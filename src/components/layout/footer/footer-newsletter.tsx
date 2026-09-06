'use client'

import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function FooterNewsletter() {
  const t = useTranslations('components.layout.footer.newsletter')
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    setEmail('')
  }

  return (
    <div className="flex flex-col">
      <h3 className="text-base font-semibold tracking-tight text-foreground">{t('title')}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{t('description')}</p>

      <form onSubmit={handleSubmit} className="mt-3.5 flex flex-col">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('placeholder')}
          className="w-full rounded-lg border border-border/80 bg-background/60 px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary"
        />

        <Button
          type="submit"
          className="mt-2.5 w-full gap-1.5 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground shadow-md shadow-primary/25 transition-all duration-200 hover:bg-primary/90 active:scale-[0.99]"
        >
          <span>{t('button')}</span>
          <ArrowRight className="size-4" />
        </Button>

        <p className="mt-2 text-[11px] text-muted-foreground/70">{t('disclaimer')}</p>
      </form>
    </div>
  )
}
