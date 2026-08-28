import { useEffect, useState } from 'react'
import type { UseAutoRotateOptions, UseAutoRotateReturn } from '../types'

export const useAutoRotate = ({
  totalItems,
  intervalMs = 3000,
  isPaused = false,
}: UseAutoRotateOptions): UseAutoRotateReturn => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (isHovered || isPaused) return

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalItems)
    }, intervalMs)

    return () => clearInterval(timer)
  }, [isHovered, isPaused, totalItems, intervalMs])

  const pauseHandlers = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    onTouchStart: () => setIsHovered(true),
    onTouchEnd: () => setIsHovered(false),
    onFocusCapture: () => setIsHovered(true),
    onBlurCapture: () => setIsHovered(false),
  }

  return {
    activeIndex,
    setActiveIndex,
    pauseHandlers,
  }
}
