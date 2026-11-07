'use client'

import { useFormatter, useTranslations } from 'next-intl'
import { sileo } from 'sileo'
import type { ImageUploadError } from '../types'

export interface ImageUploadErrorMessage {
  title: string
  description: string
}

const BYTES_PER_MB = 1024 * 1024

/** Mirrors `useLoginErrors`: maps each typed `reason` to translated toast copy. */
export function useImageUploadErrors() {
  const t = useTranslations('features.blog.errors.image_upload')
  const tGlobal = useTranslations('common.errors')
  const format = useFormatter()

  const formatSize = (bytes: number): string =>
    `${format.number(bytes / BYTES_PER_MB, { maximumFractionDigits: 2 })} MB`

  const getImageUploadErrorMessage = (err: ImageUploadError): ImageUploadErrorMessage => {
    // The exhaustive `switch` makes the compiler flag any new reason without a message.
    switch (err.reason) {
      case 'NO_FILE':
      case 'EMPTY_FILE':
      case 'IMAGE_PROCESSING_FAILED':
      case 'OFFLINE':
      case 'NETWORK_ERROR':
      case 'TIMEOUT':
      case 'PAYLOAD_TOO_LARGE':
      case 'RATE_LIMITED':
      case 'UNAUTHORIZED':
      case 'FORBIDDEN':
      case 'STORAGE_ERROR':
        return {
          title: t(`${err.reason}.title`),
          description: t(`${err.reason}.description`),
        }
      case 'INVALID_FILE_TYPE':
        return {
          title: t('INVALID_FILE_TYPE.title'),
          description: t('INVALID_FILE_TYPE.description', { received: err.received }),
        }
      case 'UNSUPPORTED_FORMAT':
        return {
          title: t('UNSUPPORTED_FORMAT.title'),
          description: t('UNSUPPORTED_FORMAT.description', { format: err.format.toUpperCase() }),
        }
      case 'FILE_TOO_LARGE':
        return {
          title: t('FILE_TOO_LARGE.title'),
          description: t('FILE_TOO_LARGE.description', {
            maxSize: formatSize(err.maxBytes),
            actualSize: formatSize(err.actualBytes),
          }),
        }
      case 'UNKNOWN_ERROR':
        return {
          title: tGlobal('unknown_title'),
          description: tGlobal('unknown_description'),
        }
      default: {
        const _exhaustive: never = err
        return {
          title: tGlobal('unexpected_title'),
          description: tGlobal('unexpected_description'),
        }
      }
    }
  }

  const handleImageUploadError = (err: ImageUploadError) => {
    sileo.error(getImageUploadErrorMessage(err))
  }

  return { getImageUploadErrorMessage, handleImageUploadError }
}
