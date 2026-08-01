import { Store } from "../../state/toolStore";
import type { UuidState } from "./types";
import { DEFAULT_STATE } from "./types";

function stateEquals(a: UuidState, b: UuidState): boolean {
  if (a === b) return true;
  const aKeys = Object.keys(a) as (keyof UuidState)[];
  const bKeys = Object.keys(b) as (keyof UuidState)[];
  if (aKeys.length !== bKeys.length) return false;
  for (const k of aKeys) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}

export const uuidStore = new Store<UuidState>(DEFAULT_STATE, stateEquals);
