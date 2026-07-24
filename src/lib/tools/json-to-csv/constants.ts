/**
 * JSON→CSV Tool — Constants & Configuration
 *
 * All configurable thresholds and static data live here so they
 * can be tuned independently of business logic.
 */

import type { DelimiterOption } from "./types";

// ── File-size thresholds (in characters) ──

/** Inputs larger than this show a preview instead of the full text */
export const LARGE_FILE_THRESHOLD = 500_000;

/** Inputs larger than this trigger a user confirm dialog before conversion */
export const WARNING_THRESHOLD = 5_000_000;

/** Hard limit — inputs above this are rejected */
export const MAX_INPUT_CHARS = 15_000_000;

/** Inputs above this length use the Web Worker for conversion */
export const USE_WORKER_ABOVE_CHARS = 400_000;

/** Number of characters to show in preview mode for both input and output */
export const PREVIEW_LENGTH = 20_000;

// ── Worker progress steps ──

export const WORKER_STEPS = {
    START: "start",
    PARSING: "parsing",
    FLATTENING: "flattening",
    FORMATTING: "formatting",
    DONE: "done",
    ERROR: "error",
} as const;

// ── UI options ──

export const DELIMITER_OPTIONS: DelimiterOption[] = [
    { value: ",", label: "Comma ( , )" },
    { value: ";", label: "Semicolon ( ; )" },
    { value: "\t", label: "Tab ( \\t )" },
];

// ── Sample data ──

export const SAMPLE_JSON = `[
  {
    "id": 1,
    "name": "Leanne Graham",
    "username": "Bret",
    "email": "Sincere@april.biz",
    "address": {
      "street": "Kulas Light",
      "suite": "Apt. 556",
      "city": "Gwenborough"
    }
  },
  {
    "id": 2,
    "name": "Ervin Howell",
    "username": "Antonette",
    "email": "Shanna@melissa.tv",
    "address": {
      "street": "Victor Plains",
      "suite": "Suite 879",
      "city": "Wisokyburgh"
    }
  }
]`;

