export interface BcryptState {
    input: string;
    rounds: number;
    result: string | null;
    isRunning: boolean;
    error: string | null;
}

export const DEFAULT_STATE: BcryptState = {
    input: "",
    rounds: 10,
    result: null,
    isRunning: false,
    error: null,
};