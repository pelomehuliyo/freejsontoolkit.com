import { Store } from "../../state/toolStore";
import type { Sha256State } from "./types";
import { DEFAULT_STATE } from "./types";

function stateEquals(a: Sha256State, b: Sha256State): boolean {
    return (
        a.input === b.input &&
        a.encoding === b.encoding &&
        a.isRunning === b.isRunning &&
        a.error === b.error &&
        a.result?.hex === b.result?.hex &&
        a.result?.base64 === b.result?.base64
    );
}

export const sha256Store = new Store<Sha256State>(DEFAULT_STATE, stateEquals);