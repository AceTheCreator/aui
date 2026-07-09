import { AsyncAPI, defaultConfig } from 'aui'
import type { ConfigInterface } from 'aui'
import 'aui/style.css'
import { useMemo, useState } from 'react'
import exampleDoc from './examples/example1.json'
// import exampleDoc from './torture.json'
import { EditorPane } from './components/EditorPane'
import { EditorTabs } from './components/EditorTabs'
import type { EditorTab } from './components/EditorTabs'
import { FetchSchema } from './components/FetchSchema'
import { ResizeHandle } from './components/ResizeHandle'
import { ThemeToggle } from './components/ThemeToggle'
import { ViewToggle } from './components/ViewToggle'
import { useJsonEditor } from './hooks/useJsonEditor'
import { useResizableSplit } from './hooks/useResizableSplit'
import { scrollbarStyle, UI_PALETTES } from './theme'
import type { UiMode } from './theme'

const DEFAULT_DOC_TEXT = JSON.stringify(exampleDoc, null, 2)
const DEFAULT_CONFIG_TEXT = JSON.stringify(defaultConfig, null, 2)

export default function App() {
  const [activeTab, setActiveTab] = useState<EditorTab>('doc')
  const [uiMode, setUiMode] = useState<UiMode>('dark')
  const [editorExpanded, setEditorExpanded] = useState(true)
  const palette = UI_PALETTES[uiMode]

  const doc = useJsonEditor<unknown>(DEFAULT_DOC_TEXT, exampleDoc)
  const config = useJsonEditor<ConfigInterface>(DEFAULT_CONFIG_TEXT, defaultConfig, {
    emptyValue: defaultConfig,
  })

  // The toggle is authoritative over the AsyncAPI preview's light/dark mode: it only
  // forwards the branch matching the current mode, ignoring whichever theme.light/theme.dark
  // the user's own edited config also defines for the other mode. Brand `colors` scales
  // aren't mode-specific, so they always pass through untouched.
  const previewConfig = useMemo<ConfigInterface>(
    () => ({
      ...config.value,
      theme: {
        colors: config.value.theme?.colors,
        ...(uiMode === 'dark' ? { dark: config.value.theme?.dark } : { light: config.value.theme?.light }),
      },
    }),
    [config.value, uiMode],
  )

  const { containerRef, splitPercent, handlePointerDown, nudge } = useResizableSplit()

  return (
    <div ref={containerRef} style={{ display: 'flex', height: '100vh', position: 'relative' }}>
      <div
        className="playground-preview-scroll"
        style={{ width: editorExpanded ? `${splitPercent}%` : '100%', overflow: 'auto' }}
      >
        <style>{scrollbarStyle('.playground-preview-scroll', palette)}</style>
        {!doc.error && <AsyncAPI asyncapi={doc.value as any} config={previewConfig} />}
      </div>

      {editorExpanded && (
        <>
          <ResizeHandle splitPercent={splitPercent} onPointerDown={handlePointerDown} onNudge={nudge} palette={palette} />

          <div style={{ display: 'flex', flexDirection: 'column', width: `${100 - splitPercent}%` }}>
            <EditorTabs
              activeTab={activeTab}
              onChange={setActiveTab}
              palette={palette}
              trailing={
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingRight: '6px' }}>
                  <ThemeToggle mode={uiMode} palette={palette} onChange={setUiMode} />
                  <ViewToggle expanded palette={palette} onChange={setEditorExpanded} />
                </div>
              }
              tabs={[
                { id: 'doc', label: 'AsyncAPI Document', hasError: doc.error != null },
                { id: 'config', label: 'Config', hasError: config.error != null },
              ]}
            />
            <div
              id={`panel-${activeTab}`}
              role="tabpanel"
              aria-labelledby={`tab-${activeTab}`}
              style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
            >
              {activeTab === 'doc' ? (
                <>
                  <FetchSchema palette={palette} onLoad={doc.onChange} />
                  <EditorPane
                    ariaLabel="AsyncAPI document JSON"
                    value={doc.text}
                    onChange={doc.onChange}
                    error={doc.error}
                    mode={uiMode}
                    palette={palette}
                  />
                </>
              ) : (
                <EditorPane
                  ariaLabel="Config JSON"
                  value={config.text}
                  onChange={config.onChange}
                  error={config.error}
                  mode={uiMode}
                  palette={palette}
                />
              )}
            </div>
          </div>
        </>
      )}

      {!editorExpanded && (
        <div
          style={{
            position: 'fixed',
            top: '12px',
            right: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px',
            background: palette.chromeBg,
            border: `1px solid ${palette.chromeBorder}`,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 40,
          }}
        >
          <ThemeToggle mode={uiMode} palette={palette} onChange={setUiMode} />
          <ViewToggle expanded={false} palette={palette} onChange={setEditorExpanded} />
        </div>
      )}
    </div>
  )
}
