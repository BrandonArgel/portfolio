'use client'

import { Music2 } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import { SpotifyIcon } from '@/assets/icons/social'
import { useIsVisible } from '@/hooks/use-is-visible'
import { cn } from '@/lib/utils'
import type { SpotifyTrack } from '../types'
import { fetcher } from '../utils/fetcher'
import { SpotifyProgressBar } from './spotify-progress-bar'

interface SpotifyWidgetProps {
  className?: string
}

export function SpotifyWidget({ className }: SpotifyWidgetProps) {
  const t = useTranslations('components.spotify')
  const widgetRef = useRef<HTMLDivElement>(null)

  const isVisible = useIsVisible(widgetRef, 0.1)
  const [hasIntersected, setHasIntersected] = useState(false)

  useEffect(() => {
    if (isVisible && !hasIntersected) {
      setHasIntersected(true)
    }
  }, [isVisible, hasIntersected])

  const { data } = useSWR<SpotifyTrack | null>(hasIntersected ? '/api/spotify' : null, fetcher, {
    refreshInterval: (currentData) => {
      if (!isVisible) return 0

      if (!currentData?.isPlaying || !currentData.item) return 15000

      const duration = currentData.item.duration_ms
      const progress = currentData.progressMs ?? 0
      const timeRemaining = duration - progress

      if (timeRemaining > 0 && timeRemaining < 15000) {
        return timeRemaining + 1500
      }

      return 15000
    },
    fallbackData: null,
  })

  const isPlaying = data?.isPlaying ?? false
  const item = data?.item
  const durationMs = item?.duration_ms ?? 0
  const initialProgressMs = data?.progressMs ?? 0
  const title = item?.name ?? t('not_playing')
  const artist = item?.artists?.map((a) => a.name).join(', ') ?? t('idle')
  const albumImageUrl = item?.album?.images?.[0]?.url
  const songUrl = item?.external_urls?.spotify

  return (
    <div
      ref={widgetRef}
      className={cn(
        'group/spotify relative block w-full overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:bg-card/80',
        className,
      )}
    >
      {isPlaying && songUrl && (
        <a
          href={songUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-10 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <span className="sr-only">
            {t('now_playing')}: {title} {t('by')} {artist}
          </span>
        </a>
      )}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-0.5 -right-0.5 size-6 rounded-br-2xl border-b-2 border-r-2 border-blue-500 transition-colors group-hover/spotify:border-emerald-500"
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
            <span
              aria-hidden="true"
              className={cn('size-1.5 rounded-full bg-emerald-400', isPlaying && 'animate-pulse')}
            />
            <span>{isPlaying ? t('now_playing') : t('not_playing')}</span>
          </div>
          <span className="text-xs text-muted-foreground">{t('on_spotify')}</span>
        </div>

        <SpotifyIcon
          aria-hidden="true"
          className="size-4 text-emerald-500 transition-transform duration-300 group-hover/spotify:scale-110"
        />
      </div>

      <div className="mt-3 flex items-center gap-3">
        {isPlaying && albumImageUrl ? (
          <div className="relative size-11 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-background/50">
            <Image src={albumImageUrl} alt="" fill sizes="44px" className="object-cover" />
          </div>
        ) : (
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-background/50 text-muted-foreground transition-colors group-hover/spotify:border-emerald-500/30 group-hover/spotify:text-emerald-400">
            <Music2 aria-hidden="true" className="size-5 stroke-[1.5]" />
          </div>
        )}

        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold tracking-tight text-foreground">
            {title}
          </span>
          <span className="truncate text-xs text-muted-foreground">{artist}</span>
        </div>
      </div>

      <SpotifyProgressBar
        isPlaying={isPlaying}
        isVisible={isVisible}
        initialProgressMs={initialProgressMs}
        durationMs={durationMs}
      />
    </div>
  )
}
