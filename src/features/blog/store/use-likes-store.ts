import { create } from 'zustand'

interface LikeStateSnapshot {
  isLiked: boolean
  likesCount: number
}

interface LikesStoreState {
  /** In-memory overrides keeping header and footer like buttons synchronized across clicks. */
  overrides: Record<string, LikeStateSnapshot>
}

export const useLikesStore = create<LikesStoreState>(() => ({
  overrides: {},
}))

export const likesStoreActions = {
  setOverride: (postId: string, snapshot: LikeStateSnapshot) => {
    useLikesStore.setState((state) => ({
      overrides: {
        ...state.overrides,
        [postId]: snapshot,
      },
    }))
  },
}
