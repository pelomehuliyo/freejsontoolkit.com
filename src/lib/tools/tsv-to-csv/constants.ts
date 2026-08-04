// A small rectangular sample with ONE field that contains a comma — in TSV a
// comma is just data, but when you convert, watch it come out quoted in the
// CSV. Load Sample LOADS ONLY; press Convert.
export const SAMPLE_TSV = `name\trole\tcity
Ada Lovelace\tEngineer, Analyst\tLondon
Alan Turing\tMathematician\tCambridge
Grace Hopper\tAdmiral\tArlington VA`;

export const MAX_INPUT_CHARS = 15_000_000;

// Live (main-thread) conversion caps here so big tables never hitch the UI;
// above it, the result arrives via the worker when you press Convert.
export const LIVE_CONVERT_THRESHOLD = 100_000;