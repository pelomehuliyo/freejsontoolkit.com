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