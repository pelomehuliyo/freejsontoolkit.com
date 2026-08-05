// A sample with a real mismatch: the schema demands "role" and bans extra keys,
// but the third record is missing "role" and carries an extra "score".
// Load Sample LOADS ONLY; press Validate.
export const SAMPLE_INSTANCE = `{
  "users": [
    { "name": "Ada", "role": "engineer" },
    { "name": "Alan", "role": "mathematician" },
    { "name": "Grace" }
  ]
}`;

export const SAMPLE_SCHEMA = `{
  "type": "object",
  "required": ["users"],
  "additionalProperties": false,
  "properties": {
    "users": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["name", "role"],
        "additionalProperties": false,
        "properties": {
          "name": { "type": "string", "minLength": 1 },
          "role": { "type": "string", "enum": ["engineer", "mathematician", "admiral"] }
        }
      }
    }
  }
}`;

export const MAX_INPUT_CHARS = 15_000_000;

// Live (main-thread) validation caps here so big inputs never hitch the UI;
// above it, the result arrives via the worker when you press Validate.
export const LIVE_VALIDATE_THRESHOLD = 300_000;

// Cap on reported violations so one bad document can't flood the panel —
// the first failures tell you what's wrong; the cap keeps it readable.
export const MAX_ERRORS = 100;