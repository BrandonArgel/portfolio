import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Section, SectionDescription, SectionHeader, SectionTitle } from '@/components/ui/section'

export interface NotFoundViewProps {
  badge: string
  title: string
  description: string
  actions: ReactNode
}

export function NotFoundView({ badge, title, description, actions }: NotFoundViewProps) {
  return (
    <Section
      withGlow
      className="my-auto py-16 sm:py-24"
      containerClassName="flex flex-col items-center justify-center text-center"
    >
      <div className="relative flex max-w-2xl flex-col items-center gap-6">
        <span
          aria-hidden="true"
          className="select-none bg-linear-to-b from-primary/25 via-primary/10 to-transparent bg-clip-text text-[7rem] leading-none font-extrabold tracking-tighter text-transparent sm:text-[9.5rem]"
        >
          404
        </span>

        <SectionHeader align="center" className="-mt-6 gap-4">
          <Badge variant="softPrimary" size="lg">
            {badge}
          </Badge>

          <SectionTitle as="h1" className="text-3xl sm:text-5xl">
            {title}
          </SectionTitle>

          <SectionDescription className="max-w-lg text-balance">{description}</SectionDescription>
        </SectionHeader>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">{actions}</div>
      </div>
    </Section>
  )
}
