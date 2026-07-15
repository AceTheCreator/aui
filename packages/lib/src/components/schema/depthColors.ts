// Colors for nested levels (depth 0 is always grey).
const DEPTH_PALETTE = [
  { line: "border-teal-500", text: "text-teal-600" },
  { line: "border-green-500", text: "text-green-600" },
  { line: "border-lime-500", text: "text-lime-600" },
  { line: "border-blue-500", text: "text-blue-600" },
  { line: "border-cyan-500", text: "text-cyan-600" },
  { line: "border-violet-500", text: "text-violet-600" },
] as const;

/** Returns line/text Tailwind classes; nested levels cycle the palette. */
export const getDepthColors = (depth: number) => {
  return DEPTH_PALETTE[depth % DEPTH_PALETTE.length];
};
