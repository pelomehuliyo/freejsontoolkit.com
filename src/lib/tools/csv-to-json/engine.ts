import { parseCsv } from "../../csv/csvParser";
import type { CsvDelimiterOption, IndentOption } from "./types";

export interface ConvertOptions {
  delimiter: CsvDelimiterOption;
  hasHeader: boolean;
  skipEmptyLines: boolean;
  indent: IndentOption;
}

export interface ConvertResult {
  output: string;
  recordCount: number;
  outputChars: number;
  delimiterUsed: string;
}

/** Pure transform — no DOM, no store. Throws on unparseable CSV. */
export function convertCsvToJson(input: string, opts: ConvertOptions): ConvertResult {
  const result = parseCsv(input, {
    delimiter: opts.delimiter,
    hasHeader: opts.hasHeader,
    trimWhitespace: true,
    skipEmptyLines: opts.skipEmptyLines,
  });

  if (!result.success || !result.csv) {
    const msg = result.error
      ? `[${result.error.code}] ${result.error.message}`
      : "Failed to parse CSV.";
    throw new Error(msg);
  }

  const space = opts.indent === "tab" ? "\t" : Number(opts.indent);
  const output = JSON.stringify(result.csv.records, null, space);

  return {
    output,
    recordCount: result.csv.records.length,
    outputChars: output.length,
    delimiterUsed: result.csv.delimiter,
  };
}
