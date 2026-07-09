export type UiMode = 'light' | 'dark'

export interface UiPalette {
  chromeBg: string
  chromeBorder: string
  textPrimary: string
  textMuted: string
  hoverText: string
  activeIndicator: string
  focusRing: string
  errorBg: string
  errorBorder: string
  errorText: string
  warningText: string
  handleBg: string
  handleBgHover: string
  scrollbarTrack: string
  scrollbarThumb: string
  scrollbarThumbHover: string
}

export const UI_PALETTES: Record<UiMode, UiPalette> = {
  dark: {
    chromeBg: '#030712',
    chromeBorder: '#1f2937',
    textPrimary: '#f9fafb',
    textMuted: '#6b7280',
    hoverText: '#e5e7eb',
    activeIndicator: '#1f2937',
    focusRing: '#3b82f6',
    errorBg: '#450a0a',
    errorBorder: '#7f1d1d',
    errorText: '#fca5a5',
    warningText: '#fbbf24',
    handleBg: '#1f2937',
    handleBgHover: '#374151',
    scrollbarTrack: '#030712',
    scrollbarThumb: '#374151',
    scrollbarThumbHover: '#4b5563',
  },
  light: {
    chromeBg: '#ffffff',
    chromeBorder: '#e5e7eb',
    textPrimary: '#111827',
    textMuted: '#6b7280',
    hoverText: '#111827',
    activeIndicator: '#e5e7eb',
    focusRing: '#3b82f6',
    errorBg: '#fef2f2',
    errorBorder: '#fecaca',
    errorText: '#dc2626',
    warningText: '#b45309',
    handleBg: '#e5e7eb',
    handleBgHover: '#d1d5db',
    scrollbarTrack: '#f9fafb',
    scrollbarThumb: '#d1d5db',
    scrollbarThumbHover: '#9ca3af',
  },
}

/** CSS text for a themed scrollbar (standard `scrollbar-*` props + WebKit pseudo-elements) on the given selector. */
export function scrollbarStyle(selector: string, palette: UiPalette): string {
  return `
    ${selector} {
      scrollbar-color: ${palette.scrollbarThumb} ${palette.scrollbarTrack};
      scrollbar-width: thin;
    }
    ${selector}::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }
    ${selector}::-webkit-scrollbar-track {
      background: ${palette.scrollbarTrack};
    }
    ${selector}::-webkit-scrollbar-thumb {
      background: ${palette.scrollbarThumb};
      border-radius: 6px;
      border: 2px solid ${palette.scrollbarTrack};
    }
    ${selector}::-webkit-scrollbar-thumb:hover {
      background: ${palette.scrollbarThumbHover};
    }
  `
}
