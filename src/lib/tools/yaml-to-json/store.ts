import { Store } from "../../state/toolStore";
import type { YamlToJsonState } from "./types";
import { DEFAULT_STATE } from "./types";

function stateEquals(a: YamlToJsonState, b: YamlToJsonState): boolean {
  if (a === b) return true;
  const aKeys = Object.keys(a) as (keyof YamlToJsonState)[];
  const bKeys = Object.keys(b) as (keyof YamlToJsonState)[];
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

export const yamlToJsonStore = new Store<YamlToJsonState>(DEFAULT_STATE, stateEquals);
