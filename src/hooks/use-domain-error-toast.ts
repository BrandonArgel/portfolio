'use client'

import { useCallback } from 'react'
import { sileo } from 'sileo'

export interface ErrorToastMessage {
  title: string
  description: string
}

export type ErrorTranslationFn<R extends string> = (
  key: `${R}.title` | `${R}.description`,
) => string

export function translateErrorReason<R extends string>(
  t: ErrorTranslationFn<R>,
  reason: R,
): ErrorToastMessage {
  return {
    title: t(`${reason}.title`),
    description: t(`${reason}.description`),
  }
}

export function useDomainErrorToast<E extends { reason: string }>(
  t: ErrorTranslationFn<E['reason']>,
): {
  getErrorMessage: (err: E) => ErrorToastMessage
  handleError: (err: E) => void
} {
  const getErrorMessage = useCallback(
    (err: E): ErrorToastMessage => translateErrorReason(t, err.reason),
    [t],
  )

  const handleError = useCallback(
    (err: E) => {
      sileo.error(getErrorMessage(err))
    },
    [getErrorMessage],
  )

  return { getErrorMessage, handleError }
}
