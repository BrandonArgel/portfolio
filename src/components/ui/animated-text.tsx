'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedTextProps {
  text: string
  className?: string
}

export const AnimatedText = ({ text, className = '' }: AnimatedTextProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLSpanElement>(null)

  const words = text.split(' ')
  let letterCount = 0

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.5,
      },
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <span ref={containerRef} className={cn('flex flex-wrap gap-x-[0.25em]', className)}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-flex overflow-hidden">
          {word.split('').map((letter) => {
            const currentDelayIndex = letterCount++

            return (
              <span
                key={currentDelayIndex}
                className={cn(
                  'relative inline-block transition-transform duration-300 ease-in-out',
                  'group-hover/anim:translate-y-[-1.5em]',
                  isVisible && '[@media(hover:none)]:translate-y-[-1.5em]',
                )}
                style={{ transitionDelay: `${currentDelayIndex * 20}ms` }}
              >
                <span>{letter}</span>

                <span className="absolute left-0 top-[1.5em] text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary">
                  {letter}
                </span>
              </span>
            )
          })}
        </span>
      ))}
    </span>
  )
}
