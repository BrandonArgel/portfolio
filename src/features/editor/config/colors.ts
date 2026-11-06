import type { Editor } from '@tiptap/core'

export const EDITOR_COLOR_IDS = [
  'default',
  'gray',
  'brown',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
  'pink',
  'red',
] as const

export type EditorColorId = (typeof EDITOR_COLOR_IDS)[number]

export interface EditorColorOption {
  id: EditorColorId
  textValue: string | null
  bgValue: string | null
  previewText: string
  previewBg: string
}

export const EDITOR_COLORS: readonly EditorColorOption[] = [
  {
    id: 'default',
    textValue: null,
    bgValue: null,
    previewText: 'var(--color-foreground)',
    previewBg: 'transparent',
  },
  {
    id: 'gray',
    textValue: 'var(--editor-text-gray)',
    bgValue: 'var(--editor-bg-gray)',
    previewText: 'var(--editor-text-gray)',
    previewBg: 'var(--editor-bg-gray)',
  },
  {
    id: 'brown',
    textValue: 'var(--editor-text-brown)',
    bgValue: 'var(--editor-bg-brown)',
    previewText: 'var(--editor-text-brown)',
    previewBg: 'var(--editor-bg-brown)',
  },
  {
    id: 'orange',
    textValue: 'var(--editor-text-orange)',
    bgValue: 'var(--editor-bg-orange)',
    previewText: 'var(--editor-text-orange)',
    previewBg: 'var(--editor-bg-orange)',
  },
  {
    id: 'yellow',
    textValue: 'var(--editor-text-yellow)',
    bgValue: 'var(--editor-bg-yellow)',
    previewText: 'var(--editor-text-yellow)',
    previewBg: 'var(--editor-bg-yellow)',
  },
  {
    id: 'green',
    textValue: 'var(--editor-text-green)',
    bgValue: 'var(--editor-bg-green)',
    previewText: 'var(--editor-text-green)',
    previewBg: 'var(--editor-bg-green)',
  },
  {
    id: 'blue',
    textValue: 'var(--editor-text-blue)',
    bgValue: 'var(--editor-bg-blue)',
    previewText: 'var(--editor-text-blue)',
    previewBg: 'var(--editor-bg-blue)',
  },
  {
    id: 'purple',
    textValue: 'var(--editor-text-purple)',
    bgValue: 'var(--editor-bg-purple)',
    previewText: 'var(--editor-text-purple)',
    previewBg: 'var(--editor-bg-purple)',
  },
  {
    id: 'pink',
    textValue: 'var(--editor-text-pink)',
    bgValue: 'var(--editor-bg-pink)',
    previewText: 'var(--editor-text-pink)',
    previewBg: 'var(--editor-bg-pink)',
  },
  {
    id: 'red',
    textValue: 'var(--editor-text-red)',
    bgValue: 'var(--editor-bg-red)',
    previewText: 'var(--editor-text-red)',
    previewBg: 'var(--editor-bg-red)',
  },
] as const

export const EDITOR_COLOR_MAP: Record<EditorColorId, EditorColorOption> = Object.fromEntries(
  EDITOR_COLORS.map((color) => [color.id, color]),
) as Record<EditorColorId, EditorColorOption>

export interface RecentColorItem {
  type: 'text' | 'highlight'
  id: EditorColorId
}

export const RECENT_COLORS_STORAGE_KEY = 'tiptap-editor-recent-colors'
export const MAX_RECENT_COLORS = 5

function isEditorColorId(value: unknown): value is EditorColorId {
  return typeof value === 'string' && EDITOR_COLOR_IDS.includes(value as EditorColorId)
}

function isRecentColorItem(value: unknown): value is RecentColorItem {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return (record.type === 'text' || record.type === 'highlight') && isEditorColorId(record.id)
}

/**
 * Normalizes a raw color string (CSS variable, color ID, or hex/rgb/oklch)
 * to the canonical editor palette token when applicable.
 */
