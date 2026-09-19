'use client'

import { useTranslations } from 'next-intl'
import { sileo } from 'sileo'
import type { SavePostError, UploadImageError } from '../types/errors'

export function useBlogErrors() {
  const t = useTranslations('features.blog.composer.notifications.errors')
  const tGlobal = useTranslations('common.errors')

  const handleSaveError = (err: SavePostError) => {
    switch (err.reason) {
      case 'SLUG_ALREADY_EXISTS':
        sileo.error({ title: t('slug_exists_title'), description: t('slug_exists_desc') })
        break
      case 'VALIDATION_ERROR':
        sileo.error({ title: t('validation_title'), description: t('validation_desc') })
        break
      case 'UNAUTHORIZED':
        sileo.error({
          title: tGlobal('unauthorized_title'),
          description: tGlobal('unauthorized_desc'),
        })
        break
      case 'UNKNOWN_ERROR':
        sileo.error({ title: tGlobal('system_title'), description: tGlobal('system_description') })
        break
      default:
        err satisfies never
        sileo.error({ title: tGlobal('unexpected_title') })
    }
  }

  const handleUploadError = (err: UploadImageError) => {
    switch (err.reason) {
      case 'PAYLOAD_TOO_LARGE':
        sileo.error({ title: t('payload_large_title'), description: t('payload_large_desc') })
        break
      case 'INVALID_FILE_TYPE':
        sileo.error({ title: t('invalid_file_title'), description: t('invalid_file_desc') })
        break
      case 'UPLOAD_FAILED':
        sileo.error({ title: t('upload_failed_title'), description: t('upload_failed_desc') })
        break
      case 'UNKNOWN_ERROR':
        sileo.error({ title: tGlobal('system_title') })
        break
      default:
        err satisfies never
        sileo.error({ title: tGlobal('unexpected_title') })
    }
  }

  return { handleSaveError, handleUploadError }
}
