import { Store } from "../../state/toolStore";
import type { BcryptState } from "./types";
import { DEFAULT_STATE } from "./types";

function stateEquals(a: BcryptState, b: BcryptState): boolean {
    return (
        a.input === b.input &&
        a.rounds === b.rounds &&
        a.result === b.result &&
        a.isRunning === b.isRunning &&
        a.error === b.error
    );
}

export const bcryptStore = new Store<BcryptState>(DEFAULT_STATE, stateEquals);