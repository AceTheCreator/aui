/**
 * Default line/label colors for nested schema tree levels, used when no
 * `config.theme.depthColors` is provided (or it's empty). Overridable via
 * config — see `getDepthColor` below, which cycles through whichever
 * palette (default or config-provided) it's given, at any length.
 */
export const DEFAULT_DEPTH_COLORS = [
  "#14b8a6", // teal-500
  "#22c55e", // green-500
  "#84cc16", // lime-500
  "#3b82f6", // blue-500
  "#06b6d4", // cyan-500
  "#8b5cf6", // violet-500
];

/** Resolves the color for a given depth, cycling through `palette` (any length). */
export const getDepthColor = (depth: number, palette: string[]): string => {
  const colors = palette.length > 0 ? palette : DEFAULT_DEPTH_COLORS;
  // Safe modulo — depth can be negative for content whose own row is suppressed
  // (e.g. a tree's root row), so `%` alone could index before the array start.
  const index = ((depth % colors.length) + colors.length) % colors.length;
  return colors[index];
};
