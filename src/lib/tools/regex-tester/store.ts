import { Store } from "../../state/toolStore";
import type { RegexState } from "./types";
import { DEFAULT_STATE } from "./types";

function stateEquals(a: RegexState, b: RegexState): boolean {
    if (a === b) return true;
    const aKeys = Object.keys(a) as (keyof RegexState)[];
    const bKeys = Object.keys(b) as (keyof RegexState)[];
    if (aKeys.length !== bKeys.length) return false;
    for (const key of aKeys) {
        if (a[key] !== b[key]) return false;
    }
    return true;
}

export const regexStore = new Store<RegexState>(DEFAULT_STATE, stateEquals);