export type UuidVersion = "v1" | "v4" | "v5" | "v7";
export type UuidFormat = "hyphen" | "compact" | "braces" | "urn";

export interface UuidItem {
  /** the five hex groups, lowercase — the page tints them for the ledger */
  groups: [string, string, string, string, string];
  /** fully formatted per the chosen format + case, used for copy/download */
  formatted: string;
  version: UuidVersion;
}

export type OrderTag = "sortable" | "time-based" | "random" | "deterministic";

export interface UuidGenerateResult {
  items: UuidItem[];
  ms: number;
  orderTag: OrderTag;
  orderOk: boolean; // true only when a sortable batch verified monotonic
  rendered: number; // how many rows the UI should draw (<= items.length)
}

export interface UuidState {
  version: UuidVersion;
  count: number;
  format: UuidFormat;
  upper: boolean;
  // v5 inputs
  namespaceMode: "preset" | "custom";
  namespaceUuid: string;
  customNamespace: string;
  name: string;
  // output
  result: UuidGenerateResult | null;
  isRunning: boolean;
  sessionTotal: number;
  error: string | null;
}

export const DEFAULT_STATE: UuidState = {
  version: "v4",
  count: 5,
  format: "hyphen",
  upper: false,
  namespaceMode: "preset",
  namespaceUuid: "6ba7b810-9dad-11d1-80b4-00c04fd430c8", // DNS
  customNamespace: "",
  name: "",
  result: null,
  isRunning: false,
  sessionTotal: 0,
  error: null,
};
