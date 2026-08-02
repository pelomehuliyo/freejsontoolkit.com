export type IndentOption = "2" | "4" | "tab";
export interface XmlOptions {
  pretty: boolean;
  indent: IndentOption;
  rootName: string;
  itemName: string;
  declaration: boolean;
}
export interface XmlResult {
  output: string;
  inputChars: number;
  outputChars: number;
  elements: number;
  maxDepth: number;
}
export interface JsonToXmlState {
  jsonInput: string;
  result: XmlResult | null;
  inputStatus: "empty" | "ready" | "invalid";
  outputStatus: "empty" | "converted";
  isConverting: boolean;
  error: string | null;
  pretty: boolean;
  indent: IndentOption;
  rootName: string;
  itemName: string;
  declaration: boolean;
}
export const DEFAULT_STATE: JsonToXmlState = {
  jsonInput: "",
  result: null,
  inputStatus: "empty",
  outputStatus: "empty",
  isConverting: false,
  error: null,
  pretty: true,
  indent: "2",
  rootName: "root",
  itemName: "item",
  declaration: true,
};
