/**
 * CSV Benchmark Data Generator
 *
 * Pre-generates CSV data files to disk for benchmark use.
 * Run once before benchmarks: `npx tsx src/lib/csv/__benchmarks__/generateData.ts`
 *
 * Or without tsx: `node --loader ts-node/esm src/lib/csv/__benchmarks__/generateData.ts`
 * Simpler: Use the npm script `npm run bench:generate`
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { generateBenchmarkCsv, CSV_SIZES } from "./csvBenchmarkData";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "data");

function main() {
    mkdirSync(DATA_DIR, { recursive: true });

    for (const size of CSV_SIZES) {
        const label = size.label.toLowerCase();
        const filePath = join(DATA_DIR, `${label}.csv`);

        console.log(`Generating ${size.label} (${size.rowCount.toLocaleString()} rows)...`);
        const start = Date.now();

        const { csv, headers, rowCount } = generateBenchmarkCsv(size.rowCount);

        writeFileSync(filePath, csv, "utf-8");

        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        const fileSizeKb = (csv.length / 1024).toFixed(1);
        console.log(`  → ${filePath} (${fileSizeKb} KB, ${rowCount.toLocaleString()} rows, ${elapsed}s)`);
    }

    // Generate edge case: quoted fields
    console.log(`\nGenerating quoted.csv (10K rows all quoted)...`);
    const { csv: quotedCsv } = generateBenchmarkCsv(10_000);
    const quotedLines = quotedCsv.split("\n").map(
        (line) => line.split(",").map((f) => `"${f}"`).join(",")
    );
    writeFileSync(join(DATA_DIR, "quoted.csv"), quotedLines.join("\n"), "utf-8");

    console.log("\nDone! All benchmark data files generated.");
}

main();

