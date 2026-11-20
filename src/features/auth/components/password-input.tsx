'use client'

import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { type ComponentProps, type ReactNode, useState } from 'react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { cn } from '@/lib/utils'

type PasswordInputProps = Omit<ComponentProps<typeof InputGroupInput>, 'type'> & {
  children?: ReactNode
}

export function PasswordInput({ children, className, ref, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const Icon = showPassword ? EyeOffIcon : EyeIcon

  return (
    <div className={cn('space-y-3', className)}>
      <InputGroup>
        <InputGroupInput {...props} ref={ref} type={showPassword ? 'text' : 'password'} />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
          >
            <Icon className="size-4.5" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {children}
    </div>
  )
}
