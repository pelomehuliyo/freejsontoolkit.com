import { Store } from "../../state/toolStore";
import type { JwtDecoderState } from "./types";
import { DEFAULT_STATE } from "./types";

function stateEquals(a: JwtDecoderState, b: JwtDecoderState): boolean {
    if (a === b) return true;
    const aKeys = Object.keys(a) as (keyof JwtDecoderState)[];
    const bKeys = Object.keys(b) as (keyof JwtDecoderState)[];
    if (aKeys.length !== bKeys.length) return false;
    for (const key of aKeys) {
        if (a[key] !== b[key]) return false;
    }
    return true;
}

export const jwtDecoderStore = new Store<JwtDecoderState>(DEFAULT_STATE, stateEquals);