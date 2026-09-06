'use client'

import { Check, Copy, Mail, MapPin, MessageSquare } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { sileo } from 'sileo'
import { Badge } from '@/components/ui/badge'
import { PingDot } from '@/components/ui/ping-dot'
import { cn } from '@/lib/utils'

interface ContactInfoProps {
  className?: string
}

export function ContactInfo({ className }: ContactInfoProps) {
  const t = useTranslations('features.contact')
  const [copied, setCopied] = useState(false)
  const email = 'brandargel@gmail.com'

  async function handleCopyEmail() {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      sileo.success({
        title: t('actions.copied'),
        description: email,
      })
      setTimeout(() => setCopied(false), 2500)
    } catch (_error) {
      // Fallback
    }
  }

  return (
    <div
      className={cn(
        'relative flex flex-col justify-between rounded-3xl border border-border/70 bg-card/60 p-7 sm:p-9 shadow-xl backdrop-blur-sm transition-all duration-300',
        className,
      )}
    >
      <div>
        {/* Availability Status Badge */}
        <div className="mb-6">
          <Badge variant="softGreen" size="lg" className="gap-2">
            <PingDot />
            <span>{t('status')}</span>
          </Badge>
        </div>

        {/* Headline & Intro */}
        <h3 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t('info_title')}
        </h3>

        <p className="mb-8 text-base leading-relaxed text-muted-foreground">
          {t('info_description')}
        </p>

        {/* Contact Channels List */}
        <div className="space-y-4">
          {/* Email Item */}
          <div className="group/item flex items-center justify-between rounded-2xl border border-border/60 bg-muted/30 dark:bg-slate-900/50 p-4 transition-colors hover:border-primary/40 hover:bg-muted/50">
            <div className="flex items-center gap-3.5">
              <div className="flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <Mail className="size-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">{t('details.email')}</p>
                <a
                  href={`mailto:${email}`}
                  className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
                >
                  {email}
                </a>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyEmail}
              aria-label={t('actions.copy_email')}
              title={t('actions.copy_email')}
              className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border/60 bg-background/80 text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:text-primary active:scale-95"
            >
              {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
            </button>
          </div>

          {/* WhatsApp / Phone Item */}
          <a
            href="https://wa.me/+523327161523"
            target="_blank"
            rel="noopener noreferrer"
            className="group/item flex items-center justify-between rounded-2xl border border-border/60 bg-muted/30 dark:bg-slate-900/50 p-4 transition-colors hover:border-emerald-500/40 hover:bg-muted/50"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex size-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                <MessageSquare className="size-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">{t('details.whatsapp')}</p>
                <p className="text-sm font-semibold text-foreground transition-colors group-hover/item:text-emerald-400">
                  +52 33 2716 1523
                </p>
              </div>
            </div>
          </a>

          {/* Location Item */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-border/60 bg-muted/30 dark:bg-slate-900/50 p-4">
            <div className="flex size-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
              <MapPin className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t('details.location')}</p>
              <p className="text-sm font-semibold text-foreground">{t('details.location_value')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
