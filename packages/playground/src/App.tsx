import { useCallback, useRef, useState } from 'react'
import { AsyncAPI } from 'aui'
import 'aui/style.css'
import exampleDoc from './example.json'

const DEFAULT_TEXT = JSON.stringify(exampleDoc, null, 2)
const MIN_PANE_PERCENT = 20

export default function App() {
  const [text, setText] = useState(DEFAULT_TEXT)
  const [doc, setDoc] = useState<object>(exampleDoc)
  const [error, setError] = useState<string | null>(null)
  const [leftWidth, setLeftWidth] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value)
    try {
      setDoc(JSON.parse(e.target.value))
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return
    const { left, width } = containerRef.current.getBoundingClientRect()
    const percent = ((e.clientX - left) / width) * 100
    const clamped = Math.min(Math.max(percent, MIN_PANE_PERCENT), 100 - MIN_PANE_PERCENT)
    setLeftWidth(clamped)
  }, [])

  const stopDragging = useCallback(() => {
    isDraggingRef.current = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', stopDragging)
  }, [handlePointerMove])

  const startDragging = useCallback(() => {
    isDraggingRef.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', stopDragging)
  }, [handlePointerMove, stopDragging])

  return (
    <div ref={containerRef} style={{ display: 'flex', height: '100vh' }}>
      <div style={{ display: 'flex', flexDirection: 'column', width: `${leftWidth}%` }}>
        <textarea
          style={{ flex: 1, padding: '1rem', fontFamily: 'monospace', fontSize: '0.875rem', resize: 'none', outline: 'none', background: '#030712', color: '#f3f4f6' }}
          value={text}
          onChange={handleChange}
          spellCheck={false}
        />
        {error && (
          <div style={{ padding: '0.5rem 1rem', color: '#dc2626', background: '#fef2f2', borderTop: '1px solid #fecaca', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}
      </div>
      <div
        onPointerDown={startDragging}
        style={{
          width: '5px',
          cursor: 'col-resize',
          background: '#e5e7eb',
          flexShrink: 0,
        }}
      />
      <div style={{ width: `${100 - leftWidth}%`, overflow: 'auto' }}>
        {!error && <AsyncAPI asyncapi={doc as any} />}
      </div>
    </div>
  )
}
