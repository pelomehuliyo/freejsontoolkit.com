/**
 * Authors — Person entities for E-E-A-T.
 *
 * Single human author for Learn articles and trust pages. Using a Person
 * (not Organization-only) satisfies Google SQRG E-E-A-T for YMYL-adjacent
 * hashing/password advice (is-bcrypt-secure, is-sha-512-secure, what-is-hmac).
 * Keep sameAs live — rater checks links resolve.
 */

export interface AuthorPerson {
  name: string;
  jobTitle: string;
  image: string;
  sameAs: string[];
  url: string;
}

export const AUTHOR: AuthorPerson = {
  name: "Mehul",
  jobTitle: "Full-stack engineer, 5yr local-first tools",
  // Photo served from /public — add file at public/authors/mehul.jpg (512x512)
  image: "/authors/mehul.jpg",
  sameAs: [
    "https://github.com/pelomehuliyo",
    "https://www.linkedin.com/in/mehul-pelo",
  ],
  url: "https://www.freejsontoolkit.com/about#author",
};

/** Map LearnArticle.publishedIn (v1.8 etc.) to a real ISO date for JSON-LD + sitemap lastmod */
export const PUBLISHED_IN_DATES: Record<string, string> = {
  "v1.8": "2026-03-15",
  "v1.9": "2026-05-20",
  "v1.10": "2026-07-30",
  "v1.11": "2026-08-31",
};

export function dateForPublishedIn(publishedIn: string): string {
  return PUBLISHED_IN_DATES[publishedIn] ?? "2026-08-31";
}

/** Primary site-wide lastModified — also used for About/Why-local */
export const SITE_LAST_MODIFIED = "2026-08-31";
