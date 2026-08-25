'use client'

import { CircleX } from 'lucide-react'
import { type Control, Controller, type FieldValues, type Path } from 'react-hook-form'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { PasswordInput } from '@/features/auth/components/password-input'

interface ControlledInputProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  type?: string
  placeholder?: string
  autoComplete?: string
  isPassword?: boolean
  children?: React.ReactNode
}

export function ControlledInput<T extends FieldValues>({
  control,
  name,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  isPassword,
  children,
}: ControlledInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid || undefined}>
          <FieldLabel htmlFor={`${name}-input`}>{label}</FieldLabel>

          {isPassword ? (
            <PasswordInput
              {...field}
              id={`${name}-input`}
              autoComplete={autoComplete}
              placeholder={placeholder}
              aria-invalid={fieldState.invalid || undefined}
            >
              {children}
            </PasswordInput>
          ) : (
            <InputGroup>
              <InputGroupInput
                {...field}
                id={`${name}-input`}
                type={type}
                placeholder={placeholder}
                autoComplete={autoComplete}
                aria-invalid={fieldState.invalid || undefined}
              />
              {fieldState.invalid && (
                <InputGroupAddon align="inline-end">
                  <CircleX className="size-4 text-destructive" aria-hidden="true" />
                </InputGroupAddon>
              )}
            </InputGroup>
          )}

          {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
        </Field>
      )}
    />
  )
}
