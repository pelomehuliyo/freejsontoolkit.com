/**
 * JSON→CSV Tool — Typed Worker Protocol
 *
 * Defines the strict request/response message types for page↔worker
 * communication. All messages include a `requestId` for correlation
 * so multiple conversions can be safely managed.
 *
 * Design rules:
 *   - No anonymous postMessage() objects — every message is typed.
 *   - `requestId` is supplied by the caller (uuid / counter).
 *   - Progress percentages are ONLY reported when they represent real
 *     measurable progress (e.g. record count processed). Never simulated.
 */

// ── Worker Stages ──

export type WorkerStage =
    | "parsing"
    | "flattening"
    | "formatting"
    | "complete";

// ── Request Types (page → worker) ──

export type WorkerRequest = ConvertRequest | CancelRequest;

export interface ConvertRequest {
    readonly type: "convert";
    readonly requestId: string;
    readonly payload: {
        readonly jsonStr: string;
        readonly options: {
            readonly delimiter: string;
            readonly includeHeaders: boolean;
            readonly flatten: boolean;
        };
    };
}

export interface CancelRequest {
    readonly type: "cancel";
    readonly requestId: string;
}

// ── Response Types (worker → page) ──

export type WorkerResponse =
    | ProgressResponse
    | DoneResponse
    | ErrorResponse
    | CancelledResponse;

export interface ProgressResponse {
    readonly type: "progress";
    readonly requestId: string;
    readonly payload: {
        readonly stage: WorkerStage;
        /** Only set when real measurable progress exists (e.g. record count) */
        readonly percentage?: number;
    };
}

export interface DoneResponse {
    readonly type: "done";
    readonly requestId: string;
    readonly payload: {
        readonly csv: string;
    };
}

export interface ErrorResponse {
    readonly type: "error";
    readonly requestId: string;
    readonly payload: {
        readonly message: string;
        readonly code?: string;
    };
}

export interface CancelledResponse {
    readonly type: "cancelled";
    readonly requestId: string;
}

// ── Worker Client Types (for the Promise-based API) ──

export interface WorkerProgress {
    readonly stage: WorkerStage;
    readonly percentage?: number;
}

export interface WorkerClientResult {
    readonly csv: string;
}

export interface WorkerClientHandle {
    /** Promise that resolves with the result on success, rejects on error/cancel */
    readonly result: Promise<WorkerClientResult>;
    /** Request cancellation of this specific conversion */
    cancel(): void;
}

