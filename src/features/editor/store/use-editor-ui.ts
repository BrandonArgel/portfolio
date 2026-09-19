'use client'

import { create } from 'zustand'

interface VideoDialogState {
  isOpen: boolean
  pendingCallback: ((data: { videoUrl: string }) => void) | null
}

interface MathDialogState {
  isOpen: boolean
  latex: string
  type: 'inline' | 'block'
  pendingCallback: ((data: { latex: string }) => void) | null
}

interface EditorUIState {
  videoDialog: VideoDialogState
  mathDialog: MathDialogState

  openVideoDialog: (callback: (data: { videoUrl: string }) => void) => void
  closeVideoDialog: () => void

  openMathDialog: (
    latex: string,
    type: 'inline' | 'block',
    callback: (data: { latex: string }) => void,
  ) => void
  closeMathDialog: () => void
}

export const useEditorUI = create<EditorUIState>((set) => ({
  videoDialog: {
    isOpen: false,
    pendingCallback: null,
  },

  mathDialog: {
    isOpen: false,
    latex: '',
    type: 'inline',
    pendingCallback: null,
  },

  openVideoDialog: (callback) =>
    set({
      videoDialog: { isOpen: true, pendingCallback: callback },
    }),

  closeVideoDialog: () =>
    set({
      videoDialog: { isOpen: false, pendingCallback: null },
    }),

  openMathDialog: (latex, type, callback) =>
    set({
      mathDialog: { isOpen: true, latex, type, pendingCallback: callback },
    }),

  closeMathDialog: () =>
    set({
      mathDialog: { isOpen: false, latex: '', type: 'inline', pendingCallback: null },
    }),
}))
