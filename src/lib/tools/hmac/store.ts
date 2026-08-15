import { Store } from "../../state/toolStore";
import type { HmacState } from "./types";
import { DEFAULT_STATE } from "./types";

function stateEquals(a: HmacState, b: HmacState): boolean {
    return (
        a.message === b.message &&
        a.key === b.key &&
        a.algorithm === b.algorithm &&
        a.encoding === b.encoding &&
        a.isRunning === b.isRunning &&
        a.error === b.error &&
        a.result?.hex === b.result?.hex &&
        a.result?.base64 === b.result?.base64
    );
}

export const hmacStore = new Store<HmacState>(DEFAULT_STATE, stateEquals);