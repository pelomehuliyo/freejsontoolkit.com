// Compact, offline word lists — enough variety to look real, small enough to
// stay out of the way. Everything the faker needs lives here; nothing fetches.
export const FIRST_NAMES = [
    "Ada", "Alan", "Grace", "Linus", "Margaret", "Dennis", "Barbara", "Ken",
    "Hedy", "John", "Radia", "Tim", "Anita", "Vint", "Sophie", "Donald",
    "Fei-Fei", "Yann", "Guido", "Bjarne", "Leslie", "Brian", "Katherine", "Edsger",
];
export const LAST_NAMES = [
    "Lovelace", "Turing", "Hopper", "Torvalds", "Hamilton", "Ritchie", "Liskov",
    "Thompson", "Lamarr", "McCarthy", "Perlman", "Berners-Lee", "Borg", "Cerf",
    "Wilson", "Knuth", "Li", "LeCun", "van Rossum", "Stroustrup", "Lamport",
    "Kernighan", "Johnson", "Dijkstra",
];
export const LOREM = [
    "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
    "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
    "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
    "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
    "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
    "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
    "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
    "deserunt", "mollit", "anim", "id", "est", "laborum",
];
export const DOMAINS = ["example.com", "test.dev", "sample.io", "mock.org", "fixture.net", "demo.app"];
export const TLDS = ["com", "dev", "io", "org", "net", "app"];

export const COUNT_PRESETS = [1, 10, 100, 1000];
export const MAX_COUNT = 5000;
// Live (auto) generation runs up to this many records as you type; above it the
// user presses Generate explicitly so big batches never hitch the editor.
export const AUTO_GEN_COUNT = 200;

// Type glyph per token kind — used by the live "shape" strip.
export function glyphFor(kind: string): string {
    switch (kind) {
        case "int":
        case "float":
        case "index":
        case "index1":
        case "timestamp":
            return "#";
        case "bool":
            return "◉";
        case "date":
        case "now":
            return "◷";
        case "uuid":
            return "⌗";
        case "ipv4":
        case "url":
            return "⌁";
        case "enum":
        case "pick":
            return "≡";
        case "null":
            return "∅";
        case "name":
        case "firstName":
        case "lastName":
        case "email":
        case "username":
        case "word":
        case "words":
        case "sentence":
        case "paragraph":
        case "string":
            return "T";
        default:
            return "·";
    }
}

export interface LegendRow {
    token: string;
    syntax: string;
    example: string;
}
export interface LegendGroup {
    group: string;
    rows: LegendRow[];
}

// The reference — varied rows grouped by family; this *is* the documentation.
// (This block is the one that was missing from the on-disk file; it must be
// present and exported, or the page's LEGEND.map(...) reads undefined.)
export const LEGEND: LegendGroup[] = [
    {
        group: "Identifiers",
        rows: [
            { token: "uuid", syntax: "{{uuid}}", example: "3f1c…e9a2" },
            { token: "index", syntax: "{{index}}", example: "0, 1, 2 …" },
            { token: "index1", syntax: "{{index1}}", example: "1, 2, 3 …" },
        ],
    },
    {
        group: "People",
        rows: [
            { token: "name", syntax: "{{name}}", example: "Grace Hopper" },
            { token: "firstName", syntax: "{{firstName}}", example: "Margaret" },
            { token: "lastName", syntax: "{{lastName}}", example: "Hamilton" },
            { token: "email", syntax: "{{email}}", example: "ada.lovelace@example.com" },
            { token: "username", syntax: "{{username}}", example: "alan_turing42" },
        ],
    },
    {
        group: "Text",
        rows: [
            { token: "word", syntax: "{{word}}", example: "consectetur" },
            { token: "words", syntax: "{{words}} or {{words:5}}", example: "sed do eiusmod tempor incididunt" },
            { token: "sentence", syntax: "{{sentence}}", example: "Lorem ipsum dolor sit amet." },
            { token: "paragraph", syntax: "{{paragraph}}", example: "Three to five sentences." },
            { token: "string", syntax: "{{string}} or {{string:8}}", example: "aB3kQ9zL" },
        ],
    },
    {
        group: "Numbers & flags",
        rows: [
            { token: "int", syntax: "{{int}} or {{int:1..100}}", example: "42" },
            { token: "float", syntax: "{{float}} or {{float:0..10}}", example: "7.31" },
            { token: "bool", syntax: "{{bool}}", example: "true" },
        ],
    },
    {
        group: "Dates & network",
        rows: [
            { token: "date", syntax: "{{date:2020..2024}}", example: "2022-08-14" },
            { token: "now", syntax: "{{now}}", example: "2026-07-31T…Z" },
            { token: "timestamp", syntax: "{{timestamp}}", example: "1722441600000" },
            { token: "ipv4", syntax: "{{ipv4}}", example: "192.168.4.21" },
            { token: "url", syntax: "{{url}}", example: "https://magna.io/dolor" },
        ],
    },
    {
        group: "Structure",
        rows: [
            { token: "enum", syntax: "{{enum:a|b|c}}", example: "editor" },
            { token: "null", syntax: "{{null}}", example: "null" },
        ],
    },
];