'use client'

import { useSyncExternalStore } from 'react'
import type { StoreApi, UseBoundStore } from 'zustand'

interface PersistApi {
  hasHydrated: () => boolean
  onFinishHydration: (listener: () => void) => () => void
}

type PersistedStore<T> = UseBoundStore<StoreApi<T>> & {
  persist?: PersistApi
}

const EMPTY_UNSUBSCRIBE = () => {}
const getServerHydrationSnapshot = () => false

export function subscribeStoreHydration<T>(
  store: PersistedStore<T>,
  onStoreChange: () => void,
): () => void {
  return store.persist?.onFinishHydration(onStoreChange) ?? EMPTY_UNSUBSCRIBE
}

export function getStoreHydrationSnapshot<T>(store: PersistedStore<T>): boolean {
  return store.persist?.hasHydrated() ?? false
}

export function useStoreHydration<T>(store: PersistedStore<T>): boolean {
  return useSyncExternalStore(
    (onStoreChange) => subscribeStoreHydration(store, onStoreChange),
    () => getStoreHydrationSnapshot(store),
    getServerHydrationSnapshot,
  )
}
