export type CsvDelimiterOption = "auto" | "," | ";" | "|" | ":" | "\t";
export type IndentOption = "2" | "4" | "tab";

export interface CsvToJsonFile {
  name: string;
  size: number;
}

export interface LargeFileInfo {
  file: CsvToJsonFile;
  /** The original File, retained so a changed option can re-run the conversion. */
  source?: File;
  blob: Blob | null;
  preview: string;
  phase: string;
  /** Records shown in the capped preview. */
  rows: number;
  /** Total records in the full converted result (engine's recordCount). */
  totalRows: number;
}

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
  /** Set while a file takes the large-file mode path. */
  largeFile: LargeFileInfo | null;
  /** Set when an option changes after a large-file result — outcome is stale. */
  staleOptions: boolean;
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
  largeFile: null,
  staleOptions: false,
};
