import { Store } from "../../state/toolStore";
import type { Sha512State } from "./types";
import { DEFAULT_STATE } from "./types";

function stateEquals(a: Sha512State, b: Sha512State): boolean {
    return (
        a.input === b.input &&
        a.encoding === b.encoding &&
        a.isRunning === b.isRunning &&
        a.error === b.error &&
        a.result?.hex === b.result?.hex &&
        a.result?.base64 === b.result?.base64
    );
}

export const sha512Store = new Store<Sha512State>(DEFAULT_STATE, stateEquals);