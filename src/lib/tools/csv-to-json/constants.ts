import type { CsvDelimiterOption, IndentOption } from "./types";

export const SAMPLE_CSV = `id,name,email,role,active
1,Ada Lovelace,ada@example.com,admin,true
2,Alan Turing,alan@example.com,engineer,true
3,Grace Hopper,grace@example.com,architect,false`;

export const DELIMITER_OPTIONS: { value: CsvDelimiterOption; label: string }[] = [
  { value: "auto", label: "Auto-detect" },
  { value: ",", label: "Comma ( , )" },
  { value: ";", label: "Semicolon ( ; )" },
  { value: "\t", label: "Tab" },
  { value: "|", label: "Pipe ( | )" },
];

export const INDENT_OPTIONS: { value: IndentOption; label: string }[] = [
  { value: "2", label: "2 spaces" },
  { value: "4", label: "4 spaces" },
  { value: "tab", label: "Tab" },
];

export const MAX_INPUT_CHARS = 15_000_000;

/** Human-readable name for a detected/chosen delimiter. */
export function delimiterLabel(d: string): string {
  switch (d) {
    case ",":
      return "comma";
    case ";":
      return "semicolon";
    case "\t":
      return "tab";
    case "|":
      return "pipe";
    case ":":
      return "colon";
    default:
      return d ? JSON.stringify(d) : "";
  }
}
