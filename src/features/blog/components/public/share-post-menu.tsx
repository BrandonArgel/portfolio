'use client'

import { Check, Link2, Share2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'
import { sileo } from 'sileo'
import { InstagramIcon, LinkedInIcon, WhatsAppIcon, XIcon } from '@/assets/icons/social'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type BlogInteractionLocation, type BlogSharePlatform, track } from '@/lib/analytics/events'
import { cn } from '@/lib/utils'

export interface SharePostMenuProps {
  post: {
    id: string
    title: string
    slug: string
    description?: string
  }
  location: BlogInteractionLocation
  variant?: 'icon' | 'button'
  className?: string
}

export function SharePostMenu({ post, location, variant = 'icon', className }: SharePostMenuProps) {
  const t = useTranslations('features.blog.reader')
  const locale = useLocale()
  const [copied, setCopied] = useState(false)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current)
      }
    }
  }, [])

  const getCanonicalUrl = useCallback(() => {
    if (typeof window === 'undefined') {
      return `/${locale}/blog/${post.slug}`
    }
    return `${window.location.origin}/${locale}/blog/${post.slug}`
  }, [locale, post.slug])

  const recordShare = useCallback(
    (platform: BlogSharePlatform) => {
      track('Blog_Post_Shared', {
        postId: post.id,
        slug: post.slug,
        platform,
        location,
      })
    },
    [location, post.id, post.slug],
  )

  const openExternalWindow = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleCopyLink = async () => {
    const url = getCanonicalUrl()
    recordShare('copy_link')

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current)
      }
      copyTimerRef.current = setTimeout(() => {
        setCopied(false)
      }, 2000)

      sileo.success({
        title: t('actions.link_copied'),
      })
    } catch {
      sileo.error({
        title: t('actions.link_copy_error'),
      })
    }
  }

  const handleWhatsAppShare = () => {
    const url = getCanonicalUrl()
    recordShare('whatsapp')
    const shareText = `${post.title} — ${url}`
    openExternalWindow(`https://wa.me/?text=${encodeURIComponent(shareText)}`)
  }

  const handleXShare = () => {
    const url = getCanonicalUrl()
    recordShare('x')
    openExternalWindow(
      `https://x.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}`,
    )
  }

  const handleLinkedInShare = () => {
    const url = getCanonicalUrl()
    recordShare('linkedin')
    openExternalWindow(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    )
  }

  const handleInstagramOrNativeShare = async () => {
    const url = getCanonicalUrl()
    recordShare('instagram_or_native')

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: post.title,
          text: post.description || post.title,
          url,
        })
        return
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      sileo.success({
        title: t('actions.share_menu.instagram_copied_title'),
        description: t('actions.share_menu.instagram_copied_hint'),
      })
    } catch {
      sileo.error({
        title: t('actions.link_copy_error'),
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        onClick={(e) => {
          e.stopPropagation()
        }}
        className={cn(
          variant === 'button'
            ? 'inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer'
            : 'p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer',
          className,
        )}
        aria-label={t('actions.share')}
        title={t('actions.share')}
      >
        {copied ? <Check className="size-3.5 text-emerald-500" /> : <Share2 className="size-3.5" />}
        {variant === 'button' && <span>{t('actions.share')}</span>}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52 p-1.5">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1 text-xs font-semibold text-muted-foreground">
            {t('actions.share_menu.label')}
          </DropdownMenuLabel>

          <DropdownMenuItem
            onClick={handleCopyLink}
            className="gap-2.5 px-2 py-1.5 text-xs font-medium cursor-pointer"
          >
            {copied ? (
              <Check className="size-3.5 text-emerald-500" />
            ) : (
              <Link2 className="size-3.5 text-muted-foreground" />
            )}
            <span>
              {copied ? t('actions.share_menu.copied') : t('actions.share_menu.copy_link')}
            </span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={handleWhatsAppShare}
            className="gap-2.5 px-2 py-1.5 text-xs font-medium cursor-pointer"
          >
            <WhatsAppIcon className="size-3.5 text-emerald-500" />
            <span>{t('actions.share_menu.whatsapp')}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleXShare}
            className="gap-2.5 px-2 py-1.5 text-xs font-medium cursor-pointer"
          >
            <XIcon className="size-3.5 text-foreground" />
            <span>{t('actions.share_menu.x')}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleLinkedInShare}
            className="gap-2.5 px-2 py-1.5 text-xs font-medium cursor-pointer"
          >
            <LinkedInIcon className="size-3.5 text-sky-500" />
            <span>{t('actions.share_menu.linkedin')}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleInstagramOrNativeShare}
            className="gap-2.5 px-2 py-1.5 text-xs font-medium cursor-pointer"
          >
            <InstagramIcon className="size-3.5 text-pink-500" />
            <span>{t('actions.share_menu.instagram_or_native')}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
