import { useCallback, useRef, useState } from 'react'
import { AsyncAPI, defaultConfig } from 'aui'
import type { ConfigInterface } from 'aui'
import 'aui/style.css'
// import exampleDoc from './example.json'
import exampleDoc from './torture.json'

const DEFAULT_DOC_TEXT = JSON.stringify(exampleDoc, null, 2)
const DEFAULT_CONFIG_TEXT = JSON.stringify(defaultConfig, null, 2)
const MIN_PANE_PERCENT = 20

type Tab = 'doc' | 'config'

function EditorPane({
  value,
  onChange,
  error,
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  error: string | null
}) {
  return (
    <>
      <textarea
        style={{ flex: 1, padding: '1rem', fontFamily: 'monospace', fontSize: '0.875rem', resize: 'none', outline: 'none', background: '#030712', color: '#f3f4f6' }}
        value={value}
        onChange={onChange}
        spellCheck={false}
      />
      {error && (
        <div style={{ padding: '0.5rem 1rem', color: '#dc2626', background: '#fef2f2', borderTop: '1px solid #fecaca', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}
    </>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('doc')

  const [docText, setDocText] = useState(DEFAULT_DOC_TEXT)
  const [doc, setDoc] = useState<object>(exampleDoc)
  const [docError, setDocError] = useState<string | null>(null)

  const [configText, setConfigText] = useState(DEFAULT_CONFIG_TEXT)
  const [config, setConfig] = useState<ConfigInterface>(defaultConfig)
  const [configError, setConfigError] = useState<string | null>(null)

  const [leftWidth, setLeftWidth] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)

  function handleDocChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setDocText(e.target.value)
    try {
      setDoc(JSON.parse(e.target.value))
      setDocError(null)
    } catch (err) {
      setDocError((err as Error).message)
    }
  }

  function handleConfigChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setConfigText(e.target.value)
    if (e.target.value.trim() === '') {
      setConfig(defaultConfig)
      setConfigError(null)
      return
    }
    try {
      setConfig(JSON.parse(e.target.value))
      setConfigError(null)
    } catch (err) {
      setConfigError((err as Error).message)
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
        <div style={{ display: 'flex', borderBottom: '1px solid #1f2937', background: '#030712', flexShrink: 0 }}>
          {(['doc', 'config'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.8125rem',
                fontFamily: 'inherit',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #f3f4f6' : '2px solid transparent',
                background: 'transparent',
                color: activeTab === tab ? '#f3f4f6' : '#6b7280',
                cursor: 'pointer',
              }}
            >
              {tab === 'doc' ? 'AsyncAPI Document' : 'Config'}
              {(tab === 'doc' ? docError : configError) && (
                <span style={{ color: '#dc2626', marginLeft: '0.375rem' }}>●</span>
              )}
            </button>
          ))}
        </div>
        {activeTab === 'doc' ? (
          <EditorPane value={docText} onChange={handleDocChange} error={docError} />
        ) : (
          <EditorPane value={configText} onChange={handleConfigChange} error={configError} />
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
        {!docError && <AsyncAPI asyncapi={doc as any} config={config} />}
      </div>
    </div>
  )
}
