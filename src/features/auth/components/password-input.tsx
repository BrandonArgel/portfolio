'use client'

import { EyeIcon, EyeOffIcon } from 'lucide-react'
import {
  type ChangeEvent,
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useDeferredValue,
  useMemo,
  useState,
} from 'react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const PasswordInputContext = createContext<{ password: string } | null>(null)

type PasswordInputProps = Omit<ComponentProps<typeof InputGroupInput>, 'type'> & {
  children?: ReactNode
}

export function PasswordInput({
  children,
  onChange,
  value,
  defaultValue,
  className,
  ref,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState(defaultValue ?? '')

  const Icon = showPassword ? EyeOffIcon : EyeIcon
  const currentValue = value ?? password

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    onChange?.(e)
  }

  return (
    <PasswordInputContext.Provider value={{ password: currentValue.toString() }}>
      <div className={cn('space-y-3', className)}>
        <InputGroup>
          <InputGroupInput
            {...props}
            ref={ref}
            value={value}
            defaultValue={defaultValue}
            type={showPassword ? 'text' : 'password'}
            onChange={handleChange}
          />
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
    </PasswordInputContext.Provider>
  )
}

function calculatePasswordStrength(password: string) {
  if (!password) return { score: 0, feedback: { warning: undefined } }

  let matchCount = 0
  const requirements = [
    { regex: /.{12,}/, text: 'Password must have at least 12 characters' },
    { regex: /[a-z]/, text: 'Add at least one lowercase letter' },
    { regex: /[A-Z]/, text: 'Add at least one uppercase letter' },
    { regex: /[0-9]/, text: 'Enter at least one number' },
    { regex: /[^A-Za-z0-9]/, text: 'Add at least one special character' },
  ]

  let firstMissingRequirement = ''

  requirements.forEach((req) => {
    if (req.regex.test(password)) {
      matchCount += 1
    } else if (!firstMissingRequirement) {
      firstMissingRequirement = req.text
    }
  })

  let finalScore = 0
  if (matchCount <= 2) finalScore = 1
  else if (matchCount === 3) finalScore = 2
  else if (matchCount === 4) finalScore = 3
  else if (matchCount === 5) finalScore = 4

  return {
    score: finalScore,
    feedback: { warning: firstMissingRequirement || undefined },
  }
}

export function PasswordInputStrengthChecker() {
  const { password } = usePasswordInput()
  const deferredPassword = useDeferredValue(password)

  const strengthResult = useMemo(() => {
    if (deferredPassword.length === 0) {
      return { score: 0, feedback: { warning: undefined } }
    }
    return calculatePasswordStrength(deferredPassword)
  }, [deferredPassword])

  function getLabel() {
    if (deferredPassword.length === 0) return 'Password strength'

    switch (strengthResult.score) {
      case 0:
      case 1:
        return 'Very weak'
      case 2:
        return 'Weak'
      case 3:
        return 'Strong'
      case 4:
        return 'Very strong'
      default:
        return ''
    }
  }

  const label = getLabel()

  return (
    <div className="space-y-0.5">
      <div
        role="progressbar"
        aria-label="Password strength"
        aria-valuenow={strengthResult.score}
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuetext={label}
        className="flex gap-1"
      >
        {[1, 2, 3, 4].map((level) => {
          const color = strengthResult.score >= 3 ? 'bg-primary' : 'bg-destructive'

          return (
            <div
              key={`strength-indicator-${level}`}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors duration-200',
                strengthResult.score >= level ? color : 'bg-border',
              )}
            />
          )
        })}
      </div>
      <div className="flex justify-end text-sm text-muted-foreground">
        {strengthResult.feedback.warning == null ? (
          label
        ) : (
          <Tooltip>
            <TooltipTrigger className="underline underline-offset-1 cursor-help">
              {label}
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={4} className="text-base">
              {strengthResult.feedback.warning}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  )
}

export const usePasswordInput = () => {
  const context = useContext(PasswordInputContext)
  if (context == null) {
    throw new Error('usePasswordInput must be used inside PasswordInputContext')
  }
  return context
}
