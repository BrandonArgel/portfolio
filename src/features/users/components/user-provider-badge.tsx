'use client'

import { Mail } from 'lucide-react'
import type { ComponentProps, ElementType } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  SUPPORTED_OAUTH_PROVIDER_DETAILS,
  type SupportedOAuthProvider,
} from '@/features/auth/config/o-auth-providers'

interface UserProviderBadgeProps {
  providers: string[]
}

export function UserProviderBadge({ providers }: UserProviderBadgeProps) {
  if (!providers || providers.length === 0) {
    return (
      <Tooltip>
        <TooltipTrigger className="cursor-help p-1 rounded-md hover:bg-muted/50 transition-colors inline-flex">
          <Mail className="size-4 text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent>Email / Password</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      {providers.map((provider) => {
        if (provider in SUPPORTED_OAUTH_PROVIDER_DETAILS) {
          const details = SUPPORTED_OAUTH_PROVIDER_DETAILS[provider as SupportedOAuthProvider]
          const Icon = details.Icon as ElementType<ComponentProps<'svg'>>

          return (
            <Tooltip key={provider}>
              <TooltipTrigger className="cursor-help p-1 rounded-md hover:bg-muted/50 transition-colors inline-flex">
                <Icon className="size-4" />
              </TooltipTrigger>
              <TooltipContent>{details.name}</TooltipContent>
            </Tooltip>
          )
        }

        return (
          <Tooltip key={provider}>
            <TooltipTrigger className="cursor-help p-1 rounded-md hover:bg-muted/50 transition-colors inline-flex">
              <Mail className="size-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              {provider === 'credential' ? 'Email / Password' : provider}
            </TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}
