import { Store } from "../../state/toolStore";
import type { JsonValidatorState } from "./types";
import { DEFAULT_STATE } from "./types";

function stateEquals(a: JsonValidatorState, b: JsonValidatorState): boolean {
  if (a === b) return true;
  const aKeys = Object.keys(a) as (keyof JsonValidatorState)[];
  const bKeys = Object.keys(b) as (keyof JsonValidatorState)[];
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

export const jsonValidatorStore = new Store<JsonValidatorState>(DEFAULT_STATE, stateEquals);