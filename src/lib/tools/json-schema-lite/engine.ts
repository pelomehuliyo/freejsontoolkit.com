/**
 * JSON Schema Lite — engine.
 *
 * A from-scratch, dependency-free schema validator — the registry's recorded
 * decision ("hand-roll; Ajv is too heavy for this floor") honored by building
 * on v1.3's hand-rolled JSON grammar: the instance is parsed with the same
 * tokenizer + walker the JSON Validator uses, so coordinates and guarantees
 * are identical everywhere.
 *
 * Supported (the "lite" contract):
 *   type (string/number/integer/boolean/object/array/null — incl. unions),
 *   enum, const, properties + required + additionalProperties (true/false or
 *   a schema), items, minimum/maximum/exclusiveMinimum/exclusiveMaximum,
 *   multipleOf, minLength/maxLength, minItems/maxItems,
 *   minProperties/maxProperties.
 *
 * Deliberately OUT (v2.0's full validator): $ref / $defs, allOf/anyOf/oneOf/
 * not, if/then/else, patternProperties, pattern, format. Unknown keywords are
 * ignored (per the JSON Schema spec, unknown annotations never fail a parse).
 *
 * Errors carry a JSON Pointer path ("" = root). Pure: no DOM, no store, no
 * browser APIs — safe in a Web Worker.
 */
import { MAX_ERRORS } from "./constants";
import type { SchemaValidateResult, SchemaViolation } from "./types";

export interface EngineInput {
    instance: string;
    schema: string;
}

/** Re-export of the JSON Validator's engine (v1.3 floor). */
import { validateJson } from "../json-validator/engine";

/** The supported vocabulary — used by the engine and read by the page/FAQ. */
export const LITE_SUPPORTED = [
    "type",
    "properties",
    "required",
    "additionalProperties",
    "items",
    "enum",
    "const",
    "minimum",
    "maximum",
    "exclusiveMinimum",
    "exclusiveMaximum",
    "multipleOf",
    "minLength",
    "maxLength",
    "minItems",
    "maxItems",
    "minProperties",
    "maxProperties",
];
export const LITE_UNSUPPORTED = [
    "$ref",
    "$defs",
    "definitions",
    "allOf",
    "anyOf",
    "oneOf",
    "not",
    "if",
    "then",
    "else",
    "patternProperties",
    "pattern",
    "format",
];
const METADATA = new Set(["$schema", "$id", "$comment", "title", "description", "default", "examples"]);

interface Fail {
    position: number;
    message: string;
}

function locate(s: string, position: number): { line: number; column: number } {
    let line = 1;
    let column = 1;
    const limit = Math.min(position, s.length);
    for (let k = 0; k < limit; k++) {
        if (s.charCodeAt(k) === 10) {
            line++;
            column = 1;
        } else {
            column++;
        }
    }
    return { line, column };
}

function jsonTypeOf(v: unknown): string {
    if (v === null) return "null";
    if (Array.isArray(v)) return "array";
    return typeof v; // "string" | "number" | "boolean" | "object"
}

function deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (a === null || b === null) return false;
    if (Array.isArray(a)) {
        if (!Array.isArray(b) || a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (!deepEqual(a[i], b[i])) return false;
        }
        return true;
    }
    if (typeof a === "object") {
        const ao = a as Record<string, unknown>;
        const bo = b as Record<string, unknown>;
        const ak = Object.keys(ao);
        const bk = Object.keys(bo);
        if (ak.length !== bk.length) return false;
        for (const k of ak) {
            if (!Object.prototype.hasOwnProperty.call(bo, k)) return false;
            if (!deepEqual(ao[k], bo[k])) return false;
        }
        return true;
    }
    return false;
}

