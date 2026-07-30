/**
 * CSV Module — Automatic Delimiter Detection
 *
 * Detects the most likely delimiter in a CSV string by sampling the first N
 * non-empty lines and scoring each candidate delimiter (comma, semicolon,
 * tab, pipe, colon) based on per-line frequency consistency.
 *
 * Design:
 *   - Lightweight character scanner (NOT the full parser — no circular imports)
 *   - Quoted-field aware: delimiters inside double-quoted fields are ignored
 *   - Two-pass scoring: Pass 1 = frequency + consistency, Pass 2 = tiebreaker
 *   - Deterministic, pure, side-effect free, O(n) amortized
 *
 * The detector is completely independent of csvParser.ts and must never import it.
 */

import type { CsvDelimiter, DelimiterDetectionResult, DetectorOptions } from "./types";

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

/** Default number of non-empty lines to sample for detection */
export const DEFAULT_SAMPLE_LINES = 10;

/** The five candidate delimiters we test */
const CANDIDATE_DELIMITERS: CsvDelimiter[] = [",", ";", "\t", "|", ":"];

/**
 * Tiebreaker threshold: if the top two scores are within this ratio of each
 * other, the result is considered ambiguous and a second pass is triggered.
 */
const TIEBREAKER_THRESHOLD = 0.05;

/**
 * Fallback priority order when scores are truly equal after tiebreaker.
 * Comma is most common, followed by semicolon (common in European locales),
 * then tab, pipe, colon.
 */
const FALLBACK_PRIORITY: CsvDelimiter[] = [",", ";", "\t", "|", ":"];

// ──────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────

/**
 * Automatically detects the delimiter used in a CSV string.
 *
 * The algorithm:
 *   1. Collect up to `sampleLines` non-empty lines from the input.
 *   2. For each candidate delimiter, count occurrences per line (ignoring
 *      quoted regions). Store per-line counts.
 *   3. Score each delimiter: `score = consistencyWeight × frequencyWeight`.
 *   4. If the top two scores are within 5 % of each other, run a tiebreaker
 *      that re-scans the first 3 rows with only the tied delimiters,
 *      checking field-count consistency.
 *   5. Return the winner with confidence and score breakdown.
 *
 * @param csv     Raw CSV input string
 * @param options Optional detector configuration
 * @returns       A DelimiterDetectionResult with the detected delimiter,
 *                confidence (0–1), per-delimiter scores, and ambiguity info
 *
 * @example
 * detectDelimiter("a,b,c\\n1,2,3")
 * // → { delimiter: ",", confidence: 1, scores: { ",": 1, ";": 0, ... }, ... }
 *
 * detectDelimiter("")
 * // → { delimiter: ",", confidence: 0, scores: { ",": 0, ... }, ... }
 *
 * detectDelimiter("a;b;c\\n1;2;3")
 * // → { delimiter: ";", confidence: 1, scores: { ",": 0, ";": 1, ... }, ... }
 */
export function detectDelimiter(
  csv: string,
  options: DetectorOptions = {},
): DelimiterDetectionResult {
  const sampleLines = options.sampleLines ?? DEFAULT_SAMPLE_LINES;

  // ── Step 1: Collect non-empty sample lines ──
  const lines = collectSampleLines(csv, sampleLines);

  if (lines.length === 0) {
    return emptyResult();
  }

  // ── Step 2: Count delimiter occurrences per line ──
  // perLineCounts[delimiter] = number[] of per-line counts (one entry per line)
  const perLineCounts = new Map<CsvDelimiter, number[]>();
  for (const delim of CANDIDATE_DELIMITERS) {
    perLineCounts.set(delim, []);
  }

  for (const line of lines) {
    const counts = countDelimiters(line);
    for (const delim of CANDIDATE_DELIMITERS) {
      perLineCounts.get(delim)!.push(counts[delim]);
    }
  }

  // ── Step 3: Score each delimiter ──
  const scores: Record<string, number> = {
    ",": 0,
    ";": 0,
    "\t": 0,
    "|": 0,
    ":": 0,
  };

  for (const delim of CANDIDATE_DELIMITERS) {
    scores[delim] = computeScore(perLineCounts.get(delim)!, lines.length);
  }

  // ── Step 4: Rank and select winner ──
  const ranked = rankDelimiters(scores);

  if (ranked.length === 0) {
    return emptyResult();
  }

  const top = ranked[0];
  const runnerUp = ranked.length > 1 ? ranked[1] : null;

  // Check ambiguity: are top 2 scores within TIEBREAKER_THRESHOLD?
  let ambiguous = false;
  let tiebroken = false;

  if (runnerUp && top.score > 0) {
    const ratio = Math.abs(top.score - runnerUp.score) / top.score;
    ambiguous = ratio <= TIEBREAKER_THRESHOLD;
  }

  // ── Step 5: Tiebreaker pass (lightweight scanner, NOT full parser) ──
  let winner = top.delimiter;
  let runnerUpDelim: CsvDelimiter | undefined;

  if (ambiguous && runnerUp) {
    // Tiebreaker: re-scan first 3 lines with tied delimiters,
    // compare per-line field count consistency
    const tiedDelims = [top.delimiter, runnerUp.delimiter];
    const tieResult = resolveTie(lines.slice(0, 3), tiedDelims);

    if (tieResult) {
      winner = tieResult;
      tiebroken = true;
      // Re-evaluate ambiguity after tiebreaker
      if (tieResult === runnerUp.delimiter) {
        runnerUpDelim = top.delimiter;
      }
    }
  }

  // If still ambiguous, apply fallback priority
  if (ambiguous && runnerUp && !tiebroken) {
    // Use fallback priority to break the tie
    for (const delim of FALLBACK_PRIORITY) {
      if (delim === top.delimiter || delim === runnerUp.delimiter) {
        winner = delim;
        runnerUpDelim = delim === top.delimiter ? runnerUp.delimiter : top.delimiter;
        tiebroken = true;
        break;
      }
    }
  }

  // Detect if runner-up should be reported
  if (!runnerUpDelim && runnerUp && ambiguous) {
    runnerUpDelim = runnerUp.delimiter;
  }

  // Compute overall confidence
  const confidence = computeConfidence(winner, scores, lines.length, ranked);

  return {
    delimiter: winner,
    confidence,
    scores: scores as Record<CsvDelimiter, number>,
    sampledLines: lines.length,
    tiebroken,
    ambiguous: ambiguous && !tiebroken,
    runnerUp: runnerUpDelim,
  };
}

