'use client'

import { useEffect } from 'react'
import { recordPostViewAction } from '../../actions/view-actions'

const DWELL_TIME_MS = 2500
const VIEW_STORAGE_PREFIX = 'viewed_post:'

function hasRecordedViewInSession(storageKey: string): boolean {
  try {
    return window.sessionStorage.getItem(storageKey) === '1'
  } catch {
    return false
  }
}

function markViewInSession(storageKey: string): void {
  try {
    window.sessionStorage.setItem(storageKey, '1')
  } catch {
    // Ignore storage quota or private-mode restrictions.
  }
}

export interface PostViewTrackerProps {
  postId: string
}

export function PostViewTracker({ postId }: PostViewTrackerProps) {
  useEffect(() => {
    if (!postId || typeof window === 'undefined') return

    const storageKey = `${VIEW_STORAGE_PREFIX}${postId}`
    if (hasRecordedViewInSession(storageKey)) return

    let remainingMs = DWELL_TIME_MS
    let startedAt: number | null = null
    let timerId: ReturnType<typeof setTimeout> | null = null
    let disposed = false

    const clearPendingTimer = () => {
      if (timerId !== null) {
        clearTimeout(timerId)
        timerId = null
      }
      if (startedAt !== null) {
        remainingMs = Math.max(0, remainingMs - (Date.now() - startedAt))
        startedAt = null
      }
    }

    const commitView = () => {
      if (disposed || hasRecordedViewInSession(storageKey)) return
      markViewInSession(storageKey)
      void recordPostViewAction(postId)
    }

    const scheduleTimer = () => {
      if (disposed || document.visibilityState !== 'visible' || timerId !== null) {
        return
      }
      if (remainingMs <= 0) {
        commitView()
        return
      }
      startedAt = Date.now()
      timerId = setTimeout(() => {
        timerId = null
        startedAt = null
        remainingMs = 0
        commitView()
      }, remainingMs)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        scheduleTimer()
      } else {
        clearPendingTimer()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    scheduleTimer()

    return () => {
      disposed = true
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearPendingTimer()
    }
  }, [postId])

  return null
}
