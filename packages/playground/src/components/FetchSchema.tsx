import { useState } from 'react'
import type { SyntheticEvent } from 'react'
import type { UiPalette } from '../theme'

interface FetchSchemaProps {
  palette: UiPalette
  onLoad: (text: string) => void
}

// GitHub's HTML blob pages don't send CORS headers (and aren't the raw file anyway) —
// rewrite them to the raw.githubusercontent.com equivalent, which does.
function toFetchableUrl(url: string): string {
  try {
    const parsed = new URL(url)
    if (parsed.hostname !== 'github.com') return url

    const match = parsed.pathname.match(/^\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/)
    if (!match) return url

    const [, owner, repo, ref, path] = match
    return `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${path}`
  } catch {
    return url
  }
}

export function FetchSchema({ palette, onLoad }: FetchSchemaProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSchema = async () => {
    const trimmed = url.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)
    try {
      const res = await fetch(toFetchableUrl(trimmed))
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status} ${res.statusText}`)
      }
      const text = await res.text()
      try {
        console.log(text)
        // Only JSON is supported today — the doc editor parses the loaded text as JSON.
        JSON.parse(text)
      } catch {
        throw new Error("That document isn't valid JSON — YAML AsyncAPI documents aren't supported yet, only JSON.")
      }
      onLoad(text)
    } catch (err) {
      if (err instanceof TypeError) {
        // fetch() rejects with a generic TypeError for CORS failures and network errors alike,
        // without exposing the real reason to JS — the browser console has the specific cause.
        setError("Couldn't reach that URL — it may not allow cross-origin requests (CORS), or the host may be unreachable.")
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch document')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    fetchSchema()
  }

  const disabled = loading || !url.trim()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        padding: '8px',
        borderBottom: `1px solid ${palette.chromeBorder}`,
        background: palette.chromeBg,
        transition: 'background 150ms ease, border-color 150ms ease',
      }}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '6px' }}>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/api.json"
          aria-label="AsyncAPI document URL"
          style={{
            flex: 1,
            minWidth: 0,
            padding: '0.35rem 0.6rem',
            fontSize: '0.8125rem',
            fontFamily: 'inherit',
            border: `1px solid ${palette.chromeBorder}`,
            borderRadius: '6px',
            background: 'transparent',
            color: palette.textPrimary,
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={disabled}
          style={{
            padding: '0.35rem 0.75rem',
            fontSize: '0.8125rem',
            fontWeight: 500,
            fontFamily: 'inherit',
            border: `1px solid ${palette.chromeBorder}`,
            borderRadius: '6px',
            background: 'transparent',
            color: palette.textMuted,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            whiteSpace: 'nowrap',
          }}
        >
          {loading ? 'Fetching…' : 'Fetch'}
        </button>
      </form>
      {error && (
        <p role="alert" style={{ margin: 0, fontSize: '0.75rem', color: palette.errorText }}>
          {error}
        </p>
      )}
    </div>
  )
}
