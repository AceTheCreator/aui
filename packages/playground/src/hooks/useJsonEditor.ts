import { useCallback, useState } from 'react'

interface UseJsonEditorOptions<T> {
  /** Value to fall back to when the editor is cleared, instead of treating it as a parse error. */
  emptyValue?: T
}

export function useJsonEditor<T>(initialText: string, initialValue: T, options: UseJsonEditorOptions<T> = {}) {
  const [text, setText] = useState(initialText)
  const [value, setValue] = useState<T>(initialValue)
  const [error, setError] = useState<string | null>(null)

  const onChange = useCallback(
    (nextText: string) => {
      setText(nextText)

      if (options.emptyValue !== undefined && nextText.trim() === '') {
        setValue(options.emptyValue)
        setError(null)
        return
      }

      try {
        setValue(JSON.parse(nextText) as T)
        setError(null)
      } catch (err) {
        setError((err as Error).message)
      }
    },
    [options.emptyValue],
  )

  return { text, value, error, onChange }
}
