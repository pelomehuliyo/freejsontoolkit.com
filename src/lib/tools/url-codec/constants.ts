import type { UrlEncoding, UrlMode } from "./types";

export const MODES: { id: UrlMode; label: string }[] = [
  { id: "encode", label: "Encode" },
  { id: "decode", label: "Decode" },
];

export const ENCODINGS: { id: UrlEncoding; label: string }[] = [
  { id: "component", label: "Component" },
  { id: "whole", label: "Whole URL" },
  { id: "form", label: "Form" },
];

// A representative mix: spaces, a reserved-laden URL, non-ASCII, and an emoji,
// so encoding it lights up the footprint in every interesting way at once.
export const SAMPLE_TEXT =
  "name=Ada Lovelace&query=hello world&emoji=🚀&home=https://example.com/a?b=c#top";

export const MAX_INPUT_CHARS = 2_000_000;
// Live (as-you-type) recompute stops above this so big pastes never hitch the
// editor; past it the user presses the button explicitly.
export const AUTO_THRESHOLD = 300_000;

// Cap the rendered footprint so a huge input can't build a massive DOM.
export const FOOT_CAP = 4000;
