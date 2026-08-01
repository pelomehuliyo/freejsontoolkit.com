import { Store } from "../../state/toolStore";
import type { UrlCodecState } from "./types";
import { DEFAULT_STATE } from "./types";

function stateEquals(a: UrlCodecState, b: UrlCodecState): boolean {
    if (a === b) return true;
    const aKeys = Object.keys(a) as (keyof UrlCodecState)[];
    const bKeys = Object.keys(b) as (keyof UrlCodecState)[];
    if (aKeys.length !== bKeys.length) return false;
    for (const k of aKeys) {
        if (a[k] !== b[k]) return false;
    }
    return true;
}

export const urlCodecStore = new Store<UrlCodecState>(DEFAULT_STATE, stateEquals);