export function normalizeEditorColor(
  value: string | null | undefined,
  type: 'text' | 'highlight',
): string | null {
  if (!value || typeof value !== 'string') return null

  const cleaned = value
    .trim()
    .replace(/^['"]+|['"]+$/g, '')
    .trim()
  if (
    !cleaned ||
    cleaned === 'inherit' ||
    cleaned === 'transparent' ||
    cleaned === 'initial' ||
    cleaned === 'unset' ||
    cleaned === 'currentColor'
  ) {
    return null
  }

  const compact = cleaned.replace(/\s+/g, ' ')
  const lower = compact.toLowerCase()

  for (const option of EDITOR_COLORS) {
    if (option.id === 'default') continue

    if (type === 'text') {
      if (
        lower === option.textValue?.toLowerCase() ||
        lower === `var(--color-editor-text-${option.id})` ||
        lower === option.id
      ) {
        return option.textValue
      }
    } else {
      if (
        lower === option.bgValue?.toLowerCase() ||
        lower === `var(--color-editor-bg-${option.id})` ||
        lower === option.id
      ) {
        return option.bgValue
      }
    }
  }

  return compact
}

/**
 * Extracts the active text or highlight color from the editor state,
 * combining `editor.getAttributes`, `editor.isActive`, and selection range inspection.
 */
export function getActiveMarkColor(
  editor: Editor,
  markName: 'textStyle' | 'highlight',
  type: 'text' | 'highlight',
): string | null {
  const rawAttr = editor.getAttributes(markName).color as string | undefined
  const normalizedAttr = normalizeEditorColor(rawAttr, type)
  if (normalizedAttr) {
    return normalizedAttr
  }

  for (const option of EDITOR_COLORS) {
    const targetColor = type === 'text' ? option.textValue : option.bgValue
    if (targetColor && editor.isActive(markName, { color: targetColor })) {
      return targetColor
    }
  }

  const { from, to, empty } = editor.state.selection
  if (!empty) {
    let foundColor: string | null = null
    editor.state.doc.nodesBetween(from, to, (node) => {
      if (foundColor) return false
      for (const mark of node.marks) {
        if (mark.type.name === markName) {
          const candidate = normalizeEditorColor(mark.attrs?.color as string | undefined, type)
          if (candidate) {
            foundColor = candidate
            return false
          }
        }
      }
      return undefined
    })
    if (foundColor) {
      return foundColor
    }
  }

  return null
}

/**
 * Matches a balanced inline HTML tag (`<span ...>...</span>` or `<mark ...>...</mark>`)
 * at the start of `src`.
 */
export function matchBalancedHtmlTag(
  src: string,
  tagName: 'span' | 'mark',
): { raw: string; attrsRaw: string; innerContent: string } | null {
  const openRegex = new RegExp(`^<${tagName}\\b([^>]*)>`, 'i')
  const openMatch = openRegex.exec(src)
  if (!openMatch || openMatch[0].endsWith('/>')) {
    return null
  }

  const attrsRaw = openMatch[1] ?? ''
  const tagScanRegex = new RegExp(`<(/?)${tagName}\\b[^>]*>`, 'gi')
  tagScanRegex.lastIndex = openMatch[0].length

  let depth = 1
  let scanMatch = tagScanRegex.exec(src)

  while (scanMatch !== null) {
    if (scanMatch[1] === '/') {
      depth -= 1
    } else if (!scanMatch[0].endsWith('/>')) {
      depth += 1
    }

    if (depth === 0) {
      const innerStart = openMatch[0].length
      const innerEnd = scanMatch.index
      const fullEnd = scanMatch.index + scanMatch[0].length
      return {
        raw: src.slice(0, fullEnd),
        attrsRaw,
        innerContent: src.slice(innerStart, innerEnd),
      }
    }

    scanMatch = tagScanRegex.exec(src)
  }

  return null
}

/**
 * Extracts a color value from an HTML opening tag's attributes string,
 * prioritizing `data-color="..."` and falling back to `style="..."`.
 */
export function extractColorFromAttrs(
  attrsRaw: string,
  styleProperty: 'color' | 'background-color',
): string | null {
  const dataColorMatch = /\bdata-color\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i.exec(attrsRaw)
  if (dataColorMatch) {
    const rawDataColor = (dataColorMatch[1] ?? dataColorMatch[2] ?? dataColorMatch[3] ?? '').trim()
    if (rawDataColor) return rawDataColor
  }

  const styleMatch = /\bstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(attrsRaw)
  if (styleMatch) {
    const styleStr = styleMatch[1] ?? styleMatch[2] ?? ''
    const declarations = styleStr.split(';')
    for (let i = declarations.length - 1; i >= 0; i -= 1) {
      const decl = declarations[i]?.trim()
      if (!decl) continue
      const colonIdx = decl.indexOf(':')
      if (colonIdx === -1) continue
      const prop = decl.slice(0, colonIdx).trim().toLowerCase()
      const val = decl.slice(colonIdx + 1).trim()
      if (prop === styleProperty && val) {
        return val
      }
    }
  }

  return null
}

export function loadRecentColors(): RecentColorItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(RECENT_COLORS_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isRecentColorItem).slice(0, MAX_RECENT_COLORS)
  } catch {
    return []
  }
}

export function pushRecentColor(
  current: RecentColorItem[],
  nextItem: RecentColorItem,
): RecentColorItem[] {
  const updated = [
    nextItem,
    ...current.filter((item) => !(item.type === nextItem.type && item.id === nextItem.id)),
  ].slice(0, MAX_RECENT_COLORS)

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(RECENT_COLORS_STORAGE_KEY, JSON.stringify(updated))
    } catch {
      // Ignore storage quota / privacy mode errors
    }
  }

  return updated
}
