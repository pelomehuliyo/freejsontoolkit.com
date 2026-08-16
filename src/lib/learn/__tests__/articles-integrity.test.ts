import { describe, it, expect } from "vitest";
import { ARTICLES, getArticle } from "../../learn/articles";
import { tools } from "../../tools/registry";
import { COMPARISONS } from "../../tools/comparisons";

const EM = "\u2014";

describe("Learn articles integrity", () => {
  it("slugs are unique and resolvable", () => {
    const slugs = ARTICLES.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(getArticle(s)).toBeDefined();
  });

  it("toolId and relatedToolIds exist in the registry", () => {
    const ids = new Set(tools.map((t) => t.id));
    for (const a of ARTICLES) {
      expect(ids.has(a.toolId), `${a.slug}: toolId ${a.toolId}`).toBe(true);
      for (const r of a.relatedToolIds) {
        expect(ids.has(r), `${a.slug}: related ${r}`).toBe(true);
      }
    }
  });

  it("comparisonSlugs exist in COMPARISONS", () => {
    const comps = new Set(Object.values(COMPARISONS).map((c) => c.slug));
    for (const a of ARTICLES) {
      for (const c of a.comparisonSlugs) {
        expect(comps.has(c), `${a.slug}: comparison ${c}`).toBe(true);
      }
    }
  });

  it("user-facing article copy avoids em dashes", () => {
    const strings: string[] = [];
    for (const a of ARTICLES) {
      strings.push(a.title, a.description, a.heroQuestion, a.shortAnswer, a.eyebrow);
      for (const s of a.sections) {
        strings.push(s.heading, s.body, ...(s.list ?? []));
      }
      for (const f of a.faq) strings.push(f.q, f.a);
    }
    for (const s of strings) {
      expect(s.includes(EM), `em dash in: ${s.slice(0, 60)}`).toBe(false);
    }
  });
});
