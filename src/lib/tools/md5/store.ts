import { Store } from "../../state/toolStore";
import type { Md5State } from "./types";
import { DEFAULT_STATE } from "./types";

function stateEquals(a: Md5State, b: Md5State): boolean {
    return (
        a.input === b.input &&
        a.encoding === b.encoding &&
        a.isRunning === b.isRunning &&
        a.error === b.error &&
        a.result?.hex === b.result?.hex &&
        a.result?.base64 === b.result?.base64
    );
}

export const md5Store = new Store<Md5State>(DEFAULT_STATE, stateEquals);