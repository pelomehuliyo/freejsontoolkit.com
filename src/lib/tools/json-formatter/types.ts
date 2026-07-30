export type IndentOption = "2" | "4" | "tab";

export interface JsonFormatterState {
  jsonInput: string;
  formattedOutput: string;
  inputStatus: "empty" | "ready" | "invalid";
  outputStatus: "empty" | "formatted";
  isFormatting: boolean;
  error: string | null;
  indent: IndentOption;
  sortKeys: boolean;
}

export const DEFAULT_STATE: JsonFormatterState = {
  jsonInput: "",
  formattedOutput: "",
  inputStatus: "empty",
  outputStatus: "empty",
  isFormatting: false,
  error: null,
  indent: "2",
  sortKeys: false,
};
