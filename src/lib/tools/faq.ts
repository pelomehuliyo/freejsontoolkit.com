/**
 * Per-tool FAQ content — the single source for FAQPage structured data.
 *
 * Transcribed from the visible <details>/<summary> FAQ sections rendered on
 * each page so the schema and the page stay in step. The homepage FAQs live
 * under the key "home".
 */
export interface Faq {
  q: string;
  a: string;
}

export const FAQS: Record<string, Faq[]> = {
  "home": [
    { q: "Is my data uploaded anywhere?", a: "No. Every tool processes your input locally in your browser, in a Web Worker when a file is large. Nothing you paste or drop leaves your machine." },
    { q: "Do I need an account?", a: "No. There is no sign‑up, no session and no server‑side record of anything you process. Your starred tools and recents live only in your own browser." },
    { q: "Does it work offline?", a: "Once a page has loaded, the tools keep working without a connection. The logic ships with the page, not a server." },
    { q: "How do I find the right tool fast?", a: "Press ⌘K (or / ) anywhere to open the command palette, a fuzzy search over every tool with your recent ones on top. Or browse the catalog by category above." },
  ],
  "base64": [
    { q: "Is my input uploaded anywhere?", a: "No. Encoding and decoding run entirely in your browser, in a background worker for large inputs. Nothing you paste leaves your machine." },
    { q: "Why does the output get bigger when I encode?", a: "Base64 represents every 3 bytes of input as 4 printable characters, so encoded text is always at least ~33% larger than its byte length, more for non-ASCII since characters like emoji expand to several bytes first. The meter shows that ratio live." },
    { q: "What does the tag on decode mean?", a: "When you decode, the tool reads the first bytes of the result and names common formats (PNG, JPEG, PDF, GIF, WebP, ZIP, gzip) or marks it as JSON or plain text. If the payload is binary, you get a clean byte count instead of unreadable characters." },
  ],
  "bcrypt": [
    { q: "Is my password uploaded?", a: "No. Hashing runs entirely in your browser, in a background worker. Nothing you enter leaves your machine." },
    { q: "Why does the same password give a different hash?", a: "bcrypt embeds a random salt in every hash, so identical passwords produce different hashes. That's intentional: it stops attackers from precomputing tables or spotting duplicate passwords in a database." },
    { q: "What does the cost factor do?", a: "The cost factor controls how many rounds of key stretching bcrypt runs: 2^cost. Higher values take longer to compute but make brute-forcing far more expensive. 10 is the common default; use 11–12 for new systems. See the SHA-256 vs bcrypt comparison ." },
    { q: "Is bcrypt right for checking a file checksum?", a: "No. bcrypt is for password storage. For checksums, fingerprints, and content verification use a fast hash like SHA-256 or SHA-512 instead." },
    { q: "How long does bcrypt hashing take?", a: "With a normal cost factor of 10 to 12, hashing takes from tens to a few hundred milliseconds on a typical CPU. That delay is intentional and is what makes brute force expensive." },
    { q: "What does $2a$10$ at the start of a hash mean?", a: "The version marker and the cost factor. $2a$ is the bcrypt variant, and 10 means 2^10, or 1,024 rounds, of key stretching were used." },
    { q: "Should I use bcrypt or argon2?", a: "Both are secure. Argon2 is newer and memory-hard; bcrypt is more widely supported. Either one beats a fast hash for passwords." },
    { q: "What is the bcrypt 72-byte limit?", a: "bcrypt only considers the first 72 bytes of input, so longer passwords are truncated. Applications enforce a length limit up front or pre-hash long inputs, which carries its own tradeoffs." },
  ],
  "csv-to-json": [
    { q: "How does the large-file mode work?", a: "If you drop a file larger than 15 MB, the tool switches to a background worker. It reads the file off the main thread, converts it in one pass, and gives you a capped preview in the editor. The full result is always available as a download. Nothing is uploaded. Read the honest limits in our large-file guide →" },
    { q: "Is my CSV uploaded anywhere?", a: "No. Conversion happens entirely in your browser. Your data never leaves your machine." },
    { q: "Can it handle large CSV files?", a: "Yes. Files above about 15 MB switch to a dedicated large-file mode: the file is read and converted in a background worker, you see a capped preview in the editor, and the full JSON is a one-click download. Nothing is uploaded. The only ceiling is your device's memory. See how large-file mode works →" },
    { q: "Which delimiters are supported?", a: "Comma, semicolon, tab, and pipe, plus auto-detection that figures it out for you. Quoted fields containing delimiters and newlines are handled correctly (RFC 4180)." },
    { q: "How are headers handled?", a: "With \"First row is a header\" on (default), the first row becomes the object keys. Turn it off to get synthetic keys (column1, column2, …) and keep every row as data." },
  ],
  "csv-to-tsv": [
    { q: "How does the large-file mode work?", a: "If you drop a file larger than 15 MB, the tool switches to a background worker. It reads the file off the main thread, converts it in one pass, and gives you a capped preview in the editor. The full result is always available as a download. Nothing is uploaded. Read the honest limits in our large-file guide →" },
    { q: "Is my CSV uploaded anywhere?", a: "No. Parsing and conversion run entirely in your browser (in a background worker for large tables). Your data never leaves your machine." },
    { q: "Can it handle large CSV files?", a: "Yes. Files above about 15 MB switch to a dedicated large-file mode: the file is read and converted in a background worker, you see a capped preview in the editor, and the full TSV is a one-click download. Nothing is uploaded. The only ceiling is your device's memory. See how large-file mode works →" },
    { q: "What happens to commas inside quoted fields?", a: "They're preserved. The parser reads quoted fields correctly, and since TSV uses tabs, the comma becomes ordinary text. The surrounding quotes are dropped." },
    { q: "Do ragged rows work?", a: "No. CSV → TSV needs a rectangular grid. Rows with a different number of fields fail with the exact line number instead of being silently padded or dropped, which would change your data." },
  ],
  "fake-json": [
    { q: "Is my template sent anywhere?", a: "No. Generation runs entirely in your browser. The template and the data it produces never leave your machine." },
    { q: "What does the seed do?", a: "It makes the output reproducible. Type any word and the same template + count + seed always yields the same records, handy for fixtures and CI. Leave it empty for fresh random data each time." },
    { q: "Why did my number come out as a string?", a: "It didn't, if the value was only the token. The unbox rule keeps \" as a number. If you write text around a token, like \"id- , the whole value is text, so you get a string." },
    { q: "Can I nest objects and arrays?", a: "Yes. The template is real JSON, so any structure works. Tokens expand wherever they appear, including inside nested objects and arrays. For a variable-length array, list the tokens you want; a repeat-count token is on the roadmap." },
  ],
  "hmac": [
    { q: "Is my message or key uploaded?", a: "No. The MAC is computed entirely in your browser using the native Web Crypto API. Nothing you enter leaves your machine." },
    { q: "What is HMAC, exactly?", a: "HMAC (Hash-based Message Authentication Code) is a hash computed with a secret key. It proves two things at once: the message hasn't been altered, and whoever produced it knew the key. Unlike a plain checksum, an attacker who doesn't know the key can't forge a matching MAC." },
    { q: "Why do I need a secret key?", a: "The key is what makes the MAC trustworthy. Anyone can compute SHA-256, but only parties who share the secret can produce or verify an HMAC. Keep the key secret. Treat it like a password, and never paste real production keys into any tool." },
    { q: "Which algorithm should I use?", a: "SHA-256 is the common default and matches most APIs and protocols. SHA-512 gives a larger 512-bit MAC and is a good choice for high-security or high-throughput setups. See the SHA-256 vs HMAC comparison ." },
    { q: "Is HMAC the same as a hash?", a: "Not quite. A plain hash like SHA-256 has no secret. Anyone can compute it, so it detects accidental corruption but not forgery. HMAC adds a key, so it also proves authenticity. For password storage specifically, use a slow, salted function like bcrypt instead." },
  ],
  "json-diff": [
    { q: "Is either document uploaded?", a: "No. The comparison runs entirely in your browser, in a background worker for large inputs. Neither side ever leaves your machine." },
    { q: "Why do some changed lines face each other?", a: "When a line is removed and another added in the same place, the diff pairs them onto one row so you can read the before/after at a glance, instead of scrolling a delete block against an insert block." },
    { q: "What does the similarity score mean?", a: "It's the share of lines that are identical on both sides, as a percentage of all lines involved. 100% means identical; 0% means nothing in common." },
  ],
  "json-formatter": [
    { q: "Is my JSON uploaded anywhere?", a: "No. Formatting happens entirely in your browser. Your data never leaves your machine." },
    { q: "What does \"sort keys\" do?", a: "It reorders every object's properties alphabetically for deterministic output, handy for diffing. Array element order is always preserved." },
    { q: "Can it validate JSON too?", a: "Yes. If the input isn't valid JSON, the status bar shows the parse error with its position. A dedicated JSON Validator with richer diagnostics ships in v1.2." },
    { q: "How do I make minified JSON readable?", a: "Paste the minified JSON here and click Format. To go the other way, from readable to compact, use the JSON Minifier." },
    { q: "Can I format JSON in Chrome without an extension?", a: "Yes. This tool runs entirely in your browser tab, so there is nothing to install and no extension permissions to grant. Just paste your JSON and format." },
    { q: "What is JSON mostly used for?", a: "JSON is the standard format for API responses, configuration files, database exports, and data interchange between frontend and backend systems." },
    { q: "Does formatting change my data?", a: "No. Only whitespace and line breaks change. Keys, values, and array order are preserved exactly." },
  ],
  "json-minifier": [
    { q: "Is my JSON uploaded anywhere?", a: "No. Minification runs entirely in your browser, in a background worker for large files. Your data never leaves your machine." },
    { q: "Does minifying change my data?", a: "Only the whitespace. Every key, value, number, and array order is preserved exactly. The optional \"sort keys\" reorders object properties alphabetically but never alters values." },
    { q: "When should I minify?", a: "When size matters more than readability: embedding JSON in a bundle, sending it over a slow link, or storing many records. For editing or debugging, the Formatter (beautifier) is the better tool; minified JSON is intentionally hard for humans to read." },
  ],
  "json-schema-validator": [
    { q: "Is my JSON uploaded anywhere?", a: "No. Validation runs entirely in your browser (in a background worker for large inputs). Neither your data nor your schema ever leaves your machine." },
    { q: "What does \"lite\" mean?", a: "A clearly-scoped subset of JSON Schema: types, required keys, additionalProperties, enum/const, numeric ranges, string lengths, and array/object size limits. Keywords we don't support yet are listed openly in the panel. We'd rather tell you what's out than pretend otherwise. The full validator (with $ref and combinators) is a planned v2.0 tool." },
    { q: "What happens to keywords you don't support?", a: "They're ignored, per the JSON Schema spec. Unknown keywords never fail validation. So a schema using $ref or anyOf won't error; it just won't enforce those parts. The coverage line above the button states exactly what's active." },
    { q: "Why don't you just use Ajv?", a: "Ajv is excellent but ~150KB gzipped, heavier than this entire site's philosophy allows for one tool. So the engine is hand-rolled on the same JSON grammar walker that powers the JSON Validator: zero dependencies, identical coordinates everywhere." },
  ],
  "json-to-csv": [
    { q: "Is my JSON data uploaded to a server?", a: "No. Everything runs locally in your browser. Your JSON is never sent to any server. The conversion happens 100% client-side using a Web Worker for large files." },
    { q: "What is the maximum file size?", a: "The tool accepts JSON inputs up to 15 million characters. For files above 500K characters, a preview is shown and the full content is used only when you click Convert. Files above 5M characters trigger a confirmation dialog before processing." },
    { q: "How does object flattening work?", a: "When flattening is enabled, nested objects are expanded using dot notation. For example, &#123;\"user\": &#123;\"name\": \"John\"&#125;&#125; becomes a column named user.name with value John . This ensures deeply nested JSON is represented as flat CSV columns." },
    { q: "Which delimiters are supported?", a: "You can choose between comma (,), semicolon (;), and tab (\\\\t) delimiters. The default is comma, which works with most spreadsheet applications like Excel and Google Sheets." },
    { q: "Can I cancel a running conversion?", a: "Yes. During conversion, a Cancel button appears beside Convert. Click it to stop the conversion. For large files using a Web Worker, cancellation also terminates the worker thread to free memory." },
    { q: "Does the tool work offline?", a: "After the initial page load, the tool works offline. There is no server-side dependency for the conversion logic. All processing is built into the JavaScript bundle." },
  ],
  "json-to-toml": [
    { q: "Is my JSON uploaded anywhere?", a: "No. Conversion runs entirely in your browser (in a background worker for large files). Your data never leaves your machine." },
    { q: "Why does a top-level array fail?", a: "TOML's root must be a table (an object). A top-level JSON array, or a bare string, number, or boolean, has nowhere to live, so we explain that instead of silently wrapping it in a made-up key." },
    { q: "What happens to null?", a: "TOML has no null value. By default we refuse and point at the exact path (like limits.timeout or tools[2] ); switch to \"Strip nulls\" to drop those keys/elements and convert anyway." },
    { q: "Do numbers stay exact?", a: "JSON's single number type maps to TOML integers and floats. Very large integers (beyond 2 53 ) can lose precision. That's a JSON limit, not a bug here." },
  ],
  "json-to-xml": [
    { q: "Is my JSON uploaded anywhere?", a: "No. Conversion runs entirely in your browser, in a background worker for large files. Your data never leaves your machine." },
    { q: "How are arrays represented?", a: "Each entry becomes its own element using the \"Array item tag\" (default item ), wrapped in the array's key. So \"tags\": [\"a\",\"b\"] becomes <tags><item>a</item><item>b</item></tags> ." },
    { q: "Will it round-trip back to identical JSON?", a: "Not always, and we don't pretend otherwise. XML has no native notion of null vs an empty string, or of a number vs the text of that number, so some type information is lost on the way to XML. The mapping is designed to be readable and reversible where it can be." },
  ],
  "json-to-yaml": [
    { q: "Is my JSON uploaded anywhere?", a: "No. Conversion runs entirely in your browser (in a background worker for large files). Your data never leaves your machine." },
    { q: "How are strings handled?", a: "Strings are quoted when they contain special characters, start/end with spaces, or are empty. Otherwise they are left unquoted for readability." },
    { q: "Does it preserve array order?", a: "Yes. Arrays are always output in the order they appear in the JSON. Only object keys can be sorted (optionally)." },
    { q: "What about null values?", a: "Null is output as null in YAML, which is the standard representation." },
  ],
  "json-validator": [
    { q: "Is my JSON uploaded anywhere?", a: "No. Validation runs entirely in your browser (in a background worker for large files). Your data never leaves your machine." },
    { q: "Why are duplicate keys only a warning?", a: "The JSON specification permits repeated keys, and JSON.parse silently keeps the last value. That is usually a bug. We flag them so you can decide, rather than rejecting valid input." },
    { q: "How exact are the line and column numbers?", a: "Exact, and identical in every browser. The validator walks the JSON grammar itself rather than reading an error string, so the coordinates never depend on the engine's message format." },
  ],
  "jwt-decoder": [
    { q: "Does this verify my token's signature?", a: "No, and it can't. Verification needs the signing key (a secret or a public key), which only the issuer holds. This tool decodes the visible parts and tells you plainly that the signature was not checked. Anyone who warns you otherwise is guessing." },
    { q: "Is my token uploaded anywhere?", a: "No. Decoding is base64url + JSON.parse, done entirely in your browser. Tokens are credentials. Pasting one into a site that uploads it is how they get stolen. This one has no network path for it to travel." },
    { q: "What does \"expired\" mean here?", a: "It's a time fact, not a signature fact. If the exp claim is in the past, the token is expired by its own terms. But that says nothing about whether it was ever legitimately signed." },
    { q: "What about alg: \"none\" ?", a: "A token with alg: \"none\" and no signature is unsigned. Anyone could have created it. The decoder calls this out loudly. Servers that accept such tokens have a serious vulnerability." },
  ],
  "md5": [
    { q: "Is MD5 secure?", a: "No. MD5 has known collision attacks since 2004. Attackers can craft two different inputs with the same checksum. It's fine for legacy compatibility, dedup keys, or non-security checksums, but never for passwords, signatures, or integrity that must resist tampering. Use SHA-256 or SHA-512 instead." },
    { q: "Can I reverse or \"decrypt\" an MD5 hash?", a: "No. MD5 is one-way. What you see online are rainbow tables or dictionary lookups, which only match known inputs. Two different inputs can also share an MD5, so a match never proves the original text." },
    { q: "Why is MD5 still around?", a: "Legacy systems, old checksum conventions, and non-security dedup still reference it. This tool exists for those cases. It's not an endorsement." },
    { q: "Is my text uploaded?", a: "No. The hashing happens entirely in your browser with a local implementation. Nothing is sent anywhere." },
  ],
  "regex-tester": [
    { q: "Is my text uploaded anywhere?", a: "No. Matching runs entirely in your browser using the native RegExp engine. Your pattern and text never leave your machine." },
    { q: "Which regex flavor is this?", a: "JavaScript (ECMAScript) regular expressions, the same engine your browser runs. Lookbehind, named groups, and the u / s flags are all supported." },
    { q: "Can a pattern freeze the tab?", a: "A pathological pattern with nested quantifiers can backtrack heavily (this is true of any regex engine). The test string is capped at 500k characters to bound the work; if a match seems to hang, simplify the pattern." },
    { q: "What do the replace tokens mean?", a: "$1 … $9 insert capture groups, $& inserts the whole match, and $$ inserts a literal dollar sign. That's standard JavaScript replace syntax." },
  ],
  "sha-256": [
    { q: "Is my text uploaded?", a: "No. The hashing happens entirely in your browser using the native Web Crypto API." },
    { q: "Can I use this for passwords?", a: "SHA-256 is too fast for password storage. Use a deliberately slow, salted function like bcrypt instead." },
    { q: "Which encoding should I use?", a: "Hex is standard for checksums and APIs. Base64 is more compact for URLs or tokens." },
  ],
  "sha-512": [
    { q: "Is my text uploaded?", a: "No. The hashing happens entirely in your browser using the native Web Crypto API." },
    { q: "How is SHA-512 different from SHA-256?", a: "Both belong to the SHA-2 family. SHA-512 produces a 512-bit digest (128 hex chars) vs SHA-256's 256 bits (64 hex chars), and uses 64-bit word operations, which is why it's the natural choice on 64-bit platforms. See the SHA-256 vs SHA-512 comparison ." },
    { q: "Can I use this for passwords?", a: "SHA-512 is too fast for password storage. Use a deliberately slow, salted function like bcrypt instead." },
  ],
  "text-diff": [
    { q: "Is either text uploaded?", a: "No. The comparison runs entirely in your browser, in a background worker for large inputs. Neither side ever leaves your machine." },
    { q: "What kind of text can I compare?", a: "Any text: log files, config files, code, markdown, environment files, SQL, CSV. The diff works line by line, so it doesn't matter what the text is . If you're comparing two JSON documents, the dedicated JSON Diff tool has the same engine with JSON framing." },
    { q: "Why do some changed lines face each other?", a: "When a line is removed and another added in the same place, the diff pairs them onto one row so you can read the before/after at a glance, instead of scrolling a delete block against an insert block." },
    { q: "What does the similarity score mean?", a: "It's the share of lines that are identical on both sides, as a percentage of all lines involved. 100% means identical; 0% means nothing in common." },
  ],
  "timestamp-converter": [
    { q: "Is my timestamp sent anywhere?", a: "No. All conversion runs entirely in your browser with the native Date engine. Nothing you paste leaves your machine." },
    { q: "Which unit should I pick?", a: "If the number is 10 digits long, it's seconds. 13 digits → milliseconds. 16 digits → microseconds. 19 digits → nanoseconds. When in doubt, try seconds first. The readout makes it obvious if the value looks wrong." },
    { q: "Why does the date look off by an hour?", a: "A timestamp is an absolute instant; the same instant reads differently in UTC and in your local timezone. The readout shows both, side by side, so the \"off by an hour\" is just your zone's offset, not a bug." },
    { q: "What date formats can I paste?", a: "Local ISO like 2026-08-05T12:00:00 (treated as your local time), UTC ISO ending in Z , RFC/HTTP dates like Wed, 05 Aug 2026 12:00:00 GMT , and bare dates like 2026-08-05 (local midnight)." },
  ],
  "toml-to-json": [
    { q: "Is my TOML uploaded anywhere?", a: "No. Parsing runs entirely in your browser (in a background worker for large files). Your config never leaves your machine." },
    { q: "What happens to dates and comments?", a: "TOML datetimes become ISO-8601 strings (JSON has no date type), and comments are dropped because JSON has nowhere to keep them. Tables become nested objects." },
    { q: "Do integers stay integers?", a: "JSON has one number type, so TOML's integer/float distinction flattens into numbers. Very large integers (beyond 2 53 ) can lose precision. That's a JSON limit, not a bug here. inf and nan become null ." },
    { q: "What about duplicate keys?", a: "The TOML spec forbids them, and the parser refuses rather than silently keeping one. You'll get an exact line and column so you can fix it." },
  ],
  "tsv-to-csv": [
    { q: "How does the large-file mode work?", a: "If you drop a file larger than 15 MB, the tool switches to a background worker. It reads the file off the main thread, converts it in one pass, and gives you a capped preview in the editor. The full result is always available as a download. Nothing is uploaded. Read the honest limits in our large-file guide →" },
    { q: "Is my TSV uploaded anywhere?", a: "No. Parsing and conversion run entirely in your browser (in a background worker for large tables). Your data never leaves your machine." },
    { q: "Can it handle large TSV files?", a: "Yes. Files above about 15 MB switch to a dedicated large-file mode: the file is read and converted in a background worker, you see a capped preview in the editor, and the full CSV is a one-click download. Nothing is uploaded. The only ceiling is your device's memory. See how large-file mode works →" },
    { q: "What happens to a field that contains a comma?", a: "It's preserved and quoted. In TSV a comma is ordinary data; in CSV it's the delimiter, so the converter wraps that field in double quotes to keep it one cell." },
    { q: "Is this conversion lossless?", a: "Yes. CSV quoting can represent commas, double quotes, and even embedded newlines, so nothing from a valid TSV is dropped or refused. (The reverse, CSV → TSV, is the lossy direction, and that tool says so.)" },
    { q: "Do ragged rows work?", a: "No. TSV → CSV needs a rectangular grid. Rows with a different number of fields fail with the exact line number instead of being silently padded or dropped, which would change your data." },
  ],
  "uuid-generator": [
    { q: "Which version should I use?", a: "For an opaque id, v4. For a primary key you'll sort or insert in order, v7, whose time prefix keeps inserts sequential. For a stable id derived from a name (a URL, a DNS name), v5." },
    { q: "Are these generated on a server?", a: "No. Every UUID is produced in your browser using the platform's cryptographic RNG (and SHA-1 for v5). Nothing you generate is transmitted or stored." },
    { q: "Why aren't v1 UUIDs sortable as strings?", a: "v1 stores the low 32 bits of the timestamp first, so the string order doesn't follow time. That limitation is exactly what v7 was designed to fix: it puts the most-significant time bits at the front." },
    { q: "What does \"deterministic\" mean for v5?", a: "The same namespace + name always hashes to the same UUID, on any machine. Generating a batch appends an index to the name so you get distinct ids; remove the index logic and you'd get the same id repeated." },
  ],
  "xml-to-json": [
    { q: "Is my XML uploaded anywhere?", a: "No. Conversion runs entirely in your browser (in a background worker). Your data never leaves your machine." },
    { q: "How are XML attributes handled?", a: "Attributes are prefixed with @ in the JSON output (e.g., \"@id\": \"1\" ). You can toggle them on/off." },
    { q: "What about CDATA and comments?", a: "CDATA is treated as text. Comments, processing instructions, and DOCTYPE declarations are skipped for clean output." },
    { q: "Why are arrays sometimes single objects?", a: "If \"Preserve arrays\" is off, a single child becomes an object. Turn it on to always get arrays for repeated tags." },
  ],
  "yaml-to-json": [
    { q: "Is my YAML uploaded anywhere?", a: "No. Parsing runs entirely in your browser (in a background worker for large files). Your config never leaves your machine." },
    { q: "Why does my file fail on tabs?", a: "YAML forbids tab characters for indentation. Spaces only. The error points to the exact line; replace the tabs with spaces and convert again." },
    { q: "What happens to duplicate keys?", a: "They fail the conversion with an exact line and column, on purpose. JSON output would have to silently keep only the last value. We'd rather point at the problem than drop your data without telling you." },
    { q: "What about comments, dates, and anchors?", a: "Comments are dropped (JSON has nowhere to keep them), YAML timestamps become ISO-8601 strings (JSON has no date type), and anchors / aliases ( &id / *id ) are resolved to their expanded values." },
    { q: "Which YAML version is supported?", a: "YAML 1.2 with the core schema, the modern spec, and the same parser the JSON → YAML tool uses, so a round trip stays consistent in both directions." },
  ],
  "sha-512": [
    {
      q: "Is my text uploaded?",
      a: "No. The hashing happens entirely in your browser using the native Web Crypto API.",
    },
    {
      q: "What is SHA-512?",
      a: "SHA-512 is a one-way cryptographic hash function that produces a 512-bit digest, usually shown as 128 hexadecimal characters. It is used for integrity checks, digital signatures, and high-security hashing.",
    },
    {
      q: "Can SHA-512 be decrypted?",
      a: "No. SHA-512 is one-way by design. The hash cannot be decrypted back to the original input. Weak inputs can still be discovered by guessing and hashing many candidates.",
    },
    {
      q: "Is SHA-512 secure?",
      a: "Yes, for hashing and integrity use. SHA-512 has no practical collision attack known. It is not fully quantum-proof, but it provides a large security margin. For passwords, use bcrypt instead.",
    },
    {
      q: "SHA-256 vs SHA-512: which should I use?",
      a: "Both are secure. SHA-256 is shorter and widely adopted. SHA-512 gives a longer digest and can be faster on 64-bit systems. Use SHA-512 when you want extra margin; use SHA-256 for compatibility.",
    },
    {
      q: "What is the output length of SHA-512?",
      a: "SHA-512 outputs 512 bits: 64 raw bytes, 128 hex characters, or about 88 Base64 characters.",
    },
    {
      q: "Can I use SHA-512 for passwords?",
      a: "No. SHA-512 is too fast for password storage. Use a slow password hash such as bcrypt with a unique salt.",
    },
  ],
};
