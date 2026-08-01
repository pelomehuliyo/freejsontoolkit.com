import { Store } from "../../state/toolStore";
import type { JsonToXmlState } from "./types";
import { DEFAULT_STATE } from "./types";

function stateEquals(a: JsonToXmlState, b: JsonToXmlState): boolean {
    if (a === b) return true;
    const aKeys = Object.keys(a) as (keyof JsonToXmlState)[];
    const bKeys = Object.keys(b) as (keyof JsonToXmlState)[];
    if (aKeys.length !== bKeys.length) return false;
    for (const key of aKeys) {
        if (a[key] !== b[key]) return false;
    }
    return true;
}
export const jsonToXmlStore = new Store<JsonToXmlState>(DEFAULT_STATE, stateEquals);