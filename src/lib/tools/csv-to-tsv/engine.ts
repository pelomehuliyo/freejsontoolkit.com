/**
 * CSV → TSV — engine.
 *
 * Parses with the shared RFC 4180 parser (quoted fields, escaped quotes,
 * multiline fields, BOM/EOL handling all inherited) and re-serializes with
 * tabs. Because the parser returns header-keyed records, the grid is rebuilt
 * as headers + one row per record — so input MUST be rectangular. That is
 * stated honestly:
 *   - ragged rows fail in the parser with a line number (records can't hold
 *     ragged data, and a silent pad-or-drop would alter your table);
 *   - a field containing an embedded newline cannot survive TSV (no cell
 *     separator keeps it one cell) — refused by default, with an explicit
 *     escape-to-\n option for when you'd rather force it.
 *
 * Pure: no DOM, no store. Safe to run in a Web Worker.
 */
import { parseCsv } from "../../csv/csvParser";
import { serializeGrid } from "../../csv/csvSerializer";
import type { ConvertOptions, ConvertResult, ProblemCell } from "./types";

export function convertCsvToTsv(input: string, opts: ConvertOptions): ConvertResult {
    const sourceSize = input.length;
    if (input.trim().length === 0) {
        return {
            ok: false,
            authoritative: false,
            output: "",
            sourceSize,
            rowCount: 0,
            colCount: 0,
            problemCells: [],
            error: { message: "Empty input" },
        };
    }

    const parsed = parseCsv(input, {
        delimiter: "auto",
        hasHeader: true,
        trimWhitespace: true,
        skipEmptyLines: true,
    });

    if (!parsed.success || !parsed.csv) {
        const err = parsed.error ?? { code: "UNKNOWN", message: "Failed to parse CSV." };
        return {
            ok: false,
            authoritative: false,
            output: "",
            sourceSize,
            rowCount: 0,
            colCount: 0,
            problemCells: [],
            error: { message: `[${err.code}] ${err.message}` },
        };
    }

    const { records, headers } = parsed.csv;
    const grid: string[][] = [headers];
    for (const record of records) {
        grid.push(headers.map((h) => (record[h] === undefined ? "" : String(record[h]))));
    }

    // Detect embedded newlines — TSV cannot keep them inside one cell.
    const problemCells: ProblemCell[] = [];
    grid.forEach((row, r) => {
        row.forEach((cell, c) => {
            if (cell.indexOf("\n") !== -1 || cell.indexOf("\r") !== -1) {
                problemCells.push({
                    line: r + 1,
                    column: c + 1,
                    preview: cell.length > 24 ? cell.slice(0, 24) + "…" : cell,
                });
            }
        });
    });

    if (problemCells.length > 0 && opts.newlineStrategy === "reject") {
        const spots = problemCells
            .slice(0, 5)
            .map((p) => `line ${p.line}, col ${p.column}`)
            .join("; ");
        const more = problemCells.length > 5 ? ` (+${problemCells.length - 5} more)` : "";
        return {
            ok: false,
            authoritative: false,
            output: "",
            sourceSize,
            rowCount: grid.length,
            colCount: headers.length,
            problemCells,
            error: {
                message:
                    `${problemCells.length} cell(s) contain an embedded newline, which TSV cannot ` +
                    `represent in one cell (${spots}${more}). Remove them, or switch to "Escape to \\n".`,
            },
        };
    }

    const outGrid =
        opts.newlineStrategy === "escape"
            ? grid.map((row) => row.map((cell) => cell.replace(/\r\n|\r|\n/g, "\\n")))
            : grid;

    const output = serializeGrid(outGrid, "\t");
    return {
        ok: true,
        authoritative: false,
        output,
        sourceSize,
        rowCount: grid.length,
        colCount: headers.length,
        problemCells,
    };
}