import { Store } from "../../state/toolStore";
import type { TsvToCsvState } from "./types";
import { DEFAULT_STATE } from "./types";

function stateEquals(a: TsvToCsvState, b: TsvToCsvState): boolean {
    if (a === b) return true;
    const aKeys = Object.keys(a) as (keyof TsvToCsvState)[];
    const bKeys = Object.keys(b) as (keyof TsvToCsvState)[];
    if (aKeys.length !== bKeys.length) return false;
    for (const key of aKeys) {
        if (a[key] !== b[key]) return false;
    }
    return true;
}

export const tsvToCsvStore = new Store<TsvToCsvState>(DEFAULT_STATE, stateEquals);