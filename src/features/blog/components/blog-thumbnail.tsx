import { cn } from '@/lib/utils'

interface BlogThumbnailProps {
  title: string
  coverBadge?: string
  domainWatermark?: string
  className?: string
}

export function BlogThumbnail({
  title,
  coverBadge = 'Technical Guide',
  domainWatermark = 'www.brandonargel.com',
  className,
}: BlogThumbnailProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative aspect-16/10 w-full overflow-hidden rounded-xl border border-white/10 bg-linear-to-b from-neutral-900 via-slate-950 to-neutral-950 p-5 select-none transition-transform duration-500 group-hover/blog-card:scale-[1.02]',
        className,
      )}
    >
      {/* Blueprint Grid Lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Crosshair Marks on Four Corners */}
      <span className="font-mono absolute top-2 left-2 text-[10px] text-white/40 leading-none">
        +
      </span>
      <span className="font-mono absolute top-2 right-2 text-[10px] text-white/40 leading-none">
        +
      </span>
      <span className="font-mono absolute bottom-2 left-2 text-[10px] text-white/40 leading-none">
        +
      </span>
      <span className="font-mono absolute bottom-2 right-2 text-[10px] text-white/40 leading-none">
        +
      </span>

      {/* Decorative Technical Framing Lines */}
      <div className="pointer-events-none absolute inset-3 rounded-lg border border-white/5" />

      {/* Ambient Vignette & Center Glow */}
      <div className="pointer-events-none absolute inset-0 bg-radial-[circle_at_center,transparent_30%,rgba(0,0,0,0.6)_100%]" />

      {/* Centered Graphic Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
        {/* Banner Title */}
        <h4 className="line-clamp-2 px-2 text-xs font-bold tracking-tight text-white/95 sm:text-sm">
          {title}
        </h4>

        {/* Center Pill Badge */}
        {coverBadge && (
          <div className="mt-3 inline-flex items-center justify-center rounded bg-white px-2.5 py-0.5 shadow-sm">
            <span className="text-[10px] font-bold text-neutral-950 sm:text-xs">{coverBadge}</span>
          </div>
        )}

        {/* Domain Watermark */}
        {domainWatermark && (
          <span className="font-mono mt-1.5 text-[8px] tracking-wider text-white/40 sm:text-[9px]">
            {domainWatermark}
          </span>
        )}
      </div>
    </div>
  )
}