// ──────────────────────────────────────────────
// Internal Helpers
// ──────────────────────────────────────────────

/**
 * Collects non-empty lines from the CSV input, up to `maxLines`.
 * Strips BOM, normalises line endings, and skips blank/whitespace-only lines.
 *
 * Uses character scanning (indexOf) instead of split("\n") to avoid
 * allocating an array of ALL lines when only a sample is needed.
 * This is critical for large CSV files where split("\n") would create
 * hundreds of thousands of strings just to extract 10 lines.
 */
function collectSampleLines(csv: string, maxLines: number): string[] {
  // Strip BOM
  let clean = csv.replace(/^\uFEFF/, "");

  // Normalise line endings
  clean = clean.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const lines: string[] = [];
  let pos = 0;
  let nextPos: number;

  while (lines.length < maxLines && pos < clean.length) {
    nextPos = clean.indexOf("\n", pos);
    if (nextPos === -1) {
      // Last line (no trailing newline)
      const line = clean.slice(pos);
      if (line.trim() !== "") {
        lines.push(line);
      }
      break;
    }
    const line = clean.slice(pos, nextPos);
    if (line.trim() !== "") {
      lines.push(line);
    }
    pos = nextPos + 1;
  }

  return lines;
}

/**
 * Counts occurrences of each candidate delimiter in a single line,
 * respecting double-quoted regions.
 *
 * This is a lightweight FSM scanner — NOT the full parser.
 * It only tracks quote state and delimiter characters.
 */
function countDelimiters(line: string): Record<string, number> {
  const counts: Record<string, number> = { ",": 0, ";": 0, "\t": 0, "|": 0, ":": 0 };
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes) {
        // Inside quotes: check for escaped quote ""
        if (i + 1 < line.length && line[i + 1] === '"') {
          i += 2; // skip escaped quote
          continue;
        }
        // Closing quote
        inQuotes = false;
      } else {
        // Opening quote
        inQuotes = true;
      }
      i++;
      continue;
    }

    if (!inQuotes) {
      if (ch === ",") counts[","]++;
      else if (ch === ";") counts[";"]++;
      else if (ch === "\t") counts["\t"]++;
      else if (ch === "|") counts["|"]++;
      else if (ch === ":") counts[":"]++;
    }

    i++;
  }

  return counts;
}

/**
 * Computes the score for a single delimiter based on its per-line counts.
 *
 * Score formula:
 *   consistencyWeight = (number of non-zero lines where count == mode) / totalLines
 *   frequencyWeight   = min(averageCount / expectedCount, 1)
 *   score             = consistencyWeight × frequencyWeight
 *
 * If all counts are zero, score = 0.
 */
