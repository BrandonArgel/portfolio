import { useEffect, useState } from 'react'
import type { StoreApi, UseBoundStore } from 'zustand'

export function useStoreHydration<T>(store: UseBoundStore<StoreApi<T>> & { persist: any }) {
  const [hydrated, setHydrated] = useState(() => store.persist.hasHydrated())

  useEffect(() => {
    const unsubFinishHydration = store.persist.onFinishHydration(() => {
      setHydrated(true)
    })

    setHydrated(store.persist.hasHydrated())

    return () => {
      unsubFinishHydration()
    }
  }, [store])

  return hydrated
}
