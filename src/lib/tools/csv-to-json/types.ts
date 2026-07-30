export type CsvDelimiterOption = "auto" | "," | ";" | "|" | ":" | "\t";
export type IndentOption = "2" | "4" | "tab";

export interface CsvToJsonState {
  csvInput: string;
  jsonOutput: string;
  inputStatus: "empty" | "ready";
  outputStatus: "empty" | "converted";
  isConverting: boolean;
  error: string | null;
  delimiter: CsvDelimiterOption;
  hasHeader: boolean;
  skipEmptyLines: boolean;
  indent: IndentOption;
  recordCount: number;
  delimiterUsed: string;
}

export const DEFAULT_STATE: CsvToJsonState = {
  csvInput: "",
  jsonOutput: "",
  inputStatus: "empty",
  outputStatus: "empty",
  isConverting: false,
  error: null,
  delimiter: "auto",
  hasHeader: true,
  skipEmptyLines: true,
  indent: "2",
  recordCount: 0,
  delimiterUsed: "",
};
