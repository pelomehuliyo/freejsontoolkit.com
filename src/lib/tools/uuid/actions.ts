import type { Store } from "../../state/toolStore";
import type {
    UuidFormat,
    UuidGenerateResult,
    UuidState,
    UuidVersion,
} from "./types";
import { generate } from "./engine";
import { NAMESPACE_PRESETS } from "./constants";

export function setVersion(store: Store<UuidState>, version: UuidVersion): void {
    store.update((s) => ({ ...s, version, error: null }));
}
export function setCount(store: Store<UuidState>, count: number): void {
    store.update((s) => ({ ...s, count: Math.max(1, count | 0) }));
}
export function setFormat(store: Store<UuidState>, format: UuidFormat): void {
    store.update((s) => ({ ...s, format }));
}
export function setUpper(store: Store<UuidState>, upper: boolean): void {
    store.update((s) => ({ ...s, upper }));
}
export function setNamespacePreset(store: Store<UuidState>, id: string): void {
    const p = NAMESPACE_PRESETS.find((x) => x.id === id) ?? NAMESPACE_PRESETS[0];
    store.update((s) => ({ ...s, namespaceMode: "preset", namespaceUuid: p.uuid }));
}
export function setCustomNamespace(store: Store<UuidState>, value: string): void {
    store.update((s) => ({ ...s, customNamespace: value, namespaceMode: "custom", namespaceUuid: value }));
}
export function setName(store: Store<UuidState>, value: string): void {
    store.update((s) => ({ ...s, name: value, error: null }));
}

export function clearAll(store: Store<UuidState>): void {
    store.update((s) => ({ ...s, result: null, error: null }));
}

export async function runGenerate(store: Store<UuidState>): Promise<void> {
    const s = store.get();
    if (s.isRunning) return;
    store.update((x) => ({ ...x, isRunning: true, error: null }));
    try {
        const result: UuidGenerateResult = await generate({
            version: s.version,
            count: s.count,
            format: s.format,
            upper: s.upper,
            namespaceUuid: s.namespaceUuid,
            name: s.name,
        });
        store.update((x) => ({
            ...x,
            isRunning: false,
            result,
            sessionTotal: x.sessionTotal + result.items.length,
        }));
    } catch (err) {
        store.update((x) => ({
            ...x,
            isRunning: false,
            error: err instanceof Error ? err.message : "Generation failed.",
        }));
    }
}