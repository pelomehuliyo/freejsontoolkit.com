/**
 * JSON Validator — engine.
 *
 * A from-scratch JSON grammar walker (tokenizer + recursive-descent structural
 * validator over the token stream). We do NOT lean on JSON.parse for the
 * verdict or the position, because modern V8 (the browser + Node this project
 * targets) emits error messages with NO line/column/position — so a JSON.parse-
 * based validator would report "somewhere wrong" with no coordinates in the
 * exact environments we ship to. This walker produces exact line/column that
 * are identical everywhere, and additionally catches duplicate keys (warning)
 * and trailing commas (error) that JSON.parse silently permits.
 *
 * Pure: no DOM, no store, no browser APIs. Safe to run in a Web Worker.
 */
import type { ValidationError, ValidationResult, ValidatorOptions, ValidatorStats } from "./types";

const MAX_DEPTH = 4096;

type TokType =
  | "lbrace"
  | "rbrace"
  | "lbracket"
  | "rbracket"
  | "colon"
  | "comma"
  | "string"
  | "number"
  | "true"
  | "false"
  | "null";

interface Token {
  type: TokType;
  start: number;
  value?: string; // unescaped text for strings (used for key comparison)
}

// Internal error carrier — caught by validateJson and turned into a result.
interface Fail {
  position: number;
  message: string;
}

function isDigit(c: string): boolean {
  return c >= "0" && c <= "9";
}
function isHex(c: string): boolean {
  return isDigit(c) || (c >= "a" && c <= "f") || (c >= "A" && c <= "F");
}

function unescapeString(raw: string): string {
  let out = "";
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (c !== "\\") {
      out += c;
      continue;
    }
    const e = raw[++i];
    switch (e) {
      case '"':
      case "\\":
      case "/":
        out += e;
        break;
      case "b":
        out += "\b";
        break;
      case "f":
        out += "\f";
        break;
      case "n":
        out += "\n";
        break;
      case "r":
        out += "\r";
        break;
      case "t":
        out += "\t";
        break;
      case "u": {
        const hex = raw.slice(i + 1, i + 5);
        out += String.fromCharCode(parseInt(hex, 16));
        i += 4;
        break;
      }
      default:
        out += e ?? "";
    }
  }
  return out;
}

