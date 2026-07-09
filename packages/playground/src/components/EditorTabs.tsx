import { useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import type { UiPalette } from '../theme'

export type EditorTab = 'doc' | 'config'

interface TabDescriptor {
  id: EditorTab
  label: string
  hasError: boolean
}

interface EditorTabsProps {
  tabs: TabDescriptor[]
  activeTab: EditorTab
  onChange: (tab: EditorTab) => void
  palette: UiPalette
  trailing?: ReactNode
}

const TAB_ICONS: Record<EditorTab, ReactNode> = {
  doc: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M9 13h6M9 17h6" />
    </svg>
  ),
  config: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  ),
}

export function EditorTabs({ tabs, activeTab, onChange, palette, trailing }: EditorTabsProps) {
  const buttonRefs = useRef<Map<EditorTab, HTMLButtonElement>>(new Map())
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null)

  useLayoutEffect(() => {
    const el = buttonRefs.current.get(activeTab)
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth })
  }, [activeTab, tabs.length])

  const focusTab = (id: EditorTab) => {
    onChange(id)
    buttonRefs.current.get(id)?.focus()
  }

  // Roving-tabindex arrow key navigation per the WAI-ARIA tabs pattern.
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowLeft': {
        e.preventDefault()
        const delta = e.key === 'ArrowRight' ? 1 : -1
        const next = tabs[(index + delta + tabs.length) % tabs.length]
        focusTab(next.id)
        break
      }
      case 'Home':
        e.preventDefault()
        focusTab(tabs[0].id)
        break
      case 'End':
        e.preventDefault()
        focusTab(tabs[tabs.length - 1].id)
        break
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${palette.chromeBorder}`,
        background: palette.chromeBg,
        flexShrink: 0,
        transition: 'background 150ms ease, border-color 150ms ease',
      }}
    >
      <div role="tablist" aria-label="Editor source" style={{ position: 'relative', display: 'flex', gap: '2px', padding: '6px' }}>
        <style>{`
          .playground-editor-tab:hover {
            color: ${palette.hoverText};
          }
          .playground-editor-tab[aria-selected="true"] {
            color: ${palette.textPrimary};
          }
          .playground-editor-tab:focus-visible {
            outline: 2px solid ${palette.focusRing};
            outline-offset: -2px;
          }
        `}</style>

        {indicator && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: '6px',
              bottom: '6px',
              left: indicator.left,
              width: indicator.width,
              background: palette.activeIndicator,
              borderRadius: '6px',
              transition: 'left 200ms cubic-bezier(0.4, 0, 0.2, 1), width 200ms cubic-bezier(0.4, 0, 0.2, 1), background 150ms ease',
            }}
          />
        )}

        {tabs.map(({ id, label, hasError }, index) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              ref={(el) => {
                if (el) buttonRefs.current.set(id, el)
                else buttonRefs.current.delete(id)
              }}
              type="button"
              role="tab"
              id={`tab-${id}`}
              aria-controls={`panel-${id}`}
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="playground-editor-tab"
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.75rem',
                fontSize: '0.8125rem',
                fontWeight: 500,
                fontFamily: 'inherit',
                letterSpacing: '0.01em',
                border: 'none',
                borderRadius: '6px',
                background: 'transparent',
                color: isActive ? palette.textPrimary : palette.textMuted,
                cursor: 'pointer',
                transition: 'color 150ms ease',
              }}
            >
              {TAB_ICONS[id]}
              {label}
              {hasError && (
                <span
                  aria-label="has errors"
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#f87171',
                    boxShadow: `0 0 0 3px rgba(248, 113, 113, 0.2), 0 0 0 2px ${palette.chromeBg}`,
                  }}
                />
              )}
            </button>
          )
        })}
      </div>

      {trailing}
    </div>
  )
}
