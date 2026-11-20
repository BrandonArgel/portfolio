import { describe, expect, test } from 'bun:test'
import { create } from 'zustand'
import { getStoreHydrationSnapshot, subscribeStoreHydration } from './use-store-hydration'

describe('useStoreHydration helpers', () => {
  test('degrade safely when store.persist is undefined during SSR', () => {
    const storeWithoutPersist = create(() => ({ count: 0 }))

    expect(getStoreHydrationSnapshot(storeWithoutPersist)).toBe(false)

    const unsubscribe = subscribeStoreHydration(storeWithoutPersist, () => {})
    expect(typeof unsubscribe).toBe('function')
    expect(() => unsubscribe()).not.toThrow()
  })

  test('forwards hasHydrated state and finish-hydration subscriptions when store.persist exists', () => {
    let hydrated = false
    let listener: (() => void) | null = null
    let unsubscribed = false

    const baseStore = create(() => ({ count: 0 }))
    const storeWithPersist = Object.assign(baseStore, {
      persist: {
        hasHydrated: () => hydrated,
        onFinishHydration: (cb: () => void) => {
          listener = cb
          return () => {
            unsubscribed = true
          }
        },
      },
    })

    let notified = 0
    const unsubscribe = subscribeStoreHydration(storeWithPersist, () => {
      notified += 1
    })

    expect(getStoreHydrationSnapshot(storeWithPersist)).toBe(false)

    hydrated = true
    const registeredListener = listener as (() => void) | null
    if (registeredListener) {
      registeredListener()
    }

    expect(notified).toBe(1)
    expect(getStoreHydrationSnapshot(storeWithPersist)).toBe(true)

    unsubscribe()
    expect(unsubscribed).toBe(true)
  })
})