/** Walk the instance against the schema, collecting violations. */
function validateNode(
    value: unknown,
    schema: unknown,
    path: string,
    errors: SchemaViolation[],
    depth: number,
): void {
    if (errors.length >= MAX_ERRORS || depth > 128) return;

    if (schema === true || schema === undefined) return;
    if (schema === false) {
        errors.push({ path, message: "This location is forbidden by the schema (false schema)." });
        return;
    }
    if (typeof schema !== "object" || Array.isArray(schema) || schema === null) {
        errors.push({ path, message: "Invalid schema: a schema must be an object or a boolean." });
        return;
    }
    const s = schema as Record<string, unknown>;

    // ── type ──
    if (s.type !== undefined) {
        const allowed = Array.isArray(s.type) ? s.type : [s.type];
        const actual = jsonTypeOf(value);
        const ok = allowed.some((t) => {
            if (t === "integer") return typeof value === "number" && Number.isInteger(value);
            return t === actual;
        });
        if (!ok) {
            errors.push({
                path,
                message: `Expected type ${allowed.join(" | ")}, got ${actual}.`,
            });
            return; // a type mismatch makes deeper keyword checks noise
        }
    }

    // ── enum ──
    if (Array.isArray(s.enum)) {
        const list = s.enum as unknown[];
        if (!list.some((x) => deepEqual(x, value))) {
            const shown = list
                .slice(0, 5)
                .map((x) => JSON.stringify(x))
                .join(", ");
            errors.push({ path, message: `Value must be one of: ${shown}${list.length > 5 ? ", …" : ""}.` });
        }
    }

    // ── const ──
    if ("const" in s) {
        if (!deepEqual(s.const, value)) {
            errors.push({ path, message: `Value must equal ${JSON.stringify(s.const)}.` });
        }
    }

    // ── number keywords ──
    if (typeof value === "number") {
        if (typeof s.minimum === "number" && value < s.minimum) {
            errors.push({ path, message: `Value ${value} is less than minimum ${s.minimum}.` });
        }
        if (typeof s.maximum === "number" && value > s.maximum) {
            errors.push({ path, message: `Value ${value} is greater than maximum ${s.maximum}.` });
        }
        if (typeof s.exclusiveMinimum === "number" && value <= s.exclusiveMinimum) {
            errors.push({ path, message: `Value ${value} must be > ${s.exclusiveMinimum}.` });
        }
        if (typeof s.exclusiveMaximum === "number" && value >= s.exclusiveMaximum) {
            errors.push({ path, message: `Value ${value} must be < ${s.exclusiveMaximum}.` });
        }
        if (typeof s.multipleOf === "number" && s.multipleOf > 0) {
            const q = value / s.multipleOf;
            if (Math.abs(q - Math.round(q)) > 1e-9) {
                errors.push({ path, message: `Value ${value} is not a multiple of ${s.multipleOf}.` });
            }
        }
    }

    // ── string keywords ──
    if (typeof value === "string") {
        if (typeof s.minLength === "number" && value.length < s.minLength) {
            errors.push({ path, message: `String is ${value.length} chars; minimum is ${s.minLength}.` });
        }
        if (typeof s.maxLength === "number" && value.length > s.maxLength) {
            errors.push({ path, message: `String is ${value.length} chars; maximum is ${s.maxLength}.` });
        }
    }

    // ── array keywords ──
    if (Array.isArray(value)) {
        if (typeof s.minItems === "number" && value.length < s.minItems) {
            errors.push({ path, message: `Array has ${value.length} items; minimum is ${s.minItems}.` });
        }
        if (typeof s.maxItems === "number" && value.length > s.maxItems) {
            errors.push({ path, message: `Array has ${value.length} items; maximum is ${s.maxItems}.` });
        }
        if (s.items !== undefined && errors.length < MAX_ERRORS) {
            for (let i = 0; i < value.length && errors.length < MAX_ERRORS; i++) {
                validateNode(value[i], s.items, path + "/" + i, errors, depth + 1);
            }
        }
    }

    // ── object keywords ──
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        const obj = value as Record<string, unknown>;
        const keys = Object.keys(obj);

        if (typeof s.minProperties === "number" && keys.length < s.minProperties) {
            errors.push({ path, message: `Object has ${keys.length} properties; minimum is ${s.minProperties}.` });
        }
        if (typeof s.maxProperties === "number" && keys.length > s.maxProperties) {
            errors.push({ path, message: `Object has ${keys.length} properties; maximum is ${s.maxProperties}.` });
        }

        if (Array.isArray(s.required)) {
            for (const r of s.required as unknown[]) {
                if (typeof r !== "string") continue;
                if (!Object.prototype.hasOwnProperty.call(obj, r)) {
                    errors.push({ path, message: `Missing required property "${r}".` });
                }
            }
        }

        const props = (s.properties ?? {}) as Record<string, unknown>;
        const additional = s.additionalProperties;

        for (const k of keys) {
            if (errors.length >= MAX_ERRORS) break;
            if (Object.prototype.hasOwnProperty.call(props, k)) {
                validateNode(obj[k], props[k], path + "/" + k, errors, depth + 1);
            } else if (additional === false) {
                errors.push({ path, message: `Additional property "${k}" is not allowed.` });
            } else if (additional !== undefined && additional !== true) {
                validateNode(obj[k], additional, path + "/" + k, errors, depth + 1);
            }
        }
    }
}

