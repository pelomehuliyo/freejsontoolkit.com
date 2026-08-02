export type IndentOption = "2" | "4" | "tab";

export interface ConverterOptions {
  indent: IndentOption;
}

export interface ConvertStats {
  objects: number;
  arrays: number;
  scalars: number;
  keys: number;
  maxDepth: number;
}

export interface ConvertError {
  message: string;
  line?: number;
  column?: number;
  /** absolute offset when the parser provides one (drives scroll-to-error) */
  position?: number;
}

export interface ConvertResult {
  ok: boolean;
  /** True only for the explicit Convert action (drives output + scroll-to-error);
   *  live as-you-type results carry false so the output box never churns while typing. */
  authoritative: boolean;
  /** Pretty-printed JSON when ok. */
  output: string;
  error?: ConvertError;
  stats?: ConvertStats;
  sourceSize: number;
}

export interface YamlToJsonState {
  yamlInput: string;
  result: ConvertResult | null;
  inputStatus: "empty" | "ready";
  outputStatus: "empty" | "valid" | "invalid";
  isConverting: boolean;
  error: string | null;
  indent: IndentOption;
}

export const DEFAULT_STATE: YamlToJsonState = {
  yamlInput: "",
  result: null,
  inputStatus: "empty",
  outputStatus: "empty",
  isConverting: false,
  error: null,
  indent: "2",
};
