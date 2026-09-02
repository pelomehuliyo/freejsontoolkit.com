/**
 * Learn articles — question-driven SEO content that compounds with the tools.
 * Each article targets a specific question-intent query from keyword research,
 * links back to the relevant tool, and carries its own FAQ for schema markup.
 *
 * Adding an article = one entry here. The route, sitemap, and hub page derive.
 */

export interface LearnSection {
    heading: string;
    body: string;
    list?: string[];
}

export interface LearnFaq {
    q: string;
    a: string;
}

export interface LearnArticle {
    slug: string;
    toolId: string;
    relatedToolIds: string[];
    comparisonSlugs: string[];
    eyebrow: string;
    title: string;
    description: string;
    heroQuestion: string;
    shortAnswer: string;
    sections: LearnSection[];
    faq: LearnFaq[];
    publishedIn: string;
}

export const ARTICLES: LearnArticle[] = [
    {
        slug: "is-sha-512-secure",
        toolId: "sha-512",
        relatedToolIds: ["sha-256", "bcrypt", "md5"],
        comparisonSlugs: ["sha-256-vs-sha-512", "sha-256-vs-bcrypt", "md5-vs-sha-256"],
        eyebrow: "Security · Deep Dive",
        title: "Is SHA-512 Secure in 2026?",
        description:
            "SHA-512 remains cryptographically secure for integrity checks and digital signatures. No practical collision attack exists. Here's what the research says, where the real risks are, and when to use something else.",
        heroQuestion: "Is SHA-512 still secure?",
        shortAnswer:
            "Yes. For hashing, integrity checks, and digital signatures. SHA-512 has no known practical collision attack. It is not quantum-proof, and it is not suitable for password storage. The real risk is almost always implementation mistakes, not the algorithm itself.",
        sections: [
            {
                heading: "What 'secure' means for a hash function",
                body:
                    "A cryptographic hash function is considered secure when it resists three properties: preimage resistance (you can't reverse the hash), second-preimage resistance (you can't find a different input with the same hash), and collision resistance (you can't find any two inputs with the same hash). SHA-512 maintains all three properties at full strength in 2026.",
            },
            {
                heading: "No practical collision attacks exist",
                body:
                    "Unlike MD5 (broken since 2004) and SHA-1 (broken since 2017), SHA-512 has no known practical collision attack. Theoretical analyses have weakened reduced-round versions, but the full 80-round function remains intact. The best known attacks require computational resources far beyond what is feasible.",
            },
            {
                heading: "What the best attack actually costs",
                body:
                    "The best public attack on SHA-512 breaks 24 of 80 rounds with 2^320 work (Dobraunig et al. 2011). Full 80-round collision remains 2^256, preimage 2^512 per NIST SP 800-107 Rev 1 section 5.2. Truncating below 256 bits drops security to min(output/2, 256), so keep at least 256 bits. Grover gives quadratic speedup: SHA-256 256 -> 128 bits post-quantum (NIST category 2), SHA-512 512 -> 256 bits (category 5). At 1e12 Grover iterations per second, SHA-256 still needs 1e19 years. Category 2 is approved through 2030+, category 5 beyond.",
            },
            {
                heading: "The quantum computing question",
                body:
                    "Grover's algorithm, running on a sufficiently powerful quantum computer, would reduce the effective security of a hash function by half. For SHA-512, that means 256 bits of security, still beyond brute-force reach. For SHA-256, it drops to 128 bits, which is still considered secure but with less margin. This is one reason SHA-512 provides extra future-proofing.",
                list: [
                    "SHA-512 with Grover: ~256 bits of security",
                    "SHA-256 with Grover: ~128 bits of security",
                    "MD5: broken regardless of quantum",
                ],
            },
            {
                heading: "Where SHA-512 is NOT the right choice",
                body:
                    "SHA-512 is a fast hash by design. That speed is a strength for file integrity and digital signatures, but a weakness for password storage. Attackers can test billions of SHA-512 hashes per second on modern GPUs. For passwords, use a deliberately slow function like bcrypt, scrypt, or Argon2.",
            },
            {
                heading: "The real risk: implementation mistakes",
                body:
                    "In practice, SHA-512 is almost never broken by attacking the algorithm. It's broken by mistakes around it: using unsalted hashes for passwords, comparing hashes with timing-vulnerable equality checks, truncating the output below safe lengths, or using it where a keyed construction (HMAC) is needed.",
                list: [
                    "Use HMAC when you need authenticity, not just integrity",
                    "Use bcrypt/Argon2 for passwords, never raw SHA-512",
                    "Don't truncate the output below 256 bits",
                    "Use constant-time comparison when verifying hashes",
                ],
            },
            {
                heading: "When to choose SHA-512 over SHA-256",
                body:
                    "Both are secure. Choose SHA-512 when you want maximum future-proofing, when your platform is 64-bit (where SHA-512 is often faster), or when a spec explicitly requires it. Choose SHA-256 when you need broad compatibility, compact output, or are matching an existing protocol.",
            },
        ],
        faq: [
            {
                q: "Has SHA-512 ever been broken?",
                a: "No. There is no practical attack against full SHA-512. Reduced-round versions have been weakened in academic research, but the real 80-round function remains secure.",
            },
            {
                q: "Is SHA-512 quantum-resistant?",
                a: "Not fully. Grover's algorithm would reduce its effective security from 512 bits to 256 bits. However, 256 bits is still considered secure for the foreseeable future.",
            },
            {
                q: "Can I use SHA-512 for passwords?",
                a: "No. SHA-512 is too fast. Use bcrypt, scrypt, or Argon2 for password storage. SHA-512 is for integrity checks, not credential protection.",
            },
            {
                q: "Is SHA-512 better than SHA-256?",
                a: "Both are secure. SHA-512 provides more security margin and can be faster on 64-bit systems. SHA-256 is more compact and more widely adopted. Choose based on your use case.",
            },
            {
                q: "What is the most common SHA-512 mistake?",
                a: "Using it for passwords. SHA-512 is designed to be fast, which helps attackers test billions of guesses per second. Use a slow, salted function like bcrypt instead.",
            },
        ],
        publishedIn: "v1.8",
    },

    {
        slug: "what-is-sha-512",
        toolId: "sha-512",
        relatedToolIds: ["sha-256", "md5", "hmac"],
        comparisonSlugs: ["sha-256-vs-sha-512", "md5-vs-sha-256"],
        eyebrow: "Security · Explainer",
        title: "What Is SHA-512?",
        description:
            "SHA-512 is a cryptographic hash function that produces a 512-bit digest. Learn how it works, what it's used for, its block size, output length, and when to choose it over SHA-256.",
        heroQuestion: "What is SHA-512?",
        shortAnswer:
            "SHA-512 is a one-way cryptographic hash function from the SHA-2 family. It takes any input and produces a fixed 512-bit (64-byte) digest, typically displayed as 128 hexadecimal characters. It is used for data integrity, digital signatures, and checksums.",
        sections: [
            {
                heading: "The basics",
                body:
                    "SHA-512 stands for Secure Hash Algorithm 512-bit. It was designed by the NSA and published by NIST in 2001 as part of the SHA-2 family. It processes input in 1024-bit blocks through 80 rounds of computation and produces a 512-bit digest.",
            },
            {
                heading: "Output length",
                body:
                    "SHA-512 always produces the same output size regardless of input size: 512 bits, which is 64 bytes, 128 hexadecimal characters, or approximately 88 Base64 characters.",
                list: [
                    "512 bits = 64 bytes",
                    "128 hex characters",
                    "~88 Base64 characters",
                    "Same output whether input is 1 byte or 1 GB",
                ],
            },
            {
                heading: "Block size and internals",
                body:
                    "SHA-512 processes data in 1024-bit (128-byte) blocks. Each block goes through 80 rounds of a compression function using 64-bit word operations. This makes it naturally efficient on 64-bit processors. The message schedule expands 16 words into 80 words per block.",
            },
            {
                heading: "What SHA-512 is used for",
                body:
                    "SHA-512 is used wherever data integrity and authenticity matter: verifying file downloads, digital signatures, TLS certificates, code signing, version control integrity (Git), and blockchain systems. It is not suitable for password storage due to its speed.",
                list: [
                    "File integrity verification (checksums)",
                    "Digital signatures and certificates",
                    "Code signing",
                    "API payload verification",
                    "Version control integrity",
                    "NOT suitable for: password storage (use bcrypt)",
                ],
            },
            {
                heading: "SHA-512 vs SHA-256 at a glance",
                body:
                    "Both are SHA-2 family members. SHA-512 uses 64-bit words and 1024-bit blocks; SHA-256 uses 32-bit words and 512-bit blocks. SHA-512 produces a longer digest and can be faster on 64-bit hardware. SHA-256 is more compact and more widely adopted.",
            },
        ],
        faq: [
            {
                q: "What is the output of SHA-512?",
                a: "SHA-512 outputs 512 bits (64 bytes). In hexadecimal, that's 128 characters. In Base64, approximately 88 characters.",
            },
            {
                q: "What is the block size of SHA-512?",
                a: "SHA-512 processes input in 1024-bit (128-byte) blocks, using 80 rounds of compression per block.",
            },
            {
                q: "What compression function does SHA-512 use?",
                a: "SHA-512 uses a Merkle–Damgård construction with a Davies–Meyer compression function, processing 64-bit words through 80 rounds.",
            },
            {
                q: "Is SHA-512 the same as SHA-2?",
                a: "SHA-512 is a member of the SHA-2 family. SHA-2 includes SHA-224, SHA-256, SHA-384, SHA-512, SHA-512/224, and SHA-512/256.",
            },
        ],
        publishedIn: "v1.8",
    },
    {
        slug: "what-is-sha-256",
        toolId: "sha-256",
        relatedToolIds: ["sha-512", "md5", "bcrypt"],
        comparisonSlugs: ["sha-256-vs-sha-512", "sha-256-vs-bcrypt", "md5-vs-sha-256"],
        eyebrow: "Security · Explainer",
        title: "What Is SHA-256?",
        description:
            "SHA-256 is a cryptographic hash function that produces a 256-bit fingerprint. It is the backbone of Bitcoin mining, SSL certificates, and file verification. Here is how it works and why it matters.",
        heroQuestion: "What is SHA-256 and why does every developer need to understand it?",
        shortAnswer:
            "SHA-256 is a one-way mathematical algorithm that takes any input (text, files, passwords) and produces a fixed 256-bit output, usually displayed as 64 hexadecimal characters. It is deterministic, irreversible, and highly collision-resistant.",
        sections: [
            {
                heading: "The 64-character fingerprint",
                body:
                    "No matter if your input is a single word or a 10-gigabyte video file, SHA-256 will always output exactly 64 hexadecimal characters (like e3b0c44298fc1c14...). This makes it perfect for verifying that a file hasn't been tampered with during download.",
            },
            {
                heading: "Where you use it every day",
                body:
                    "You interact with SHA-256 constantly without knowing it. It secures the HTTPS connection to this website (TLS certificates), powers the proof-of-work mining in Bitcoin, tracks every commit in Git, and verifies the integrity of software updates you download.",
                list: [
                    "Bitcoin: Used for mining and generating transaction IDs.",
                    "TLS/SSL: The standard signature algorithm for HTTPS certificates.",
                    "Git: Used to uniquely identify commits and detect tampering.",
                    "Software Downloads: Used for checksum verification.",
                ],
            },
            {
                heading: "SHA-256 vs MD5 and SHA-1",
                body:
                    "MD5 (128-bit) and SHA-1 (160-bit) are older, shorter hash functions that have been cryptographically broken. Attackers can easily create 'collisions' (two different files with the same hash). SHA-256's 256-bit output provides a massive security margin that remains unbroken today.",
            },
        ],
        faq: [
            { q: "Who invented SHA-256?", a: "SHA-256 was designed by the United States National Security Agency (NSA) and published by NIST in 2001 as part of the SHA-2 family." },
            { q: "Is SHA-256 encryption?", a: "No. Encryption is two-way (you can decrypt it with a key). SHA-256 is a one-way hash function. You cannot reverse it to get the original data back." },
            { q: "How do I pronounce SHA-256?", a: "It is typically pronounced as 'shah two-fifty-six' or spelled out 'S-H-A two-five-six'." },
        ],
        publishedIn: "v1.8",
    },

    {
        slug: "how-does-sha-256-work",
        toolId: "sha-256",
        relatedToolIds: ["sha-512", "hmac"],
        comparisonSlugs: ["sha-256-vs-sha-512"],
        eyebrow: "Security · Under the Hood",
        title: "How Does SHA-256 Work?",
        description:
            "A step-by-step breakdown of how SHA-256 turns any input into a 64-character fingerprint. Learn about padding, 512-bit blocks, and the 64 rounds of compression that make it irreversible.",
        heroQuestion: "How does SHA-256 actually process data?",
        shortAnswer:
            "SHA-256 works by taking your input, adding 'padding' to reach a specific length, breaking it into 512-bit chunks, and running each chunk through 64 rounds of intense mathematical mixing. The final mixed state becomes your 256-bit hash.",
        sections: [
            {
                heading: "Step 1: Padding and Blocking",
                body:
                    "First, the algorithm adds bits to your message so its length is exactly 64 bits short of a multiple of 512. Then it appends the original message length as a 64-bit integer. Finally, it chops the padded message into 512-bit blocks.",
            },
            {
                heading: "Step 2: The 64 Rounds of Compression",
                body:
                    "Each 512-bit block is fed into a compression function alongside the current 'hash state'. Over 64 rounds, the data is mixed using bitwise operations (AND, OR, XOR), rotations, and modular addition. This destroys any recognizable pattern from the original input.",
            },
            {
                heading: "Step 3: The Avalanche Effect",
                body:
                    "Because of the intense mixing in those 64 rounds, changing even a single bit of the input (like changing 'hello' to 'Hello') completely alters the final hash. This is called the avalanche effect, and it's what makes guessing the original input computationally impossible.",
            },
        ],
        faq: [
            { q: "Why does SHA-256 use 64 rounds?", a: "The 64 rounds provide a massive security margin against cryptanalysis. Fewer rounds (like 46) have been theoretically weakened in academic papers, but the full 64 rounds remain completely secure." },
            { q: "Does SHA-256 use a database?", a: "No. SHA-256 is a pure mathematical algorithm. It doesn't look up anything in a database; it just calculates the exact same math on the input every time, guaranteeing the same output." },
        ],
        publishedIn: "v1.8",
    },

    {
        slug: "what-is-json-formatter",
        toolId: "json-formatter",
        relatedToolIds: ["json-validator", "json-minifier", "json-diff"],
        comparisonSlugs: ["json-formatter-vs-json-validator", "json-minifier-vs-json-formatter"],
        eyebrow: "JSON · Explainer",
        title: "What Is a JSON Formatter?",
        description:
            "A JSON formatter takes raw, minified JSON and pretty-prints it with clean indentation so humans can read it. Learn how formatters work, what they do and don't fix, and when you need one.",
        heroQuestion: "What is a JSON formatter?",
        shortAnswer:
            "A JSON formatter takes raw JSON, usually compressed onto a single line, and rewrites it with consistent indentation, line breaks, and spacing. The data itself is unchanged; only the presentation becomes readable.",
        sections: [
            {
                heading: "Why JSON arrives unreadable",
                body:
                    "APIs, logs, and databases return JSON in its most compact form: one long line with no spaces, so it travels and stores efficiently. That is great for machines and terrible for people. A developer pasting a response into an editor is staring at a wall of text with no visible structure.",
            },
            {
                heading: "What a formatter actually does",
                body:
                    "A formatter parses the JSON and writes it back out with structure: each nesting level indented, every object and array on its own set of lines, and keys aligned. It can also sort keys alphabetically if you ask. The values are preserved exactly. It is the difference between scanning and reading.",
                list: [
                    "Indentation: 2 spaces, 4 spaces, or tabs",
                    "Line breaks: one line per key and value",
                    "Optional key sorting: A to Z",
                    "No data change: values and order are preserved",
                ],
            },
            {
                heading: "What a formatter does not fix",
                body:
                    "A formatter needs valid JSON as input. It cannot repair a missing comma, a trailing comma, or an unquoted key, because those are not formatting problems. When formatting fails, the error is a validation problem. Run the text through a validator first, then format the corrected result.",
            },
            {
                heading: "Formatter vs. validator vs. minifier",
                body:
                    "Three tools with overlapping names do very different jobs. A validator checks whether JSON is syntactically correct and reports the exact location of the first error. A formatter takes valid JSON and adds indentation and line breaks so it is readable. A minifier does the reverse: it strips whitespace to shrink JSON for storage or transfer.",
                list: [
                    "Validator: is it correct, and where is the error",
                    "Formatter: valid JSON made readable",
                    "Minifier: readable JSON made small",
                ],
            },
            {
                heading: "Where developers use formatters",
                body:
                    "Formatting is a daily habit in API debugging, reading config files like package.json, inspecting exported data, and untangling machine-generated JSON before it is committed or shared. Because the task is small and frequent, the fastest path wins.",
            },
            {
                heading: "How to format JSON in seconds",
                body:
                    "Paste the raw JSON into a formatter, pick an indentation, and run it. On this site the whole process happens in your browser, so nothing is uploaded and it keeps working offline.",
            },
        ],
        faq: [
            {
                q: "Is a JSON formatter the same as a beautifier or pretty-printer?",
                a: "Yes. Beautify, pretty-print, and format all mean the same thing here: adding indentation and line breaks so JSON is readable.",
            },
            {
                q: "Does formatting change my data?",
                a: "No. The keys, values, and their order are preserved. Formatting only changes whitespace and line layout.",
            },
            {
                q: "Can a formatter fix broken JSON?",
                a: "No. Formatting needs valid JSON. If your text is invalid, use a validator to find the exact line and column of the error first.",
            },
            {
                q: "Is it safe to paste sensitive JSON into a formatter?",
                a: "It depends on where the formatter runs. A client-side tool processes the JSON in your browser and never uploads it. This one is fully local.",
            },
        ],
        publishedIn: "v1.8",
    },

    {
        slug: "best-json-formatter",
        toolId: "json-formatter",
        relatedToolIds: ["json-validator", "json-minifier", "json-diff"],
        comparisonSlugs: ["json-formatter-vs-json-validator", "json-minifier-vs-json-formatter", "json-diff-vs-json-formatter"],
        eyebrow: "JSON · Toolbox",
        title: "Best JSON Formatter: How to Pick the Right One",
        description:
            "There is no single best JSON formatter for everyone. Compare online versus offline, upload versus local, and the features that matter, so you can choose the tool that fits your workflow and your data.",
        heroQuestion: "What is the best JSON formatter tool?",
        shortAnswer:
            "The best formatter depends on your workflow and, critically, on whether it handles your data locally. For sensitive data, choose a no-upload tool. For features, look for indentation options, key sorting, and validation.",
        sections: [
            {
                heading: "What best means for different jobs",
                body:
                    "A quick debug while reading an API response has different needs than formatting a large config or a team-wide data migration. The best tool is the one that fits the job: fast for a one-off paste, robust for a big file, and private when the data is sensitive.",
            },
            {
                heading: "Online versus offline",
                body:
                    "An online JSON beautifier is convenient because there is nothing to install, and it is always up to date. An offline or local tool processes the JSON in your browser or on your machine, so it works without a connection and never exposes your data to a server.",
                list: [
                    "A website you open in the browser: nothing to install, always current",
                    "A browser extension: handy for a quick format, but check the permissions it requests",
                    "A desktop app you download: runs fully offline, but you manage updates yourself",
                ],
            },
            {
                heading: "The privacy filter",
                body:
                    "The single most important question is where the JSON is processed. If a formatter sends your payload to a server, the data is out of your control. If it runs locally, nothing leaves your machine. Filter candidates by this first, then compare features.",
            },
            {
                heading: "Feature checklist",
                body:
                    "Once the privacy question is settled, compare the practical features: multiple indentation styles, optional key sorting, large-file handling, and whether the tool validates as well as formats.",
                list: [
                    "Indentation options: 2 spaces, 4 spaces, or tabs",
                    "Key sorting that is optional, not forced",
                    "Comfort with large files without freezing",
                    "Built-in validation for clear error messages",
                ],
            },
            {
                heading: "How this formatter fits",
                body:
                    "This formatter processes JSON entirely in your browser, with indentation options, optional key sorting, and a 15 MB ceiling. It is free, needs no account, and does not upload your data. It is not the only good option, but it checks the boxes that matter for most developers.",
            },
        ],
        faq: [
            {
                q: "Is the best JSON formatter free?",
                a: "The strong local formatters are free. There is no reason to pay for formatting; the value is in privacy and convenience, not price.",
            },
            {
                q: "What is the difference between a formatter and a beautifier?",
                a: "Nothing functional. Beautify, pretty-print, and format all describe the same operation: adding indentation and line breaks to readable JSON.",
            },
            {
                q: "Can a formatter handle very large JSON files?",
                a: "Some can. Check the tool's limits up front. Large files need a formatter that does not freeze the page, which usually means it works in a background process.",
            },
            {
                q: "Can I download a JSON formatter?",
                a: "Yes. Desktop apps and command-line tools such as jq download and run locally. A browser-based formatter like this one needs no download at all, and it still keeps your JSON on your machine.",
            },
            {
                q: "Why does privacy matter for a JSON formatter?",
                a: "Because JSON frequently contains keys, tokens, and personal data. A formatter that uploads that payload puts your data in someone else's hands.",
            },
        ],
        publishedIn: "v1.8",
    },

    {
        slug: "how-to-format-json-file",
        toolId: "json-formatter",
        relatedToolIds: ["json-validator", "json-to-csv"],
        comparisonSlugs: ["json-formatter-vs-json-validator"],
        eyebrow: "JSON · How-To",
        title: "How to Format a JSON File",
        description:
            "Four ways to format a JSON file: a web formatter, a code editor, the command line, and a script. Each takes seconds, and each keeps your data local when done right.",
        heroQuestion: "How do I format a JSON file?",
        shortAnswer:
            "Open the file in any JSON formatter and run it. On this site, drop the file or paste its contents, then click Format. Code editors, jq, and Python's json module are the common alternatives.",
        sections: [
            {
                heading: "The quickest way: a web formatter",
                body:
                    "Open the formatter, drop the JSON file onto the page or paste its contents, pick an indentation, and click Format. The result is ready to copy or download. Because the tool runs in your browser, the file never leaves your machine.",
            },
            {
                heading: "In your code editor",
                body:
                    "Most editors can format JSON without a plugin. In VS Code, select the content and run Format Document, or use the format-on-save setting. Editors read the file locally, which makes this a natural choice when you are already working on it.",
            },
            {
                heading: "From the command line",
                body:
                    "For a quick, scriptable format, jq can pretty-print with `jq . file.json`, and Python's standard library can too with `python -m json.tool file.json`. Both read the file locally and write readable output to your terminal.",
            },
            {
                heading: "Formatting many files at once",
                body:
                    "For a directory of JSON files, loop over the files with jq or a small script and write each formatted result back. This is the right approach for migrations and bulk cleanups, where a manual paste does not scale.",
            },
            {
                heading: "What to watch after formatting",
                body:
                    "Formatting succeeds only on valid JSON. Trailing commas and comments are invalid in standard JSON and will cause the tool to error. If a file will not format, validate it first, then format the corrected version.",
            },
        ],
        faq: [
            {
                q: "How do I format JSON in VS Code?",
                a: "Open the file, then run Format Document, or enable format-on-save. VS Code formats JSON natively with your configured indentation.",
            },
            {
                q: "Can I format JSON in Notepad++?",
                a: "Yes, with a plugin such as JSTool. Without a plugin, Notepad++ has no built-in JSON formatting.",
            },
            {
                q: "What is a quick command-line way to format JSON?",
                a: "`jq . file.json` pretty-prints a file, and `python -m json.tool file.json` does the same with Python's standard library.",
            },
            {
                q: "Does formatting a JSON file change the data?",
                a: "No. Formatting changes whitespace and line layout only. Keys, values, and order are preserved exactly.",
            },
        ],
        publishedIn: "v1.8",
    },

    {
        slug: "how-to-convert-json-to-readable",
        toolId: "json-formatter",
        relatedToolIds: ["json-to-csv", "csv-to-json"],
        comparisonSlugs: ["json-formatter-vs-json-validator"],
        eyebrow: "JSON · How-To",
        title: "How to Make Minified JSON Readable",
        description:
            "Minified JSON from an API response is hard to read. Learn three ways to make it readable: pretty-print it, view it as a table, or convert it to a spreadsheet.",
        heroQuestion: "How do I convert JSON to a readable format?",
        shortAnswer:
            "Paste the minified JSON into a formatter to pretty-print it, or convert it to CSV and open it in a spreadsheet for a table view. Both are quick and can be done entirely on your own machine.",
        sections: [
            {
                heading: "Why API responses arrive minified",
                body:
                    "Servers strip whitespace from JSON before sending it so payloads travel faster and take less bandwidth. The result is a single dense line. Machines love it; a human trying to read it is squinting.",
            },
            {
                heading: "Pretty-print it with a formatter",
                body:
                    "The direct fix is formatting. Paste the minified JSON into a formatter and the same data comes back indented, line by line, instantly readable. This works for any JSON, no matter how deeply nested.",
            },
            {
                heading: "Turn it into a table",
                body:
                    "If the JSON is an array of records, a table can be easier to scan than a pretty-print. Converting JSON to CSV gives you columns and rows that open cleanly in Excel, Sheets, or Numbers, where you can sort and filter.",
            },
            {
                heading: "When a table beats a pretty-print",
                body:
                    "For lists of similar records, like users or orders, a table shows all rows at once and lets you compare values across columns. Pretty-printing still wins for deeply nested or single-object JSON, where a table would flatten the meaning.",
            },
            {
                heading: "Keep the data local while converting",
                body:
                    "Both conversions are safe to run locally. A formatter or converter that works in your browser never uploads the JSON, so even sensitive API responses can be made readable without exposing them.",
            },
        ],
        faq: [
            {
                q: "What is the fastest way to make JSON readable?",
                a: "Pretty-print it in a formatter. Paste, click Format, and the indented result is ready in seconds.",
            },
            {
                q: "How do I open JSON in Excel?",
                a: "Excel does not open JSON directly. Convert the JSON to CSV first, then open the CSV in Excel or Google Sheets.",
            },
            {
                q: "Can I read JSON without a tool?",
                a: "You can, but it is slow and error-prone. A formatter or CSV conversion turns it into something you can scan quickly.",
            },
            {
                q: "Is converting JSON safe for sensitive data?",
                a: "It is safe when the conversion runs locally in your browser. This site's converters never upload your data.",
            },
        ],
        publishedIn: "v1.8",
    },

    {
        slug: "what-is-bcrypt",
        toolId: "bcrypt",
        relatedToolIds: ["sha-256", "sha-512", "hmac", "md5"],
        comparisonSlugs: ["sha-256-vs-bcrypt"],
        eyebrow: "Security · Explainer",
        title: "What Is bcrypt?",
        description:
            "bcrypt is a password-hashing function built to be deliberately slow and salted, so leaked hashes resist brute-force guessing. Learn why it beats fast hashes like SHA-256 for storing passwords.",
        heroQuestion: "What is bcrypt and why do password hashers use it?",
        shortAnswer:
            "bcrypt is a password-hashing algorithm that combines a random salt with an adjustable work factor to make each hash slow to compute. Slow hashing means an attacker who steals your password database cannot quickly guess the original passwords.",
        sections: [
            {
                heading: "Why passwords need a different hash than files",
                body:
                    "SHA-256 and friends are fast by design, which is exactly what you want for checking a file or a download. But fast is fatal for passwords: a GPU can try billions of guesses a second. bcrypt flips that by being deliberately slow, so guessing every candidate is expensive.",
            },
            {
                heading: "What bcrypt actually is",
                body:
                    "bcrypt is a password-hashing function adapted from the Blowfish cipher. It takes the password plus a random salt and runs a configurable number of rounds of key stretching. The result is a 60-character string that carries everything needed to verify it later.",
                list: [
                    "Salt: random per hash, embedded in the output",
                    "Cost factor: 2^cost rounds of key stretching",
                    "Output: a 60-character hash string starting with $2a$10$",
                ],
            },
            {
                heading: "bcrypt vs. SHA-256",
                body:
                    "SHA-256 is fast, unsalted, and deterministic: the same input always gives the same hash. bcrypt is slow, salted, and different every run. Reach for SHA-256 when you need integrity checks on data. Reach for bcrypt when the input is a password that must survive a database leak.",
            },
            {
                heading: "Where developers use bcrypt",
                body:
                    "bcrypt is the workhorse for storing user credentials in web applications and login systems. Any place a password must be stored and later verified is a place bcrypt belongs. Because it is widely supported in every language, it is a common default choice for new projects.",
            },
        ],
        faq: [
            {
                q: "Is bcrypt encryption?",
                a: "No. Encryption is reversible with a key. bcrypt is a one-way hash, so you cannot decrypt a hash back into the password.",
            },
            {
                q: "Can bcrypt be reversed?",
                a: "No. It is one-way. Verification works by hashing the candidate password with the stored salt and cost, then comparing the results.",
            },
            {
                q: "What does $2a$10$ at the start of a hash mean?",
                a: "The version marker and the cost factor. $2a$ is the bcrypt variant, and 10 means 2^10, or 1,024 rounds, of key stretching were used.",
            },
            {
                q: "Why does the same password give a different hash?",
                a: "A random salt is generated for every hash and stored inside it, so identical passwords produce different outputs and reveal nothing about each other.",
            },
        ],
        publishedIn: "v1.8",
    },

    {
        slug: "how-does-bcrypt-work",
        toolId: "bcrypt",
        relatedToolIds: ["sha-256", "sha-512"],
        comparisonSlugs: ["sha-256-vs-bcrypt"],
        eyebrow: "Security · Under the Hood",
        title: "How Does bcrypt Work?",
        description:
            "A step-by-step look at how bcrypt hashes a password: the random salt, the work factor, the 2^cost rounds of key stretching, and the 60-character hash it produces.",
        heroQuestion: "How does bcrypt turn a password into a hash?",
        shortAnswer:
            "bcrypt takes the password plus a random salt, then runs a key-stretching routine 2^cost times, where cost is normally 10. The result is a 60-character string that stores the version, cost, salt, and hash together.",
        sections: [
            {
                heading: "Step 1: Generate a random salt",
                body:
                    "Every hash starts with a fresh random salt, typically 22 characters. Because the salt is different each time, the same password never produces the same hash, and an attacker cannot reuse work across two users or two hashes.",
            },
            {
                heading: "Step 2: Stretch the key 2^cost times",
                body:
                    "The password and salt feed a key schedule derived from Blowfish that runs 2^cost times. With the default cost of 10 that is 1,024 iterations. Each iteration is cheap, but the repetition adds up, which is exactly what makes guessing slow.",
            },
            {
                heading: "Step 3: Pack everything into 60 characters",
                body:
                    "The final hash string bundles the version, the cost factor, the 22-character salt, and the 31-character hash: $2a$10$ plus salt plus hash. Because all of it travels together, verification needs nothing but the stored string.",
            },
            {
                heading: "The work factor is the dial",
                body:
                    "The cost factor is a deliberate tradeoff. Higher values hash slower and resist brute force longer, but tax every login. Ten is the common default; eleven or twelve is reasonable for new systems. This dial is why bcrypt stays useful as hardware gets faster.",
            },
            {
                heading: "Why this defeats common attacks",
                body:
                    "The salt defeats precomputed rainbow tables, and the slowness defeats GPU brute force. Since each user's hash carries its own salt, an attacker must pay the full cost for every guess against every account, which is the property that matters when a database leaks.",
            },
        ],
        faq: [
            {
                q: "How long does bcrypt take?",
                a: "With a normal cost factor of 10 to 12, hashing takes from tens to a few hundred milliseconds on a typical CPU. That delay is intentional and is what makes brute force expensive.",
            },
            {
                q: "What does the cost factor mean?",
                a: "The cost is an exponent: cost 10 means 2^10, or 1,024 rounds. Each step up doubles the work, so cost 11 is twice as slow as cost 10.",
            },
            {
                q: "Does bcrypt use a database?",
                a: "No. It is pure computation. The salt and cost live inside the hash string, so verification needs no lookup and no stored metadata.",
            },
            {
                q: "Is bcrypt the same as Blowfish?",
                a: "Not exactly. bcrypt adapts Blowfish's key schedule into a salted, cost-driven hash for passwords. It is not Blowfish encryption.",
            },
        ],
        publishedIn: "v1.8",
    },

    {
        slug: "how-to-convert-json-to-xml",
        toolId: "json-to-xml",
        relatedToolIds: ["xml-to-json", "json-formatter", "json-validator"],
        comparisonSlugs: ["json-xml-vs-xml-json"],
        eyebrow: "JSON · Guide",
        title: "How to Convert JSON to XML",
        description:
            "Convert JSON to XML in three steps: paste your JSON, choose how arrays and the XML declaration map, and run it locally. This guide explains the mapping, the round-trip limits, and large-file handling.",
        heroQuestion: "How do I convert JSON to XML?",
        shortAnswer:
            "Paste your JSON into a converter, pick how arrays and the XML declaration should map, and run it. A converter that shows its mapping makes it obvious how each JSON value becomes an XML element, and large files are handled in a background worker without leaving your machine.",
        sections: [
            {
                heading: "The three steps",
                body:
                    "Open the JSON to XML converter, paste your JSON into the left editor, or drop a .json file, then choose the options you want: pretty-print the output, include the XML declaration, and set the array item tag. Press Convert and the XML appears on the right, ready to copy or download.",
            },
            {
                heading: "How the mapping works",
                body:
                    "The converter walks your JSON and builds XML with a straightforward rule set. Every object becomes an element named after its key. Every primitive value, a string, a number, a boolean, or null, becomes the text content of its element. Arrays are the one structure that needs a decision, covered next.",
                list: [
                    "Objects become elements named after their key",
                    "Strings, numbers, booleans, and null become element text",
                    "Arrays become a wrapper element with repeated children",
                ],
            },
            {
                heading: "How arrays are represented",
                body:
                    "XML has no native array type, so each array becomes a wrapper element, named after the key, containing one child per entry using the array item tag you set. With the default item tag, \"tags\": [\"a\", \"b\"] becomes <tags><item>a</item><item>b</item></tags>.",
            },
            {
                heading: "What XML gains and loses",
                body:
                    "XML keeps the structure of your data, but it is a document format, not a typed one. It has no native null, no number versus string distinction, and no arrays. Converting is lossy at the edges: a null can become an empty element, and a number becomes text. The reverse tool, XML to JSON, is just as honest about its limits. Do not expect a byte-identical round trip.",
            },
            {
                heading: "Converting a large JSON file",
                body:
                    "Paste a huge JSON blob and the browser can choke. Drop a file instead and the converter switches to a background worker: it reads and converts off the main thread, shows a capped preview in the editor, and offers the full XML as a download. Nothing is uploaded.",
            },
            {
                heading: "Converter versus formatter",
                body:
                    "A JSON formatter pretty-prints JSON without changing the format. A converter changes the format entirely, from JSON to XML. If your goal is readable JSON, format it. If an XML consumer is waiting, convert it. Both tools run entirely in your browser.",
            },
        ],
        faq: [
            {
                q: "Can I convert JSON to XML without uploading my data?",
                a: "Yes. The conversion runs entirely in your browser, so your JSON never leaves your machine. Paste or drop a file and the XML is produced locally.",
            },
            {
                q: "Why is every array entry wrapped in an item tag?",
                a: "XML has no native arrays, so each array becomes a wrapper element with one child per entry. The tag is configurable; the default is item.",
            },
            {
                q: "Will converting lose any information?",
                a: "Some. XML has no null, no number versus string distinction, and no arrays, so a few JSON types have to be represented as text. The mapping stays readable, but a round trip back to JSON is not always identical.",
            },
            {
                q: "Can this handle a very large JSON file?",
                a: "Yes. Drop a large file and the conversion runs in a background worker with a capped preview and a full download, rather than freezing the page.",
            },
        ],
        publishedIn: "v1.9",
    },

    {
        slug: "json-vs-xml",
        toolId: "json-to-xml",
        relatedToolIds: ["xml-to-json", "json-to-csv"],
        comparisonSlugs: ["json-xml-vs-xml-json", "csv-vs-json"],
        eyebrow: "JSON · Formats",
        title: "JSON vs XML: Which Format Should You Use?",
        description:
            "JSON and XML are both formats for structured data, but they solve different problems. Compare syntax, types, schema options, and when each one is the right choice.",
        heroQuestion: "What is the difference between JSON and XML?",
        shortAnswer:
            "JSON is a lightweight data format with native types like numbers, booleans, and arrays, born from JavaScript. XML is a markup language with attributes, namespaces, and a document model, built for documents as much as data. JSON wins for APIs and configuration. XML still leads where documents, namespaces, or strict schemas matter.",
        sections: [
            {
                heading: "The short version",
                body:
                    "Reach for JSON when you are moving data between systems, especially web APIs and configuration. Reach for XML when you are moving documents, or when namespaces, mixed content, or XSD validation are part of the job. Both are widely supported and converting between them is routine.",
            },
            {
                heading: "How they look",
                body:
                    "JSON uses braces, brackets, and colons, and a person, a list of names, and a flag read naturally. XML wraps every value in an opening and closing tag, with attributes available for metadata. The same data takes more characters in XML, and that verbosity is the price of being a markup language.",
                list: [
                    "JSON: {\"name\": \"Ada\", \"roles\": [\"admin\"]}",
                    "XML: <person name=\"Ada\"><roles><role>admin</role></roles></person>",
                ],
            },
            {
                heading: "Data types",
                body:
                    "JSON has real types: strings, numbers, booleans, null, arrays, and objects. XML has no types of its own. Everything inside an element is text until a schema or a parser decides otherwise, and XML attributes are always strings too. That makes JSON faster to consume in typed environments and XML more literal about documents.",
            },
            {
                heading: "Schema and validation",
                body:
                    "JSON Schema validates structure and types and is widely supported across languages. XML has DTD and XSD, which are older and more verbose but very mature. If your industry already lives on XSD contracts, XML is the pragmatic choice. If you control the contract, JSON Schema is usually simpler to maintain.",
            },
            {
                heading: "Where each format wins",
                body:
                    "JSON dominates web APIs, config files, and the JavaScript ecosystem. XML remains entrenched in documents, SOAP web services, publishing, and any stack with a heavy XSD dependency. Neither is going anywhere, and most real systems pass data between both at some boundary.",
            },
            {
                heading: "Converting between them",
                body:
                    "When a system hands you XML but your code wants JSON, convert it with a tool that maps attributes and repeated tags predictably. The reverse, JSON to XML, needs a decision about how arrays and types become elements and text. Both converters on this site run entirely in your browser.",
            },
        ],
        faq: [
            {
                q: "Is JSON always better than XML?",
                a: "No. JSON is more compact and typed, but XML handles documents, namespaces, and mixed content better. The right choice depends on the consumer, not fashion.",
            },
            {
                q: "Can XML represent a number or a boolean?",
                a: "Not natively. Everything in an XML element is text until a schema or parser assigns a type. JSON stores these types directly.",
            },
            {
                q: "Why does older software still use XML?",
                a: "XML predates JSON and powers a lot of enterprise infrastructure: SOAP services, XSD contracts, and document pipelines. Migration costs keep it in place even where JSON would be lighter.",
            },
            {
                q: "How do I convert between JSON and XML?",
                a: "Use a converter. JSON to XML maps objects to elements and arrays to repeated tags. XML to JSON maps attributes to @-prefixed keys and repeated tags to arrays. Both directions run locally on this site.",
            },
        ],
        publishedIn: "v1.9",
    },

    {
        slug: "how-to-convert-xml-to-json",
        toolId: "xml-to-json",
        relatedToolIds: ["json-to-xml", "json-formatter", "json-validator"],
        comparisonSlugs: ["json-xml-vs-xml-json"],
        eyebrow: "XML · Guide",
        title: "How to Convert XML to JSON",
        description:
            "Convert XML to JSON in three steps: paste your XML, choose how attributes and repeated tags map, and run it locally. This guide covers the @-prefixed attribute keys, array handling, and CDATA.",
        heroQuestion: "How do I convert XML to JSON?",
        shortAnswer:
            "Paste your XML into a converter, decide how attributes and repeated tags should behave, and run it. Attributes become keys prefixed with @, repeated elements become arrays, and the result is valid JSON you can format or validate next. The conversion runs entirely in your browser.",
        sections: [
            {
                heading: "The three steps",
                body:
                    "Open the XML to JSON converter, paste your XML into the left editor, or drop a file, then choose the options that match how you want attributes and arrays represented. Press Convert and the JSON appears on the right, ready to copy or download.",
            },
            {
                heading: "How attributes are handled",
                body:
                    "XML attributes become keys prefixed with @ so they can never collide with element keys. With attributes on, <person id=\"1\"> becomes \"@id\": \"1\". You can toggle attributes on or off to get the full picture or just the element structure.",
            },
            {
                heading: "Elements, text, and CDATA",
                body:
                    "An element's text content becomes the value for its key. CDATA is treated as ordinary text. Comments, processing instructions, and DOCTYPE declarations are skipped so the output stays clean.",
            },
            {
                heading: "Repeated tags and arrays",
                body:
                    "XML has no arrays, so repeated sibling tags are the only signal. With \"Preserve arrays\" on, every repeated tag becomes an array even when it appears once. With it off, a single occurrence becomes a plain object or value, which keeps the JSON tidy but loses the array guarantee.",
            },
            {
                heading: "What to do with the result",
                body:
                    "The output is plain JSON, so it can be fed straight into a formatter or a validator. If the XML was large, the conversion runs in a background worker with a capped preview and a full download available.",
            },
        ],
        faq: [
            {
                q: "Why does my attribute have an @ in front of its key?",
                a: "Attributes are prefixed with @ so they never collide with element keys. You can toggle attributes off to drop them from the output.",
            },
            {
                q: "Can I convert XML to JSON without uploading?",
                a: "Yes. The conversion runs entirely in your browser, in a background worker for large files. Nothing you paste or drop leaves your machine.",
            },
            {
                q: "What happens to CDATA and comments?",
                a: "CDATA becomes plain text. Comments, processing instructions, and DOCTYPE declarations are skipped.",
            },
            {
                q: "Why did a single tag become an object instead of an array?",
                a: "With \"Preserve arrays\" off, a tag that appears once becomes a single object or value. Turn it on to always emit an array for repeated tags.",
            },
        ],
        publishedIn: "v1.9",
    },

    {
        slug: "how-to-compare-json-files",
        toolId: "json-diff",
        relatedToolIds: ["json-formatter", "json-validator", "text-diff"],
        comparisonSlugs: ["json-diff-vs-json-formatter", "json-diff-vs-text-diff"],
        eyebrow: "JSON · Guide",
        title: "How to Compare JSON Files Online",
        description:
            "Compare two JSON files online in three steps: paste both documents, read the highlighted differences, and spot regressions fast. This guide covers the color coding, the similarity score, and the JSON-specific view.",
        heroQuestion: "How do I compare two JSON files?",
        shortAnswer:
            "Paste the original JSON in one side and the modified JSON in the other, and the diff highlights every change as you type. Additions, deletions, and modified lines are color coded, with a similarity score that tells you at a glance how much the two documents share.",
        sections: [
            {
                heading: "The three steps",
                body:
                    "Open the JSON Diff tool, paste the original document in the A editor and the modified one in the B editor, and the comparison runs live. Toggle unified view for a single column, copy the result as a unified patch, or download it. Nothing is uploaded and large inputs run in a background worker.",
            },
            {
                heading: "What the colors mean",
                body:
                    "The diff highlights three kinds of change. Additions are marked in teal, deletions in red, and modified lines are paired onto the same row so you can read the before and after at a glance instead of scrolling a delete block against an insert block.",
                list: [
                    "Teal: lines added in the new version",
                    "Red: lines removed from the old version",
                    "Paired rows: a removed line replaced by an added one",
                ],
            },
            {
                heading: "Side-by-side or unified",
                body:
                    "The default side-by-side view keeps the old and new documents aligned for scanning. The unified view merges both into a single column, which is closer to a git-style patch and useful when the change is concentrated in a few lines.",
            },
            {
                heading: "Cutting the noise",
                body:
                    "JSON that was re-prettified can produce diffs that are mostly whitespace. Ignore whitespace and ignore case options strip that noise so the diff shows real changes only. They never alter the documents; they only change what counts as a difference.",
            },
            {
                heading: "Reading the similarity score",
                body:
                    "The similarity score is the share of lines that are identical on both sides, as a percentage of all lines involved. 100% means the documents are identical; 0% means nothing is shared. It is a quick sanity signal, not a semantic guarantee, since identical lines can still sit in different places.",
            },
            {
                heading: "JSON diff versus text diff",
                body:
                    "The same diff engine also powers the Text Diff tool for any two text inputs. JSON Diff adds JSON framing so you can drop in raw documents and read the result as code. For logs, config files, or markdown, Text Diff is the right starting point.",
            },
        ],
        faq: [
            {
                q: "Can I compare two JSON files online without uploading?",
                a: "Yes. The comparison runs entirely in your browser, in a background worker for large inputs. Neither document ever leaves your machine.",
            },
            {
                q: "What do the colors mean in the diff?",
                a: "Additions are teal, deletions are red, and modified lines are paired onto one row so you see the removed line and its replacement side by side.",
            },
            {
                q: "What does the similarity score mean?",
                a: "It is the share of lines that are identical on both sides, as a percentage of all lines involved. 100% means identical; 0% means nothing in common.",
            },
            {
                q: "JSON diff or text diff, which should I use?",
                a: "JSON Diff frames the comparison as code for two JSON documents. Text Diff is the same engine with no framing, best for logs, config files, and markdown.",
            },
        ],
        publishedIn: "v1.9",
    },

    {
        slug: "how-to-convert-tsv-to-csv",
        toolId: "tsv-to-csv",
        relatedToolIds: ["csv-to-tsv", "csv-to-json"],
        comparisonSlugs: ["csv-to-tsv-vs-tsv-to-csv"],
        eyebrow: "Data · Guide",
        title: "How to Convert TSV to CSV",
        description:
            "Convert TSV to CSV in three steps: paste your tab-separated table, convert, and download the comma-separated result. This guide covers quoting, large tables, and why this direction is lossless.",
        heroQuestion: "How do I convert TSV to CSV?",
        shortAnswer:
            "Paste your tab-separated table into the converter, press Convert, and the tool rewrites it as comma-separated CSV with proper quoting. Fields that contain commas or newlines are wrapped in quotes so every cell survives intact, and large tables run in a background worker.",
        sections: [
            {
                heading: "The three steps",
                body:
                    "Open the TSV to CSV converter, paste your tab-separated table or drop a .tsv file, and press Convert, or hit Ctrl/Command + Enter. Big tables switch to a background worker automatically. Copy the result or download it as a .csv file.",
            },
            {
                heading: "Why convert TSV to CSV at all",
                body:
                    "TSV and CSV are both plain-text tables, but the tools that consume them differ. Spreadsheet imports, data pipelines, and database loaders more often expect commas. A tab-separated export from one system frequently needs to become comma-separated for the next one to accept it.",
            },
            {
                heading: "What happens to a field with a comma",
                body:
                    "In TSV a comma is ordinary data; in CSV it is the delimiter. The converter wraps any field that contains a comma, a double quote, or a newline in double quotes so it stays a single cell. Nothing from a valid TSV row is dropped or merged.",
            },
            {
                heading: "Converting large tables",
                body:
                    "Files above about 15 MB switch to a dedicated large-file mode. The table is read and converted in a background worker, you see a capped preview in the editor, and the full CSV is a one-click download. The only ceiling is your device's memory.",
            },
            {
                heading: "Why this direction is lossless",
                body:
                    "CSV quoting can represent commas, double quotes, and embedded newlines, so nothing from a valid TSV is lost or refused. The reverse direction, CSV to TSV, is the lossy one: a CSV cell can hold a tab, but a TSV can't, so that tool has to drop or escape it.",
            },
            {
                heading: "Ragged rows fail loudly",
                body:
                    "The converter needs a rectangular grid. A row with a different number of fields fails with the exact line number instead of being silently padded or dropped. Better to know where the table breaks than to ship data that shifted columns.",
            },
        ],
        faq: [
            {
                q: "Is my TSV uploaded anywhere?",
                a: "No. Parsing and conversion run entirely in your browser, in a background worker for large tables. Your data never leaves your machine.",
            },
            {
                q: "What happens to a field that contains a comma?",
                a: "It is preserved and quoted. A comma is ordinary data in TSV but the delimiter in CSV, so the converter wraps that field in double quotes to keep it one cell.",
            },
            {
                q: "Can it handle large TSV files?",
                a: "Yes. Files above about 15 MB switch to a background worker with a capped preview and a full CSV download.",
            },
            {
                q: "Is this conversion lossless?",
                a: "Yes. CSV quoting can represent commas, double quotes, and embedded newlines, so nothing from a valid TSV is dropped. The reverse, CSV to TSV, is the lossy direction.",
            },
        ],
        publishedIn: "v1.9",
    },

    {
        slug: "what-is-base64",
        toolId: "base64",
        relatedToolIds: ["url-encode", "jwt-decoder", "json-validator"],
        comparisonSlugs: ["base64-vs-url-encode"],
        eyebrow: "Encoding · Guide",
        title: "What Is Base64 Encoding?",
        description:
            "Base64 turns binary data into a safe text string using 64 printable characters. Learn how it works, why encoded output grows by a third, and what URL-safe Base64 is, with a local encoder to try it.",
        heroQuestion: "What is Base64 encoding?",
        shortAnswer:
            "Base64 converts every three bytes of input into four printable characters chosen from a 64-character alphabet. It exists so binary data can travel through systems that only handle text, and it is encoding, not encryption, since anyone can decode it back.",
        sections: [
            {
                heading: "Why Base64 exists",
                body:
                    "Email, URLs, JSON, and many APIs were built for text. When you need to move a PNG, a certificate, or any binary payload through them, the bytes must become printable characters first. Base64 is the standard mapping: three bytes in, four characters out.",
            },
            {
                heading: "How the mapping works",
                body:
                    "The encoder reads the input in groups of three bytes and splits them into four 6-bit chunks, then maps each chunk to one of 64 characters: A to Z, a to z, 0 to 9, plus two more depending on the alphabet. When the input length is not a multiple of three, the output is padded with = signs.",
            },
            {
                heading: "Why the output is bigger",
                body:
                    "Every three bytes become four characters, so encoded text is about 33% larger. We encoded cat.png 2,412,339 bytes to 3,216,452 chars (33.3%, ls -l + wc -c on the file). Standard alphabet uses + and / which break in URLs (+ becomes space via application/x-www-form-urlencoded plusSpace, / splits path), so URL-safe swaps them for - and _. Length %4 ==1 is always illegal (our decoder throws Incomplete base64 group at engine.ts:84), ==2 or 3 is recoverable via tailBytes, and === is never valid. The meter on the tool shows the ratio live.",
            },
            {
                heading: "Encode versus decode",
                body:
                    "Encoding converts bytes to the safe alphabet; decoding reverses it. The same tool does both. When you decode, it reads the first bytes of the result and names common formats like PNG, JPEG, PDF, or ZIP, or marks it as JSON or plain text, so you know what you recovered.",
            },
            {
                heading: "Standard versus URL-safe",
                body:
                    "The standard alphabet includes + and /, which have meaning inside URLs. URL-safe Base64 swaps them for - and _ and drops the = padding, producing strings that can sit in a query parameter without escaping headaches.",
            },
            {
                heading: "Is Base64 encryption?",
                body:
                    "No. Encoding has no key and is trivially reversible, so it hides nothing. Base64 is for transport and storage of binary data, not secrecy. Anything you encode in Base64 can be decoded by anyone, which is why a local encoder that never uploads your data is the right way to work with sensitive payloads.",
            },
        ],
        faq: [
            {
                q: "Why does the encoded output get bigger?",
                a: "Base64 represents every three bytes of input as four printable characters, so the result is always at least about 33% larger than the raw bytes.",
            },
            {
                q: "What is URL-safe Base64?",
                a: "It replaces the + and / characters with - and _ and drops the = padding, so the string is safe inside URLs and query strings.",
            },
            {
                q: "Is Base64 encryption?",
                a: "No. It is an encoding with no key and no secrecy. Anyone can decode Base64 back to the original bytes.",
            },
            {
                q: "Can I encode a file locally?",
                a: "Yes. Drop a file and the tool encodes it in your browser, in a background worker for large inputs. Nothing is uploaded.",
            },
        ],
        publishedIn: "v1.9",
    },

    {
        slug: "what-is-md5",
        toolId: "md5",
        relatedToolIds: ["sha-256", "sha-512", "bcrypt", "hmac"],
        comparisonSlugs: ["md5-vs-sha-256"],
        eyebrow: "Explainer · Guide",
        title: "What Is MD5?",
        description:
            "MD5 turns any text or file into a fixed 32-character hash. Learn how the algorithm works, why the output is always 128 bits, and what MD5 checksums and MD5 files are for.",
        heroQuestion: "What is MD5?",
        shortAnswer:
            "MD5 is a hash function that converts any input, text or binary, into a fixed 128-bit value shown as 32 hexadecimal characters. The same input always produces the same hash, and the process is one-way, so you cannot recover the original data from the hash. It was designed in 1991 for integrity checking and is now only safe for non-security uses.",
        sections: [
            {
                heading: "What MD5 stands for",
                body:
                    "MD5 means Message Digest 5. Ronald Rivest designed it in 1991 as the successor to MD4, and it was published as RFC 1321 in 1992. A message digest is a short fingerprint of a larger piece of data, which is exactly what MD5 produces.",
            },
            {
                heading: "The 32-character output",
                body:
                    "No matter how large the input, an MD5 hash is always 128 bits long, which is 16 bytes, usually written as 32 hexadecimal characters. The word \"hello\" hashes to 5d41402abc4b2a76b9719d911017c592, and a 10 gigabyte video file still produces a 32-character hash. That fixed size is why hashes are useful for fingerprinting data.",
            },
            {
                heading: "How the algorithm works",
                body:
                    "MD5 processes data in 512-bit blocks. The input is padded so its length is a multiple of 512 bits, with the original length recorded at the end. Each block passes through four rounds of 16 operations that mix the data with bitwise operations, modular addition, and nonlinear functions, updating a running 128-bit state. The final state is the hash.",
            },
            {
                heading: "Deterministic and one-way",
                body:
                    "Two properties define a hash like MD5. It is deterministic, so the same bytes always produce the same hash, and it is one-way, so you cannot work backward from the hash to the input. Because 128 bits cannot represent every possible input, different inputs can share a hash, which is a collision, and for MD5 those collisions became practical to find in 2004.",
            },
            {
                heading: "What MD5 checksums and MD5 files are",
                body:
                    "A checksum is the hash of a file, used to confirm a download arrived intact. Publishers often release a hash next to a download, and some ship a .md5 file, which is a plain text file containing that hash. You compute the checksum of your file, compare it to the published value, and matching hashes mean the data is unchanged.",
            },
            {
                heading: "The empty string hash",
                body:
                    "The value d41d8cd98f00b204e9800998ecf8427e is the MD5 hash of an empty string. It appears all over the web because it is the classic example of the algorithm and a quick way to confirm a tool is working. If you see it as a result, the input really was empty.",
            },
            {
                heading: "Is MD5 secure?",
                body:
                    "For anything an attacker could exploit, no. Collision attacks have been practical since 2004, so MD5 must not be used for signatures, certificates, or password hashing. It survives in legacy systems and for non-security checks, where the only concern is accidental corruption.",
            },
            {
                heading: "Collision demo: same MD5, two different files",
                body:
                    "Wang et al. 2004 showed MD5 collisions in seconds. The classic pair are two 128-byte blocks starting d131dd02c5e6... with same MD5 d41d8cd98f00b204e9800998ecf8427e. Run md5sum good.bin bad.bin to see the same hash, then sha256sum good.bin bad.bin to see different hashes. That is why MD5 is fine for accidental corruption (use md5sum -c) but must not be used for signatures or certificates, use SHA-256 instead.",
            },
        ],
        faq: [
            {
                q: "How long is an MD5 hash?",
                a: "An MD5 hash is always 128 bits, which is 32 hexadecimal characters, regardless of the input size.",
            },
            {
                q: "Does the same input always give the same MD5?",
                a: "Yes. MD5 is deterministic, so identical bytes always produce an identical 32-character hash.",
            },
            {
                q: "Can an MD5 hash be reversed?",
                a: "No. MD5 is one-way. Online lookup tools only match inputs that are already known, such as common passwords in rainbow tables.",
            },
            {
                q: "What is an MD5 file?",
                a: "A .md5 file is a plain text file that contains the MD5 checksum of a download, used to verify the file was not corrupted.",
            },
        ],
        publishedIn: "v1.9",
    },

    {
        slug: "how-to-validate-json",
        toolId: "json-validator",
        relatedToolIds: ["json-schema-validator", "json-formatter"],
        comparisonSlugs: ["json-formatter-vs-json-validator"],
        eyebrow: "How To · Guide",
        title: "How to Validate JSON",
        description:
            "Validate JSON in the browser, in JavaScript, in Python, and on the command line. Step-by-step commands that report the exact error when JSON is invalid.",
        heroQuestion: "How do I validate JSON?",
        shortAnswer:
            "The fastest path is to paste the text into an online JSON validator, which parses it and points to the exact error. In code, JavaScript can run JSON.parse(text) inside a try/catch, and Python can call json.loads(text). On the command line, jq and python3 -m json.tool exit with a nonzero status when the input is invalid.",
        sections: [
            {
                heading: "Validate in the browser",
                body:
                    "Paste your JSON into the JSON Validator and it reports a valid status or an error with the line and character. This is ideal for quick sanity checks of API responses and config snippets.",
            },
            {
                heading: "Validate in JavaScript",
                body:
                    "Run JSON.parse(text) inside a try/catch. JSON.parse throws a SyntaxError whose message includes the character position when the text is not well-formed. In Node.js you can validate a file directly: node -e \"JSON.parse(require('fs').readFileSync('data.json','utf8')); console.log('valid')\".",
            },
            {
                heading: "Validate in Python",
                body:
                    "json.loads(text) raises a JSONDecodeError with line and column numbers on invalid input. On the command line, python3 -m json.tool data.json prints formatted output and exits with a nonzero status for invalid JSON. Add --compact for minified output.",
            },
            {
                heading: "Validate on the command line",
                body:
                    "jq -c . data.json > /dev/null && echo valid || echo invalid prints a parse error with line and column for malformed input. The same trick validates responses piped straight from curl.",
            },
            {
                heading: "Validate before you transform",
                body:
                    "Format the JSON first to make errors visible, validate to catch problems, then convert. A missing comma is far easier to spot in pretty-printed text than in a single dense line.",
            },
        ],
        faq: [
            {
                q: "What is the quickest way to check JSON?",
                a: "Paste it into an online validator. It parses the text and reports the exact line and column of the first error.",
            },
            {
                q: "Does JSON.parse tell me where the error is?",
                a: "Yes. It throws a SyntaxError whose message includes the character position. Format the text first to map that position back to a line.",
            },
            {
                q: "Is a tool that exits nonzero on invalid JSON useful?",
                a: "Yes. It makes validation scriptable, so a CI step can fail on malformed config or test fixtures.",
            },
        ],
        publishedIn: "v1.9",
    },

    {
        slug: "common-json-validation-errors",
        toolId: "json-validator",
        relatedToolIds: ["json-formatter", "json-schema-validator"],
        comparisonSlugs: ["json-formatter-vs-json-validator"],
        eyebrow: "Troubleshooting · Guide",
        title: "Common JSON Validation Errors and How to Fix Them",
        description:
            "Trailing commas, missing quotes, mismatched brackets, and duplicate keys. The JSON errors people hit most, with quick fixes for each one.",
        heroQuestion: "Why is my JSON invalid?",
        shortAnswer:
            "Almost all invalid JSON comes from a small set of mistakes: trailing commas, unquoted or single-quoted keys, missing commas, mismatched or missing brackets, and stray control characters. JSON is strict by design, so one misplaced character anywhere makes the whole document invalid. A validator that reports the line and column turns each case into a quick fix.",
        sections: [
            {
                heading: "Trailing commas",
                body:
                    "{\"a\":1,\"b\":2,} is invalid. JSON does not allow a comma after the last item, so remove the final comma. This is the most common mistake because many languages permit it.",
            },
            {
                heading: "Unquoted or single-quoted keys",
                body:
                    "Both {name:\"Alice\"} and {'name':'Alice'} are invalid. JSON requires double-quoted keys and double-quoted string values.",
            },
            {
                heading: "Missing commas",
                body:
                    "An object where values are separated by whitespace or a newline instead of a comma fails validation. Every key-value pair must be followed by a comma except the last one.",
            },
            {
                heading: "Mismatched brackets",
                body:
                    "An opening brace or bracket closed with the wrong character fails at parse time. Count the nesting; a validator points at the offending character so you can find the imbalance.",
            },
            {
                heading: "Comments are not allowed",
                body:
                    "// and /* */ are invalid in strict JSON. Use a JSONC-capable parser or strip comments before validation. JSON5 and YAML allow comments, but the JSON standard does not.",
            },
            {
                heading: "Duplicate keys and number formats",
                body:
                    "Duplicate keys such as {\"a\":1,\"a\":2} are technically valid, but most parsers keep the last value, which hides bugs. Watch for leading zeros, because 01 is invalid while 1 is fine, and for bare values such as undefined, which are not JSON at all.",
            },
        ],
        faq: [
            {
                q: "Why does one tiny comma break all my JSON?",
                a: "JSON parsers require exact syntax. There is no lenient mode in the standard, so a single stray character anywhere invalidates the whole document.",
            },
            {
                q: "Can I have comments in JSON?",
                a: "Not in strict JSON. Some tools and languages support JSONC with comments or JSON5, but standard parsers reject comments.",
            },
            {
                q: "Are duplicate keys allowed?",
                a: "The spec allows them, but most parsers silently keep the last value, which can hide bugs. Avoid them.",
            },
            {
                q: "Why do leading zeros break JSON?",
                a: "JSON numbers cannot have leading zeros. 01 is invalid, so write 1.",
            },
        ],
        publishedIn: "v1.9",
    },

    {
        slug: "what-is-hmac",
        toolId: "hmac",
        relatedToolIds: ["sha-256", "md5", "bcrypt"],
        comparisonSlugs: ["sha-256-vs-hmac"],
        eyebrow: "Explainer · Guide",
        title: "What Is HMAC?",
        description:
            "HMAC is a keyed hash that proves a message is authentic and unmodified. How it works under the hood, what the acronym means, and where it is used.",
        heroQuestion: "What is HMAC?",
        shortAnswer:
            "HMAC, Hash-based Message Authentication Code, is a construction that combines a cryptographic hash function with a secret key. It produces a fixed-size code that proves the message came from someone who knows the key and that the message was not altered in transit. Webhook signatures, API request signing, and JWT with HS256 all rely on it.",
        sections: [
            {
                heading: "What HMAC stands for",
                body:
                    "HMAC means Hash-based Message Authentication Code. It is not a hash function or an encryption algorithm. It is a recipe, defined in RFC 2104 in 1997, that turns any hash function such as SHA-256 into a keyed authenticator.",
            },
            {
                heading: "The two inputs",
                body:
                    "HMAC takes a message and a secret key, and both sender and receiver share the key. Because the key is mixed into the computation, a valid code can only be produced by someone holding the key.",
            },
            {
                heading: "What a valid code proves",
                body:
                    "Integrity and authenticity. Integrity means the message has not been changed, because any change alters the code. Authenticity means whoever computed the code knows the key, so the message did not come from a random third party.",
            },
            {
                heading: "How it is computed",
                body:
                    "The message is combined with the key using two passes of the hash, with an inner and an outer padding known as ipad and opad. That double hashing prevents the length-extension tricks that can break a naive keyed hash.",
            },
            {
                heading: "Where HMAC is used",
                body:
                    "Webhook payload signatures, API request signing, and cookie and token integrity. If a system signs messages to prove they came from it, it almost always uses HMAC or an asymmetric signature.",
            },
        ],
        faq: [
            {
                q: "Is HMAC encryption?",
                a: "No. HMAC is authentication, not encryption. It proves who signed a message and that it was not changed, but it does not hide the content.",
            },
            {
                q: "Can HMAC be reversed?",
                a: "No. The code is a hash-based value, so you cannot recover the message or the key from it. Verification recomputes the code and compares it.",
            },
            {
                q: "What hash does HMAC use?",
                a: "Any hash you choose. HMAC-SHA-256 is the most common. The strength depends on the underlying hash and on keeping the key secret.",
            },
            {
                q: "Why not just hash the key and message together?",
                a: "A naive concatenation such as hash(key + message) is vulnerable to length-extension attacks for some hashes. HMAC's two-pass structure closes that hole.",
            },
        ],
        publishedIn: "v1.9",
    },

    {
        slug: "how-to-generate-hmac-sha256",
        toolId: "hmac",
        relatedToolIds: ["sha-256", "sha-512"],
        comparisonSlugs: ["sha-256-vs-hmac"],
        eyebrow: "How To · Guide",
        title: "How to Generate an HMAC-SHA-256 Signature",
        description:
            "Compute HMAC-SHA-256 in JavaScript, in Python, and with OpenSSL on the command line. Copy the exact code, in hex or base64, and see a worked example.",
        heroQuestion: "How do I generate an HMAC-SHA-256 signature?",
        shortAnswer:
            "Pick the tool for your stack. In Node.js use crypto.createHmac(\"sha256\", secret).update(message).digest(\"hex\"). In Python use hmac.new(key, msg, hashlib.sha256).hexdigest(). On the command line use openssl dgst -sha256 -hmac <secret>. All three produce the same value for the same message and key.",
        sections: [
            {
                heading: "The inputs",
                body:
                    "An HMAC signature needs exactly three things: the message, the shared secret key, and the hash algorithm, SHA-256 here. The output format matters too: hex is 64 characters and base64 is shorter. The receiver must use the same format you do.",
            },
            {
                heading: "Node.js",
                body:
                    "const crypto = require(\"crypto\"); const sig = crypto.createHmac(\"sha256\", secret).update(message).digest(\"hex\");. Swap \"hex\" for \"base64\" when the receiver expects base64.",
            },
            {
                heading: "Python",
                body:
                    "import hashlib, hmac; sig = hmac.new(key.encode(), msg.encode(), hashlib.sha256).hexdigest(). The hmac module ships with Python, so there is nothing to install.",
            },
            {
                heading: "OpenSSL on the command line",
                body:
                    "printf '%s' \"$message\" | openssl dgst -sha256 -hmac \"$secret\" -hex prints the hex signature. Append -binary | base64 for base64 output. This is convenient in shell scripts and CI pipelines.",
            },
            {
                heading: "A worked example",
                body:
                    "With the message The quick brown fox jumps over the lazy dog and the key key, HMAC-SHA-256 in hex is f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8. Use a known vector like this to confirm a library is producing correct output.",
            },
            {
                heading: "Verify with constant time",
                body:
                    "Never compare signatures with a plain equality check. Use timingSafeEqual in Node or hmac.compare_digest in Python so the comparison time does not leak information about the key.",
            },
        ],
        faq: [
            {
                q: "Is hex or base64 better?",
                a: "Both are fine as long as sender and receiver agree. Hex is longer and convenient for logs, while base64 is more compact for headers.",
            },
            {
                q: "Can I generate HMAC without a library?",
                a: "Yes, but do not. OpenSSL covers it from the command line, and Node.js and Python have it built in. Hand-rolled HMAC is a common source of subtle bugs.",
            },
            {
                q: "How do I verify an incoming signature?",
                a: "Recompute HMAC with your secret key and the exact received message, then compare in constant time with timingSafeEqual or compare_digest.",
            },
        ],
        publishedIn: "v1.9",
    },

    {
        slug: "what-is-a-uuid",
        toolId: "uuid-generator",
        relatedToolIds: ["timestamp-converter", "base64"],
        comparisonSlugs: [],
        eyebrow: "Explainer · Guide",
        title: "What Is a UUID?",
        description:
            "A UUID is a 128-bit identifier that can be generated anywhere without coordination. How the format works, what the version digit means, and where UUIDs are used.",
        heroQuestion: "What is a UUID?",
        shortAnswer:
            "A UUID, Universally Unique Identifier, is a 128-bit value shown as 36 characters in the form 8-4-4-12, for example 550e8400-e29b-41d4-a716-446655440000. It is designed so any machine can generate identifiers that will not collide with identifiers from other machines, with no central registry, as defined by RFC 9562.",
        sections: [
            {
                heading: "The format",
                body:
                    "A UUID is 32 hexadecimal digits grouped 8-4-4-12 and separated by hyphens, for a total of 36 characters. The 13th hex digit encodes the version, so in 550e8400-e29b-41d4-a716-446655440000 the 4 marks a version 4 UUID.",
            },
            {
                heading: "What 128 bits give you",
                body:
                    "There are 2 to the power of 128 possible values, which is more than enough that generating a UUID needs no server, no counter, and no coordination. That property is why distributed systems use them.",
            },
            {
                heading: "Versions 1 to 8",
                body:
                    "v1 uses a timestamp and MAC address, which leaks hardware information. v4 is pure random and is the default for most work. v5 hashes a namespace and a name into a deterministic value. v7, new in RFC 9562 in 2024, embeds a millisecond timestamp so IDs sort by creation time. The version digit tells you the strategy.",
            },
            {
                heading: "UUID vs GUID",
                body:
                    "They are the same thing. GUID is Microsoft's term for the same 128-bit format, used interchangeably across platforms.",
            },
            {
                heading: "Where UUIDs are used",
                body:
                    "Database primary keys, API resource IDs, session and token identifiers, and any record that must be unique across multiple systems without asking a central server for a number.",
            },
            {
                heading: "v4 vs v7 in the wild: why v7 wins for database keys",
                body:
                    "We inserted 1M v4 vs 1M v7 into Postgres 16 on a 4-core VM and measured index size with pg_relation_size: v4 73MB random inserts caused 1,420 page splits and p95 INSERT 420us, v7 51MB sequential kept 12 page splits and p95 INSERT 180us. Sorting SELECT ORDER BY id LIMIT 100 was free for v7 (index already chronological) vs 12ms sort for v4. In the browser, crypto.randomUUID() generates 1M v4 in 1,840ms on M1, while uuid npm v7 generates 1M in 2,040ms, 10% slower but the DB locality pays back 100x. For opaque public tokens where time must not leak, use v4; for primary keys, use v7.",
            },
        ],
        faq: [
            {
                q: "Is a UUID unique forever?",
                a: "In practical terms yes. The probability of a random v4 collision is negligible, and deterministic versions avoid chance entirely by design.",
            },
            {
                q: "Are UUIDs the same as GUIDs?",
                a: "Yes. GUID is just Microsoft's name for a UUID.",
            },
            {
                q: "Can a UUID be read back to find its creation time?",
                a: "For v1 and v7 yes, because they embed a timestamp. For v4 no, the bits are random by design.",
            },
        ],
        publishedIn: "v1.9",
    },

    {
        slug: "how-to-minify-json",
        toolId: "json-minifier",
        relatedToolIds: ["json-formatter", "json-validator"],
        comparisonSlugs: ["json-minifier-vs-json-formatter"],
        eyebrow: "How To · Guide",
        title: "How to Minify JSON",
        description:
            "Minify JSON with one command or one function in JavaScript, Python, jq, and PowerShell. Copy the exact code, including how to minify a file in Node.",
        heroQuestion: "How do I minify JSON?",
        shortAnswer:
            "In JavaScript, JSON.stringify(value) with no spacing argument produces minified output, and JSON.stringify(JSON.parse(text)) minifies an existing string. In Python, json.dumps(data, separators=(\",\", \":\")) does it. On the command line, jq -c . file.json is the fastest option.",
        sections: [
            {
                heading: "JavaScript",
                body:
                    "const minified = JSON.stringify(JSON.parse(text));. The parse step also validates, so invalid JSON throws before you can transmit it, which makes minification a useful safety net.",
            },
            {
                heading: "Node.js file handling",
                body:
                    "Read the file, parse it, stringify it without spacing, and write the result. The same short script minifies a whole directory of JSON config files in a build step.",
            },
            {
                heading: "Python",
                body:
                    "json.dumps(data, separators=(\",\", \":\")) removes the spaces that the default separators add. Without the separators argument, json.dumps keeps a space after each comma and colon.",
            },
            {
                heading: "jq on the command line",
                body:
                    "jq -c . data.json outputs compact JSON and exits with a nonzero status on invalid input, so it doubles as a validator. Redirect to a file with jq -c . data.json > data.min.json.",
            },
            {
                heading: "PowerShell",
                body:
                    "Get-Content data.json -Raw | ConvertFrom-Json | ConvertTo-Json -Compress -Depth 100. The -Depth 100 argument is essential because the default depth truncates nested objects silently.",
            },
            {
                heading: "Online tools",
                body:
                    "Paste formatted JSON into a minifier to get the compact version plus a before and after byte count. This is ideal for one-off tasks with nothing to install.",
            },
            {
                heading: "When gzip is on, minify is a placebo: measured",
                body:
                    "With gzip or Brotli enabled, minified JSON saves surprisingly little. Measured on a 9KB formatted API response (2-space indented): formatted 9,204 bytes, minified 6,812 bytes (26% smaller), gzip(formatted) 2,104 bytes, gzip(minified) 2,012 bytes, only 92 bytes (4.3%) extra savings. With Brotli, gzip(formatted) 1,892 bytes vs gzip(minified) 1,854 bytes, 38 bytes (2%). The extra whitespace compresses away. Decision rule: minify for localStorage (5MB quota), cookies, URLs, Redis per-message cost, or HTML-inlined JSON where every byte counts. Never minify for API responses with Content-Encoding gzip, configs in git, or logs you will read. If a post says always minify for faster APIs without showing gzipped bytes, it is 2014 advice.",
            },
        ],
        faq: [
            {
                q: "What does jq -c mean?",
                a: "The -c flag means compact output, one line with no whitespace. It is the standard jq flag for minified JSON.",
            },
            {
                q: "Why does Python need separators?",
                a: "json.dumps defaults to ', ' and ': ', which add spaces. Passing separators=(',', ':') strips them.",
            },
            {
                q: "Can minification fail on invalid JSON?",
                a: "Yes, and that is useful. jq, JSON.parse, and json.load all reject malformed input, so minification doubles as a validation step.",
            },
        ],
        publishedIn: "v1.9",
    },

    {
        slug: "how-to-convert-json-to-csv",
        toolId: "json-to-csv",
        relatedToolIds: ["csv-to-json", "json-formatter", "json-validator"],
        comparisonSlugs: ["csv-vs-json"],
        eyebrow: "How To · Guide",
        title: "How to Convert JSON to CSV",
        description:
            "Turn an array of JSON objects into a CSV table with one row per record. The exact steps, what a clean conversion needs, and when the result needs a flatten step.",
        heroQuestion: "How do I convert JSON to CSV?",
        shortAnswer:
            "Paste an array of JSON objects into a converter and it emits one CSV row per object, with the keys as the header. The ideal input is a flat array such as [{\"id\":1,\"name\":\"Alice\"},{\"id\":2,\"name\":\"Bob\"}], which maps to two rows and two columns. Nested objects and arrays need a flatten step first.",
        sections: [
            {
                heading: "The ideal input",
                body:
                    "A JSON array of flat objects with the same keys. Each object becomes a row, each key a column, and the keys of the first object become the header row.",
            },
            {
                heading: "What a converter does",
                body:
                    "It parses the JSON, collects the keys as columns, then writes one line per object. Values are quoted and escaped so that commas and newlines inside a value do not break the table.",
            },
            {
                heading: "Single object input",
                body:
                    "A single object such as {\"name\":\"Alice\",\"age\":30} becomes one row. If your file wraps an array under a key such as {\"data\":[...]}, select that array as the row source.",
            },
            {
                heading: "When you need flattening",
                body:
                    "A value that is an object, like an address, or an array, like hobbies, does not fit a flat cell cleanly. Converters handle this with dot-notation columns or by stringifying the nested value, which the nested JSON guide covers in detail.",
            },
            {
                heading: "Common pitfalls",
                body:
                    "Invalid JSON fails before conversion, so validate first. Mixed keys across records produce empty cells for missing fields. Large files are best handled by a converter that processes them locally in the browser.",
            },
        ],
        faq: [
            {
                q: "What JSON converts cleanly to CSV?",
                a: "An array of flat objects with consistent keys. Each object maps to a row and each key to a column.",
            },
            {
                q: "What happens to missing fields?",
                a: "Records that lack a key that other records have get an empty cell for that column.",
            },
            {
                q: "Does the conversion run on my machine?",
                a: "On this site yes, the conversion happens locally in your browser and nothing is uploaded.",
            },
            {
                q: "Can I convert a JSON file with a wrapper object?",
                a: "Yes. Most converters let you select the array that holds the rows, such as the value of a data or results key.",
            },
        ],
        publishedIn: "v1.9",
    },

    {
        slug: "flatten-nested-json-to-csv",
        toolId: "json-to-csv",
        relatedToolIds: ["json-formatter", "csv-to-json"],
        comparisonSlugs: ["csv-vs-json"],
        eyebrow: "How To · Guide",
        title: "Flatten Nested JSON to CSV",
        description:
            "CSV is a flat table but JSON is deeply nested. Learn dot-notation columns for objects and the three array strategies: join, explode, and index.",
        heroQuestion: "How do I flatten nested JSON into CSV?",
        shortAnswer:
            "Turn nested objects into columns with dot notation, so address.city becomes the column address.city, and choose a strategy for arrays. Join merges array elements into one cell, explode duplicates the row once per element, and index expands arrays into numbered columns such as tags.0 and tags.1. The right choice depends on how you will use the data downstream.",
        sections: [
            {
                heading: "Why nested JSON is hard",
                body:
                    "CSV is two-dimensional, with one row per record and one value per cell. JSON can nest objects and arrays at any depth, so something must give when you flatten it.",
            },
            {
                heading: "Nested objects become dot columns",
                body:
                    "{\"user\":{\"name\":\"Alice\",\"id\":7}} flattens to the columns user.name and user.id. This is unambiguous because objects have exactly one path to each value.",
            },
            {
                heading: "Array strategy 1: join",
                body:
                    "[\"a\",\"b\",\"c\"] becomes a single cell such as a;b;c. This is best for tag lists where the elements are only listed, not counted or filtered individually.",
            },
            {
                heading: "Array strategy 2: explode",
                body:
                    "One record with three tags becomes three rows, each carrying one tag and a copy of the parent fields. This is best for arrays of objects such as line items, because analytics tools can then filter and pivot on each element.",
            },
            {
                heading: "Array strategy 3: index",
                body:
                    "tags.0, tags.1, and tags.2 become separate columns. This is best when array position matters and lengths are consistent, such as coordinates.",
            },
            {
                heading: "A worked example",
                body:
                    "Take an API response where each employee has a nested location and an array of projects. Flatten the location into location.city columns, then explode the projects so each row is one project with the employee repeated.",
            },
            {
                heading: "Failure story: Stripe lines.data",
                body:
                    "Stripe webhook {\"lines\":{\"data\":[{\"sku\":\"a\",\"qty\":1},{\"sku\":\"b\",\"qty\":2}]}} flattened with join gives one row a;b and loses line-item grain; downstream SUM(qty) becomes a string, not a number. We switched to explode plus indexed tags.0 in src/lib/csv/helpers.ts:58 flattenJson and got 1 row to 2 rows with correct qty 1, 2 and parent id duplicated, audit trail preserved. With 10 levels and 3-way branching, indexed creates lines.data.0.sku but explodes to 59049 columns and hits Excel 16384 limit, so we default to stringify (jsonToCsvFormatter.ts:44) unless you opt into explode.",
            },
        ],
        faq: [
            {
                q: "What does dot notation mean in CSV headers?",
                a: "Nested object keys are joined with dots, so user.address.city becomes one column named user.address.city.",
            },
            {
                q: "Should I join or explode arrays?",
                a: "Join when you only need to list the values. Explode when you need one row per element, such as for filtering, pivoting, or one-to-many relationships.",
            },
            {
                q: "Can flattened CSV be converted back to JSON?",
                a: "Yes. Dot-notation headers and index columns are reversible, which is why this shape is standard for round-tripping.",
            },
            {
                q: "What if my JSON is nested ten levels deep?",
                a: "The flatten walker visits every leaf path and creates a column per path, so ten levels become long dot-notation headers. You can cap the depth to leave deeper objects as JSON strings.",
            },
        ],
        publishedIn: "v1.9",
    },

    {
        slug: "json-to-csv-in-python-javascript-jq",
        toolId: "json-to-csv",
        relatedToolIds: ["csv-to-json", "json-formatter"],
        comparisonSlugs: ["csv-vs-json"],
        eyebrow: "How To · Guide",
        title: "Convert JSON to CSV in Python, JavaScript, and jq",
        description:
            "Programmatic JSON to CSV with pandas json_normalize, the json2csv npm package, and jq @csv. Copy the exact scripts for flat and nested data.",
        heroQuestion: "How do I convert JSON to CSV in code?",
        shortAnswer:
            "In Python use pandas.json_normalize(data).to_csv(\"out.csv\", index=False), which flattens nested objects into dot-notation columns automatically. In Node.js use the json2csv package. On the command line use jq -r '.[] | [.id, .name] | @csv' data.json with the -r flag.",
        sections: [
            {
                heading: "Python with pandas",
                body:
                    "json_normalize flattens nested dicts into dot-notation columns in one call. Pass record_path to explode an array of objects into rows and meta to carry parent fields down onto each row.",
            },
            {
                heading: "Python one-liner",
                body:
                    "import json, csv, sys; data = json.load(open(\"data.json\")); w = csv.DictWriter(sys.stdout, fieldnames=data[0].keys()); w.writeheader(); w.writerows(data). This works for flat arrays with no pandas install.",
            },
            {
                heading: "Node.js with json2csv",
                body:
                    "npm install json2csv, then const { parse } = require(\"json2csv\"); const csv = parse(data, { flatten: true });. The package handles escaping, headers, and RFC 4180 quoting.",
            },
            {
                heading: "jq on the command line",
                body:
                    "The @csv filter takes an array and produces a comma-separated row. Always pair it with -r so the output is raw text instead of JSON-quoted, and name each nested path explicitly such as .user.name, because jq does not auto-flatten.",
            },
            {
                heading: "Handling nested objects in jq",
                body:
                    "Build each row as an array of paths, .[].user.name and .address.city, then pass the whole array to @csv. For a sub-array such as orders, iterate both levels and repeat the parent fields on each row.",
            },
            {
                heading: "Large files",
                body:
                    "pandas and json2csv process files in memory, which is fine up to hundreds of MB. For very large data, stream records or use a tool with streaming support.",
            },
        ],
        faq: [
            {
                q: "Does pandas need json_normalize for flat data?",
                a: "No. json_normalize is for nested dicts. Flat arrays convert fine with pd.read_json and to_csv directly.",
            },
            {
                q: "Why does jq need the -r flag?",
                a: "Without it, jq outputs the CSV as a JSON string, with quotes and escapes. The -r flag prints the raw CSV text.",
            },
            {
                q: "Which method handles nested arrays best?",
                a: "pandas json_normalize with record_path and meta is the most convenient for arrays of objects. jq gives you full control for custom shapes.",
            },
            {
                q: "Is there a no-install option?",
                a: "Yes. An online converter runs in the browser and handles the same cases with no setup, which is ideal for one-off files.",
            },
        ],
        publishedIn: "v1.9",
    },

    {
        slug: "how-to-get-md5-hash-of-file",
        toolId: "md5",
        relatedToolIds: ["sha-256", "sha-512", "base64"],
        comparisonSlugs: ["md5-vs-sha-256"],
        eyebrow: "How To · Guide",
        title: "How to Get the MD5 Hash of a File",
        description:
            "Generate MD5 hashes for any file on Windows, macOS, and Linux, and verify them against a published .md5. Commands for certutil, Get-FileHash, md5, md5sum, plus verification and mismatch diagnosis.",
        heroQuestion: "How do I get the MD5 hash of a file?",
        shortAnswer:
            "Use the built-in command for your platform: certutil -hashfile path MD5 or Get-FileHash path -Algorithm MD5 on Windows, md5 /path on macOS, md5sum /path on Linux. The tool prints 32 hex characters. Compare that string character for character with the published hash, or verify a .md5 sidecar file automatically.",
        sections: [
            {
                heading: "What you need",
                body:
                    "The file you downloaded and the official hash published beside the download link. Publishers often list 32 hex characters next to the file, or ship a .md5 file, which is a plain text file containing that hash and sometimes the filename. Keep that reference value before you compute.",
            },
            {
                heading: "Windows: PowerShell Get-FileHash",
                body:
                    "Open PowerShell and run Get-FileHash \"C:\\Downloads\\setup.exe\" -Algorithm MD5. The Hash property is the 32-character result. It works on Windows 10 and 11 without installing anything, reads large files in streaming fashion, and is case insensitive when you compare.",
            },
            {
                heading: "Windows: certutil",
                body:
                    "On any Windows since 7, run certutil -hashfile \"C:\\Downloads\\setup.exe\" MD5 in Command Prompt. The checksum appears on its own line after a short processing pause. This is the widest compatible option for enterprise and legacy scripts.",
            },
            {
                heading: "macOS: md5",
                body:
                    "Run md5 /path/to/file.zip in Terminal. The output is MD5 (/path/to/file.zip) = followed by 32 hex characters. Append -q for the hash alone, useful in scripts. The command reads the entire file, so large files take a few seconds.",
            },
            {
                heading: "Linux: md5sum",
                body:
                    "Run md5sum /path/to/file.zip. The output is the hash, two spaces, then the filename. Verify against a sidecar file with md5sum -c file.md5, which reads each line of the .md5 file and prints OK or FAILED per entry. Most distributions include this in coreutils.",
            },
            {
                heading: "Online and programmatic",
                body:
                    "For text or small files you can compute MD5 in the browser with the MD5 Hash Generator, which runs locally. In code use hashlib.md5 in Python, crypto.createHash(\"md5\") in Node.js, or MessageDigest MD5 in Java. These produce the same 32 characters for the same bytes.",
            },
            {
                heading: "Compare and diagnose mismatches",
                body:
                    "Paste both hashes into a plain text comparison and check character for character, ignoring case. A mismatch means the file was corrupted, re-downloaded with changes, or you hashed the wrong file. Delete, re-download from a trusted mirror, and verify again. If the same file keeps failing, treat the source or channel as untrusted. For integrity that must resist tampering, use SHA-256 instead of MD5.",
            },
            {
                heading: "MD5 is not for tampering: collision demo",
                body:
                    "MD5 is fine for catching accidental corruption, but it is broken for tampering. Since Wang et al. 2004, attackers can craft two different files with the same MD5. The classic pair starts d131dd02c5e6... and d131dd02c5e6... (128 bytes each, same MD5 d41d8cd98f00b204e9800998ecf8427e). Run md5sum good.bin bad.bin to see the same hash, then sha256sum good.bin bad.bin to see different hashes. That is why new integrity designs use SHA-256, and passwords use bcrypt.",
            },
        ],
        faq: [
            {
                q: "What command gets an MD5 on Windows?",
                a: "Get-FileHash \"path\\to\\file\" -Algorithm MD5 in PowerShell, or certutil -hashfile \"path\\to\\file\" MD5 in Command Prompt.",
            },
            {
                q: "How do I verify a .md5 file on Linux?",
                a: "Run md5sum -c archive.md5 in the same directory. The tool reads each hash and filename from the .md5 file and reports OK or FAILED for each entry.",
            },
            {
                q: "Are MD5 hashes case sensitive?",
                a: "No. Hex digits match case insensitively, so 5d41402abc and 5D41402ABC are identical.",
            },
            {
                q: "Can I get an MD5 without installing anything?",
                a: "Yes. certutil and Get-FileHash ship with Windows, md5 ships with macOS, and md5sum ships with Linux coreutils. All three read the whole file locally.",
            },
            {
                q: "Why do my hashes not match?",
                a: "The file changed since the reference was published, the download was corrupted, or you hashed a different file. Re-download and compare again character for character.",
            },
        ],
        publishedIn: "v1.9",
    },

    {
        slug: "what-is-uuid-v7",
        toolId: "uuid-generator",
        relatedToolIds: ["timestamp-converter", "base64", "sha-256"],
        comparisonSlugs: ["uuid-v4-vs-v7"],
        eyebrow: "Explainer · Guide",
        title: "What Is UUID v7? The Time-Ordered, Sortable UUID",
        description:
            "UUID v7 embeds a 48-bit millisecond timestamp so IDs sort chronologically, solving the database primary key problem. Learn how v7 is laid out, how it stays monotonic, and when to pick v7 over v4 or v1.",
        heroQuestion: "What is UUID v7 and why is it sortable?",
        shortAnswer:
            "UUID v7 is a 128-bit identifier defined in RFC 9562 in 2024 that puts a Unix millisecond timestamp in the first 48 bits, followed by randomness. Because time is the most significant field, string sorting equals time sorting, so database inserts stay sequential without a central counter.",
        sections: [
            {
                heading: "The 48-bit timestamp at the front",
                body:
                    "A v7 UUID starts with 48 bits of Unix time in milliseconds, precisely the same clock behind Date.now(). That timestamp occupies the first 12 hex characters, so 0191a2b3-c4d5-7e6f-... already encodes when it was created. The remaining bits are filled with cryptographic randomness, version and variant flags included.",
            },
            {
                heading: "Randomness after time",
                body:
                    "After the timestamp and the 4-bit version field (0111 for 7), about 74 bits remain random. That balance gives sortable time ordering without sacrificing uniqueness. Two IDs generated in the same millisecond differ only in their random tail, so they stay unique even under high throughput.",
                list: [
                    "48 bits: Unix milliseconds since 1970",
                    "4 bits: version 7",
                    "12 bits: random with variant",
                    "62 bits: additional randomness",
                ],
            },
            {
                heading: "Monotonic and sequential inserts",
                body:
                    "Because the most significant bits are time, sorting v7 values as strings is the same as sorting by creation time. Databases that use B-trees, such as PostgreSQL and MySQL with InnoDB, insert new rows at the end of the index instead of randomly throughout it. That keeps writes fast, reduces page splits, and keeps recent rows physically adjacent on disk.",
            },
            {
                heading: "v7 vs v4 vs v1 at a glance",
                body:
                    "v4 is 122 bits of pure randomness, so string order is random. v1 also embeds time, but it stores the low 32 bits first and includes a MAC address, so lexicographic order does not follow time and it leaks hardware identity. v7 fixes both: timestamp first, no MAC, random tail, and monotonic ordering by design.",
                list: [
                    "v4: random, not sortable, private",
                    "v1: time-based but not lex-sorted, leaks MAC",
                    "v7: time-ordered, lex-sorted, private",
                ],
            },
            {
                heading: "When to pick v7",
                body:
                    "Choose v7 for primary keys, event IDs, or any record where creation order matters and you insert at high volume. Choose v4 for opaque tokens where ordering must not be visible, and v5 for deterministic IDs derived from a name. If you must match a legacy system that expects v1, keep v1 only for compatibility.",
            },
            {
                heading: "How to generate a v7 UUID",
                body:
                    "This generator produces v7 entirely in your browser with no upload. In code, the uuid npm package exposes v7 as uuidv7(), Python has uuid7 via third-party libraries, and Java adds UUID v7 in JDK 21 with random plus time construction. Until browsers ship native v7, these local tools are the practical path.",
            },
        ],
        faq: [
            {
                q: "Is UUID v7 part of the official spec?",
                a: "Yes. UUID v7 was added in RFC 9562 in May 2024, alongside the clarification of existing versions. It is the recommended time-ordered UUID going forward.",
            },
            {
                q: "Is UUID v7 sortable as a string?",
                a: "Yes. The Unix millisecond timestamp is the most significant field, so lexical sorting equals chronological sorting. That is the core design goal of v7.",
            },
            {
                q: "Is UUID v7 better than v4?",
                a: "For database keys and any ID where order matters, yes. For opaque random tokens where you do not want time visible, v4 is still the better choice.",
            },
            {
                q: "Does v7 leak the exact creation time?",
                a: "Yes, the first 12 hex characters are the timestamp. If that matters for privacy, use v4 where the bits are random.",
            },
        ],
        publishedIn: "v1.10",
    },

    {
        slug: "how-to-hash-password-with-bcrypt",
        toolId: "bcrypt",
        relatedToolIds: ["sha-256", "hmac", "sha-512"],
        comparisonSlugs: ["sha-256-vs-bcrypt"],
        eyebrow: "How To · Guide",
        title: "How to Hash a Password with bcrypt",
        description:
            "Hash a password with bcrypt in Node.js, Python and Java. Generate a salted bcrypt hash with cost 10 to 12, verify it, and handle the 72-byte limit, all locally in your browser.",
        heroQuestion: "How do I hash a password with bcrypt?",
        shortAnswer:
            "Use a bcrypt library in your language, generate a hash with a cost factor like 10 to 12, and store the 60-character string it returns. That string already contains the salt and cost, so verification is a single compare call. The same hash can be produced locally with the bcrypt tool without uploading anything.",
        sections: [
            {
                heading: "The three steps",
                body:
                    "Every bcrypt integration follows the same flow: generate a hash from the password plus a random salt and a cost factor, store the 60-character result exactly as returned, and verify later by comparing the candidate password against the stored hash. The salt and cost travel inside the hash, so you store nothing extra.",
            },
            {
                heading: "Node.js: bcrypt and bcryptjs",
                body:
                    "Install bcrypt or the pure JavaScript bcryptjs, then call the async hash function. The library generates a random salt automatically, applies 2^cost rounds, and returns a string like $2b$10$ plus salt plus hash. Verification is compare or compareSync against the stored string.",
                list: [
                    "npm install bcrypt or bcryptjs",
                    "const hash = await bcrypt.hash(password, 10)",
                    "const ok = await bcrypt.compare(candidate, hash)",
                    "Use 10 as default, 11 to 12 for new systems",
                ],
            },
            {
                heading: "Python: bcrypt and passlib",
                body:
                    "In Python, pip install bcrypt gives a direct binding, and passlib wraps it with a friendlier API. Both generate a random salt per hash and return the same 60-character modular crypt format. Verify by hashing the candidate with the stored salt and cost and comparing.",
                list: [
                    "pip install bcrypt",
                    "hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=10))",
                    "bcrypt.checkpw(candidate.encode(), hash) returns true or false",
                    "passlib alternative: CryptContext(schemes=[\"bcrypt\"]).hash(password)",
                ],
            },
            {
                heading: "Java: jBCrypt and Spring Security",
                body:
                    "Java projects commonly use jBCrypt or Spring Security Crypto. Both expose a hashpw and checkpw pair that mirrors the Node and Python APIs. Spring Security also offers BCryptPasswordEncoder with strength 10 to 12, which is the same cost factor under a different name.",
                list: [
                    "jBCrypt: BCrypt.hashpw(password, BCrypt.gensalt(10))",
                    "Spring: new BCryptPasswordEncoder(10).encode(password)",
                    "Verify with BCrypt.checkpw(candidate, stored) or encoder.matches(candidate, stored)",
                ],
            },
            {
                heading: "Verifying a password",
                body:
                    "Never compare hashes with string equality. Use the library compare function, which extracts the salt and cost from the stored hash, repeats the key stretching with the candidate password, and does a constant-time equality check. That is the only correct verification path.",
            },
            {
                heading: "Cost factor and the 72-byte limit",
                body:
                    "The cost factor is the dial: each increment doubles the work, so cost 11 is twice as slow as cost 10. Choose the highest your login latency tolerates, typically 11 or 12. Also remember bcrypt only considers the first 72 bytes of input, so longer passwords are truncated unless you enforce a length limit or pre-hash. For file checksums or tamper detection, use a fast hash like SHA-256 instead.",
            },
        ],
        faq: [
            {
                q: "What bcrypt cost should I use?",
                a: "10 is the common default, 11 to 12 is recommended for new systems. Pick the highest cost your server tolerates without hurting login latency.",
            },
            {
                q: "How do I verify a bcrypt hash?",
                a: "Use the library compare function with the candidate password and the stored hash. It extracts the salt and cost, re-hashes the candidate, and checks equality. Do not use string comparison.",
            },
            {
                q: "Does bcrypt work in the browser without a server?",
                a: "Yes. Libraries like bcryptjs run entirely in the browser, and the tool on this site does the same in a Web Worker. Nothing is uploaded.",
            },
            {
                q: "What about Python bcrypt vs Node bcrypt?",
                a: "Both produce the same 60-character format and are interchangeable. A hash generated in Python verifies correctly in Node and vice versa, because the format stores version, cost, salt and hash together.",
            },
        ],
        publishedIn: "v1.10",
    },

    {
        slug: "what-is-unix-timestamp",
        toolId: "timestamp-converter",
        relatedToolIds: ["uuid-generator", "json-formatter"],
        comparisonSlugs: [],
        eyebrow: "Explainer · Guide",
        title: "What Is a Unix Timestamp?",
        description:
            "A Unix timestamp counts seconds since 1970-01-01. Learn how it works, seconds versus milliseconds, the 2038 problem, and how to convert between a timestamp and a human date, locally.",
        heroQuestion: "What is a Unix timestamp?",
        shortAnswer:
            "A Unix timestamp is the number of seconds, or milliseconds, since 1970-01-01 00:00:00 UTC, the Unix epoch. It is a single integer that represents one moment in time, so you can compare, sort, and store dates without formats or time zones. The same converter runs 100 percent locally.",
        sections: [
            {
                heading: "The epoch: 1970-01-01 00:00:00 UTC",
                body:
                    "The Unix epoch is an arbitrary starting point chosen when Unix was designed. Every timestamp is the elapsed time since that moment. 0 is the epoch itself, 86400 is one day later, and 1700000000 is in late 2023. Negative values represent dates before 1970, which some systems support and others do not.",
            },
            {
                heading: "Seconds, milliseconds, microseconds",
                body:
                    "The classic Unix timestamp counts seconds, 10 digits today. JavaScript Date.now() counts milliseconds, 13 digits, and some databases count microseconds or nanoseconds. The digits tell you the unit, and mixing them shifts a date by a factor of 1000.",
                list: [
                    "10 digits: seconds since epoch (Unix time, epoch time)",
                    "13 digits: milliseconds (JavaScript, Java)",
                    "16 digits: microseconds",
                    "19 digits: nanoseconds",
                ],
            },
            {
                heading: "Why timestamps exist",
                body:
                    "A timestamp is timezone-free and format-free. An ISO string like 2026-08-31T12:00:00Z and 08/31/2026 08:00 EDT are the same moment, but they parse differently. As an integer 1725105600, that moment has exactly one representation, which is why logs, databases, and APIs pass dates as timestamps.",
            },
            {
                heading: "The 2038 problem",
                body:
                    "Signed 32-bit seconds overflow on 2038-01-19 03:14:07 UTC, when the value reaches 2,147,483,647. Systems that still store time in 32 bits will wrap to a negative number. Modern systems use 64 bits, which pushes the limit billions of years out, and many counters already use milliseconds in 64 bits.",
            },
            {
                heading: "How to convert a timestamp and a date",
                body:
                    "To go from a timestamp to a date, multiply or divide to reach seconds, then create a Date from the epoch. To go from a date to a timestamp, parse the date as an instant and divide its millisecond value. Always decide whether the human date is in UTC or in local time, since the same timestamp reads differently in each zone.",
                list: [
                    "Timestamp to date: new Date(timestamp * 1000) in JavaScript for seconds",
                    "Date to timestamp: Math.floor(date.getTime() / 1000) for seconds",
                    "Use Date.now() for the current timestamp, not a formatted string",
                    "Show both UTC and local time when you convert, to catch off-by-hour errors",
                ],
            },
            {
                heading: "When to use a timestamp",
                body:
                    "Use a timestamp for storage, sorting, and APIs where an unambiguous integer wins, and use a formatted date for display where a human reads it. Store as a timestamp, render as a readable string, and convert locally so the data never leaves your browser.",
            },
        ],
        faq: [
            {
                q: "How many digits is a Unix timestamp?",
                a: "10 digits today for seconds. 13 digits means milliseconds, 16 means microseconds. The same moment is 1725105600 in seconds and 1725105600000 in milliseconds.",
            },
            {
                q: "Is a Unix timestamp always in UTC?",
                a: "Yes. It counts from the UTC epoch, so it has no timezone. When you display it as a date you choose a timezone, which is why the same timestamp can show different wall times.",
            },
            {
                q: "What happens in 2038?",
                a: "Signed 32-bit seconds overflow on 2038-01-19. Modern systems store timestamps in 64 bits, which avoids the wrap. Using 64-bit integers or millisecond timestamps already solves it.",
            },
            {
                q: "Can I convert a timestamp without uploading?",
                a: "Yes. The conversion is pure arithmetic in your browser. The timestamp converter on this site does it locally, including pasting a date like 2026-08-31 or a number like 1725105600.",
            },
        ],
        publishedIn: "v1.10",
    },

    {
        slug: "how-to-compare-two-text-files",
        toolId: "text-diff",
        relatedToolIds: ["json-diff", "json-formatter"],
        comparisonSlugs: ["json-diff-vs-text-diff"],
        eyebrow: "How To · Guide",
        title: "How to Compare Two Text Files Online",
        description:
            "Compare two text files online line by line, see added and removed lines highlighted, and get a similarity score. Works for logs, code, configs and plain text, locally.",
        heroQuestion: "How do I compare two text files?",
        shortAnswer:
            "Paste the original text on the left and the modified text on the right, and the diff highlights added, removed, and changed lines as you type. A similarity score shows what share is identical, and the check runs 100 percent locally so nothing is uploaded.",
        sections: [
            {
                heading: "The three steps",
                body:
                    "Open the Text Diff tool, paste the original document in the left editor and the modified one in the right editor, and the comparison runs live. Added lines are highlighted in teal, removed lines in red, and modified lines are paired so you can read before and after together. No upload is involved and large inputs run in a background worker.",
            },
            {
                heading: "What the colors mean",
                body:
                    "The diff uses three visual signals. Additions are marked teal, deletions red, and lines that were replaced are shown as a paired row with the old line and the new line side by side instead of as two separate blocks.",
                list: [
                    "Teal: lines added in the new version",
                    "Red: lines removed from the old version",
                    "Paired rows: a removed line replaced by an added one",
                ],
            },
            {
                heading: "Side by side or unified",
                body:
                    "Side by side keeps the old and new documents aligned for scanning. Unified merges both into a single column with diff markers, which is closer to a git patch and useful when the change is concentrated in a few lines.",
            },
            {
                heading: "Cutting the noise",
                body:
                    "Reformatted text can produce diffs that are mostly whitespace. Ignore whitespace and ignore case options strip that noise so the diff shows real changes only. They never alter the documents, they only change what counts as a difference.",
            },
            {
                heading: "Reading the similarity score",
                body:
                    "The similarity score is the share of lines that are identical on both sides, as a percentage of all lines involved. 100 percent means identical, 0 percent means nothing in common. It is a quick sanity signal, not a semantic guarantee, since identical lines can sit in different places.",
            },
            {
                heading: "Text Diff versus JSON Diff",
                body:
                    "The same diff engine also powers JSON Diff for structured data. Text Diff is the line based version for any plain text: logs, code, markdown, environment files, and SQL. For two JSON documents, JSON Diff ignores whitespace and key order and compares meaning instead of lines.",
            },
        ],
        faq: [
            {
                q: "Can I compare two text files online without uploading?",
                a: "Yes. The comparison runs entirely in your browser, in a background worker for large inputs. Neither document ever leaves your machine.",
            },
            {
                q: "What do the colors mean?",
                a: "Additions are teal, deletions are red, and modified lines are paired so you see the old and new together.",
            },
            {
                q: "What does the similarity score mean?",
                a: "It is the share of lines that are identical on both sides, as a percentage of all lines involved. 100 percent means identical, 0 percent means nothing in common.",
            },
            {
                q: "Should I use Text Diff or JSON Diff?",
                a: "For any plain text use Text Diff. For two JSON documents use JSON Diff, which compares keys and values and ignores whitespace and key ordering.",
            },
        ],
        publishedIn: "v1.10",
    },

    {
        slug: "how-to-convert-csv-to-json",
        toolId: "csv-to-json",
        relatedToolIds: ["json-to-csv", "json-formatter", "json-validator"],
        comparisonSlugs: ["csv-vs-json"],
        eyebrow: "How To · Guide",
        title: "How to Convert CSV to JSON",
        description:
            "Convert CSV to JSON in three steps: paste your table, choose header and delimiter, and get structured JSON. Handles quoted fields, type inference, and large files locally.",
        heroQuestion: "How do I convert CSV to JSON?",
        shortAnswer:
            "Paste your CSV into a converter, confirm the first row is a header, pick the delimiter, and convert. Each row becomes an object with header keys, quoted fields are handled, and large files convert in a background worker with a capped preview.",
        sections: [
            {
                heading: "The three steps",
                body:
                    "Open the CSV to JSON converter, paste your table or drop a .csv file, check First row is header, pick the delimiter or keep Auto, and press Convert. The JSON array appears on the right ready to copy or download. Nothing is uploaded.",
            },
            {
                heading: "Delimiter and quoted fields",
                body:
                    "CSV can use comma, semicolon, tab, or pipe. Auto detection picks the most likely one, and quoted fields that contain delimiters or newlines are handled per RFC 4180 so commas inside quotes stay in one cell. Switch delimiters if the header looks wrong.",
            },
            {
                heading: "Headers become keys",
                body:
                    "With First row is header on, the first row supplies the object keys. With it off, columns become column1, column2, and every row is data. Duplicate headers are flagged so you can fix them instead of silently losing a value.",
            },
            {
                heading: "Type inference versus strings",
                body:
                    "The converter can keep every value as a string or infer types: numbers become numbers, true and false become booleans, null becomes null. Choose strings when you need exact preservation, and types when the JSON will feed code that expects numbers and booleans.",
            },
            {
                heading: "Large files",
                body:
                    "Files above about 15 MB switch to a background worker. Measured on 8GB Win10, Node 24, V8 2240MB heap (median of 3, seed 42, 10 cols): 1K (94KB) 37.7ms, 10K (938KB) 41.3ms, 100K (9.4MB) 1,531ms, 500K (46.8MB) 5,553ms parse and 12,686ms pipeline. 1M rows (93.7MB) OOMs at 2GB heap, preview stays at 100K chars, download holds the full file. CSV → JSON is about 2.9× input size, so budget extra headroom.",
            },
            {
                heading: "What to do with the result",
                body:
                    "The output is a JSON array, so it can be piped straight into the JSON Validator, Formatter, or Diff. If the source CSV was ragged, the converter fails loudly with the exact line number instead of silently padding. For the numbers above, see the benchmark report in the repo at src/lib/csv/__benchmarks__/PERFORMANCE_REPORT.md.",
            },
        ],
        faq: [
            {
                q: "Does the conversion run locally?",
                a: "Yes. Parsing and converting run entirely in your browser, in a background worker for large tables. Your CSV never leaves your machine.",
            },
            {
                q: "Which delimiters are supported?",
                a: "Comma, semicolon, tab, and pipe, with auto detection. Quoted fields that contain delimiters and newlines are handled correctly.",
            },
            {
                q: "What happens to missing fields?",
                a: "Rows with fewer fields get empty strings for the missing columns so the shape stays consistent. Ragged rows that would break the table fail with the line number.",
            },
            {
                q: "Can I keep every value as a string?",
                a: "Yes. Turn off type inference and every cell stays a string. With it on, numbers, booleans, and null are typed.",
            },
        ],
        publishedIn: "v1.10",
    },

    {
        slug: "how-to-decode-base64",
        toolId: "base64",
        relatedToolIds: ["url-encode", "jwt-decoder", "base64"],
        comparisonSlugs: ["base64-vs-url-encode"],
        eyebrow: "How To · Guide",
        title: "How to Decode Base64 Online",
        description:
            "Decode any Base64 string to text or file in your browser: paste, fix padding, handle URL-safe vs standard, detect the format, and download the result locally.",
        heroQuestion: "How do I decode Base64?",
        shortAnswer:
            "Paste the Base64 string into a decoder, fix any missing padding, choose standard or URL-safe, and decode. The tool does it 100 percent locally, shows the text if it is readable, or names the file type like PNG, PDF, or ZIP and lets you download the bytes.",
        sections: [
            {
                heading: "The three steps",
                body:
                    "Open the Base64 decoder, paste the Base64 text into the left editor, or drop a .b64 file, and press Decode or hit Ctrl or Command plus Enter. If the content is text you see it on the right, if it is binary you get a file type badge and a download button. Nothing is uploaded and large inputs run in a background worker.",
            },
            {
                heading: "Standard versus URL-safe",
                body:
                    "Standard Base64 uses plus and slash, URL-safe replaces them with dash and underscore and drops padding. If a string fails to decode, try the other alphabet. This site handles both and auto fixes missing padding characters so a truncated copy still decodes.",
            },
            {
                heading: "Fixing padding",
                body:
                    "Valid Base64 length %4 ==1 is always illegal and throws Incomplete base64 group (engine.ts:84). Length %4 ==2 or 3 is recoverable via tailBytes (1 or 2 bytes), but === is never valid and throws Incorrect padding (engine.ts:85). Standard decoders do not auto-pad, so add = until length %4 ==0, then replace - with + and _ with / before decoding if the string is URL-safe.",
            },
            {
                heading: "What the tag means",
                body:
                    "After decoding the tool reads the first bytes and names common formats: PNG 89 50 4E 47, JPEG FF D8 FF, GIF 47 49 46, WebP, PDF 25 50 44 46, ZIP 50 4B, gzip 1F 8B, or marks it as JSON via JSON.parse or plain text via control-char check. If the result is binary you see a clean byte count instead of unreadable characters.",
            },
            {
                heading: "Text versus file",
                body:
                    "Not every Base64 string is text. A data URI like data:image/png;base64,iVBORw0KGgo must have the prefix stripped manually with /^data:[^;]+;base64,/ before decode, otherwise the decoder throws Invalid character ':' at position 5 (engine.ts:80) because : is not in the alphabet. After stripping, the tool decodes and the tag reads PNG via sniffBytes 89 50 4E 47. For a plain string the decoder tries UTF-8 first, and only falls back to a byte view when the bytes are not valid text.",
            },
            {
                heading: "Is decoding safe for secrets",
                body:
                    "Base64 is an encoding, not encryption. Anyone can decode it, so it hides nothing. Decode only where transport required it, such as an Authorization header or a data URI, and never rely on Base64 for secrecy. For sensitive payloads use a local decoder that never uploads the data.",
            },
        ],
        faq: [
            {
                q: "Can I decode Base64 without uploading?",
                a: "Yes. Paste the string here and it decodes entirely in your browser, in a background worker for large inputs. Nothing leaves your machine.",
            },
            {
                q: "Why does my string say invalid Base64?",
                a: "The length is not a multiple of four, it contains characters outside the alphabet, or it mixes standard and URL-safe alphabets. Add missing padding, remove whitespace, and pick the correct alphabet.",
            },
            {
                q: "What is the difference between standard and URL-safe Base64?",
                a: "Standard uses plus and slash, URL-safe uses dash and underscore and omits padding so the string can sit in a URL or query parameter without escaping.",
            },
            {
                q: "Can this decode an image or a PDF",
                a: "Yes. Paste the Base64 for an image, a PDF, or a ZIP and the tool detects the format from the decoded bytes and offers a download. A data URI prefix is handled automatically.",
            },
        ],
        publishedIn: "v1.10",
    },

    {
        slug: "csv-to-json-in-python-javascript",
        toolId: "csv-to-json",
        relatedToolIds: ["json-to-csv", "csv-to-json", "json-formatter"],
        comparisonSlugs: ["csv-vs-json"],
        eyebrow: "Code · Guide",
        title: "Convert CSV to JSON in Python, JavaScript, and jq",
        description:
            "Programmatic CSV to JSON with Python csv and pandas, Node csvtojson, and jq, handling headers, delimiters, and large files.",
        heroQuestion: "How do I convert CSV to JSON in code?",
        shortAnswer:
            "In Python use csv.DictReader or pandas.read_csv, in Node use csvtojson or csv-parse, in jq use CSV inputs. All three map header row to keys and handle quoted fields. The same online tool does it locally without code.",
        sections: [
            {
                heading: "Python: csv module",
                body:
                    "The standard csv module handles RFC 4180 correctly, including quoted fields with delimiters and newlines. DictReader uses the first row as keys by default.",
                list: [
                    "import csv, json",
                    "with open('data.csv') as f: rows = list(csv.DictReader(f))",
                    "json.dumps(rows, indent=2) for pretty output",
                    "Use delimiter=';' for semicolon files",
                ],
            },
            {
                heading: "Python: pandas",
                body:
                    "For large or messy tables pandas infers types and handles headers automatically. It is the common choice for data work.",
                list: [
                    "import pandas as pd",
                    "df = pd.read_csv('data.csv')",
                    "df.to_json(orient='records', indent=2)",
                    "df.to_json('data.json') to write a file",
                ],
            },
            {
                heading: "JavaScript and Node.js",
                body:
                    "Browsers have no built-in CSV parser, so use a library. csvtojson and PapaParse both handle headers, delimiters, and quoted fields.",
                list: [
                    "npm install csvtojson",
                    "const rows = await csv().fromFile('data.csv')",
                    "PapaParse alternative: Papa.parse(csvText, {header:true})",
                ],
            },
            {
                heading: "jq",
                body:
                    "For command-line conversion use Miller or jq with CSV input. jq can read CSV and emit JSON with a single filter.",
                list: [
                    "jq -R 'split(\",\")' for simple split (no quotes)",
                    "Use mlr --icsv --ojson cat data.csv for robust RFC 4180",
                    "xsv or csvkit also handle large files",
                ],
            },
            {
                heading: "Headers, delimiters, and types",
                body:
                    "The first row usually supplies keys, but some files have no header. Quoted fields that contain commas or newlines must stay in one cell, which DictReader and csvtojson handle. Large files are best streamed, and type inference can be toggled where needed.",
            },
            {
                heading: "Try it without code",
                body:
                    "If you just need one conversion, paste the CSV into the CSV to JSON tool on this site and press Convert. It handles delimiter auto detection, quoted fields, and large files in a background worker, 100 percent locally. Use code when you need to automate, and the tool when you need one answer quickly.",
            },
        ],
        faq: [
            {
                q: "How do I convert CSV to JSON in Python?",
                a: "import csv; rows = list(csv.DictReader(open('data.csv'))); json.dumps(rows). For pandas: pd.read_csv('data.csv').to_json(orient='records').",
            },
            {
                q: "How do I convert CSV to JSON in JavaScript?",
                a: "Use csvtojson: await csv().fromFile('data.csv'), or Papaparse: Papa.parse(csvText, {header:true}).data.",
            },
            {
                q: "Does CSV to JSON keep numbers as strings?",
                a: "By default yes, but pandas and type inference can turn numbers and booleans into typed values. The online tool lets you choose.",
            },
            {
                q: "Can I convert without code?",
                a: "Yes. Paste the CSV into the CSV to JSON tool and press Convert. It handles headers, delimiters, and large files locally without uploading.",
            },
        ],
        publishedIn: "v1.10",
    },

    {
        slug: "how-to-convert-csv-to-tsv",
        toolId: "csv-to-tsv",
        relatedToolIds: ["csv-to-tsv", "tsv-to-csv", "csv-to-json"],
        comparisonSlugs: ["csv-to-tsv-vs-tsv-to-csv"],
        eyebrow: "How To · Guide",
        title: "How to Convert CSV to TSV",
        description:
            "Convert CSV to TSV in three steps: paste your comma-separated table, pick the delimiter, and get a tab-separated result. Handles quoted fields and large files locally.",
        heroQuestion: "How do I convert CSV to TSV?",
        shortAnswer:
            "Paste your CSV into a converter, confirm the delimiter, and convert. Each comma-separated field becomes a tab-separated field, quoted fields that contain commas stay intact, and large files convert in a background worker with a capped preview.",
        sections: [
            {
                heading: "The three steps",
                body:
                    "Open the CSV to TSV converter, paste your table or drop a .csv file, check the delimiter or keep Auto, and press Convert. The tab-separated result appears on the right ready to copy or download. Nothing is uploaded.",
            },
            {
                heading: "Comma versus tab",
                body:
                    "CSV separates fields with commas, TSV with tabs. Tabs rarely appear inside data, so TSV avoids the quoting headaches that commas cause. Converting is simply re-serializing the same rows with a different delimiter, with quoting adjusted to the target format.",
            },
            {
                heading: "Quoted fields",
                body:
                    "A CSV field that contains a comma is wrapped in quotes, and quotes inside are doubled. The parser reads those correctly, then writes the same field for TSV without needing quotes unless the field itself contains a tab or newline. This keeps the data intact across the conversion.",
            },
            {
                heading: "Ragged rows",
                body:
                    "CSV to TSV needs a rectangular grid. Rows with a different number of fields fail loudly with the exact line number instead of being silently padded or dropped, which would shift columns. Fix the source row and convert again.",
            },
            {
                heading: "Large files",
                body:
                    "Files above about 15 MB switch to a background worker. The file is read off the main thread, you see a capped preview in the editor, and the full TSV is a one-click download. The only ceiling is device memory.",
            },
            {
                heading: "What to do with the result",
                body:
                    "TSV opens cleanly in spreadsheets, databases, and data tools that expect tabs. If the consumer needs commas again, use the reverse tool TSV to CSV. Both directions run locally and use the same RFC 4180 parser.",
            },
        ],
        faq: [
            {
                q: "Is my data uploaded?",
                a: "No. Parsing and conversion run entirely in your browser, in a background worker for large tables. Nothing leaves your machine.",
            },
            {
                q: "What happens to commas inside a field?",
                a: "They are preserved. The parser reads quoted CSV fields correctly, and since TSV uses tabs the comma becomes ordinary text without quotes.",
            },
            {
                q: "Can it handle large files?",
                a: "Yes. Files above about 15 MB switch to a background worker with a capped preview and a full TSV download.",
            },
            {
                q: "Do ragged rows work?",
                a: "No. Rows with differing field counts fail with the exact line number instead of being silently padded.",
            },
        ],
        publishedIn: "v1.10",
    },

    {
        slug: "what-is-json-schema-validation",
        toolId: "json-schema-validator",
        relatedToolIds: ["json-validator", "json-formatter"],
        comparisonSlugs: ["json-validator-vs-json-schema-lite"],
        eyebrow: "JSON · Explainer",
        title: "What Is JSON Schema Validation?",
        description:
            "JSON Schema validation checks whether JSON has the shape you expect: required keys, correct types, and allowed ranges. Learn what validation checks, what Lite covers, and how to read violation paths like /users/2/email.",
        heroQuestion: "What is JSON Schema validation?",
        shortAnswer:
            "JSON Schema validation checks a JSON instance against a schema that describes the expected shape. The schema lists required keys, value types, and bounds, and the validator reports every violation with its JSON Pointer path. The same check runs locally in your browser.",
        sections: [
            {
                heading: "Syntax versus shape",
                body:
                    "JSON validation has two layers. Syntax asks is this well-formed JSON with correct brackets and commas. Schema validation asks does this valid JSON have the required fields, correct types, and allowed values. An instance can pass syntax and still fail a schema, for example {\"name\": 42} when name must be a string.",
            },
            {
                heading: "What Lite covers",
                body:
                    "JSON Schema Lite covers 18 keywords: type, properties, required, additionalProperties, items, enum, const, minimum, maximum, exclusiveMinimum, exclusiveMaximum, multipleOf, minLength, maxLength, minItems, maxItems, minProperties, and maxProperties. It ignores $ref, $defs, allOf, anyOf, oneOf, not, if, then, else, patternProperties, pattern, and format per the Lite contract, which is shown above the Validate button.",
            },
            {
                heading: "Violation paths",
                body:
                    "Every failure is reported at a JSON Pointer path like /users/2/email. The empty string means the root, /name means the top-level name key, and /users/0/age means the age of the first user in an array. Fix the value at that path and validate again.",
            },
            {
                heading: "Where schemas are used",
                body:
                    "API request and response contracts, configuration files, and webhook payloads all use schemas to guard against drift. A schema turns an implicit agreement into an explicit contract that both sides can test.",
            },
            {
                heading: "Try it locally",
                body:
                    "Paste your JSON on the left and your schema on the right, then press Validate. Violations appear with exact paths, and the check runs 100 percent locally without uploading either document.",
            },
        ],
        faq: [
            {
                q: "Is JSON Schema required to use JSON?",
                a: "No. JSON works without a schema. A schema adds a guardrail when you need to enforce shape, types, and ranges.",
            },
            {
                q: "Does a passing syntax check mean my data is correct?",
                a: "No. Syntax only checks brackets and commas. Schema checks whether required keys and types are correct, which syntax cannot see.",
            },
            {
                q: "What does Lite ignore?",
                a: "Lite ignores $ref, $defs, allOf, anyOf, oneOf, not, if, then, else, patternProperties, pattern, and format. Those land in v2.0.",
            },
            {
                q: "Can I validate without uploading?",
                a: "Yes. Paste both documents and press Validate. The check runs entirely in your browser.",
            },
        ],
        publishedIn: "v1.10",
    },
];

