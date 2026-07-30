import { Store } from "../../state/toolStore";
import type { CsvToJsonState } from "./types";
import { DEFAULT_STATE } from "./types";

function stateEquals(a: CsvToJsonState, b: CsvToJsonState): boolean {
  if (a === b) return true;
  const aKeys = Object.keys(a) as (keyof CsvToJsonState)[];
  const bKeys = Object.keys(b) as (keyof CsvToJsonState)[];
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

export const csvToJsonStore = new Store<CsvToJsonState>(DEFAULT_STATE, stateEquals);
