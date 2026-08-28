import { Music2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { SpotifyIcon } from '@/assets/icons/social'
import { cn } from '@/lib/utils'

interface SpotifyWidgetProps {
  className?: string
}

export function SpotifyWidget({ className }: SpotifyWidgetProps) {
  const t = useTranslations('components.footer.spotify')

  return (
    <div
      className={cn(
        'group/spotify relative w-full overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:bg-card/80',
        className,
      )}
    >
      {/* Bottom-right blue glowing corner accent matching reference */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-0.5 -right-0.5 size-6 rounded-br-2xl border-r-2 border-b-2 border-blue-500 transition-colors group-hover/spotify:border-emerald-500"
      />

      {/* Top Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
            <span>{t('now_playing')}</span>
          </div>
          <span className="text-xs text-muted-foreground">{t('on_spotify')}</span>
        </div>

        <SpotifyIcon className="size-4 text-emerald-500 transition-transform duration-300 group-hover/spotify:scale-110" />
      </div>

      {/* Track info container */}
      <div className="mt-3 flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-background/50 text-muted-foreground transition-colors group-hover/spotify:border-emerald-500/30 group-hover/spotify:text-emerald-400">
          <Music2 className="size-5 stroke-[1.5]" />
        </div>

        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold tracking-tight text-foreground">
            {t('not_playing')}
          </span>
          <span className="truncate text-xs text-muted-foreground">{t('idle')}</span>
        </div>
      </div>
    </div>
  )
}
