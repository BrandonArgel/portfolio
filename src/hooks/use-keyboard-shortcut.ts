import { useEffect } from 'react'

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  requireCtrl: boolean = false,
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl?.getAttribute('contenteditable') === 'true'

      if (isInput && !requireCtrl) return

      if (e.key.toLowerCase() === key.toLowerCase() && (!requireCtrl || e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        callback()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [key, callback, requireCtrl])
}
