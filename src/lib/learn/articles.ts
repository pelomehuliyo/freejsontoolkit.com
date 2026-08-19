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
        slug: "can-sha-512-be-decrypted",
        toolId: "sha-512",
        relatedToolIds: ["sha-256", "bcrypt", "base64"],
        comparisonSlugs: ["sha-256-vs-bcrypt"],
        eyebrow: "Security · Myth Busting",
        title: "Can SHA-512 Be Decrypted?",
        description:
            "No. SHA-512 is a one-way function; it cannot be decrypted. But weak inputs can still be guessed. Here's why hashing is not encryption, what attackers actually do, and how to protect your data.",
        heroQuestion: "Can SHA-512 be decrypted?",
        shortAnswer:
            "No. SHA-512 is a one-way function. The hash cannot be reversed back to the original input. However, weak inputs like short passwords can still be discovered by hashing many guesses and comparing the results.",
        sections: [
            {
                heading: "Hashing is not encryption",
                body:
                    "Encryption is two-way: you encrypt with a key and decrypt with a key. Hashing is one-way: the input is transformed into a fixed-size digest, and the original data is destroyed in the process. There is no key to unlock a hash. It is not hidden; it is gone.",
            },
            {
                heading: "Why it's mathematically one-way",
                body:
                    "SHA-512 takes any input, from a single character to a 100 GB file, and compresses it into 512 bits. This is a lossy transformation: infinitely many inputs map to the same output space. There is simply not enough information in the hash to reconstruct the original.",
            },
            {
                heading: "What attackers actually do",
                body:
                    "Since they can't decrypt, attackers guess. They hash millions or billions of candidate inputs and compare each result to the target hash. This is called brute-force or dictionary attack. It doesn't break the algorithm; it exploits weak inputs.",
                list: [
                    "Dictionary attacks: try every word in a list",
                    "Brute-force: try every combination of characters",
                    "Rainbow tables: precomputed lookup tables for common inputs",
                    "GPU cracking: billions of hashes per second",
                ],
            },
            {
                heading: "Rainbow tables only work on unsalted weak inputs",
                body:
                    "A rainbow table is a massive precomputed database of input→hash pairs. If your input is common (like 'password123'), it's probably in the table. Adding a unique random salt to each input defeats rainbow tables entirely, because the attacker must recompute the table for every salt.",
            },
            {
                heading: "How to protect yourself",
                body:
                    "If you're hashing passwords: use bcrypt, scrypt, or Argon2 with a unique salt per user. If you're hashing for integrity: SHA-512 is fine, but the security depends on the input being unpredictable. If you need authenticity: use HMAC with a secret key.",
                list: [
                    "Passwords → bcrypt or Argon2, never raw SHA-512",
                    "Integrity → SHA-512 is appropriate",
                    "Authenticity → HMAC-SHA512 with a secret key",
                    "Always use unique salts for anything guessable",
                ],
            },
        ],
        faq: [
            {
                q: "Is there a SHA-512 decrypter online?",
                a: "No legitimate one exists. Sites claiming to 'decrypt' SHA-512 are either lookup databases for common inputs (which fail on anything unique) or scams.",
            },
            {
                q: "Can quantum computers reverse SHA-512?",
                a: "No known quantum algorithm reverses a hash. Grover's algorithm speeds up brute-force guessing, but it doesn't decrypt. SHA-512's one-way property holds even against quantum attacks.",
            },
            {
                q: "Why do some sites show the 'original' of a hash?",
                a: "They maintain a database of previously computed hashes. If your input is common enough to be in their database, they look it up. This is not decryption; it's a precomputed dictionary.",
            },
            {
                q: "Is Base64 the same as hashing?",
                a: "No. Base64 is an encoding; it's fully reversible and provides no security. Anyone can decode Base64. Hashing is one-way and irreversible.",
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
        slug: "is-sha-256-secure",
        toolId: "sha-256",
        relatedToolIds: ["sha-512", "bcrypt"],
        comparisonSlugs: ["sha-256-vs-sha-512", "sha-256-vs-bcrypt"],
        eyebrow: "Security · Threat Analysis",
        title: "Is SHA-256 Secure in 2026?",
        description:
            "After 20+ years of attack attempts, is SHA-256 still safe? We break down its collision resistance, the real threat of quantum computers, and why it fails as a password hasher.",
        heroQuestion: "Has SHA-256 ever been cracked or broken?",
        shortAnswer:
            "Yes, SHA-256 is highly secure for digital signatures, blockchain, and file integrity. There are zero practical collision or preimage attacks against the full algorithm. However, it is vulnerable to quantum speedups (Grover's algorithm) and is entirely unsafe for storing passwords.",
        sections: [
            {
                heading: "Zero practical breaks after 20+ years",
                body:
                    "Unlike MD5 and SHA-1, which have been demonstrably broken with real-world collision attacks, SHA-256 remains intact. The closest academic attacks only compromise reduced-round versions (e.g., 46 out of 64 rounds) and require more energy than exists on Earth to execute against the full algorithm.",
            },
            {
                heading: "The Quantum Computing Threat (Grover's Algorithm)",
                body:
                    "Quantum computers don't 'break' SHA-256 the way Shor's algorithm breaks RSA encryption. Instead, Grover's algorithm speeds up brute-force searching. This effectively halves SHA-256's security from 256 bits down to 128 bits. Fortunately, 128 bits of security is still considered computationally infeasible to brute-force.",
            },
            {
                heading: "Why SHA-256 is terrible for passwords",
                body:
                    "SHA-256 is designed to be extremely fast. Modern GPUs can calculate billions of SHA-256 hashes per second. If a database of unsalted SHA-256 password hashes leaks, attackers can crack almost all weak passwords in minutes. Always use slow, salted algorithms like bcrypt or Argon2 for passwords.",
            },
        ],
        faq: [
            { q: "Is SHA-256 quantum resistant?", a: "Technically no, but practically yes. Grover's algorithm reduces its security to 128 bits, which NIST still considers secure for the foreseeable future. If true quantum threats emerge, we will likely migrate to SHA-512 or SHA-3." },
            { q: "Can SHA-256 be cracked?", a: "The algorithm itself cannot be cracked. However, if you hash a weak password (like 'password123') with SHA-256, attackers can guess the password, hash it, and see if it matches. This is cracking the password, not breaking the algorithm." },
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
        slug: "is-json-formatter-safe",
        toolId: "json-formatter",
        relatedToolIds: ["json-validator", "json-minifier"],
        comparisonSlugs: ["json-formatter-vs-json-validator"],
        eyebrow: "JSON · Privacy",
        title: "Is It Safe to Paste JSON Into an Online Formatter?",
        description:
            "Pasting JSON that contains API keys or personal data into an online tool is a real risk. Learn the difference between client-side and server-side formatters, and how to tell which one you are using.",
        heroQuestion: "Is it safe to paste JSON into an online formatter?",
        shortAnswer:
            "It depends on where the formatting runs. A tool that processes JSON entirely in your browser never transmits your data. A tool that sends it to a server can store or log it, and then your JSON is effectively in the open. Check before you paste.",
        sections: [
            {
                heading: "Where the formatting actually runs",
                body:
                    "Client-side tools parse and pretty-print the JSON with JavaScript in your browser. The text never leaves the page, so it cannot be stored, logged, or reused. Server-side tools send the JSON over the network to be processed, which means the data reaches a machine you do not control.",
            },
            {
                heading: "What is at risk",
                body:
                    "JSON is not just data. It often carries API keys, access tokens, personal information, or internal configuration. If that payload is uploaded, it is out of your hands. Even a tool with good intentions can leak data through a breach or a misconfigured log.",
                list: [
                    "API keys and tokens embedded in configs",
                    "Personal data inside exported records",
                    "Internal service URLs and credentials",
                    "Anything you would not post publicly",
                ],
            },
            {
                heading: "How to tell if a formatter uploads your data",
                body:
                    "You can test a tool in seconds. Open its page, disconnect your network, and try to format something. A client-side tool still works. A server-side tool fails. You can also open the developer tools Network tab and check whether any request fires when you format.",
            },
            {
                heading: "How this tool handles your JSON",
                body:
                    "This formatter runs entirely in your browser. The JSON is parsed and pretty-printed locally, there is no upload endpoint, and it keeps working with no connection at all. For sensitive payloads, that is the property that matters.",
            },
            {
                heading: "Safe habits regardless of the tool",
                body:
                    "Treat any paste target with suspicion when the data is sensitive. Redact secrets before pasting, prefer tools that state how they process data, and keep the truly private material on a local formatter.",
            },
        ],
        faq: [
            {
                q: "Do online formatters upload my data?",
                a: "Some do. Server-side tools receive the JSON over the network. Client-side tools never transmit it. The two are easy to confuse, so check the Network tab or test offline.",
            },
            {
                q: "Can I use an online formatter for API keys?",
                a: "Only if it processes data locally and never sends it anywhere. A local formatter like this one is the safe choice for keys and tokens.",
            },
            {
                q: "Is a browser extension safer than a website?",
                a: "Not automatically. An extension can read the pages you visit and send data somewhere too. Read the permissions it requests before installing.",
            },
            {
                q: "Does this formatter work offline?",
                a: "Yes. It processes everything in your browser, so it formats JSON with no internet connection. That is also the reason nothing you paste is ever uploaded.",
            },
            {
                q: "What is the safest way to format JSON with secrets?",
                a: "A tool that runs fully in your browser with no network path, so the data never leaves your machine. This formatter works exactly that way.",
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
        slug: "what-is-json-used-for",
        toolId: "json-formatter",
        relatedToolIds: ["json-validator", "json-minifier", "json-to-csv"],
        comparisonSlugs: ["json-formatter-vs-json-validator"],
        eyebrow: "JSON · Explainer",
        title: "What Is JSON Used For?",
        description:
            "JSON is the default format for APIs, config files, and data exchange between systems. See the places developers hit it every day, and why it became the standard.",
        heroQuestion: "What is JSON mostly used for?",
        shortAnswer:
            "JSON is used to move data between servers and clients over APIs, store configuration, export and import structured data, and pass data between programs. It won because it is plain text, human-readable, and every language parses it.",
        sections: [
            {
                heading: "Web APIs, the biggest use",
                body:
                    "When a frontend asks a backend for data, the answer almost always arrives as JSON. REST endpoints return JSON responses, and clients send JSON bodies in requests. Reading and formatting those payloads is a daily activity for anyone who builds for the web.",
            },
            {
                heading: "Configuration files",
                body:
                    "Package managers, compilers, and tools store their settings as JSON. package.json, tsconfig.json, and countless app configs are JSON documents. Developers open these constantly, and formatting keeps them readable and diffable.",
            },
            {
                heading: "Data exchange and exports",
                body:
                    "Databases, analytics platforms, and migration tools export records as JSON because it maps naturally to objects and arrays. That exported data is easy to transform, convert, and load back into another system.",
                list: [
                    "Database exports and backups",
                    "Analytics event payloads",
                    "Migration files between systems",
                    "Spreadsheet and data-tool round trips",
                ],
            },
            {
                heading: "Browser storage and local state",
                body:
                    "Browsers store structured data in localStorage and IndexedDB as JSON. Application state, feature flags, and cached settings all live as JSON under the hood, ready to be serialized and restored.",
            },
            {
                heading: "Structured logging",
                body:
                    "Logs that need to be searched and analyzed are often written as JSON lines, one object per line. These logs are machine-readable by design, but they are still a wall of text until a formatter lays them out.",
            },
            {
                heading: "Why JSON beat the alternatives",
                body:
                    "JSON is smaller than XML, native to JavaScript, and close enough to the data structures programmers already use that no ceremony is required. That combination made it the default everywhere.",
            },
        ],
        faq: [
            {
                q: "Is JSON only for JavaScript?",
                a: "No. Every major programming language has a JSON parser. It is a language-independent data format.",
            },
            {
                q: "Is JSON a programming language?",
                a: "No. JSON is a data format for representing structured information. It has no logic, functions, or execution.",
            },
            {
                q: "Why is JSON preferred over XML?",
                a: "JSON is more compact, maps directly to objects and arrays, and needs no closing tags or schemas. For most data exchange it is simpler to write and parse.",
            },
            {
                q: "Where do I see JSON outside APIs?",
                a: "Config files, browser storage, structured logs, database exports, and data migration files all use JSON every day.",
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
        slug: "is-bcrypt-secure",
        toolId: "bcrypt",
        relatedToolIds: ["sha-256", "hmac", "md5"],
        comparisonSlugs: ["sha-256-vs-bcrypt"],
        eyebrow: "Security · Threat Analysis",
        title: "Is bcrypt Still Secure in 2026?",
        description:
            "bcrypt has resisted cracking for over two decades. Here is what it protects against, its known limits like the 72-byte input cap, and when argon2 or scrypt deserve the job instead.",
        heroQuestion: "Is bcrypt still a safe choice for storing passwords?",
        shortAnswer:
            "Yes. With a sensible cost factor of 11 to 12, bcrypt remains a strong password hash in 2026. Its real limits are the 72-byte password cap and the need to raise the cost factor over time. Argon2 is a modern alternative, not a requirement.",
        sections: [
            {
                heading: "What bcrypt is built to resist",
                body:
                    "bcrypt targets the three classic password attacks. Its slowness blocks fast offline brute force, the per-hash salt blocks precomputed rainbow tables, and the unique salt hides when two accounts share a password.",
                list: [
                    "Slow hashing blocks fast brute force",
                    "Per-hash salt blocks rainbow tables",
                    "Unique salts hide duplicate passwords",
                ],
            },
            {
                heading: "The 72-byte limit",
                body:
                    "bcrypt only considers the first 72 bytes of input; longer passwords are truncated. Applications either enforce a length limit up front or pre-hash long inputs, which trades one weakness for another. Knowing the cap exists is more important than any workaround.",
            },
            {
                heading: "The cost factor is a maintenance job",
                body:
                    "Hardware gets faster, so the cost factor must rise over time to keep the same margin. New hashes should use the highest cost your server tolerates, commonly 11 or 12. Old hashes stay verifiable and can be upgraded on the next successful login.",
            },
            {
                heading: "bcrypt vs. argon2 and scrypt",
                body:
                    "Argon2, the 2015 Password Hashing Competition winner, and scrypt are memory-hard, which resists GPU and ASIC attacks even harder. All three are acceptable. bcrypt remains a well-supported, easy-to-audit default; argon2 is the modern choice for greenfield systems.",
            },
            {
                heading: "When not to use bcrypt",
                body:
                    "bcrypt is for password storage, not general hashing. For checksums, file integrity, and download verification use a fast hash like SHA-256 or SHA-512. For authenticated messages use HMAC. Using bcrypt everywhere is as wrong as using SHA-256 for passwords.",
            },
        ],
        faq: [
            {
                q: "Can bcrypt be cracked?",
                a: "The algorithm has no practical break. Attackers can still guess weak passwords against a stolen hash, which is why a high cost factor and strong passwords matter.",
            },
            {
                q: "What is the maximum password length for bcrypt?",
                a: "72 bytes. Longer input is truncated unless you pre-hash it first, which carries its own tradeoffs.",
            },
            {
                q: "Should I use bcrypt or argon2?",
                a: "Both are secure. Argon2 is newer and memory-hard; bcrypt is more widely supported. Either one beats a fast hash for passwords.",
            },
            {
                q: "How often should I raise the cost factor?",
                a: "Choose the highest cost your server tolerates, commonly 11 to 12, whenever new hashes are created. Keep old hashes verifiable and upgrade them on the next login.",
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
                    "Every three bytes become four characters, so encoded text is always at least about a third larger than the raw bytes. Non-ASCII input grows more, because characters like emoji expand to several bytes before they are encoded. The expansion meter on the tool shows the ratio live.",
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
        slug: "is-md5-secure",
        toolId: "md5",
        relatedToolIds: ["sha-256", "sha-512", "hmac", "base64"],
        comparisonSlugs: ["md5-vs-sha-256"],
        eyebrow: "Security · Explainer",
        title: "Is MD5 Secure?",
        description:
            "MD5 has been cryptographically broken for years. Learn exactly when it is unsafe, why the 2004 collision attack matters, and what to use instead.",
        heroQuestion: "Is MD5 secure?",
        shortAnswer:
            "No, not for anything security related. MD5 has been vulnerable to collision attacks since 2004, and NIST no longer approves it for digital signatures or password hashing. It remains usable only for non-security tasks such as detecting accidental corruption or deduplicating data, where no attacker is involved.",
        sections: [
            {
                heading: "The short answer",
                body:
                    "MD5 is not secure when a malicious party could matter. Its collision resistance, the property that makes it impossible to find two different inputs with the same hash, has been broken since 2004. For integrity checks where nobody is trying to deceive you, MD5 can still be fine.",
            },
            {
                heading: "The 2004 collision attack",
                body:
                    "In 2004, Xiaoyun Wang and colleagues demonstrated that two distinct messages could be produced with the same MD5 hash in seconds on the hardware of the time. Later work made attacks faster, and by 2007 chosen-prefix collisions meant an attacker could craft two arbitrary documents with matching hashes. That turns a hash into a liability instead of a guarantee.",
            },
            {
                heading: "Why collisions break signatures and passwords",
                body:
                    "Digital signatures rely on hashing the document first; if two documents share a hash, a signed one can be swapped for another with a valid signature. For passwords, MD5 is fast, so GPUs can try billions of guesses per second, and unsalted hashes can be looked up in precomputed rainbow tables. Both uses are unsafe.",
            },
            {
                heading: "Where MD5 is still acceptable",
                body:
                    "MD5 remains reasonable for non-security work: confirming a download was not corrupted in transit, generating a stable key for deduplication, or reading checksums that older systems already publish. The deciding question is whether an attacker could benefit from finding a collision. If they could, MD5 is the wrong tool.",
            },
            {
                heading: "What to use instead",
                body:
                    "For hashes and signatures, use SHA-256 or SHA-512, which have no practical collision attacks. For password storage, use a slow salted function such as bcrypt, never a fast hash. Where a keyed message authentication code is needed, use HMAC with a strong hash.",
            },
            {
                heading: "A simple decision rule",
                body:
                    "Ask who controls the other input. If an attacker can craft a second file or string to match a hash you trust, use SHA-256 or better. If the hash only needs to catch a dropped byte during a download, MD5 is usually acceptable.",
            },
        ],
        faq: [
            {
                q: "Has MD5 been cracked?",
                a: "Yes. Collision resistance, the ability to find two inputs with the same hash, has been practically broken since 2004.",
            },
            {
                q: "Can MD5 be used for passwords?",
                a: "No. MD5 is fast and unsalted hashes are easily reversed with rainbow tables. Use a slow salted function such as bcrypt.",
            },
            {
                q: "Is MD5 still fine for checksums?",
                a: "For catching accidental corruption, yes. For resisting tampering by an attacker, no, because collisions are easy to produce.",
            },
            {
                q: "What should I use instead of MD5?",
                a: "SHA-256 or SHA-512 for hashes and signatures, and bcrypt for passwords. Both have no practical collision attacks.",
            },
        ],
        publishedIn: "v1.9",
    },

    {
        slug: "how-to-check-md5-checksum",
        toolId: "md5",
        relatedToolIds: ["sha-256", "sha-512", "base64"],
        comparisonSlugs: ["md5-vs-sha-256"],
        eyebrow: "How To · Guide",
        title: "How to Check an MD5 Checksum",
        description:
            "Verify a download by comparing its MD5 checksum against the publisher's value. Step-by-step commands for Windows, macOS, and Linux, plus what a mismatch means.",
        heroQuestion: "How do I check an MD5 checksum?",
        shortAnswer:
            "Generate the checksum of your file with a command such as certutil, md5, or md5sum, then compare it with the hash published by the download source. Matching hashes mean the file arrived intact, while a mismatch means it was corrupted or modified.",
        sections: [
            {
                heading: "What you need",
                body:
                    "Two things: the file you downloaded, and the official hash published on the source site. The publisher usually lists a 32-character MD5 next to the download link, sometimes in a .md5 file. Keep that reference value handy before you compute.",
            },
            {
                heading: "Windows: certutil",
                body:
                    "Open a Command Prompt and run certutil -hashfile followed by the file path and MD5. For example, certutil -hashfile \"C:\\Downloads\\setup.exe\" MD5 prints the checksum on its own line. This command ships with every version of Windows since 7.",
            },
            {
                heading: "Windows: PowerShell",
                body:
                    "Get-FileHash does the same job in PowerShell. Run Get-FileHash \"C:\\Downloads\\setup.exe\" -Algorithm MD5 and read the Hash property in the output. It is case insensitive, so a lowercase a-f matches an uppercase A-F.",
            },
            {
                heading: "macOS: md5",
                body:
                    "Terminal includes the md5 command. Run md5 /path/to/setup.zip and it prints MD5 (/path/to/setup.zip) = followed by the 32-character hash. The command reads the whole file, so it can take a few seconds for large downloads.",
            },
            {
                heading: "Linux: md5sum",
                body:
                    "Run md5sum /path/to/setup.zip and the output is the hash, two spaces, then the file name. Most distributions include md5sum in coreutils, and it also accepts a checksum file: md5sum -c checksum.md5 verifies a download against a .md5 file automatically.",
            },
            {
                heading: "Compare the hashes",
                body:
                    "The computed value must equal the published value character for character. Copy both into a plain text editor or a checksum compare box to avoid a typo, and ignore letter case. Some archives use the same command for SHA-256 checksums too, which the publisher will state explicitly.",
            },
            {
                heading: "If the hashes do not match",
                body:
                    "A mismatch means the file changed after the reference hash was made. The download was probably corrupted, so delete it and fetch it again, ideally from a mirror or over a verified connection. If the same file keeps failing, treat the source or the channel with suspicion.",
            },
        ],
        faq: [
            {
                q: "What command checks an MD5 on Windows?",
                a: "certutil -hashfile \"path\\to\\file\" MD5 in Command Prompt, or Get-FileHash \"path\\to\\file\" -Algorithm MD5 in PowerShell.",
            },
            {
                q: "Are MD5 checksums case sensitive?",
                a: "No. Hexadecimal digits are compared case insensitively, so 5d41 and 5D41 are the same value.",
            },
            {
                q: "Why do my two hashes not match?",
                a: "The file changed since the reference hash was published, the download was corrupted, or you hashed the wrong file. Re-download and try again.",
            },
            {
                q: "Is checking an MD5 still worthwhile?",
                a: "For catching accidental corruption during a download, yes. For proving a file was not tampered with, use SHA-256 instead.",
            },
        ],
        publishedIn: "v1.9",
    },

    {
        slug: "can-md5-be-decrypted",
        toolId: "md5",
        relatedToolIds: ["sha-256", "bcrypt", "sha-512", "hmac"],
        comparisonSlugs: ["md5-vs-sha-256"],
        eyebrow: "Security · Mythbusting",
        title: "Can MD5 Be Decrypted?",
        description:
            "MD5 hashes cannot be decrypted, because hashing is one-way. Here is what rainbow tables and brute force actually do, and why passwords should never use MD5.",
        heroQuestion: "Can MD5 be decrypted?",
        shortAnswer:
            "No. MD5 is a hash, not encryption, so there is nothing to decrypt. Online decrypt tools work by looking up known inputs in precomputed rainbow tables or by guessing, which only succeeds for weak or already-known values, and a match never proves the original text.",
        sections: [
            {
                heading: "Hash versus encryption",
                body:
                    "Encryption is reversible: a key converts ciphertext back to plaintext, so decrypting is expected. Hashing is a one-way fingerprint with no key. MD5 belongs to the second category, so the word decrypt does not apply to it at all.",
            },
            {
                heading: "Why the math cannot be reversed",
                body:
                    "An MD5 output is 128 bits, while the inputs can be any length. Many inputs map to the same output, so the hash does not contain enough information to identify the original input. Reversing it is impossible by design.",
            },
            {
                heading: "What rainbow tables do",
                body:
                    "A rainbow table stores hashes for a list of known inputs, such as common passwords and dictionary words. A lookup tool hashes nothing; it searches the table and shows the matching input when one exists. That only works for values that were precomputed, and it is a guess, not a decryption.",
            },
            {
                heading: "What brute force does",
                body:
                    "Brute force guesses inputs, hashes each one, and compares. Because MD5 is extremely fast, modern GPUs try billions of guesses per second, so short or common passwords fall in minutes. Longer random passphrases are the only defense, and even then a fast hash is the wrong tool.",
            },
            {
                heading: "Why MD5 passwords were cracked",
                body:
                    "Major breaches such as RockYou and LinkedIn leaked unsalted MD5 password hashes, and large fractions were reversed within days. Unsalting means identical passwords hash identically, so one lookup recovers every account that used the same password.",
            },
            {
                heading: "Use bcrypt instead",
                body:
                    "Password hashing needs a slow, salted function such as bcrypt, which deliberately costs hundreds of milliseconds per guess instead of nanoseconds. MD5 is fine for checksums but must never store passwords. If you see a site storing MD5 password hashes, that alone is a warning sign.",
            },
        ],
        faq: [
            {
                q: "Is MD5 encryption?",
                a: "No. MD5 is a hash function with no key and no way back to the input. Encryption, unlike hashing, is reversible with a key.",
            },
            {
                q: "Why do MD5 decrypt sites sometimes return a value?",
                a: "They look up the hash in precomputed rainbow tables and dictionary lists. A result is a known match, not a decryption, and it cannot be verified as the true input.",
            },
            {
                q: "Can a collision prove the original text?",
                a: "No. Two different inputs can share the same MD5 hash, so a match never proves which input produced it.",
            },
            {
                q: "How should passwords be stored?",
                a: "With a slow salted function such as bcrypt. MD5 and other fast hashes are trivially reversible in practice for common passwords.",
            },
        ],
        publishedIn: "v1.9",
    },

    {
        slug: "what-is-json-validation",
        toolId: "json-validator",
        relatedToolIds: ["json-schema-validator", "json-formatter", "json-minifier"],
        comparisonSlugs: ["json-formatter-vs-json-validator"],
        eyebrow: "Explainer · Guide",
        title: "What Is JSON Validation?",
        description:
            "JSON validation checks that text is well-formed JSON and, with a schema, that it has the expected structure. Learn what validation catches and what it cannot catch.",
        heroQuestion: "What is JSON validation?",
        shortAnswer:
            "JSON validation is the process of checking that text is syntactically well-formed JSON before a program uses it. Syntax validation catches missing quotes, commas, and brackets. Schema validation goes further and checks structure: required keys, types, and ranges. Validation cannot fix data, it only tells you whether the data is safe to parse.",
        sections: [
            {
                heading: "Validation is a syntax check",
                body:
                    "A JSON parser such as JSON.parse or json.loads returns an error if the text is not well-formed JSON. A validator reports the exact line and position so you can fix it. A trailing comma or a missing closing brace is the kind of thing validation catches.",
            },
            {
                heading: "Syntax versus schema",
                body:
                    "Syntax validation confirms the text is parseable JSON. Schema validation, using JSON Schema, checks meaning: a field named age must be a number, an email field must match a pattern, and required fields must be present. Most tools do one or the other, and doing both is the strongest guarantee.",
            },
            {
                heading: "What validation cannot do",
                body:
                    "Validation never fixes your data, and it cannot verify semantics such as whether an ID exists in the database or whether a number is the correct price. It only guarantees that a program can read the text without crashing.",
            },
            {
                heading: "Where validation fits",
                body:
                    "A solid pipeline formats JSON for readability, validates it for correctness, then transforms it. Validating right after an API response, a file import, or a config edit catches errors while they are still easy to locate.",
                list: [
                    "Syntax: is it well-formed JSON?",
                    "Schema: does it have the right shape?",
                    "Semantics: only your application can answer this",
                ],
            },
        ],
        faq: [
            {
                q: "Does validation fix my JSON?",
                a: "No. Validation reports problems and pinpoints the error. You fix the input and validate again.",
            },
            {
                q: "Is validation the same as formatting?",
                a: "No. Formatting adds indentation for readability. Validation checks that the JSON is correct. A formatter usually validates as a side effect.",
            },
            {
                q: "What is JSON Schema?",
                a: "A declarative format that describes the expected structure of a document: types, required fields, and value constraints. Validators can check a document against it.",
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
        slug: "json-schema-vs-json-validator",
        toolId: "json-validator",
        relatedToolIds: ["json-schema-validator", "json-formatter"],
        comparisonSlugs: ["json-formatter-vs-json-validator", "json-validator-vs-json-schema-lite"],
        eyebrow: "Explainer · Guide",
        title: "JSON Schema vs JSON Validator",
        description:
            "A JSON validator checks syntax. JSON Schema checks structure and types. Both are needed in production. See how they differ and when each one matters.",
        heroQuestion: "What is the difference between JSON Schema and a JSON validator?",
        shortAnswer:
            "A JSON validator answers one question: is this text well-formed JSON? JSON Schema answers a second question: does this document match the shape a program expects, with the right required fields, types, and ranges? Syntax validation is a prerequisite, and schema validation adds guarantees about structure. Production APIs usually do both.",
        sections: [
            {
                heading: "What a validator checks",
                body:
                    "A syntax validator checks whether the text parses. It never judges whether the fields make sense for your application, so deeply wrong data can still be perfectly valid JSON.",
            },
            {
                heading: "What JSON Schema checks",
                body:
                    "A schema describes expectations declaratively: required fields, value types, string patterns, numeric ranges, array lengths, and nesting. A schema-aware validator checks a document against it and reports which fields violate which rule.",
            },
            {
                heading: "A concrete difference",
                body:
                    "{\"name\":42} is perfectly valid JSON, and a syntax validator passes it. A schema that declares name must be a string fails it. The value is parseable but wrong for the contract.",
            },
            {
                heading: "When you need each one",
                body:
                    "Validate syntax for anything a human might have edited by hand: configs, payloads, and fixtures. Add schema validation for API boundaries, webhook payloads, and any data a program depends on.",
            },
            {
                heading: "How they work together",
                body:
                    "Check syntax first so the parser does not crash, then validate the schema so the shape is correct, then process. A tool such as JSON Schema Lite combines a syntax check with schema rules in a single pass.",
            },
        ],
        faq: [
            {
                q: "Is JSON Schema required for JSON?",
                a: "No. JSON works without it. Schema is an optional standard that adds structural guarantees for contracts and validation.",
            },
            {
                q: "Does validating syntax validate a schema?",
                a: "No. Syntax validation only confirms the document is parseable JSON. Schema validation checks the document against a set of rules.",
            },
            {
                q: "Can a schema replace tests?",
                a: "No, but it covers a large class of contract bugs at the boundary, which lets your tests focus on behavior.",
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
        slug: "hmac-vs-sha-256",
        toolId: "hmac",
        relatedToolIds: ["sha-256", "sha-512", "md5"],
        comparisonSlugs: ["sha-256-vs-hmac", "md5-vs-sha-256"],
        eyebrow: "Explainer · Guide",
        title: "HMAC vs SHA-256",
        description:
            "SHA-256 hashes a message with no key. HMAC-SHA-256 hashes it with a secret key and proves authenticity. Understand the difference and when to use which.",
        heroQuestion: "What is the difference between HMAC and SHA-256?",
        shortAnswer:
            "SHA-256 is a plain hash: anyone can compute it, so it proves the message is unchanged but not who created the hash. HMAC-SHA-256 is SHA-256 wrapped with a secret key, so a valid code proves both integrity and that the signer holds the key. For integrity without secrecy use SHA-256, and for authenticating messages use HMAC-SHA-256.",
        sections: [
            {
                heading: "A plain hash has no key",
                body:
                    "SHA-256 turns any message into a fixed 256-bit digest, and anyone can compute it. A digest alone proves nothing about the author. It only catches accidental changes.",
            },
            {
                heading: "HMAC adds a shared secret",
                body:
                    "HMAC-SHA-256 runs SHA-256 twice with the key folded into both passes. Without the key you cannot produce a valid code, so the code acts as proof that the signer possesses the key.",
            },
            {
                heading: "The attacker story",
                body:
                    "With a plain SHA-256, an attacker who changes the message can simply recompute the hash and nobody notices. With HMAC, an attacker without the key cannot compute a valid code for a modified message, so the change is detected.",
            },
            {
                heading: "Common confusions",
                body:
                    "People often say SHA-256 when they mean HMAC-SHA-256. API documentation that says SHA-256 signature almost always means HMAC-SHA-256 with a shared secret, not a bare digest.",
            },
            {
                heading: "When to use which",
                body:
                    "Use plain SHA-256 for checksums, deduplication, and download verification. Use HMAC-SHA-256 for webhook verification, API signing, and any message that needs to prove who signed it.",
            },
        ],
        faq: [
            {
                q: "Is HMAC stronger than SHA-256?",
                a: "They answer different questions. SHA-256 provides integrity, while HMAC provides integrity plus authenticity. For verifying a signer, HMAC is the right tool.",
            },
            {
                q: "Can an attacker fake an HMAC?",
                a: "Only if they know the secret key. With a strong key and HMAC-SHA-256, forgery is considered infeasible.",
            },
            {
                q: "Why does my API use SHA-256 for signing?",
                a: "It almost certainly uses HMAC-SHA-256. Many providers shorten the name to SHA-256 in their docs, but the signing scheme is a keyed MAC.",
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
        slug: "is-hmac-secure",
        toolId: "hmac",
        relatedToolIds: ["sha-256", "sha-512", "bcrypt"],
        comparisonSlugs: ["sha-256-vs-hmac"],
        eyebrow: "Security · Explainer",
        title: "Is HMAC Secure?",
        description:
            "HMAC is secure when the key is strong and the comparison is constant time. See what actually breaks HMAC implementations, from weak keys to timing leaks.",
        heroQuestion: "Is HMAC secure?",
        shortAnswer:
            "Yes, when used correctly. HMAC-SHA-256 has no known practical forgery attack. The failures you read about come from the surroundings: weak or reused secret keys, comparing signatures with a non-constant-time check, or building the signature over the wrong bytes. The algorithm is the least likely part to break.",
        sections: [
            {
                heading: "The algorithm is sound",
                body:
                    "HMAC-SHA-256 remains a NIST-approved construction with no practical forgery attack. The two-pass keyed structure has held up against decades of analysis, so the math is not where implementations fail.",
            },
            {
                heading: "The secret key decides everything",
                body:
                    "A short, guessable, or leaked key makes any signature forgeable. Generate keys with a cryptographically secure random source and keep them out of client-side code entirely.",
            },
            {
                heading: "Constant-time comparison",
                body:
                    "If you compare signatures with an equality check that returns at the first mismatch, timing reveals how many prefix bytes matched, which over many requests can leak the key. Use timingSafeEqual in Node or hmac.compare_digest in Python.",
            },
            {
                heading: "Sign the right bytes",
                body:
                    "Canonicalization mistakes are the classic bug. The sender and receiver must sign the identical byte sequence: same field order, same encoding, same key format. Include a timestamp so a captured signature expires.",
            },
            {
                heading: "HMAC is not encryption",
                body:
                    "The message travels in plaintext, so HMAC proves authenticity but does not hide content. Combine HMAC with TLS for confidentiality, and remember that HMAC never replaces password hashing.",
            },
        ],
        faq: [
            {
                q: "Can HMAC be hacked?",
                a: "Not the construction itself. Practical breaks come from weak keys, timing-leaking comparisons, or signing mismatched byte sequences.",
            },
            {
                q: "Is HMAC-MD5 ever acceptable?",
                a: "Only in legacy systems with a strict compatibility need. Prefer HMAC-SHA-256 everywhere you control the protocol.",
            },
            {
                q: "Does HMAC encrypt the message?",
                a: "No. The message stays readable. HMAC only proves integrity and authenticity, and transport security such as TLS provides confidentiality.",
            },
            {
                q: "How long should the HMAC key be?",
                a: "At least as long as the hash output, 32 bytes for SHA-256, and generated randomly. Longer keys add no security beyond that.",
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
        slug: "uuid-v4-vs-v5",
        toolId: "uuid-generator",
        relatedToolIds: ["timestamp-converter", "base64"],
        comparisonSlugs: [],
        eyebrow: "Explainer · Guide",
        title: "UUID v4 vs v5",
        description:
            "v4 is random, v5 is deterministic. Same input always yields the same v5 UUID, which makes v5 right for deduplication and v4 right for everyday IDs.",
        heroQuestion: "What is the difference between UUID v4 and v5?",
        shortAnswer:
            "UUID v4 is generated from 122 random bits, so every call produces a new unpredictable value. UUID v5 hashes a namespace plus a name with SHA-1, so the same namespace and name always produce the same UUID. Use v4 for IDs that must look random and unique, and v5 when you need a stable identifier derived from a known input such as a URL or email.",
        sections: [
            {
                heading: "v4 is random",
                body:
                    "In a v4 UUID, 122 of the 128 bits come from a random source. Nothing about the input is recoverable, and each generation is independent. It is the default choice for most identifiers.",
            },
            {
                heading: "v5 is deterministic",
                body:
                    "You feed a namespace UUID and a name string, and the generator hashes them with SHA-1 and shapes the result into a UUID. The same pair always yields the same UUID, on any machine, forever.",
            },
            {
                heading: "Why determinism matters",
                body:
                    "v5 lets you derive an ID from data you already have: a URL, an email, or a product code, without storing a mapping. That property is the basis for deduplication and idempotent operations.",
            },
            {
                heading: "The collision story",
                body:
                    "v4 collisions are astronomically unlikely, while v5 collisions are intentional: identical inputs map to the same value by design, and the namespace prevents different applications from interfering with each other.",
            },
            {
                heading: "Which to use",
                body:
                    "When in doubt, use v4. Choose v5 when the same entity must resolve to the same ID across systems, such as content-addressable storage or migrating keys. v3 is the older MD5-based twin of v5 and is best avoided in new work.",
            },
        ],
        faq: [
            {
                q: "Does v5 produce the same UUID every time?",
                a: "Yes. The same namespace and name always produce the same v5 UUID, which is exactly why it is used for stable identifiers.",
            },
            {
                q: "Can two different names give the same v5 UUID?",
                a: "With overwhelming probability no, within a namespace. The SHA-1 hash maps distinct names to distinct values in practice.",
            },
            {
                q: "Is v4 better than v5?",
                a: "For random, opaque, per-use IDs yes. For reproducible IDs from known inputs, v5 is the correct choice. They solve different problems.",
            },
            {
                q: "What is a namespace in v5?",
                a: "A fixed UUID that scopes the hash. RFC 9562 defines standard namespaces for DNS names and URLs, and using one prevents your v5 IDs from colliding with another application's.",
            },
        ],
        publishedIn: "v1.9",
    },

    {
        slug: "can-uuids-collide",
        toolId: "uuid-generator",
        relatedToolIds: ["base64", "timestamp-converter"],
        comparisonSlugs: [],
        eyebrow: "Security · Mythbusting",
        title: "Can Two UUIDs Ever Be the Same?",
        description:
            "Yes, technically, but the odds are so small they are negligible. Here is the actual collision math, the birthday paradox, and the one real risk: a weak random source.",
        heroQuestion: "Can UUIDs collide?",
        shortAnswer:
            "Yes, but only with a probability so small it is irrelevant for real applications. For random v4 UUIDs you would need to generate roughly 2.71 quintillion values, 2.71 x 10^18, before a 50 percent chance of a single collision, per the birthday paradox. The practical risk is not the math but a weak random source generating predictable IDs.",
        sections: [
            {
                heading: "The birthday paradox",
                body:
                    "Collisions among random IDs grow faster than intuition suggests. With 2 to the power of 122 random values available, a 50 percent collision chance needs about 2.71 x 10^18 UUIDs, not the full 2^122.",
            },
            {
                heading: "Putting the number in perspective",
                body:
                    "Generating 1 billion UUIDs per second for every second of a year, about 3.15 x 10^16 values, still leaves you far below the collision threshold. A duplicate is more likely to be a bug than luck.",
            },
            {
                heading: "Deterministic versions never collide by design",
                body:
                    "v1 uses time, clock sequence, and MAC address, so collisions require a clock reset or identical node state. v3 and v5 are deterministic, so identical inputs intentionally share a UUID.",
            },
            {
                heading: "The real risk is a weak random source",
                body:
                    "v4 is only as strong as the random source that feeds it. A predictable or badly seeded generator can produce repeats, and browser randomness bugs have caused real collisions. Use crypto.randomUUID or another cryptographically secure generator.",
            },
            {
                heading: "Defensive database practice",
                body:
                    "Because collisions are theoretically possible, mission-critical tables often add a uniqueness constraint or primary key, so a collision would error loudly instead of silently merging rows.",
            },
        ],
        faq: [
            {
                q: "What are the actual odds of a v4 collision?",
                a: "The birthday bound puts a 50 percent collision chance at about 2.71 x 10^18 UUIDs, and a 1 percent chance at roughly 2.6 x 10^18.",
            },
            {
                q: "Has a UUID collision ever happened?",
                a: "There are no confirmed cases from proper random generation. Recorded duplicates trace to bugs, weak random sources, or copied IDs.",
            },
            {
                q: "Do UUIDs guarantee uniqueness?",
                a: "No absolute guarantee. They provide statistical uniqueness that is effectively absolute, and deterministic versions avoid chance entirely by construction.",
            },
        ],
        publishedIn: "v1.9",
    },

    {
        slug: "how-to-generate-a-uuid",
        toolId: "uuid-generator",
        relatedToolIds: ["base64", "timestamp-converter"],
        comparisonSlugs: [],
        eyebrow: "How To · Guide",
        title: "How to Generate a UUID",
        description:
            "Generate v4 UUIDs in the browser, in JavaScript, Python, and Java, and in databases. Copy the exact code and know which versions to use.",
        heroQuestion: "How do I generate a UUID?",
        shortAnswer:
            "In the browser or Node.js, crypto.randomUUID() returns a v4 UUID with no dependencies. Python has uuid.uuid4(), Java has UUID.randomUUID(), and PostgreSQL has gen_random_uuid(). For bulk or zero-code generation, an online UUID generator produces as many as you need in one click.",
        sections: [
            {
                heading: "Browser and Node.js",
                body:
                    "crypto.randomUUID() is built in and uses a cryptographically secure source, so there is nothing to install. For bulk generation, loop over it. The uuid npm package adds v1, v3, v5, and v7 support when you need other versions.",
            },
            {
                heading: "Python",
                body:
                    "import uuid; uuid.uuid4() produces a random v4 value. uuid.uuid5(uuid.NAMESPACE_URL, \"https://example.com\") produces a deterministic name-based ID. Avoid uuid.uuid1() in new code because it embeds the MAC address.",
            },
            {
                heading: "Java",
                body:
                    "UUID.randomUUID() from java.util gives a v4 value. For name-based UUIDs, hash a namespace and name with SHA-1 and set the version bits yourself, which is a small, well-documented routine.",
            },
            {
                heading: "Databases",
                body:
                    "PostgreSQL has gen_random_uuid() for v4 values. MySQL and MariaDB support UUID() with a generated counter. Most ORMs expose these as column defaults so you never manage IDs in application code.",
            },
            {
                heading: "Which version",
                body:
                    "Use v4 for almost everything. Use v7 for database primary keys that should sort by creation time. Use v5 for deterministic IDs from known names. Avoid v1 in new code because it leaks hardware information.",
            },
        ],
        faq: [
            {
                q: "Is crypto.randomUUID available everywhere?",
                a: "It is in all modern browsers over secure contexts and in Node.js 14.17 and later. For older environments, the uuid npm package or a polyfill works.",
            },
            {
                q: "Can I generate UUIDs without internet?",
                a: "Yes. UUID generation is local by design, so an offline or in-browser generator works fine.",
            },
            {
                q: "How many UUIDs can I generate?",
                a: "As many as you need. Because generation requires no coordination, you can create millions without any risk of running out.",
            },
        ],
        publishedIn: "v1.9",
    },

    {
        slug: "what-is-json-minification",
        toolId: "json-minifier",
        relatedToolIds: ["json-formatter", "json-validator"],
        comparisonSlugs: ["json-minifier-vs-json-formatter"],
        eyebrow: "Explainer · Guide",
        title: "What Is JSON Minification?",
        description:
            "JSON minification removes all optional whitespace without changing the data. What gets stripped, what stays, and why the result is still 100 percent valid JSON.",
        heroQuestion: "What is JSON minification?",
        shortAnswer:
            "Minification removes every whitespace character outside of string values: spaces, tabs, and newlines, leaving the smallest valid JSON representation. The data is identical, so any parser reads minified and formatted JSON the same way. The only difference is size and readability.",
        sections: [
            {
                heading: "What gets removed",
                body:
                    "Indentation, line breaks, and spaces after colons and commas are all removed. These characters are optional in JSON syntax per RFC 8259, so deleting them changes nothing about the meaning.",
            },
            {
                heading: "What stays",
                body:
                    "Every key, value, and structural character stays, plus all whitespace inside strings. The space in \"hello world\" is part of the value, not formatting, so it is preserved exactly.",
            },
            {
                heading: "Lossless by design",
                body:
                    "Minified and pretty-printed versions parse to the exact same structure. No information is lost, so you can format, minify, and format again without changing the data.",
            },
            {
                heading: "How much smaller",
                body:
                    "Typical savings are 20 to 40 percent for two-space indented JSON, rising to 40 to 60 percent for deeply nested documents. Whitespace is a large share of a formatted file.",
            },
            {
                heading: "Minify vs compress",
                body:
                    "Minification removes characters from the text, while compression such as gzip re-encodes the byte stream. They are separate operations and they stack: minify first, then gzip.",
            },
        ],
        faq: [
            {
                q: "Does minifying JSON change the data?",
                a: "No. Only optional whitespace is removed. The parsed structure is byte-for-byte equivalent.",
            },
            {
                q: "Are spaces inside strings removed?",
                a: "No. Whitespace inside a quoted string is part of the value and is preserved exactly.",
            },
            {
                q: "Is minified JSON still valid?",
                a: "Yes. Whitespace between tokens is insignificant in the spec, so minified JSON parses identically to formatted JSON.",
            },
        ],
        publishedIn: "v1.9",
    },

    {
        slug: "why-minify-json",
        toolId: "json-minifier",
        relatedToolIds: ["json-formatter", "json-to-csv"],
        comparisonSlugs: ["json-minifier-vs-json-formatter"],
        eyebrow: "Explainer · Guide",
        title: "Why Minify JSON (and When Not To)",
        description:
            "Minified JSON ships faster over the network and uses less storage, but readability has value. Learn the decision rule for when minification actually helps.",
        heroQuestion: "Why should I minify JSON?",
        shortAnswer:
            "Minify JSON when it will be parsed by a machine and never read by a human: API responses, storage, localStorage, and inline script data. Skip it when humans read or edit the file, such as package.json, configs, and anything in version control. With gzip already enabled, minification adds only a few percent of extra savings.",
        sections: [
            {
                heading: "The network case",
                body:
                    "Smaller payloads mean faster loads and lower bandwidth costs, especially for mobile clients and high-traffic APIs. A 40 percent smaller response is real money at scale.",
            },
            {
                heading: "The storage case",
                body:
                    "Databases, caches, and message queues charge per byte. Minified JSON in a text column, in Redis, or in a queue message uses less space and fits more data per message.",
            },
            {
                heading: "Embedded JSON",
                body:
                    "JSON inlined into HTML script tags, localStorage, cookies, or URLs has strict size limits. Minifying keeps more room for real data and keeps URLs within safe length limits.",
            },
            {
                heading: "When not to minify",
                body:
                    "Config files developers edit, files in version control, logs you might read during an incident, and documentation examples should stay formatted. A minified config turns every diff into one giant line and makes review painful.",
            },
            {
                heading: "The gzip reality",
                body:
                    "Most servers compress JSON with gzip or Brotli, which squeezes whitespace aggressively. On top of compression, minification saves only 3 to 8 percent more, so it matters most where compression is absent.",
            },
            {
                heading: "The decision rule",
                body:
                    "If a machine reads it, nobody ever looks at it, and size counts, minify it. If a human will open it in the next month, leave it formatted.",
            },
        ],
        faq: [
            {
                q: "Is minifying worth it if my server uses gzip?",
                a: "Marginally. gzip compresses whitespace anyway, so minification adds only a few percent on top. It matters more for storage and for channels that do not compress.",
            },
            {
                q: "Should package.json be minified?",
                a: "No. It is edited by humans and tracked in version control. Formatting it keeps diffs reviewable.",
            },
            {
                q: "Does minification help small payloads?",
                a: "Barely. Under a few kilobytes the request overhead dominates. Minification pays off on large responses and at scale.",
            },
            {
                q: "Do minified files work in Excel or a database?",
                a: "For JSON consumed by code, yes. If the file is meant to be read or edited by people, keep it formatted.",
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
        slug: "json-minify-vs-format",
        toolId: "json-minifier",
        relatedToolIds: ["json-formatter", "json-validator"],
        comparisonSlugs: ["json-minifier-vs-json-formatter"],
        eyebrow: "Explainer · Guide",
        title: "Minify vs Format JSON",
        description:
            "Minify and format are opposite operations on the same data. One shrinks JSON for machines, the other expands it for humans. Here is when to use each.",
        heroQuestion: "What is the difference between minifying and formatting JSON?",
        shortAnswer:
            "Formatting, also called pretty-printing, adds indentation and line breaks so humans can read JSON. Minifying removes that whitespace so machines can ship and store it efficiently. Both are lossless and reversible, because the parsed data is identical either way. Use Format to read, and Minify to ship.",
        sections: [
            {
                heading: "The same data, two spellings",
                body:
                    "The compact form {\"a\":1} and the pretty version with newlines and indentation parse to the same object. JSON ignores whitespace between tokens, so the two spellings are interchangeable.",
            },
            {
                heading: "Format is for reading",
                body:
                    "Pretty-printed JSON is scannable, foldable, and produces clean diffs. It belongs in configs, logs, examples, and anything a developer opens by hand.",
            },
            {
                heading: "Minify is for shipping",
                body:
                    "Compact JSON belongs in API responses, storage, and bundles. It carries no indentation weight across the wire or on disk.",
            },
            {
                heading: "The workflow",
                body:
                    "Format first to review and validate, then minify for production. Many pipelines keep pretty JSON in the repository and emit minified JSON at build time.",
            },
            {
                heading: "In version control",
                body:
                    "Never commit minified JSON that you will keep editing. A single-line change rewrites the whole file in a diff, which makes review painful. Format at rest, and minify on the way out.",
            },
        ],
        faq: [
            {
                q: "Is minified JSON harder to read?",
                a: "Yes, it is a single dense line. That is the tradeoff for smaller size. Format the same data when a human needs to inspect it.",
            },
            {
                q: "Do minify and format ever lose data?",
                a: "No. Both operations only move whitespace. Keys, values, and structure are preserved exactly.",
            },
            {
                q: "Which should I use for my API?",
                a: "Minify responses for speed, and format the same data for debugging. Dev tools usually prettify minified responses automatically.",
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
        slug: "why-convert-json-to-csv",
        toolId: "json-to-csv",
        relatedToolIds: ["csv-to-json", "json-formatter"],
        comparisonSlugs: ["csv-vs-json"],
        eyebrow: "Explainer · Guide",
        title: "Why Convert JSON to CSV?",
        description:
            "CSV opens in Excel, loads into SQL, and feeds analytics tools that will not read JSON. Learn what CSV is good at and when conversion loses information.",
        heroQuestion: "Why should I convert JSON to CSV?",
        shortAnswer:
            "CSV is the lingua franca of tabular data: Excel, Google Sheets, SQL importers, Pandas, and BI tools all open it directly, while most of them have awkward JSON support. Converting an array of JSON records to CSV turns program data into a table you can sort, filter, and load anywhere. The cost is that nested structure is flattened, so know the shape before you convert.",
        sections: [
            {
                heading: "CSV is everywhere",
                body:
                    "Every spreadsheet, almost every database import, and every analytics tool accepts CSV. If your data must leave a program and land in a spreadsheet, CSV is the lowest-friction path.",
            },
            {
                heading: "JSON stays inside programs",
                body:
                    "JSON is great for APIs and configs, but a spreadsheet or a SQL loader will not accept a nested object. Conversion bridges the two worlds.",
            },
            {
                heading: "The flat table constraint",
                body:
                    "CSV has two dimensions, rows and columns. Objects flatten to dot-notation columns and arrays need a strategy, so some structure is always translated rather than preserved.",
            },
            {
                heading: "What you can do with the CSV",
                body:
                    "Sort and filter in a spreadsheet, import into a database table, feed charts and dashboards, or hand it to a data analyst who works in Excel.",
            },
            {
                heading: "The reverse path",
                body:
                    "A CSV can be converted back to JSON, which is what the CSV to JSON tool does. Flattened headers with dot notation round-trip cleanly when you need the JSON again.",
            },
        ],
        faq: [
            {
                q: "What is CSV best used for?",
                a: "Tabular data that needs spreadsheets, databases, or analytics. It is the most portable table format in existence.",
            },
            {
                q: "Does converting JSON to CSV lose data?",
                a: "Only shape. Flattening nested objects and choosing an array strategy changes how the data is laid out, so pick the strategy that matches your use.",
            },
            {
                q: "When should I keep JSON instead?",
                a: "When the data is deeply nested, irregular, or will be consumed by programs. CSV suits regular, tabular records destined for a spreadsheet or database.",
            },
        ],
        publishedIn: "v1.9",
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