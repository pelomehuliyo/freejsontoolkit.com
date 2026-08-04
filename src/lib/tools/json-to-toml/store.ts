import { Store } from "../../state/toolStore";
import type { JsonToTomlState } from "./types";
import { DEFAULT_STATE } from "./types";

function stateEquals(a: JsonToTomlState, b: JsonToTomlState): boolean {
    if (a === b) return true;
    const aKeys = Object.keys(a) as (keyof JsonToTomlState)[];
    const bKeys = Object.keys(b) as (keyof JsonToTomlState)[];
    if (aKeys.length !== bKeys.length) return false;
    for (const key of aKeys) {
        if (a[key] !== b[key]) return false;
    }
    return true;
}

export const jsonToTomlStore = new Store<JsonToTomlState>(DEFAULT_STATE, stateEquals);