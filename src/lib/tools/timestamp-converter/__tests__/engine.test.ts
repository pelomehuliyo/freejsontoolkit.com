import { describe, expect, it } from "vitest";
import { run, nowLocalInput, UNIT_ORDER } from "../engine";
import { timestampStore } from "../store";
import { DEFAULT_STATE } from "../types";

describe("timestamp-converter engine", () => {
    it("converts a seconds timestamp to a date (2026-08-05)", () => {
        const res = run("1785931200", { mode: "to-date", unit: "seconds" });
        expect(res.valid).toBe(true);
        expect(res.error).toBeNull();
        expect(res.date?.utcIso).toBe("2026-08-05T12:00:00.000Z");
        expect(res.date?.epochMs).toBe(1785931200000);
    });

    it("produces exact BigInt values in every unit", () => {
        const res = run("2026-08-05T12:00:00Z", { mode: "to-timestamp", unit: "seconds" });
        expect(res.valid).toBe(true);
        const values = res.values!;
        expect(new Set(values.map((v) => v.unit))).toEqual(new Set(UNIT_ORDER));
        const byUnit = new Map(values.map((v) => [v.unit, v]));
        expect(byUnit.get("seconds")?.raw).toBe("1785931200");
        expect(byUnit.get("milliseconds")?.raw).toBe("1785931200000");
        expect(byUnit.get("microseconds")?.raw).toBe("1785931200000000");
        expect(byUnit.get("nanoseconds")?.raw).toBe("1785931200000000000");
    });

    it("rejects invalid timestamps", () => {
        const res = run("not-a-date", { mode: "to-date", unit: "seconds" });
        expect(res.valid).toBe(false);
        expect(res.error).toBeTruthy();
    });

    it("nowLocalInput returns a parsable local ISO string", () => {
        const input = nowLocalInput();
        expect(input).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
        const res = run(input, { mode: "to-timestamp", unit: "seconds" });
        expect(res.valid).toBe(true);
    });
});

describe("timestamp-converter store", () => {
    it("exposes the created store with default state", () => {
        expect(timestampStore.get()).toEqual(DEFAULT_STATE);
    });
});