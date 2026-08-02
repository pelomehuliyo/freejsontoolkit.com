export type IndentOption = "2" | "4" | "tab";

export interface JsonToYamlState {
  jsonInput: string;
  yamlOutput: string;
  inputStatus: "empty" | "ready" | "invalid";
  outputStatus: "empty" | "converted";
  isConverting: boolean;
  error: string | null;
  indent: IndentOption;
  sortKeys: boolean;
}

export const DEFAULT_STATE: JsonToYamlState = {
  jsonInput: "",
  yamlOutput: "",
  inputStatus: "empty",
  outputStatus: "empty",
  isConverting: false,
  error: null,
  indent: "2",
  sortKeys: false,
};
