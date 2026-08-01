import { Store } from "../../state/toolStore";
import type { Base64State } from "./types";
import { DEFAULT_STATE } from "./types";

function stateEquals(a: Base64State, b: Base64State): boolean {
  if (a === b) return true;
  const aKeys = Object.keys(a) as (keyof Base64State)[];
  const bKeys = Object.keys(b) as (keyof Base64State)[];
  if (aKeys.length !== bKeys.length) return false;
  for (const k of aKeys) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}

export const base64Store = new Store<Base64State>(DEFAULT_STATE, stateEquals);
