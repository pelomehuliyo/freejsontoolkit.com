import { Store } from "../../state/toolStore";
import type { SchemaLiteState } from "./types";
import { DEFAULT_STATE } from "./types";

function stateEquals(a: SchemaLiteState, b: SchemaLiteState): boolean {
    if (a === b) return true;
    const aKeys = Object.keys(a) as (keyof SchemaLiteState)[];
    const bKeys = Object.keys(b) as (keyof SchemaLiteState)[];
    if (aKeys.length !== bKeys.length) return false;
    for (const key of aKeys) {
        if (a[key] !== b[key]) return false;
    }
    return true;
}

export const schemaLiteStore = new Store<SchemaLiteState>(DEFAULT_STATE, stateEquals);