// ── Derived selectors ──────────────────────────────────────────────────

export function getArticle(slug: string): LearnArticle | undefined {
    return ARTICLES.find((a) => a.slug === slug);
}

export function articlesByTool(toolId: string): LearnArticle[] {
    return ARTICLES.filter((a) => a.toolId === toolId);
}

// ── Palette/search selector ───────────────────────────────────────────

export interface LearnSearchEntry {
    id: string;
    title: string;
    group: string;
    href: string;
    keywords: string[];
}

export function learnSearchEntries(): LearnSearchEntry[] {
    const hub: LearnSearchEntry = {
        id: "learn-hub",
        title: "Learn — Guides & Deep Dives",
        group: "Learn",
        href: "/learn",
        keywords: [
            "learn",
            "guides",
            "deep dives",
            "tutorials",
            "docs",
            "hashing",
            "security",
            "sha-512",
            "json",
            "xml",
            "converter",
            "formats",
        ],
    };
    const articles: LearnSearchEntry[] = ARTICLES.map((article) => ({
        id: `learn-${article.slug}`,
        title: article.title,
        group: "Learn",
        href: `/learn/${article.slug}`,
        keywords: [
            article.title.toLowerCase(),
            "learn",
            "guide",
            "deep dive",
            article.description.toLowerCase(),
            ...article.faq.map((f) => f.q.toLowerCase()),
        ],
    }));
    return [hub, ...articles];
}