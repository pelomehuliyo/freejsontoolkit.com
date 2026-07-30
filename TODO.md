# CodeEditor Fix Plan

## ✅ Step 1: Fix CodeEditor.astro

- [x] Fix `updateGutter()` virtualization math (derive lineHeight, calculate firstVisibleLine from scrollTop)
- [x] Replace scroll handler `syncScroll()` with `updateGutter()` call
- [x] Remove `textarea.__updateGutter` external hook
- [x] Remove console.log statements
- [x] Clean up paste handler

## ✅ Step 2: Fix json-to-csv.astro

- [x] Remove `triggerGutter()` function and all calls
- [x] Remove `resetTextarea()` function and all calls
- [x] Fix store subscription: only assign value when different, no side effects

## ✅ Complete
