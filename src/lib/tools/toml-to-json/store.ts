import { Store } from "../../state/toolStore";
import type { TomlToJsonState } from "./types";
import { DEFAULT_STATE } from "./types";

function stateEquals(a: TomlToJsonState, b: TomlToJsonState): boolean {
    if (a === b) return true;
    const aKeys = Object.keys(a) as (keyof TomlToJsonState)[];
    const bKeys = Object.keys(b) as (keyof TomlToJsonState)[];
    if (aKeys.length !== bKeys.length) return false;
    for (const key of aKeys) {
        if (a[key] !== b[key]) return false;
    }
    return true;
}

export const tomlToJsonStore = new Store<TomlToJsonState>(DEFAULT_STATE, stateEquals);