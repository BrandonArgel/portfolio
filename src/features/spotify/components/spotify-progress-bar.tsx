import { useEffect, useState } from 'react'
import { Progress, ProgressIndicator, ProgressTrack } from '@/components/ui/progress'
import { formatTime } from '../utils/format-time'

interface SpotifyProgressBarProps {
  isPlaying: boolean
  isVisible: boolean
  initialProgressMs: number
  durationMs: number
}

export function SpotifyProgressBar({
  isPlaying,
  isVisible,
  initialProgressMs,
  durationMs,
}: SpotifyProgressBarProps) {
  const [progress, setProgress] = useState<number>(initialProgressMs)

  useEffect(() => {
    if (!isPlaying) {
      setProgress(0)
      return
    }

    if (!isVisible) return

    setProgress(initialProgressMs)
    const startTime = Date.now()

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const current = initialProgressMs + elapsed
      setProgress(durationMs > 0 ? Math.min(current, durationMs) : current)
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying, initialProgressMs, durationMs, isVisible])

  if (!isPlaying || durationMs <= 0) return null

  const progressPercentage = durationMs > 0 ? Math.min(100, (progress / durationMs) * 100) : 0

  return (
    <div className="mt-3 space-y-1.5 z-20 relative">
      <Progress value={progressPercentage} className="w-full">
        <ProgressTrack>
          <ProgressIndicator className="bg-emerald-500 group-hover/spotify:bg-emerald-400" />
        </ProgressTrack>
      </Progress>
      <div
        className="flex items-center justify-between text-xs font-mono text-muted-foreground"
        aria-hidden="true"
      >
        <span>{formatTime(progress)}</span>
        <span>{formatTime(durationMs)}</span>
      </div>
    </div>
  )
}
