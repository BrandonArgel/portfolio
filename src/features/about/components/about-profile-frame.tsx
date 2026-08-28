import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AboutProfileFrameProps {
  className?: string
}

export function AboutProfileFrame({ className }: AboutProfileFrameProps) {
  return (
    <div
      className={cn('group relative flex w-full max-w-100 items-center justify-center', className)}
    >
      {/* Floating Accent 1: Top-Right Purple Rounded Square */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-4 -right-4 size-20 md:size-24 rounded-2xl border border-purple-500/30 bg-purple-600/15 dark:bg-purple-950/40 shadow-xl backdrop-blur-md rotate-6 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-105"
      />

      {/* Floating Accent 2: Bottom-Left Dark Blue Rounded Square */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-5 -left-5 size-24 md:size-28 rounded-2xl border border-blue-500/30 bg-blue-600/15 dark:bg-blue-950/40 shadow-xl backdrop-blur-md -rotate-12 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105"
      />

      {/* Main Photo / Profile Frame */}
      <div className="relative aspect-4/5 sm:aspect-square w-full max-w-100 overflow-hidden rounded-3xl border border-border/70 bg-card/60 shadow-2xl backdrop-blur-sm transition-all duration-500 group-hover:border-primary/40 group-hover:shadow-primary/5">
        {/* Ambient inner gradient glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 bg-linear-to-tr from-blue-500/10 via-transparent to-purple-500/10"
        />

        {/* Profile Image */}
        <Image
          src="/me.webp"
          alt="Picture of Brandon Argel"
          width={800}
          height={800}
          priority
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    </div>
  )
}
