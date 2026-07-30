import { Store } from "../../state/toolStore";
import type { JsonFormatterState } from "./types";
import { DEFAULT_STATE } from "./types";

function stateEquals(a: JsonFormatterState, b: JsonFormatterState): boolean {
  if (a === b) return true;
  const aKeys = Object.keys(a) as (keyof JsonFormatterState)[];
  const bKeys = Object.keys(b) as (keyof JsonFormatterState)[];
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

export const jsonFormatterStore = new Store<JsonFormatterState>(DEFAULT_STATE, stateEquals);
