import { describe, expect, it } from "vitest";
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildJsonLd } from "../structured-data";
import { availableTools, tools } from "../../tools/registry";
import { FAQS } from "../../tools/faq";

const SITE = "https://freejsontoolkit.com/";
const opts = (pathname: string, title = "T", description = "D") => ({
    pathname,
    site: SITE,
    title,
    description,
});

type Node = Record<string, unknown>;
function node(o: object | null): Node {
    return (o ?? {}) as Node;
}
function child(n: Node, key: string): Node {
    const v = n[key];
    return v && typeof v === "object" ? (v as Node) : {};
}
function children(n: Node, key: string): Node[] {
    const v = n[key];
    return Array.isArray(v) ? (v as Node[]) : [];
}

describe("buildJsonLd — route mapping", () => {
    it("home → WebSite with publisher and SearchAction", () => {
        const s = node(buildJsonLd(opts("/")));
        expect(s["@type"]).toBe("WebSite");
        expect(s.name).toBe("Free JSON Toolkit");
        expect(child(s, "publisher")["@type"]).toBe("Organization");
        expect(child(s, "publisher").url).toBe("https://freejsontoolkit.com/");
        expect(child(s, "potentialAction").target).toBe("https://freejsontoolkit.com/?q={search_term_string}");
    });

    it("accepts an empty trailing-slash root", () => {
        expect(node(buildJsonLd(opts("")))["@type"]).toBe("WebSite");
    });

    it("tool page → WebApplication driven by the registry", () => {
        const tool = tools.find((t) => t.id === "json-formatter")!;
        const s = node(buildJsonLd(opts("/tools/json-formatter")));
        expect(s["@type"]).toBe("WebApplication");
        expect(s.name).toBe(tool.name);
        expect(s.description).toBe(tool.tagline);
        expect(s.keywords).toBe(tool.keywords!.join(", "));
        expect(s.applicationCategory).toBe("DeveloperApplication");
        expect(s.applicationSubCategory).toBeTruthy();
        expect(child(s, "offers").price).toBe("0");
        expect(child(s, "offers").url).toBe("https://freejsontoolkit.com/tools/json-formatter");
        expect(s.softwareVersion).toBe(tool.addedIn);
        expect(s.inLanguage).toBe("en");
    });

    it("trailing slash on the pathname matches the same tool", () => {
        const a = node(buildJsonLd(opts("/tools/json-formatter")));
        const b = node(buildJsonLd(opts("/tools/json-formatter/")));
        expect(a.name).toBe(b.name);
        expect(a.url).toBe("https://freejsontoolkit.com/tools/json-formatter");
    });

    it("/tools → CollectionPage listing every available tool", () => {
        const s = node(buildJsonLd(opts("/tools")));
        expect(s["@type"]).toBe("CollectionPage");
        const items = children(child(s, "hasPart"), "itemListElement");
        expect(items).toHaveLength(availableTools.length);
        expect(items[0].position).toBe(1);
        expect(items[0].name).toBe(availableTools[0].name);
    });

    it("/collections/<family> → CollectionPage filtered to that family", () => {
        const s = node(buildJsonLd(opts("/collections/json")));
        expect(s["@type"]).toBe("CollectionPage");
        const expected = availableTools.filter((t) => t.family === "json");
        const items = children(child(s, "hasPart"), "itemListElement");
        expect(items).toHaveLength(expected.length);
        expected.forEach((t, i) => {
            expect(items[i].url).toBe(`https://freejsontoolkit.com${t.href}`);
        });
    });

    it("unknown family slug falls through to a WebPage", () => {
        expect(node(buildJsonLd(opts("/collections/not-a-family")))["@type"]).toBe("WebPage");
    });

    it("about/contact get dedicated types", () => {
        expect(node(buildJsonLd(opts("/about")))["@type"]).toBe("AboutPage");
        expect(node(buildJsonLd(opts("/contact")))["@type"]).toBe("ContactPage");
    });

    it("compare, legal and utility pages → WebPage", () => {
        for (const p of ["/compare", "/compare/json-formatter-vs-json-minifier", "/privacy", "/terms", "/why-local", "/large-files", "/disclaimer"]) {
            expect(node(buildJsonLd(opts(p)))["@type"]).toBe("WebPage");
        }
    });

    it("/404 → no schema", () => {
        expect(buildJsonLd(opts("/404"))).toBeNull();
    });

    it("output round-trips through JSON.stringify (valid JSON-LD)", () => {
        for (const p of ["/", "/tools", "/tools/json-formatter", "/collections", "/collections/json", "/about", "/privacy", "/compare/x"]) {
            const s = buildJsonLd(opts(p))!;
            expect(() => JSON.parse(JSON.stringify(s))).not.toThrow();
        }
    });
});

