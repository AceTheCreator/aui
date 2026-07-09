import type { KeyboardEvent, PointerEvent } from 'react'
import type { UiPalette } from '../theme'

interface ResizeHandleProps {
  splitPercent: number
  onPointerDown: (e: PointerEvent<HTMLDivElement>) => void
  onNudge: (deltaPercent: number) => void
  palette: UiPalette
}

const KEYBOARD_STEP_PERCENT = 2

export function ResizeHandle({ splitPercent, onPointerDown, onNudge, palette }: ResizeHandleProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      onNudge(-KEYBOARD_STEP_PERCENT)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      onNudge(KEYBOARD_STEP_PERCENT)
    }
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-valuenow={Math.round(splitPercent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Resize preview and editor panes"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onKeyDown={handleKeyDown}
      className="playground-resize-handle"
      style={{
        width: '5px',
        cursor: 'col-resize',
        background: palette.handleBg,
        flexShrink: 0,
        transition: 'background 150ms ease',
      }}
    >
      <style>{`
        .playground-resize-handle:hover,
        .playground-resize-handle:focus-visible {
          background: ${palette.handleBgHover} !important;
        }
      `}</style>
    </div>
  )
}