export function validateAgainstSchema(input: EngineInput): SchemaValidateResult {
    const instanceSize = input.instance.length;

    // 1. Parse the schema first — a broken schema means nothing can be judged.
    let schemaValue: unknown;
    try {
        schemaValue = JSON.parse(input.schema);
    } catch (e) {
        const f = e as Fail;
        const where =
            typeof f?.position === "number"
                ? (() => {
                    const { line, column } = locate(input.schema, f.position);
                    return ` (line ${line}, column ${column})`;
                })()
                : "";
        return {
            ok: false,
            authoritative: false,
            truncated: false,
            instanceSize,
            errors: [{ path: "", message: `Schema is not valid JSON${where}: ${f?.message ?? "parse error"}` }],
        };
    }

    // 2. Parse the instance on the shared floor (tokenizer + walker → coordinates).
    const parsed = validateJson(input.instance, {
        flagDuplicateKeys: false,
        indent: "2",
        includeNormalized: false,
    });
    if (!parsed.valid) {
        const err = parsed.error!;
        return {
            ok: false,
            authoritative: false,
            truncated: false,
            instanceSize,
            errors: [
                {
                    path: "",
                    message: `Instance is not valid JSON — ${err.message} at line ${err.line}, column ${err.column}.`,
                },
            ],
        };
    }

    // 3. Re-parse for the value (safe — the walker already proved it).
    const instanceValue = JSON.parse(input.instance);

    // 4. Walk against the schema.
    const errors: SchemaViolation[] = [];
    validateNode(instanceValue, schemaValue, "", errors, 0);
    const truncated = errors.length > MAX_ERRORS;
    if (truncated) errors.length = MAX_ERRORS;

    return { ok: errors.length === 0, authoritative: false, truncated, instanceSize, errors };
}

/** Pure presentation: the verdict ledger shown in the output editor. */
export function buildReport(result: SchemaValidateResult): string {
    if (result.ok) {
        return [
            "✓ Valid against schema",
            "",
            `  ${result.instanceSize.toLocaleString()} chars checked · 0 violations`,
        ].join("\n");
    }
    const out: string[] = [`✗ ${result.errors.length} violation(s)`, ""];
    for (const e of result.errors) {
        out.push(`  ${e.path === "" ? "(root)" : e.path}`);
        out.push(`    ${e.message}`);
        out.push("");
    }
    if (result.truncated) {
        out.push(`  … capped at ${MAX_ERRORS} — fix these first, re-validate.`);
    }
    return out.join("\n").trimEnd();
}