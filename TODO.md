# Phase 3 — Worker Architecture Refinement

## ✅ Plan Approved — Implementing

### Steps

- [x] Create `src/lib/tools/json-to-csv/workerProtocol.ts`
- [x] Update `src/lib/tools/json-to-csv/constants.ts`
- [x] Update `src/lib/tools/json-to-csv/types.ts`
- [x] Rewrite `src/workers/json-to-csv.worker.ts`
- [x] Rewrite `src/lib/tools/json-to-csv/jsonToCsvWorker.ts`
- [x] Update `src/lib/tools/json-to-csv/actions.ts`
- [x] Update `src/pages/tools/json-to-csv.astro`

1. **Create `src/lib/tools/json-to-csv/workerProtocol.ts`**
   - `WorkerStage` union type: `"parsing" | "flattening" | "formatting" | "complete"`
   - `ConvertRequest` with `requestId` + payload
   - `CancelRequest` with `requestId`
   - `ProgressResponse`, `DoneResponse`, `ErrorResponse`, `CancelledResponse` — all with `requestId`
   - `WorkerClientHandle` interface
   - `WorkerProgress` interface

2. **Update `src/lib/tools/json-to-csv/constants.ts`**
   - Add `WORKER_TIMEOUT_MS` exported constant (60_000)
   - Update `WORKER_STEPS` to match protocol stages

3. **Update `src/lib/tools/json-to-csv/types.ts`**
   - Add `ConversionProgress` interface
   - Add `isCancelling` and `conversionProgress` fields to `JsonToCsvState`
   - Update `DEFAULT_STATE`

4. **Rewrite `src/workers/json-to-csv.worker.ts`**
   - Import `convertJsonToCsv` from CSV engine
   - Implement typed message handler matching `WorkerRequest` union
   - Send `ProgressResponse` with stage at natural boundaries
   - Check cancellation flag per `requestId` between stages
   - Send `CancelledResponse` on cancellation
   - Send `DoneResponse` with CSV result
   - Send `ErrorResponse` on failure
   - No fake percentages — only real measurable progress

5. **Rewrite `src/lib/tools/json-to-csv/jsonToCsvWorker.ts`**
   - Implement typed message passing with `requestId`
   - Return `WorkerClientHandle` (`{ result, cancel }`)
   - Use `WORKER_TIMEOUT_MS` from constants
   - Move threshold logic inside (whether to use worker)
   - Cancel sends `CancelRequest` with `requestId`, then force-terminates after short timeout
   - Reject result promise on cancel/timeout/error

6. **Update `src/lib/tools/json-to-csv/actions.ts`**
   - Use new `WorkerClientHandle` pattern
   - Integrate cancellation — set `isCancelling` in store
   - Wire cancel to `workerHandle.cancel()`
   - Remove sync/worker threshold logic (worker client owns this)
   - Use structured progress from store

7. **Update `src/pages/tools/json-to-csv.astro`**
   - Add cancel button (visible during conversion)
   - Wire cancel action
   - Use structured progress for status display
   - Handle `isCancelling` state

### After Implementation
```bash
npm test
npm run build
```

