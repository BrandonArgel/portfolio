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
