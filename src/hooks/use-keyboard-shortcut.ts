import { useEffect, useRef } from 'react'
import { useIsMac } from './use-is-mac'

interface ShortcutOptions {
  ignoreInInputs?: boolean
  preventDefault?: boolean
}

export function useKeyboardShortcut(
  shortcut: string,
  callback: (e: KeyboardEvent) => void,
  options: ShortcutOptions = {},
) {
  const isMac = useIsMac()
  const { ignoreInInputs = true, preventDefault = true } = options

  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const keys = shortcut
      .toLowerCase()
      .split('+')
      .map((k) => k.trim())

    const requiredModifiers = {
      ctrl: keys.includes('ctrl') || (keys.includes('mod') && !isMac),
      meta: keys.includes('meta') || keys.includes('cmd') || (keys.includes('mod') && isMac),
      shift: keys.includes('shift'),
      alt: keys.includes('alt') || keys.includes('option'),
    }

    const mainKey =
      keys.find((k) => !['ctrl', 'meta', 'cmd', 'mod', 'shift', 'alt', 'option'].includes(k)) || ''

    const handleKeyDown = (e: KeyboardEvent) => {
      if (ignoreInInputs) {
        const activeEl = document.activeElement
        const isInput =
          activeEl instanceof HTMLInputElement ||
          activeEl instanceof HTMLTextAreaElement ||
          activeEl?.getAttribute('contenteditable') === 'true'
        if (isInput) return
      }

      const isCtrlMatch = e.ctrlKey === requiredModifiers.ctrl
      const isMetaMatch = e.metaKey === requiredModifiers.meta
      const isShiftMatch = e.shiftKey === requiredModifiers.shift
      const isAltMatch = e.altKey === requiredModifiers.alt

      const isKeyMatch = e.key.toLowerCase() === mainKey

      if (isCtrlMatch && isMetaMatch && isShiftMatch && isAltMatch && isKeyMatch) {
        if (preventDefault) e.preventDefault()
        callbackRef.current(e)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcut, ignoreInInputs, preventDefault, isMac])
}
