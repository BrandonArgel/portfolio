import type { ElementType } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type CardColor, themeVariants } from '@/components/ui/card-variants'
import { cn } from '@/lib/utils'

interface AboutPhilosophyCardProps {
  icon: ElementType
  title: string
  description: string
  index: number
  color: CardColor
  className?: string
}

export function AboutPhilosophyCard({
  icon: Icon,
  title,
  description,
  index,
  color,
  className,
}: AboutPhilosophyCardProps) {
  const formattedIndex = String(index + 1).padStart(2, '0')

  return (
    <Card
      className={cn(
        themeVariants.wrapper({ color }),
        'rounded-2xl [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(7)]',
        className,
      )}
    >
      <CardHeader className="pb-2">
        <div className="mb-3 flex items-center justify-between">
          <div className={cn(themeVariants.iconBox({ color }), 'size-11')}>
            <Icon className="size-5" />
          </div>

          <span className="font-mono text-xs font-semibold tracking-wider text-muted-foreground/60 transition-colors group-hover/card:text-muted-foreground">
            {formattedIndex}
          </span>
        </div>

        <CardTitle className={cn(themeVariants.title({ color }), 'text-lg font-bold')}>
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
