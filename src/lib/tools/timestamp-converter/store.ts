import { Store } from "../../state/toolStore";
import type { TsState } from "./types";
import { DEFAULT_STATE } from "./types";

function stateEquals(a: TsState, b: TsState): boolean {
    if (a === b) return true;
    const aKeys = Object.keys(a) as (keyof TsState)[];
    const bKeys = Object.keys(b) as (keyof TsState)[];
    if (aKeys.length !== bKeys.length) return false;
    for (const k of aKeys) {
        if (a[k] !== b[k]) return false;
    }
    return true;
}

export const timestampStore = new Store<TsState>(DEFAULT_STATE, stateEquals);