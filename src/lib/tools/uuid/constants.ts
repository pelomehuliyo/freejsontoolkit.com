import type { UuidVersion } from "./types";

export const NAMESPACE_PRESETS: { id: string; label: string; uuid: string }[] = [
  { id: "dns", label: "DNS", uuid: "6ba7b810-9dad-11d1-80b4-00c04fd430c8" },
  { id: "url", label: "URL", uuid: "6ba7b811-9dad-11d1-80b4-00c04fd430c8" },
  { id: "oid", label: "OID", uuid: "6ba7b812-9dad-11d1-80b4-00c04fd430c8" },
  { id: "x500", label: "X.500", uuid: "6ba7b814-9dad-11d1-80b4-00c04fd430c8" },
];

export const COUNT_PRESETS: number[] = [1, 10, 100, 1000];

// Per-version bulk caps. v5 is low because each item is one SHA-1 over the
// network-free subtle API and a single name would otherwise repeat.
export function maxCount(v: UuidVersion): number {
  return v === "v5" ? 256 : 5000;
}

// The ledger only draws this many rows; copy-all / download still carry all.
export const RENDER_CAP = 300;

export interface VersionMeta {
  version: UuidVersion;
  name: string;
  blurb: string;
  tags: string[];
}

// The legend — varied rows, not equal cards; this *is* the documentation.
export const VERSION_LEGEND: VersionMeta[] = [
  {
    version: "v4",
    name: "Version 4 — Random",
    blurb: "122 bits of cryptographic randomness. The default for opaque identifiers.",
    tags: ["random", "crypto.getRandomValues"],
  },
  {
    version: "v7",
    name: "Version 7 — Time-ordered",
    blurb:
      "A 48-bit Unix-ms prefix plus randomness. Sorts chronologically — ideal as a database key.",
    tags: ["time-ordered", "sortable", "monotonic"],
  },
  {
    version: "v1",
    name: "Version 1 — Time-based",
    blurb: "Timestamp + clock sequence + node. Time-derived, but its bytes don't sort as strings.",
    tags: ["time-based", "not lex-sorted"],
  },
  {
    version: "v5",
    name: "Version 5 — Name-based (SHA-1)",
    blurb: "A deterministic hash of a namespace + name. Same input always yields the same UUID.",
    tags: ["name-based", "sha-1", "deterministic"],
  },
];
