import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BookmarkedPostSummary } from '../types'

interface AuthOptimisticEntry {
  bookmarked: boolean
  post: BookmarkedPostSummary
}

interface BookmarksStoreState {
  /** Bookmarked articles persisted in localStorage for unauthenticated (guest) visitors. */
  guestBookmarks: BookmarkedPostSummary[]
  /** In-memory optimistic overrides for authenticated users so sidebar & cards stay in instant sync. */
  authOptimisticOverrides: Record<string, AuthOptimisticEntry>
}

export const useBookmarksStore = create<BookmarksStoreState>()(
  persist(
    (): BookmarksStoreState => ({
      guestBookmarks: [],
      authOptimisticOverrides: {},
    }),
    {
      name: 'portfolio-blog-bookmarks-v1',
      partialize: (state) => ({ guestBookmarks: state.guestBookmarks }),
    },
  ),
)

export const bookmarksStoreActions = {
  toggleGuestBookmark: (post: BookmarkedPostSummary): boolean => {
    const state = useBookmarksStore.getState()
    const exists = state.guestBookmarks.some((item) => item.id === post.id)

    if (exists) {
      useBookmarksStore.setState({
        guestBookmarks: state.guestBookmarks.filter((item) => item.id !== post.id),
      })
      return false
    }

    useBookmarksStore.setState({
      guestBookmarks: [post, ...state.guestBookmarks],
    })
    return true
  },

  setAuthOptimisticOverride: (post: BookmarkedPostSummary, bookmarked: boolean) => {
    useBookmarksStore.setState((state) => ({
      authOptimisticOverrides: {
        ...state.authOptimisticOverrides,
        [post.id]: { bookmarked, post },
      },
    }))
  },

  clearAuthOptimisticOverride: (postId: string) => {
    useBookmarksStore.setState((state) => {
      const next = { ...state.authOptimisticOverrides }
      delete next[postId]
      return { authOptimisticOverrides: next }
    })
  },
}
