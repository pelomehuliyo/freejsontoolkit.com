/**
 * UUID — engine.
 *
 * Four real versions, hand-built on crypto.getRandomValues / crypto.subtle:
 *   v4 random · v7 time-ordered (sortable) · v1 time-based · v5 name-based SHA-1.
 * v3 is intentionally absent: it needs MD5, which Web Crypto does not expose,
 * and a hand-rolled MD5 is a silent-corruption risk; v5 is its correct successor.
 *
 * v1's 60-bit timestamp is computed with BigInt so it stays exact past 2^53.
 * v7 keeps a module-level (ms, counter) clock so same-millisecond batches stay
 * strictly monotonic — which is the entire reason to reach for v7.
 *
 * Pure apart from crypto + performance.now(); no DOM, no store. Safe anywhere.
 */
import type { OrderTag, UuidFormat, UuidGenerateResult, UuidItem, UuidVersion } from "./types";
import { maxCount, RENDER_CAP } from "./constants";

const HEX = "0123456789abcdef";
function hb(b: number): string {
  return HEX[(b >> 4) & 15] + HEX[b & 15];
}

// ── module clocks ──
let v7LastMs = -1;
let v7RandA = 0;
let v1Node: Uint8Array | null = null;
let v1ClockSeq = 0;
let v1LastMs = -1;
let v1Sub = 0;

function ensureV1Node(): void {
  if (v1Node) return;
  v1Node = crypto.getRandomValues(new Uint8Array(6));
  v1Node[0] = v1Node[0] | 0x01; // set multicast bit → locally-administered node
  v1ClockSeq = crypto.getRandomValues(new Uint16Array(1))[0] & 0x3fff;
}

function groupsOf(b: Uint8Array): UuidItem["groups"] {
  return [
    hb(b[0]) + hb(b[1]) + hb(b[2]) + hb(b[3]),
    hb(b[4]) + hb(b[5]),
    hb(b[6]) + hb(b[7]),
    hb(b[8]) + hb(b[9]),
    hb(b[10]) + hb(b[11]) + hb(b[12]) + hb(b[13]) + hb(b[14]) + hb(b[15]),
  ];
}

function formatGroups(g: UuidItem["groups"], fmt: UuidFormat, upper: boolean): string {
  const map = (s: string): string => (upper ? s.toUpperCase() : s);
  const core = g.map(map);
  switch (fmt) {
    case "compact":
      return core.join("");
    case "braces":
      return "{" + core.join("-") + "}";
    case "urn":
      return "urn:uuid:" + core.join("-");
    default:
      return core.join("-");
  }
}

function build(b: Uint8Array, fmt: UuidFormat, upper: boolean, version: UuidVersion): UuidItem {
  const groups = groupsOf(b);
  return { groups, formatted: formatGroups(groups, fmt, upper), version };
}

function v4(fmt: UuidFormat, upper: boolean): UuidItem {
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  return build(b, fmt, upper, "v4");
}

function v7(fmt: UuidFormat, upper: boolean): UuidItem {
  const ms = Date.now();
  if (ms === v7LastMs) {
    v7RandA = (v7RandA + 1) & 0x0fff;
  } else {
    v7LastMs = ms;
    v7RandA = crypto.getRandomValues(new Uint16Array(1))[0] & 0x0fff;
  }
  const r = crypto.getRandomValues(new Uint8Array(10));
  const b = new Uint8Array(16);
  // 48-bit big-endian millisecond timestamp (high bytes via division to stay safe)
  b[0] = Math.floor(ms / 0x10000000000) & 0xff;
  b[1] = Math.floor(ms / 0x100000000) & 0xff;
  b[2] = (ms >>> 24) & 0xff;
  b[3] = (ms >>> 16) & 0xff;
  b[4] = (ms >>> 8) & 0xff;
  b[5] = ms & 0xff;
  b[6] = 0x70 | ((v7RandA >> 8) & 0x0f);
  b[7] = v7RandA & 0xff;
  b[8] = 0x80 | (r[2] & 0x3f);
  b[9] = r[3];
  b[10] = r[4];
  b[11] = r[5];
  b[12] = r[6];
  b[13] = r[7];
  b[14] = r[8];
  b[15] = r[9];
  return build(b, fmt, upper, "v7");
}

