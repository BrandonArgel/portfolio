'use client'

import Autoplay from 'embla-carousel-autoplay'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { TESTIMONIAL_ROTATION_INTERVAL_MS, TESTIMONIALS_LIST } from '../constants/testimonials-data'
import { TestimonialCard } from './testimonial-card'
import { TestimonialControls } from './testimonial-controls'

export function TestimonialCarousel() {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  const pluginAutoplay = useRef(
    Autoplay({
      delay: TESTIMONIAL_ROTATION_INTERVAL_MS,
      stopOnMouseEnter: true,
      stopOnInteraction: false,
    }),
  )

  const pluginWheel = useRef(
    WheelGesturesPlugin({
      forceWheelAxis: 'x',
      wheelDraggingClass: 'is-wheel-dragging',
    }),
  )

  useEffect(() => {
    if (!api) return

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap())
    }

    api.on('select', onSelect)
    api.on('reInit', onSelect)

    return () => {
      api.off('select', onSelect)
      api.off('reInit', onSelect)
    }
  }, [api])

  useEffect(() => {
    if (!api) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const autoplayPlugin = api.plugins().autoplay

          if (!autoplayPlugin) return

          try {
            if (entry.isIntersecting) {
              autoplayPlugin.play()
            } else {
              autoplayPlugin.stop()
            }
          } catch (error) {
            console.debug("The Embla Autoplay plugin wasn't ready:", error)
          }
        })
      },
      { threshold: 0.5 },
    )

    const rootNode = api.rootNode()
    if (rootNode) {
      observer.observe(rootNode)
    }

    return () => {
      if (rootNode) observer.unobserve(rootNode)
      observer.disconnect()
    }
  }, [api])

  const handlePrev = useCallback(() => api?.scrollPrev(), [api])
  const handleNext = useCallback(() => api?.scrollNext(), [api])
  const handleSelect = useCallback((index: number) => api?.scrollTo(index), [api])

  return (
    <div className="flex w-full flex-col items-center">
      <Carousel
        setApi={setApi}
        plugins={[pluginAutoplay.current, pluginWheel.current]}
        opts={{
          loop: true,
          align: 'center',
          skipSnaps: false,
        }}
        className="w-full max-w-3xl"
      >
        <CarouselContent className="p-1">
          {TESTIMONIALS_LIST.map((testimonial) => (
            <CarouselItem key={testimonial.key} className="flex justify-center">
              <TestimonialCard testimonial={testimonial} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <TestimonialControls
        total={count || TESTIMONIALS_LIST.length}
        activeIndex={current}
        onPrev={handlePrev}
        onNext={handleNext}
        onSelect={handleSelect}
        className="mt-8"
      />
    </div>
  )
}
