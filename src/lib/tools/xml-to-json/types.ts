export interface XmlToJsonOptions {
  includeAttributes: boolean;
  preserveArrays: boolean;
  indent: string | number; // '2' | '4' | 'tab'
}

export interface XmlToJsonResult {
  output: string;
  inputChars: number;
  outputChars: number;
}

export interface XmlToJsonState {
  xmlInput: string;
  jsonOutput: string;
  inputStatus: "empty" | "ready" | "invalid";
  outputStatus: "empty" | "converted";
  isConverting: boolean;
  error: string | null;
  includeAttributes: boolean;
  preserveArrays: boolean;
  indent: string | number;
}

export const DEFAULT_STATE: XmlToJsonState = {
  xmlInput: "",
  jsonOutput: "",
  inputStatus: "empty",
  outputStatus: "empty",
  isConverting: false,
  error: null,
  includeAttributes: true,
  preserveArrays: true,
  indent: "2",
};
