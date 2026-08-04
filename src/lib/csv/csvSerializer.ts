/**
 * CSV Serializer — the write-side twin of csvParser.
 *
 * Turns a grid of string cells back into delimited text, applying RFC 4180
 * quoting: a field is quoted when it contains the delimiter, a double quote,
 * or a line break; embedded quotes are doubled. The CSV → TSV and TSV → CSV
 * converters share this so there is exactly one source of truth for quoting.
 *
 * Pure, side-effect free, no DOM.
 */

/**
 * Serialize one row of cells into a delimited line.
 */
export function serializeRow(cells: string[], delimiter: string): string {
    return cells.map((c) => quoteField(c, delimiter)).join(delimiter);
}

/**
 * Serialize a grid of rows into delimited text (joined with \n).
 */
export function serializeGrid(rows: string[][], delimiter: string): string {
    return rows.map((row) => serializeRow(row, delimiter)).join("\n");
}

/**
 * Quote a single field per RFC 4180 — only when necessary, so clean output
 * stays clean. (The target delimiter drives quoting: converting TSV → CSV,
 * a tab is just data, but a comma is not.)
 */
export function quoteField(value: string, delimiter: string): string {
    const needsQuotes =
        value.indexOf(delimiter) !== -1 ||
        value.indexOf('"') !== -1 ||
        value.indexOf("\n") !== -1 ||
        value.indexOf("\r") !== -1;
    if (!needsQuotes) return value;
    return '"' + value.replace(/"/g, '""') + '"';
}