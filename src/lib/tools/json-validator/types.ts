export type IndentOption = "2" | "4" | "tab";

export interface ValidatorOptions {
  flagDuplicateKeys: boolean;
  indent: IndentOption;
  includeNormalized: boolean;
}

export interface ValidatorStats {
  objects: number;
  arrays: number;
  strings: number;
  numbers: number;
  booleans: number;
  nulls: number;
  keys: number;
  maxDepth: number;
}

export interface ValidationError {
  message: string;
  position: number;
  line: number;
  column: number;
}

export interface ValidationResult {
  valid: boolean;
  /** True only for the explicit Validate action (drives scroll-to-error);
   *  live as-you-type results carry false so typing never jumps the editor. */
  authoritative: boolean;
  error?: ValidationError;
  stats?: ValidatorStats;
  duplicateKeys?: string[];
  /** Present only when valid AND includeNormalized was requested. */
  normalized?: string;
  size: number;
}

export interface JsonValidatorState {
  jsonInput: string;
  result: ValidationResult | null;
  inputStatus: "empty" | "ready";
  outputStatus: "empty" | "valid" | "invalid";
  isValidating: boolean;
  error: string | null;
  flagDuplicateKeys: boolean;
  indent: IndentOption;
  includeNormalized: boolean;
}

export const DEFAULT_STATE: JsonValidatorState = {
  jsonInput: "",
  result: null,
  inputStatus: "empty",
  outputStatus: "empty",
  isValidating: false,
  error: null,
  flagDuplicateKeys: true,
  indent: "2",
  includeNormalized: false,
};
