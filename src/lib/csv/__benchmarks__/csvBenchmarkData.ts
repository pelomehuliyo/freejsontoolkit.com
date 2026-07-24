/**
 * CSV Benchmark — Data Generator
 *
 * Generates synthetic CSV data of various sizes for benchmarking.
 * Deterministic (seeded RNG) for reproducible results.
 */

// ──────────────────────────────────────────────
// Seeded PRNG (Mulberry32) for reproducibility
// ──────────────────────────────────────────────

function mulberry32(seed: number): () => number {
    return () => {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// ──────────────────────────────────────────────
// Column Definitions
// ──────────────────────────────────────────────

interface ColumnDef {
    name: string;
    generate: (rng: () => number) => string;
}

const STANDARD_COLUMNS: ColumnDef[] = [
    {
        name: "id",
        generate: (rng) => Math.floor(rng() * 1_000_000).toString(),
    },
    {
        name: "name",
        generate: (rng) => {
            const first = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Hank", "Ivy", "Jack"];
            const last = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
            return `${first[Math.floor(rng() * first.length)]} ${last[Math.floor(rng() * last.length)]}`;
        },
    },
    {
        name: "email",
        generate: (rng) => {
            const domains = ["example.com", "test.org", "demo.net", "sample.io", "fakemail.com"];
            const name = `user${Math.floor(rng() * 10000)}`;
            return `${name}@${domains[Math.floor(rng() * domains.length)]}`;
        },
    },
    {
        name: "age",
        generate: (rng) => Math.floor(rng() * 80 + 18).toString(),
    },
    {
        name: "salary",
        generate: (rng) => (Math.floor(rng() * 200_000 * 100) / 100).toFixed(2),
    },
    {
        name: "is_active",
        generate: (rng) => (rng() > 0.5 ? "true" : "false"),
    },
    {
        name: "department",
        generate: (rng) => {
            const depts = ["Engineering", "Sales", "Marketing", "HR", "Finance", "Legal", "Support", "QA", "DevOps", "Product"];
            return depts[Math.floor(rng() * depts.length)];
        },
    },
    {
        name: "start_date",
        generate: (rng) => {
            const year = Math.floor(rng() * 20) + 2005;
            const month = Math.floor(rng() * 12) + 1;
            const day = Math.floor(rng() * 28) + 1;
            return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
        },
    },
    {
        name: "rating",
        generate: (rng) => (Math.floor(rng() * 50) / 10).toFixed(1),
    },
    {
        name: "notes",
        generate: (rng) => {
            const phrases = [
                "Excellent performer",
                "Needs improvement",
                "Good team player",
                "On track",
                "Exceeds expectations",
                "New hire",
                "Looking for growth",
                "Consistent results",
                "Highly skilled",
                "Great communication",
            ];
            return phrases[Math.floor(rng() * phrases.length)];
        },
    },
];

// ──────────────────────────────────────────────
// CSV Data Generation
// ──────────────────────────────────────────────

export interface BenchmarkCsv {
    csv: string;
    headers: string[];
    rowCount: number;
}

/**
 * Generates a synthetic CSV string of the specified size.
 *
 * @param rowCount Number of data rows to generate
 * @param seed     PRNG seed for reproducibility (default: 42)
 * @returns        Object with CSV string, headers array, and row count
 */
export function generateBenchmarkCsv(rowCount: number, seed = 42): BenchmarkCsv {
    const rng = mulberry32(seed);
    const headers = STANDARD_COLUMNS.map((c) => c.name);
    const rows: string[] = [];

    for (let i = 0; i < rowCount; i++) {
        const row = STANDARD_COLUMNS.map((col) => col.generate(rng)).join(",");
        rows.push(row);
    }

    const csv = headers.join(",") + "\n" + rows.join("\n");
    return { csv, headers, rowCount };
}

/**
 * Generates a CSV with heavy quoting (simulating user-generated content).
 * Every field is wrapped in double quotes.
 */
export function generateQuotedCsv(rowCount: number, seed = 42): BenchmarkCsv {
    const rng = mulberry32(seed);
    const headers = STANDARD_COLUMNS.map((c) => c.name);
    const rows: string[] = [];

    for (let i = 0; i < rowCount; i++) {
        const row = STANDARD_COLUMNS.map((col) => `"${col.generate(rng)}"`).join(",");
        rows.push(row);
    }

    const csv = headers.map((h) => `"${h}"`).join(",") + "\n" + rows.join("\n");
    return { csv, headers, rowCount };
}

/**
 * Generates a CSV with irregular column counts (some rows shorter/longer).
 */
export function generateIrregularCsv(rowCount: number, seed = 42): BenchmarkCsv {
    const rng = mulberry32(seed);
    const headers = STANDARD_COLUMNS.map((c) => c.name);
    const rows: string[] = [];

    for (let i = 0; i < rowCount; i++) {
        // Vary number of columns per row: 8-12
        const colCount = Math.max(2, Math.min(STANDARD_COLUMNS.length, 8 + Math.floor(rng() * 5)));
        const row: string[] = [];
        for (let j = 0; j < colCount; j++) {
            row.push(STANDARD_COLUMNS[j].generate(rng));
        }
        rows.push(row.join(","));
    }

    const csv = headers.join(",") + "\n" + rows.join("\n");
    return { csv, headers, rowCount };
}

// ──────────────────────────────────────────────
// Size Definitions
// ──────────────────────────────────────────────

export interface CsvSizeDefinition {
    label: string;
    rowCount: number;
    description: string;
}

export const CSV_SIZES: CsvSizeDefinition[] = [
    { label: "1K", rowCount: 1_000, description: "Small — ~50 KB" },
    { label: "10K", rowCount: 10_000, description: "Medium — ~500 KB" },
    { label: "100K", rowCount: 100_000, description: "Large — ~5 MB" },
    { label: "500K", rowCount: 500_000, description: "X-Large — ~25 MB" },
    { label: "1M", rowCount: 1_000_000, description: "XX-Large — ~50 MB" },
];

