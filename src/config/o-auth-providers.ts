import type { ComponentProps, ElementType } from 'react'
import { DiscordIcon, FacebookIcon, GitHubIcon, GoogleIcon } from '@/assets/icons/o-auth'

export const SUPPORTED_OAUTH_PROVIDERS = ['google', 'github', 'facebook', 'discord'] as const

export const SUPPORTED_OAUTH_PROVIDER_DETAILS: Record<
  SupportedOAuthProvider,
  { name: string; Icon: ElementType<ComponentProps<'svg'>> }
> = {
  discord: { name: 'Discord', Icon: DiscordIcon },
  github: { name: 'GitHub', Icon: GitHubIcon },
  google: { name: 'Google', Icon: GoogleIcon },
  facebook: { name: 'Facebook', Icon: FacebookIcon },
}

export type SupportedOAuthProvider = (typeof SUPPORTED_OAUTH_PROVIDERS)[number]
