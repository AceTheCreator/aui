import type { UiPalette } from '../theme'

interface ViewToggleProps {
  expanded: boolean
  palette: UiPalette
  onChange: (expanded: boolean) => void
}

export function ViewToggle({ expanded, palette, onChange }: ViewToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!expanded)}
      aria-label={expanded ? 'Hide editor and show full-width docs' : 'Show editor'}
      aria-pressed={expanded}
      title={expanded ? 'Hide editor and show full-width docs' : 'Show editor'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        border: `1px solid ${palette.chromeBorder}`,
        borderRadius: '6px',
        background: 'transparent',
        color: palette.textMuted,
        cursor: 'pointer',
      }}
    >
      {expanded ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>
      )}
    </button>
  )
}
