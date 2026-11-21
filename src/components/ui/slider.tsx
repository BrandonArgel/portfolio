'use client'

import { Slider as SliderPrimitive } from '@base-ui/react/slider'
import { cn } from '@/lib/utils'

interface SliderProps extends SliderPrimitive.Root.Props<number> {
  ariaLabel?: string
}

function Slider({ className, ariaLabel, ...props }: SliderProps) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn('relative flex w-full items-center select-none', className)}
      {...props}
    >
      <SliderPrimitive.Control
        data-slot="slider-control"
        className="flex w-full touch-none items-center py-2 select-none"
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-indicator"
            className="h-full rounded-full bg-primary"
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          getAriaLabel={ariaLabel ? () => ariaLabel : undefined}
          className="block size-4 rounded-full border border-primary/50 bg-background shadow-sm transition-colors outline-none hover:border-primary focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
        />
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
