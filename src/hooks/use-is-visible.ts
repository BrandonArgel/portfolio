import { type RefObject, useEffect, useState } from 'react'

export function useIsVisible(ref: RefObject<HTMLElement | null>, threshold = 0.1) {
  const [isIntersecting, setIsIntersecting] = useState(true)
  const [isDocumentVisible, setIsDocumentVisible] = useState(true)

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsDocumentVisible(!document.hidden)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    handleVisibilityChange()

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      { threshold },
    )

    const currentRef = ref.current

    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
      observer.disconnect()
    }
  }, [ref, threshold])

  return isIntersecting && isDocumentVisible
}
