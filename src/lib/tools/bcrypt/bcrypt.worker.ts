import { run } from "./engine";

const ctx = self as unknown as {
    onmessage: ((e: MessageEvent) => void) | null;
    postMessage: (msg: unknown) => void;
};

interface WorkerRequest {
    id: number;
    password: string;
    rounds: number;
}

ctx.onmessage = (e: MessageEvent) => {
    const { id, password, rounds } = e.data as WorkerRequest;
    try {
        const result = run(password, rounds);
        ctx.postMessage({ id, ok: true, result });
    } catch (err) {
        const message = err instanceof Error ? err.message : "bcrypt hashing failed.";
        ctx.postMessage({ id, ok: false, error: message });
    }
};