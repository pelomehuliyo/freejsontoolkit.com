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
            "Yes — for hashing, integrity checks, and digital signatures. SHA-512 has no known practical collision attack. It is not quantum-proof, and it is not suitable for password storage. The real risk is almost always implementation mistakes, not the algorithm itself.",
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
                    "Grover's algorithm, running on a sufficiently powerful quantum computer, would reduce the effective security of a hash function by half. For SHA-512, that means 256 bits of security — still beyond brute-force reach. For SHA-256, it drops to 128 bits, which is still considered secure but with less margin. This is one reason SHA-512 provides extra future-proofing.",
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
            "No. SHA-512 is a one-way function — it cannot be decrypted. But weak inputs can still be guessed. Here's why hashing is not encryption, what attackers actually do, and how to protect your data.",
        heroQuestion: "Can SHA-512 be decrypted?",
        shortAnswer:
            "No. SHA-512 is a one-way function. The hash cannot be reversed back to the original input. However, weak inputs like short passwords can still be discovered by hashing many guesses and comparing the results.",
        sections: [
            {
                heading: "Hashing is not encryption",
                body:
                    "Encryption is two-way: you encrypt with a key and decrypt with a key. Hashing is one-way: the input is transformed into a fixed-size digest, and the original data is destroyed in the process. There is no key to unlock a hash. It is not hidden — it is gone.",
            },
            {
                heading: "Why it's mathematically one-way",
                body:
                    "SHA-512 takes any input — from a single character to a 100 GB file — and compresses it into 512 bits. This is a lossy transformation: infinitely many inputs map to the same output space. There is simply not enough information in the hash to reconstruct the original.",
            },
            {
                heading: "What attackers actually do",
                body:
                    "Since they can't decrypt, attackers guess. They hash millions or billions of candidate inputs and compare each result to the target hash. This is called brute-force or dictionary attack. It doesn't break the algorithm — it exploits weak inputs.",
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
                a: "They maintain a database of previously computed hashes. If your input is common enough to be in their database, they look it up. This is not decryption — it's a precomputed dictionary.",
            },
            {
                q: "Is Base64 the same as hashing?",
                a: "No. Base64 is an encoding — it's fully reversible and provides no security. Anyone can decode Base64. Hashing is one-way and irreversible.",
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
];

// ── Derived selectors ──────────────────────────────────────────────────

export function getArticle(slug: string): LearnArticle | undefined {
    return ARTICLES.find((a) => a.slug === slug);
}

export function articlesByTool(toolId: string): LearnArticle[] {
    return ARTICLES.filter((a) => a.toolId === toolId);
}