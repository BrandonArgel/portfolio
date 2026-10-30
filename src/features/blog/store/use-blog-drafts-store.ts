import { del, get, set } from 'idb-keyval'
import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import { type BlogFrontmatter, defaultFrontmatter } from '../schemas/post.schema'

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

export const useBlogDraftsStore = create<BlogDraftsStoreState>()(
  persist(() => ({ drafts: {} }), {
    name: 'blog-drafts-storage',
    storage: createJSONStorage(() => idbStorage),
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
            frontmatter: initialFrontmatter || defaultFrontmatter,
            content: initialContent || '',
            lastSaved: null,
          },
        },
      }))
    }
  },

  setContent: (id: string, content: string) => {
    useBlogDraftsStore.setState((state) => {
      const currentDraft = state.drafts[id] || { frontmatter: defaultFrontmatter, lastSaved: null }
      return {
        drafts: {
          ...state.drafts,
          [id]: { ...currentDraft, content, lastSaved: Date.now() },
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
          [id]: { ...currentDraft, frontmatter, lastSaved: Date.now() },
        },
      }
    })
  },

  clearDraft: (id: string) => {
    useBlogDraftsStore.setState((state) => {
      const newDrafts = { ...state.drafts }
      delete newDrafts[id]
      return { drafts: newDrafts }
    })
  },
}
