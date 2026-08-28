import type { LucideIcon } from 'lucide-react'

export type HeroFeatureKey =
  | 'frontend_development'
  | 'backend_architecture'
  | 'full_stack_solutions'

export interface HeroFeatureColors {
  iconBg: string
  iconText: string
}

export interface HeroFeatureConfig {
  key: HeroFeatureKey
  icon: LucideIcon
  position: string
  colors: HeroFeatureColors
}

export interface UseAutoRotateOptions {
  totalItems: number
  intervalMs?: number
  isPaused?: boolean
}

export interface UseAutoRotateReturn {
  activeIndex: number
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>
  pauseHandlers: {
    onMouseEnter: () => void
    onMouseLeave: () => void
    onTouchStart: () => void
    onTouchEnd: () => void
    onFocusCapture: () => void
    onBlurCapture: () => void
  }
}
