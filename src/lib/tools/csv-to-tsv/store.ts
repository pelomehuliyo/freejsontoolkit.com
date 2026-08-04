import { Store } from "../../state/toolStore";
import type { CsvToTsvState } from "./types";
import { DEFAULT_STATE } from "./types";

function stateEquals(a: CsvToTsvState, b: CsvToTsvState): boolean {
    if (a === b) return true;
    const aKeys = Object.keys(a) as (keyof CsvToTsvState)[];
    const bKeys = Object.keys(b) as (keyof CsvToTsvState)[];
    if (aKeys.length !== bKeys.length) return false;
    for (const key of aKeys) {
        if (a[key] !== b[key]) return false;
    }
    return true;
}

export const csvToTsvStore = new Store<CsvToTsvState>(DEFAULT_STATE, stateEquals);