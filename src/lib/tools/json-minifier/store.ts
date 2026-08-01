import { Store } from "../../state/toolStore";
import type { JsonMinifierState } from "./types";
import { DEFAULT_STATE } from "./types";

function stateEquals(a: JsonMinifierState, b: JsonMinifierState): boolean {
  if (a === b) return true;
  const aKeys = Object.keys(a) as (keyof JsonMinifierState)[];
  const bKeys = Object.keys(b) as (keyof JsonMinifierState)[];
  if (aKeys.length !== bKeys.length) return false;
  for (const k of aKeys) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}

export const jsonMinifierStore = new Store<JsonMinifierState>(DEFAULT_STATE, stateEquals);
