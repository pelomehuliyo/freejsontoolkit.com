export interface ConvertOptions {
  /** What to do when a CSV field contains an embedded newline —
   *  TSV has no way to keep it inside one cell. */
  newlineStrategy: "reject" | "escape";
}

export interface ProblemCell {
  line: number;
  column: number;
  preview: string;
}

export interface ConvertResult {
  ok: boolean;
  authoritative: boolean;
  output: string;
  error?: { message: string };
  rowCount: number;
  colCount: number;
  problemCells: ProblemCell[];
  sourceSize: number;
}

export interface CsvToTsvFile {
  name: string;
  size: number;
}

export interface LargeFileInfo {
  file: CsvToTsvFile;
  /** The original File, retained so a changed option can re-run the conversion. */
  source?: File;
  blob: Blob | null;
  preview: string;
  phase: string;
  rows: number;
  cols: number;
}

export interface CsvToTsvState {
  csvInput: string;
  result: ConvertResult | null;
  inputStatus: "empty" | "ready";
  outputStatus: "empty" | "converted" | "invalid";
  isConverting: boolean;
  error: string | null;
  newlineStrategy: "reject" | "escape";
  /** Set while a file takes the large-file mode path. */
  largeFile: LargeFileInfo | null;
  /** Set when an option changes after a large-file result — outcome is stale. */
  staleOptions: boolean;
}

export const DEFAULT_STATE: CsvToTsvState = {
  csvInput: "",
  result: null,
  inputStatus: "empty",
  outputStatus: "empty",
  isConverting: false,
  error: null,
  newlineStrategy: "reject",
  largeFile: null,
  staleOptions: false,
};
