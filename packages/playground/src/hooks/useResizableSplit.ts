import { useCallback, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'

interface UseResizableSplitOptions {
  initialPercent?: number
  minPercent?: number
  maxPercent?: number
}

const DEFAULT_MIN_PERCENT = 20

export function useResizableSplit({
  initialPercent = 50,
  minPercent = DEFAULT_MIN_PERCENT,
  maxPercent = 100 - DEFAULT_MIN_PERCENT,
}: UseResizableSplitOptions = {}) {
  const [splitPercent, setSplitPercent] = useState(initialPercent)
  const containerRef = useRef<HTMLDivElement>(null)

  const updateFromClientX = useCallback(
    (clientX: number) => {
      const container = containerRef.current
      if (!container) return
      const { left, width } = container.getBoundingClientRect()
      if (width === 0) return
      const percent = ((clientX - left) / width) * 100
      setSplitPercent(Math.min(Math.max(percent, minPercent), maxPercent))
    },
    [minPercent, maxPercent],
  )

  // Uses pointer capture on the handle itself rather than window listeners, so the
  // drag survives the cursor leaving the handle/viewport and is automatically torn
  // down if the handle unmounts mid-drag — no manual cleanup/leak risk.
  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      e.preventDefault()
      const handle = e.currentTarget
      handle.setPointerCapture(e.pointerId)

      const previousCursor = document.body.style.cursor
      const previousUserSelect = document.body.style.userSelect
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      const handleMove = (ev: PointerEvent) => updateFromClientX(ev.clientX)
      const handleUp = () => {
        document.body.style.cursor = previousCursor
        document.body.style.userSelect = previousUserSelect
        handle.removeEventListener('pointermove', handleMove)
        handle.removeEventListener('pointerup', handleUp)
        handle.removeEventListener('pointercancel', handleUp)
      }

      handle.addEventListener('pointermove', handleMove)
      handle.addEventListener('pointerup', handleUp)
      handle.addEventListener('pointercancel', handleUp)
    },
    [updateFromClientX],
  )

  const nudge = useCallback(
    (deltaPercent: number) => {
      setSplitPercent((current) => Math.min(Math.max(current + deltaPercent, minPercent), maxPercent))
    },
    [minPercent, maxPercent],
  )

  return { containerRef, splitPercent, handlePointerDown, nudge }
}
