import { del, get, set } from 'idb-keyval'
import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import { type BlogFrontmatter, defaultFrontmatter } from '../schemas/post-schema'

const idbStorage: StateStorage = {
  getItem: async (name) => (await get(name)) || null,
  setItem: async (name, value) => await set(name, value),
  removeItem: async (name) => await del(name),
}

type DraftState = {
  frontmatter: BlogFrontmatter
  content: string
  lastSaved: number | null
}

type BlogDraftsStoreState = {
  drafts: Record<string, DraftState>
}

function normalizeDraftFrontmatter(frontmatter?: Partial<BlogFrontmatter>): BlogFrontmatter {
  return {
    ...defaultFrontmatter,
    ...frontmatter,
    coverImageAlt: frontmatter?.coverImageAlt ?? defaultFrontmatter.coverImageAlt,
    canonicalUrl: frontmatter?.canonicalUrl ?? defaultFrontmatter.canonicalUrl,
  }
}

export const useBlogDraftsStore = create<BlogDraftsStoreState>()(
  persist(() => ({ drafts: {} }), {
    name: 'blog-drafts-storage',
    storage: createJSONStorage(() => idbStorage),
    merge: (persistedState, currentState) => {
      const persisted = persistedState as Partial<BlogDraftsStoreState> | undefined
      if (!persisted?.drafts) return currentState

      const normalizedDrafts: Record<string, DraftState> = {}
      for (const [key, draft] of Object.entries(persisted.drafts)) {
        if (!draft) continue
        normalizedDrafts[key] = {
          ...draft,
          frontmatter: normalizeDraftFrontmatter(draft.frontmatter),
        }
      }

      return {
        ...currentState,
        drafts: normalizedDrafts,
      }
    },
  }),
)

export const blogDraftsActions = {
  initDraft: (id: string, initialFrontmatter?: BlogFrontmatter, initialContent?: string) => {
    const state = useBlogDraftsStore.getState()
    if (!state.drafts[id]) {
      useBlogDraftsStore.setState((prev) => ({
        drafts: {
          ...prev.drafts,
          [id]: {
            frontmatter: normalizeDraftFrontmatter(initialFrontmatter),
            content: initialContent || '',
            lastSaved: null,
          },
        },
      }))
    }
  },

  setContent: (id: string, content: string) => {
    useBlogDraftsStore.setState((state) => {
      const currentDraft = state.drafts[id] || {
        frontmatter: defaultFrontmatter,
        lastSaved: null,
      }
      return {
        drafts: {
          ...state.drafts,
          [id]: {
            ...currentDraft,
            frontmatter: {
              ...normalizeDraftFrontmatter(currentDraft.frontmatter),
              draft: true,
            },
            content,
            lastSaved: Date.now(),
          },
        },
      }
    })
  },

  setFrontmatter: (id: string, frontmatter: BlogFrontmatter) => {
    useBlogDraftsStore.setState((state) => {
      const currentDraft = state.drafts[id] || { content: '', lastSaved: null }
      return {
        drafts: {
          ...state.drafts,
          [id]: {
            ...currentDraft,
            frontmatter: normalizeDraftFrontmatter(frontmatter),
            lastSaved: Date.now(),
          },
        },
      }
    })
  },

  resetDraft: (id: string, frontmatter: BlogFrontmatter, content: string) => {
    useBlogDraftsStore.setState((state) => ({
      drafts: {
        ...state.drafts,
        [id]: {
          frontmatter: normalizeDraftFrontmatter(frontmatter),
          content,
          lastSaved: Date.now(),
        },
      },
    }))
  },

  clearDraft: (id: string) => {
    useBlogDraftsStore.setState((state) => {
      const newDrafts = { ...state.drafts }
      delete newDrafts[id]
      return { drafts: newDrafts }
    })
  },
}
