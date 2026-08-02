import { Store } from "../../state/toolStore";
import type { XmlToJsonState } from "./types";
import { DEFAULT_STATE } from "./types";

function stateEquals(a: XmlToJsonState, b: XmlToJsonState): boolean {
  if (a === b) return true;
  const aKeys = Object.keys(a) as (keyof XmlToJsonState)[];
  const bKeys = Object.keys(b) as (keyof XmlToJsonState)[];
  if (aKeys.length !== bKeys.length) return false;
  for (const k of aKeys) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}

export const xmlToJsonStore = new Store<XmlToJsonState>(DEFAULT_STATE, stateEquals);