function v1(fmt: UuidFormat, upper: boolean): UuidItem {
  ensureV1Node();
  const ms = Date.now();
  if (ms !== v1LastMs) {
    v1LastMs = ms;
    v1Sub = crypto.getRandomValues(new Uint16Array(1))[0] % 10000;
  } else {
    v1Sub = (v1Sub + 1) % 10000;
    if (v1Sub === 0) v1ClockSeq = (v1ClockSeq + 1) & 0x3fff;
  }
  // 60-bit timestamp in 100-ns units since 1582-10-15, exact via BigInt
  const T = (BigInt(ms) + 12219292800000n) * 10000n + BigInt(v1Sub);
  const timeLow = Number(T & 0xffffffffn);
  const timeMid = Number((T >> 32n) & 0xffffn);
  const timeHi = Number((T >> 48n) & 0x0fffn);
  const b = new Uint8Array(16);
  b[0] = timeLow & 0xff;
  b[1] = (timeLow >> 8) & 0xff;
  b[2] = (timeLow >> 16) & 0xff;
  b[3] = (timeLow >> 24) & 0xff;
  b[4] = timeMid & 0xff;
  b[5] = (timeMid >> 8) & 0xff;
  b[6] = timeHi & 0xff;
  b[7] = ((timeHi >> 8) & 0x0f) | 0x10;
  b[8] = ((v1ClockSeq >> 8) & 0x3f) | 0x80;
  b[9] = v1ClockSeq & 0xff;
  b[10] = v1Node![0];
  b[11] = v1Node![1];
  b[12] = v1Node![2];
  b[13] = v1Node![3];
  b[14] = v1Node![4];
  b[15] = v1Node![5];
  return build(b, fmt, upper, "v1");
}

function parseUuidBytes(s: string): Uint8Array {
  const h = s.replace(/-/g, "");
  if (h.length !== 32 || !/^[0-9a-f]{32}$/i.test(h)) {
    throw new Error("Namespace must be a 32-hex (36-char) UUID");
  }
  const b = new Uint8Array(16);
  for (let i = 0; i < 16; i++) b[i] = parseInt(h.substr(i * 2, 2), 16);
  return b;
}

async function v5(
  namespaceUuid: string,
  name: string,
  fmt: UuidFormat,
  upper: boolean,
): Promise<UuidItem> {
  const ns = parseUuidBytes(namespaceUuid);
  const nm = new TextEncoder().encode(name);
  const buf = new Uint8Array(ns.length + nm.length);
  buf.set(ns, 0);
  buf.set(nm, ns.length);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-1", buf));
  const b = digest.slice(0, 16);
  b[6] = (b[6] & 0x0f) | 0x50;
  b[8] = (b[8] & 0x3f) | 0x80;
  return build(b, fmt, upper, "v5");
}

export interface GenerateOpts {
  version: UuidVersion;
  count: number;
  format: UuidFormat;
  upper: boolean;
  namespaceUuid: string;
  name: string;
}

export async function generate(opts: GenerateOpts): Promise<UuidGenerateResult> {
  const cap = maxCount(opts.version);
  const count = Math.max(1, Math.min(opts.count || 1, cap));

  if (opts.version === "v5" && opts.name.trim() === "") {
    throw new Error("Version 5 needs a name to hash.");
  }

  const t0 = performance.now();
  const items: UuidItem[] = [];

  if (opts.version === "v5") {
    for (let i = 0; i < count; i++) {
      // distinct name-based ids: suffix the index so a batch isn't N copies
      const nm = count === 1 ? opts.name : `${opts.name}#${i}`;
      items.push(await v5(opts.namespaceUuid, nm, opts.format, opts.upper));
    }
  } else {
    for (let i = 0; i < count; i++) {
      if (opts.version === "v4") items.push(v4(opts.format, opts.upper));
      else if (opts.version === "v7") items.push(v7(opts.format, opts.upper));
      else items.push(v1(opts.format, opts.upper));
    }
  }
  const ms = performance.now() - t0;

  let orderTag: OrderTag = "random";
  let orderOk = false;
  if (opts.version === "v7") {
    orderTag = "sortable";
    orderOk = true;
    for (let i = 1; i < items.length; i++) {
      if (items[i].formatted < items[i - 1].formatted) {
        orderOk = false;
        break;
      }
    }
  } else if (opts.version === "v1") {
    orderTag = "time-based";
  } else if (opts.version === "v5") {
    orderTag = "deterministic";
  }

  return {
    items,
    ms,
    orderTag,
    orderOk,
    rendered: Math.min(items.length, RENDER_CAP),
  };
}
