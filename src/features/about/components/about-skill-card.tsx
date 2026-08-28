import type { ElementType } from 'react'
import { cn } from '@/lib/utils'

interface AboutSkillCardProps {
  icon: ElementType
  title: string
  description: string
  skills: string[]
  className?: string
}

export function AboutSkillCard({
  icon: Icon,
  title,
  description,
  skills,
  className,
}: AboutSkillCardProps) {
  return (
    <article
      className={cn(
        'group/skill-card relative flex flex-col justify-between rounded-2xl border border-border/70 bg-card/60 p-7 sm:p-8 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-card/90 hover:shadow-2xl hover:-translate-y-1',
        className,
      )}
    >
      <div>
        {/* Category Icon */}
        <div className="mb-5 flex size-11 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-primary transition-transform duration-300 group-hover/skill-card:scale-105">
          <Icon className="size-5" />
        </div>

        {/* Card Title */}
        <h3 className="mb-2 text-xl font-bold tracking-tight text-foreground transition-colors group-hover/skill-card:text-primary">
          {title}
        </h3>

        {/* Card Description */}
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{description}</p>

        {/* Bullet-point List */}
        <ul className="space-y-2.5">
          {skills.map((skill) => (
            <li
              key={skill}
              className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground/90 transition-colors group-hover/skill-card:text-foreground/90"
            >
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-full bg-blue-400 dark:bg-blue-500 shadow-[0_0_8px_rgba(96,165,250,0.6)]"
              />
              <span>{skill}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}