function computeScore(counts: number[], totalLines: number): number {
  // Check if delimiter appears at all
  const nonZeroCounts = counts.filter((c) => c > 0);
  if (nonZeroCounts.length === 0) {
    return 0;
  }

  // ── consistencyWeight ──
  // Find the mode (most common non-zero count)
  const freqMap = new Map<number, number>();
  for (const c of nonZeroCounts) {
    freqMap.set(c, (freqMap.get(c) ?? 0) + 1);
  }

  let modeCount = 0;
  let modeFrequency = 0;
  for (const [count, frequency] of freqMap) {
    if (frequency > modeFrequency) {
      modeCount = count;
      modeFrequency = frequency;
    }
  }

  // Consistency = fraction of lines that have the modal non-zero count
  const consistentLines = nonZeroCounts.filter((c) => c === modeCount).length;
  const consistencyWeight = consistentLines / totalLines;

  // ── frequencyWeight ──
  // Average count per line (only considering non-zero lines)
  const totalOccurrences = nonZeroCounts.reduce((a, b) => a + b, 0);
  const averageCount = totalOccurrences / totalLines;

  // expectedCount = modeCount (the most common count is our "expected" column count)
  const expectedCount = modeCount;
  const frequencyWeight = expectedCount > 0 ? Math.min(averageCount / expectedCount, 1) : 0;

  // ── final score ──
  return consistencyWeight * frequencyWeight;
}

/**
 * Ranks delimiters by their scores in descending order.
 */
interface RankedDelimiter {
  delimiter: CsvDelimiter;
  score: number;
}

function rankDelimiters(scores: Record<string, number>): RankedDelimiter[] {
  const entries = CANDIDATE_DELIMITERS.map((d) => ({
    delimiter: d,
    score: scores[d],
  }));
  entries.sort((a, b) => b.score - a.score);
  return entries;
}

/**
 * Tiebreaker: for each tied delimiter, count how many fields appear per line
 * using the lightweight scanner. The delimiter that produces the most
 * consistent field counts across lines wins.
 *
 * This does NOT use the full parser — it uses the same lightweight
 * `countDelimiters` scanner to keep detection independent of csvParser.ts.
 */
function resolveTie(lines: string[], tiedDelims: CsvDelimiter[]): CsvDelimiter | null {
  if (lines.length === 0 || tiedDelims.length === 0) {
    return null;
  }

  let bestDelim: CsvDelimiter | null = null;
  let bestConsistency = -1;

  for (const delim of tiedDelims) {
    // For each line, count how many fields the delimiter would produce
    const fieldCounts: number[] = [];

    for (const line of lines) {
      const counts = countDelimiters(line);
      // Field count = delimiter count + 1 (for the fields between delimiters)
      fieldCounts.push(counts[delim] + 1);
    }

    // Consistency = how many lines have the most common field count
    const freqMap = new Map<number, number>();
    for (const fc of fieldCounts) {
      freqMap.set(fc, (freqMap.get(fc) ?? 0) + 1);
    }

    let maxFreq = 0;
    for (const freq of freqMap.values()) {
      if (freq > maxFreq) maxFreq = freq;
    }

    const consistency = maxFreq / lines.length;

    if (consistency > bestConsistency) {
      bestConsistency = consistency;
      bestDelim = delim;
    } else if (consistency === bestConsistency && bestDelim) {
      // Prefer the one with higher field counts (more columns = more specific)
      const bestCounts = countDelimiters(lines[0]);
      const currentCounts = countDelimiters(lines[0]);
      if (currentCounts[delim] > bestCounts[bestDelim]) {
        bestDelim = delim;
      }
    }
  }

  return bestDelim;
}

/**
 * Computes overall confidence (0–1) based on the winner's score and how
 * much it outperforms the runner-up.
 *
 * Confidence is deterministic and based solely on measurable statistics:
 *   - If the winner's score is 0, confidence = 0
 *   - If the winner is the only delimiter with a non-zero score, confidence = score
 *   - Otherwise, confidence is adjusted by the margin over the runner-up
 */
function computeConfidence(
  winner: CsvDelimiter,
  scores: Record<string, number>,
  sampledLines: number,
  ranked: RankedDelimiter[],
): number {
  const winnerScore = scores[winner];

  if (winnerScore <= 0 || sampledLines === 0) {
    return 0;
  }

  const runnerUpScore = ranked.length > 1 ? ranked[1].score : 0;

  if (runnerUpScore <= 0) {
    // Only one delimiter found — confidence = raw score
    return Math.min(winnerScore, 1);
  }

  // Margin-adjusted confidence: how much better is the winner?
  const margin = (winnerScore - runnerUpScore) / Math.max(winnerScore, 0.001);
  // Clamp: margin is 0–1 (if runnerUp is 0) or could be small
  const adjustedScore = winnerScore * (0.5 + 0.5 * margin);

  return Math.min(Math.max(adjustedScore, 0), 1);
}

/**
 * Returns a default result for empty/invalid input.
 * Uses comma as a safe fallback with zero confidence.
 */
function emptyResult(): DelimiterDetectionResult {
  return {
    delimiter: ",",
    confidence: 0,
    scores: { ",": 0, ";": 0, "\t": 0, "|": 0, ":": 0 },
    sampledLines: 0,
    tiebroken: false,
    ambiguous: false,
  };
}
