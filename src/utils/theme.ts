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
  scale: Record<number, string | undefined> | undefined,
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

const COLOR_VAR_MAP: Array<[keyof NonNullable<ThemeConfig["colors"]>, string]> = [
  ["background",    "--color-background"],
  ["surface",       "--color-surface"],
  ["border",        "--color-border"],
  ["textPrimary",   "--color-text-primary"],
  ["textSecondary", "--color-text-secondary"],
  ["textMuted",     "--color-text-muted"],
];

const DARK_NEUTRAL_DEFAULTS: Record<number, string> = {
  50:  "15 23 42",
  100: "30 41 59",
  200: "51 65 85",
  300: "71 85 105",
  500: "148 163 184",
  600: "203 213 225",
  700: "226 232 240",
  800: "241 245 249",
  900: "248 250 252",
};

export function buildThemeVars(theme: ThemeConfig): Record<string, string> {
  const vars: Record<string, string> = {};

  if (theme.mode === "dark") {
    // Apply inverted neutral scale as defaults — user's theme.neutral overrides these
    for (const [shade, value] of Object.entries(DARK_NEUTRAL_DEFAULTS)) {
      vars[`--color-neutral-${shade}`] = value;
    }

    if (theme.colors) {
      for (const [key, cssVar] of COLOR_VAR_MAP) {
        const value = theme.colors[key];
        if (value) vars[cssVar] = hexToRgbChannels(value);
      }
    }
  }

  buildColorScaleVars(theme.primary,   "primary",   vars);
  buildColorScaleVars(theme.secondary, "secondary", vars);
  buildColorScaleVars(theme.neutral,   "neutral",   vars); // explicit overrides win

  return vars;
}
