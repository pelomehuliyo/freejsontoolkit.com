## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Copy & Content

### Tool header contract

Every tool page header (`ToolHeader` in `src/components/tools/ToolHeader.astro`)
has exactly three parts: **breadcrumbs**, **title**, **subtitle**. No tool page
may ship without all three.

**Breadcrumbs** — Standard pattern is `Home → Tool Name`, e.g.
`[{ label: "Home", href: "/" }, { label: "JSON Formatter" }]`. If a tool
belongs to a collection and the design already supports collection
breadcrumbs, keep that consistent. Never invent a third breadcrumb style.

**Subtitle** — One clear sentence explaining what the tool does. Rules:

- One sentence, plain and factual. No marketing fluff.
- No privacy claims. The privacy notice rendered inside `ToolHeader` owns
  that — never repeat "offline", "100% local", "without leaving your
  browser", or "never uploaded" in the subtitle.

Good tone:

> Unix time to a human date, and any date back to Unix time — in seconds, ms, µs or ns.

Avoid:

> The best free online timestamp tool with blazing fast conversion.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