function tokenize(s: string): Token[] {
  const tokens: Token[] = [];
  const n = s.length;
  let i = 0;

  const fail = (position: number, message: string): never => {
    throw { position, message } as Fail;
  };

  while (i < n) {
    const c = s[i];
    if (c === " " || c === "\n" || c === "\r" || c === "\t") {
      i++;
      continue;
    }
    if (c === "{" || c === "}" || c === "[" || c === "]" || c === ":" || c === ",") {
      const map: Record<string, TokType> = {
        "{": "lbrace",
        "}": "rbrace",
        "[": "lbracket",
        "]": "rbracket",
        ":": "colon",
        ",": "comma",
      };
      tokens.push({ type: map[c], start: i });
      i++;
      continue;
    }
    if (c === '"') {
      const start = i;
      i++;
      let raw = "";
      for (;;) {
        if (i >= n) fail(start, "Unterminated string");
        const ch = s[i];
        if (ch === "\\") {
          i++;
          if (i >= n) fail(start, "Unterminated string escape");
          const e = s[i];
          if (e === "u") {
            for (let h = 1; h <= 4; h++) {
              if (!isHex(s[i + h] ?? "")) fail(i + h, "Bad unicode escape");
            }
            raw += s.slice(i - 1, i + 5);
            i += 5;
          } else if ('"\\/bfnrt'.indexOf(e) !== -1) {
            raw += s.slice(i - 1, i + 1);
            i++;
          } else {
            fail(i, `Bad escape character "\\${e}"`);
          }
        } else if (ch === '"') {
          i++;
          break;
        } else {
          raw += ch;
          i++;
        }
      }
      tokens.push({ type: "string", start, value: unescapeString(raw) });
      continue;
    }
    if (c === "-" || isDigit(c)) {
      const start = i;
      if (s[i] === "-") i++;
      if (s[i] === "0") {
        i++;
        if (i < n && isDigit(s[i])) fail(start, "Leading zeros are not allowed");
      } else if (isDigit(s[i])) {
        while (i < n && isDigit(s[i])) i++;
      } else {
        fail(start, "Invalid number");
      }
      if (s[i] === ".") {
        i++;
        if (!isDigit(s[i] ?? "")) fail(start, "Invalid number: expected digit after '.'");
        while (i < n && isDigit(s[i])) i++;
      }
      if (s[i] === "e" || s[i] === "E") {
        i++;
        if (s[i] === "+" || s[i] === "-") i++;
        if (!isDigit(s[i] ?? "")) fail(start, "Invalid number: expected digit in exponent");
        while (i < n && isDigit(s[i])) i++;
      }
      tokens.push({ type: "number", start });
      continue;
    }
    if (s.startsWith("true", i) && !/[\w]/.test(s[i + 4] ?? "")) {
      tokens.push({ type: "true", start: i });
      i += 4;
      continue;
    }
    if (s.startsWith("false", i) && !/[\w]/.test(s[i + 5] ?? "")) {
      tokens.push({ type: "false", start: i });
      i += 5;
      continue;
    }
    if (s.startsWith("null", i) && !/[\w]/.test(s[i + 4] ?? "")) {
      tokens.push({ type: "null", start: i });
      i += 4;
      continue;
    }
    fail(i, `Unexpected character ${JSON.stringify(c)}`);
  }
  return tokens;
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

/** Recursive-descent structural validation over the token stream. */
function validateStructure(
  s: string,
  tokens: Token[],
  flagDuplicateKeys: boolean,
): { stats: ValidatorStats; duplicateKeys: string[] } {
  let p = 0;
  const stats: ValidatorStats = {
    objects: 0,
    arrays: 0,
    strings: 0,
    numbers: 0,
    booleans: 0,
    nulls: 0,
    keys: 0,
    maxDepth: 0,
  };
  const duplicateKeys: string[] = [];

  const fail = (position: number, message: string): never => {
    throw { position, message } as Fail;
  };
  const peek = (): Token | undefined => tokens[p];
  const here = (): Token => tokens[p] ?? { type: "rbrace", start: s.length }; // EOF sentinel for messages

  function parseValue(depth: number): void {
    if (depth > MAX_DEPTH) fail(here().start, `Nesting exceeds ${MAX_DEPTH} levels`);
    if (depth > stats.maxDepth) stats.maxDepth = depth;
    const t = peek();
    if (!t) fail(s.length, "Unexpected end of input");
    switch (t.type) {
      case "string":
        stats.strings++;
        p++;
        return;
      case "number":
        stats.numbers++;
        p++;
        return;
      case "true":
      case "false":
        stats.booleans++;
        p++;
        return;
      case "null":
        stats.nulls++;
        p++;
        return;
      case "lbrace":
        parseObject(depth);
        return;
      case "lbracket":
        parseArray(depth);
        return;
      default:
        fail(t.start, `Unexpected token ${JSON.stringify(s[t.start])}`);
    }
  }

  function parseObject(depth: number): void {
    p++; // consume '{'
    if (peek()?.type === "rbrace") {
      p++;
      stats.objects++;
      return;
    }
    const seen = new Set<string>();
    for (;;) {
      const keyTok = peek();
      if (!keyTok || keyTok.type !== "string") {
        fail(here().start, "Expected property name (a string)");
      }
      const key = keyTok.value ?? "";
      stats.keys++;
      if (flagDuplicateKeys && seen.has(key) && duplicateKeys.indexOf(key) === -1) {
        duplicateKeys.push(key);
      }
      seen.add(key);
      p++;
      if (peek()?.type !== "colon") fail(here().start, "Expected ':' after property name");
      p++;
      parseValue(depth + 1);
      const next = peek();
      if (!next) fail(s.length, "Unterminated object");
      if (next.type === "comma") {
        const commaPos = next.start;
        p++;
        if (peek()?.type === "rbrace") fail(commaPos, "Trailing comma in object");
        continue;
      }
      if (next.type === "rbrace") {
        p++;
        stats.objects++;
        return;
      }
      fail(next.start, "Expected ',' or '}'");
    }
  }

  function parseArray(depth: number): void {
    p++; // consume '['
    if (peek()?.type === "rbracket") {
      p++;
      stats.arrays++;
      return;
    }
    for (;;) {
      parseValue(depth + 1);
      const next = peek();
      if (!next) fail(s.length, "Unterminated array");
      if (next.type === "comma") {
        const commaPos = next.start;
        p++;
        if (peek()?.type === "rbracket") fail(commaPos, "Trailing comma in array");
        continue;
      }
      if (next.type === "rbracket") {
        p++;
        stats.arrays++;
        return;
      }
      fail(next.start, "Expected ',' or ']'");
    }
  }

  parseValue(1);
  if (p < tokens.length) fail(tokens[p].start, "Unexpected token after top-level value");
  return { stats, duplicateKeys };
}

export function validateJson(input: string, opts: ValidatorOptions): ValidationResult {
  const size = input.length;
  if (input.trim().length === 0) {
    return {
      valid: false,
      authoritative: false,
      size,
      error: { message: "Empty input", position: 0, line: 1, column: 1 },
    };
  }

  let tokens: Token[];
  try {
    tokens = tokenize(input);
  } catch (e) {
    const f = e as Fail;
    const { line, column } = locate(input, f.position);
    const error: ValidationError = { message: f.message, position: f.position, line, column };
    return { valid: false, authoritative: false, size, error };
  }

  let stats: ValidatorStats;
  let duplicateKeys: string[];
  try {
    const r = validateStructure(input, tokens, opts.flagDuplicateKeys);
    stats = r.stats;
    duplicateKeys = r.duplicateKeys;
  } catch (e) {
    const f = e as Fail;
    const { line, column } = locate(input, f.position);
    const error: ValidationError = { message: f.message, position: f.position, line, column };
    return { valid: false, authoritative: false, size, error };
  }

  let normalized: string | undefined;
  if (opts.includeNormalized) {
    // Safe: the walker already proved the input is well-formed, so JSON.parse
    // cannot throw here. (On duplicate keys, JSON.parse keeps the last value —
    // the report notes this.)
    normalized = JSON.stringify(
      JSON.parse(input),
      null,
      opts.indent === "tab" ? "\t" : Number(opts.indent),
    );
  }

  return { valid: true, authoritative: false, size, stats, duplicateKeys, normalized };
}

/** Pure presentation: turn a result (+ the source, for the error snippet) into
 *  the mono diagnostics readout shown in the output editor. */
export function buildReport(result: ValidationResult, source: string): string {
  const leader = (label: string, val: string | number): string => {
    const s = String(val);
    const dots = ".".repeat(Math.max(2, 30 - label.length - s.length));
    return `  ${label} ${dots} ${s}`;
  };

  if (!result.valid) {
    const err = result.error!;
    const lines = source.split("\n");
    const lo = Math.max(0, err.line - 2);
    const hi = Math.min(lines.length - 1, err.line);
    const width = String(hi + 1).length;
    const ctx = lines
      .slice(lo, hi + 1)
      .map((ln, idx) => {
        const n = lo + idx + 1;
        const mark = n === err.line ? ">" : " ";
        return `${mark} ${String(n).padStart(width)} | ${ln}`;
      })
      .join("\n");
    const caret = `${" ".repeat(width + 4)}| ${" ".repeat(Math.max(0, err.column - 1))}^`;
    return [
      "✗ Invalid JSON",
      "",
      `  ${err.message}`,
      `  at line ${err.line}, column ${err.column}  (position ${err.position})`,
      "",
      ctx,
      caret,
    ].join("\n");
  }

  const st = result.stats!;
  const dup = result.duplicateKeys ?? [];
  const out: string[] = [
    "✓ Valid JSON",
    "",
    "structure",
    leader("objects", st.objects),
    leader("arrays", st.arrays),
    leader("strings", st.strings),
    leader("numbers", st.numbers),
    leader("booleans", st.booleans),
    leader("nulls", st.nulls),
    leader("max depth", st.maxDepth),
    leader("size", `${result.size} chars`),
    "",
    "keys",
    leader("total", st.keys),
    leader("duplicates", dup.length),
  ];
  if (dup.length > 0) {
    out.push("");
    out.push(
      "  ! " +
        dup
          .slice(0, 8)
          .map((k) => JSON.stringify(k))
          .join(", ") +
        (dup.length > 8 ? ", …" : ""),
    );
  }
  if (result.normalized !== undefined) {
    out.push("");
    out.push("── normalized" + (dup.length > 0 ? "  (last key wins on duplicates)" : "") + " ──");
    out.push(result.normalized);
  }
  return out.join("\n");
}
