/**
 * JSON Converter Utilities
 *
 * Re-exports from the modular src/lib/csv/ architecture.
 *
 * Maintains backward compatibility for:
 *   - src/lib/lib/json-to-csv.worker.ts
 *   - src/pages/tools/json-to-csv.astro
 *   - Any other consumer importing from "src/lib/converter"
 */

export type { ConversionOptions } from "./csv/types";
export { convertJsonToCsv as jsonToCsv } from "./csv/converter";