describe("buildBreadcrumbJsonLd", () => {
    it("tool page → Home / Family / Tool matching the rendered trail", () => {
        const tool = tools.find((t) => t.id === "yaml-to-json")!;
        const s = node(buildBreadcrumbJsonLd({ pathname: "/tools/yaml-to-json", site: SITE }));
        expect(s["@type"]).toBe("BreadcrumbList");
        const items = children(s, "itemListElement");
        expect(items).toHaveLength(3);
        expect(items[0]).toMatchObject({ position: 1, name: "Home", item: "https://freejsontoolkit.com/" });
        expect(items[1].name).toBeTruthy();
        expect(items[1].item).toBe(`https://freejsontoolkit.com/collections/${tool.family}`);
        expect(items[2]).toMatchObject({ position: 3, name: tool.name, item: `https://freejsontoolkit.com${tool.href}` });
    });

    it("non-tool routes → null", () => {
        expect(buildBreadcrumbJsonLd({ pathname: "/", site: SITE })).toBeNull();
        expect(buildBreadcrumbJsonLd({ pathname: "/about", site: SITE })).toBeNull();
        expect(buildBreadcrumbJsonLd({ pathname: "/tools", site: SITE })).toBeNull();
    });
});

describe("buildFaqJsonLd", () => {
    it("home → FAQPage with the 4 homepage questions", () => {
        const s = node(buildFaqJsonLd({ pathname: "/", site: SITE }));
        expect(s["@type"]).toBe("FAQPage");
        const main = children(s, "mainEntity");
        expect(main).toHaveLength(FAQS.home.length);
        expect(main[0].name).toBe(FAQS.home[0].q);
        expect(child(main[0] as Node, "acceptedAnswer").text).toBe(FAQS.home[0].a);
    });

    it("tool page → FAQPage matching its faq.ts entry", () => {
        const s = node(buildFaqJsonLd({ pathname: "/tools/yaml-to-json", site: SITE }));
        expect(s["@type"]).toBe("FAQPage");
        expect(children(s, "mainEntity")).toHaveLength(FAQS["yaml-to-json"].length);
    });

    it("tool with a FAQ added later (url-codec) → FAQPage matching its faq.ts entry", () => {
        const s = node(buildFaqJsonLd({ pathname: "/tools/url-codec", site: SITE }));
        expect(s["@type"]).toBe("FAQPage");
        expect(children(s, "mainEntity")).toHaveLength(FAQS["url-encode"].length);
    });

    it("non-tool routes → null", () => {
        expect(buildFaqJsonLd({ pathname: "/privacy", site: SITE })).toBeNull();
        expect(buildFaqJsonLd({ pathname: "/about", site: SITE })).toBeNull();
    });

    it("every faq.ts key maps to a live, available route", () => {
        for (const key of Object.keys(FAQS)) {
            if (key === "home") continue;
            const tool = tools.find((t) => t.id === key);
            expect(tool, `faq key "${key}" should exist in the registry`).toBeTruthy();
            expect(tool!.status).toBe("available");
        }
    });
});