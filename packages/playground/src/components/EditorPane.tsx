import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { tokyoNight, githubLight } from "@uiw/codemirror-themes-all";
import { useMemo } from 'react'
import { scrollbarStyle } from '../theme'
import type { UiMode, UiPalette } from '../theme'

interface EditorPaneProps {
  value: string
  onChange: (value: string) => void
  error: string | null
  ariaLabel: string
  mode: UiMode
  palette: UiPalette
}

const extensions = [json()]

export function EditorPane({ value, onChange, error, ariaLabel, mode, palette }: EditorPaneProps) {
  const basicSetup = useMemo(
    () => ({
      foldGutter: true,
      highlightActiveLine: true,
    }),
    [],
  )

  return (
    <>
      <div
        style={{ flex: 1, minHeight: 0 }}
        aria-label={ariaLabel}
        aria-invalid={error != null}
      >
        <style>{scrollbarStyle('.cm-scroller', palette)}</style>
        <CodeMirror
          value={value}
          onChange={onChange}
          theme={mode === "dark" ? tokyoNight : githubLight}
          extensions={extensions}
          basicSetup={basicSetup}
          height="100%"
          style={{ height: "100%", fontSize: "0.875rem" }}
        />
      </div>
      {error && (
        <div
          role="alert"
          style={{
            padding: "0.5rem 1rem",
            color: palette.errorText,
            background: palette.errorBg,
            borderTop: `1px solid ${palette.errorBorder}`,
            fontSize: "0.875rem",
            transition:
              "background 150ms ease, color 150ms ease, border-color 150ms ease",
          }}
        >
          {error}
        </div>
      )}
    </>
  );
}
