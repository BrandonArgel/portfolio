import { useTranslations } from 'next-intl'
import type { ComponentProps, ElementType } from 'react'
import {
  EmailIcon,
  FacebookIcon,
  GitHubIcon,
  InstagramIcon,
  LinkedInIcon,
  WhatsAppIcon,
  YouTubeIcon,
} from '@/assets/icons/social'
import { LinkButton } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const SOCIAL_LINKS: {
  id: 'linkedin' | 'github' | 'facebook' | 'instagram' | 'youtube' | 'email' | 'whatsapp'
  Icon: ElementType<ComponentProps<'svg'>>
  href: string
}[] = [
  { id: 'linkedin', Icon: LinkedInIcon, href: 'https://www.linkedin.com/in/brandargel' },
  { id: 'github', Icon: GitHubIcon, href: 'https://github.com/BrandonArgel' },
  { id: 'facebook', Icon: FacebookIcon, href: 'https://www.facebook.com/brandonargel.dominguez' },
  { id: 'instagram', Icon: InstagramIcon, href: 'https://www.instagram.com/brandargel' },
  {
    id: 'youtube',
    Icon: YouTubeIcon,
    href: 'https://www.youtube.com/@brandonargelverdejadomingu338',
  },
  { id: 'email', Icon: EmailIcon, href: 'mailto:brandargel@gmail.com' },
  { id: 'whatsapp', Icon: WhatsAppIcon, href: 'https://wa.me/+523327161523' },
]

interface SocialLinksProps {
  className?: string
}

export function SocialLinks({ className }: SocialLinksProps) {
  const t = useTranslations('features.hero.social')

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {SOCIAL_LINKS.map(({ id, Icon, href }) => {
        const isEmail = id === 'email'
        const label = t(`${id}.label`)

        return (
          <LinkButton
            key={id}
            variant="outline"
            href={href}
            target={isEmail ? '_self' : '_blank'}
            rel={isEmail ? undefined : 'noopener noreferrer'}
            aria-label={label}
            title={label}
            className={cn(
              'flex size-8.5 items-center justify-center rounded-full border border-border/70 bg-card/60 text-muted-foreground transition-all duration-200 hover:scale-110 hover:border-primary/40! hover:bg-primary/10 hover:text-primary hover:shadow-md',
            )}
          >
            <Icon className="size-4 transition-transform duration-200 group-hover:scale-110" />
            <span className="sr-only">{label}</span>
          </LinkButton>
        )
      })}
    </div>
  )
}
