export type TestimonialKey = 'sura_cedeno' | 'carlos_cespedes' | 'aaron_garibay' | 'joel_campos'

export interface TestimonialItem {
  key: TestimonialKey
  name: string
  company?: string
  linkedInUrl?: string
  avatarUrl?: string
  initials: string
}

export interface UseTestimonialCarouselOptions {
  totalItems: number
  intervalMs?: number
  isPaused?: boolean
}

export interface UseTestimonialCarouselReturn {
  activeIndex: number
  setActiveIndex: (index: number) => void
  next: () => void
  prev: () => void
  goTo: (index: number) => void
  pauseHandlers: {
    onMouseEnter: () => void
    onMouseLeave: () => void
    onTouchStart: () => void
    onTouchEnd: () => void
    onFocusCapture: () => void
    onBlurCapture: () => void
  }
}
