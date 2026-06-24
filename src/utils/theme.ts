import { ThemeConfig } from "../config/config";
import { SHADES } from "../contants";

function hexToRgbChannels(hex: string): string {
  const clean = hex.replace("#", "").padEnd(6, "0");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);

  return `${r} ${g} ${b}`;
}

function buildColorScaleVars(
  scale: Record<number, string> | undefined,
  prefix: string,
  vars: Record<string, string>,
) {
  if (!scale) return;

  for (const shade of SHADES) {
    const value = scale[shade];

    if (value) {
      vars[`--color-${prefix}-${shade}`] = hexToRgbChannels(value);
    }
  }
}

export function buildThemeVars(theme: ThemeConfig): Record<string, string> {
  const vars: Record<string, string> = {};

  buildColorScaleVars(theme.primary, "primary", vars);
  buildColorScaleVars(theme.indigo, "secondary", vars);
  buildColorScaleVars(theme.neutral, "neutral", vars);

  return vars;
}
