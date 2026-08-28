'use client'

import Autoplay from 'embla-carousel-autoplay'
import * as React from 'react'
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { TESTIMONIAL_ROTATION_INTERVAL_MS, TESTIMONIALS_LIST } from '../constants/testimonials-data'
import { TestimonialCard } from './testimonial-card'
import { TestimonialControls } from './testimonial-controls'

export function TestimonialCarousel() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  const plugin = React.useRef(
    Autoplay({
      delay: TESTIMONIAL_ROTATION_INTERVAL_MS,
      stopOnMouseEnter: true,
      stopOnInteraction: false,
    }),
  )

  React.useEffect(() => {
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

  const handlePrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const handleNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  const handleSelect = React.useCallback(
    (index: number) => {
      api?.scrollTo(index)
    },
    [api],
  )

  return (
    <div className="flex w-full flex-col items-center">
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        opts={{
          loop: true,
          align: 'center',
        }}
        className="w-full max-w-3xl"
      >
        <CarouselContent>
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
