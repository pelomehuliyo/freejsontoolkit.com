import { Store } from "../../state/toolStore";
import type { JsonToYamlState } from "./types";
import { DEFAULT_STATE } from "./types";

function stateEquals(a: JsonToYamlState, b: JsonToYamlState): boolean {
  if (a === b) return true;
  const aKeys = Object.keys(a) as (keyof JsonToYamlState)[];
  const bKeys = Object.keys(b) as (keyof JsonToYamlState)[];
  if (aKeys.length !== bKeys.length) return false;
  for (const k of aKeys) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}

export const jsonToYamlStore = new Store<JsonToYamlState>(DEFAULT_STATE, stateEquals);
