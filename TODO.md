# TODO — Regex Tester "try it" docs interception

- [x] Explore regex-tester.astro, docs.ts, ToolDocs.astro, actions.ts, store.ts, CodeEditor.astro
- [x] Confirm the fjt:docs-load contract and that all referenced symbols are in scope
- [x] Insert the fjt:docs-load intercept block after `initAnnounce("regex-announce");` in regex-tester.astro
- [ ] Verify (optional) with `npm run dev` that "try it" fills both inputs and lights up matches
