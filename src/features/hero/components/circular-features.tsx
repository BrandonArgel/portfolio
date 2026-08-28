'use client'

import { useRef } from 'react'
import { useIsVisible } from '@/hooks/use-is-visible'
import { HERO_FEATURES, ROTATION_INTERVAL_MS } from '../constants/hero-features'
import { useAutoRotate } from '../hooks/use-auto-rotate'
import { FeatureCard } from './feature-card'

export function CircularFeatures() {
  const containerRef = useRef<HTMLDivElement>(null)
  const isVisible = useIsVisible(containerRef)

  const { activeIndex, setActiveIndex, pauseHandlers } = useAutoRotate({
    totalItems: HERO_FEATURES.length,
    intervalMs: ROTATION_INTERVAL_MS,
    isPaused: !isVisible,
  })

  return (
    <div className="mt-10 w-full">
      <div
        ref={containerRef}
        role="tablist"
        aria-label="Highlighted areas of expertise"
        className="relative mx-auto flex h-100 w-full max-w-140 origin-center items-center justify-center transition-transform duration-300 lg:justify-end"
        {...pauseHandlers}
      >
        {HERO_FEATURES.map((feature, index) => (
          <FeatureCard
            key={feature.key}
            feature={feature}
            isActive={activeIndex === index}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  )
}
