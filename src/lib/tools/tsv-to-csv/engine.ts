/**
 * TSV → CSV — engine.
 *
 * Parses with the shared RFC 4180 parser (delimiter pinned to tab) and
 * re-serializes with commas via the shared serializer. This direction is
 * LOSSLESS and nothing is ever refused: CSV quoting can represent commas,
 * double quotes, and embedded newlines, so every TSV cell survives the
 * crossing intact. (The reverse — CSV → TSV — is the lossy one, and that
 * tool is where the honesty/refusal logic lives.)
 *
 * Pure: no DOM, no store. Safe to run in a Web Worker.
 */
import { parseCsv } from "../../csv/csvParser";
import { serializeGrid } from "../../csv/csvSerializer";
import type { ConvertResult } from "./types";

export function convertTsvToCsv(input: string): ConvertResult {
    const sourceSize = input.length;
    if (input.trim().length === 0) {
        return {
            ok: false,
            authoritative: false,
            output: "",
            sourceSize,
            rowCount: 0,
            colCount: 0,
            error: { message: "Empty input" },
        };
    }

    const parsed = parseCsv(input, {
        delimiter: "\t",
        hasHeader: true,
        trimWhitespace: true,
        skipEmptyLines: true,
    });

    if (!parsed.success || !parsed.csv) {
        const err = parsed.error ?? { code: "UNKNOWN", message: "Failed to parse TSV." };
        return {
            ok: false,
            authoritative: false,
            output: "",
            sourceSize,
            rowCount: 0,
            colCount: 0,
            error: { message: `[${err.code}] ${err.message}` },
        };
    }

    const { records, headers } = parsed.csv;
    const grid: string[][] = [headers];
    for (const record of records) {
        grid.push(headers.map((h) => (record[h] === undefined ? "" : String(record[h]))));
    }

    // Lossless: quoteField (in the shared serializer) quotes any cell that holds
    // a comma, a quote, or a newline, and doubles embedded quotes.
    const output = serializeGrid(grid, ",");
    return {
        ok: true,
        authoritative: false,
        output,
        sourceSize,
        rowCount: grid.length,
        colCount: headers.length,
    };
}