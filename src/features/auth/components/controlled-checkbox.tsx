'use client'

import { type Control, Controller, type FieldValues, type Path } from 'react-hook-form'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'

interface ControlledCheckboxProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  children?: React.ReactNode
}

export function ControlledCheckbox<T extends FieldValues>({
  control,
  name,
  children,
}: ControlledCheckboxProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, ...fieldProps }, fieldState }) => (
        <Field data-invalid={fieldState.invalid || undefined}>
          <div className="flex items-center gap-2">
            <Checkbox
              {...fieldProps}
              checked={value}
              onCheckedChange={onChange}
              id={`${name}-checkbox`}
              aria-invalid={fieldState.invalid || undefined}
            />
            <FieldLabel htmlFor={`${name}-checkbox`}>{children}</FieldLabel>
          </div>
          {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
        </Field>
      )}
    />
  )
}
