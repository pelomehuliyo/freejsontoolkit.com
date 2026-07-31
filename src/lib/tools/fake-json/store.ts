import { Store } from "../../state/toolStore";
import type { FakeJsonState } from "./types";
import { DEFAULT_STATE } from "./types";

function stateEquals(a: FakeJsonState, b: FakeJsonState): boolean {
    if (a === b) return true;
    const aKeys = Object.keys(a) as (keyof FakeJsonState)[];
    const bKeys = Object.keys(b) as (keyof FakeJsonState)[];
    if (aKeys.length !== bKeys.length) return false;
    for (const k of aKeys) {
        if (a[k] !== b[k]) return false;
    }
    return true;
}

export const fakeJsonStore = new Store<FakeJsonState>(DEFAULT_STATE, stateEquals);