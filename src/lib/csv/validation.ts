/**
 * CSV Module — Input Validation
 *
 * Validates JSON strings before conversion, detects common issues,
 * and returns structured error information.
 */

import type { CsvError } from "./types";

// ──────────────────────────────────────────────
// Validation Result
// ──────────────────────────────────────────────

export interface ValidationResult {
    valid: boolean;
    errors: CsvError[];
    warnings: CsvError[];
}

// ──────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────

/**
 * Validates a raw JSON string and returns structured feedback.
 *
 * Returns { valid: true, errors: [], warnings: [] } when the input
 * is syntactically valid JSON and is suitable for CSV conversion.
 */
export function validateJsonInput(input: string): ValidationResult {
    const errors: CsvError[] = [];
    const warnings: CsvError[] = [];

    // Empty input
    const trimmed = input.trim();
    if (!trimmed) {
        errors.push({
            code: "EMPTY_INPUT",
            message: "Input is empty. Paste or upload a JSON file to convert.",
        });
        return { valid: false, errors, warnings };
    }

    // Try to parse
    let parsed: unknown;
    try {
        parsed = JSON.parse(trimmed);
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown parse error";
        errors.push({
            code: "INVALID_JSON",
            message: `Invalid JSON syntax: ${msg}`,
        });
        return { valid: false, errors, warnings };
    }

    // Check top-level type
    if (parsed === null) {
        errors.push({
            code: "NULL_VALUE",
            message:
                "Input evaluates to null. Provide a JSON array or object instead.",
        });
        return { valid: false, errors, warnings };
    }

    if (typeof parsed === "string" || typeof parsed === "number" || typeof parsed === "boolean") {
        warnings.push({
            code: "PRIMITIVE_VALUE",
            message:
                "Input is a primitive value. It will be converted as a single-cell CSV row.",
        });
    }

    // Check for empty array
    if (Array.isArray(parsed) && parsed.length === 0) {
        warnings.push({
            code: "EMPTY_ARRAY",
            message: "The JSON array is empty. The output CSV will have no data rows.",
        });
    }

    return { valid: true, errors, warnings };
}

/**
 * Detects the likely delimiter of a CSV string by scanning the first line.
 */
export function detectDelimiter(csvLine: string): string {
    const counts = {
        ",": 0,
        ";": 0,
        "\t": 0,
        "|": 0,
    };

    for (const char of csvLine) {
        if (char in counts) {
            counts[char as keyof typeof counts]++;
        }
    }

    let best = ",";
    let max = 0;

    for (const [delim, count] of Object.entries(counts)) {
        if (count > max) {
            max = count;
            best = delim;
        }
    }

    return best;
}

