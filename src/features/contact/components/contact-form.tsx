'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Send } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Controller, useForm } from 'react-hook-form'
import { sileo } from 'sileo'
import { ActionButton } from '@/components/ui/action-button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { ControlledInput } from '@/features/auth/components/controlled-input'
import { sendContactMessageAction } from '@/features/contact/actions/contact.action'
import { type ContactMessageForm, contactMessageSchema } from '../schemas/contact.schema'

interface ContactFormProps {
  className?: string
}

export function ContactForm({ className }: ContactFormProps) {
  const t = useTranslations('features.contact')

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ContactMessageForm>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  })

  async function handleSendMessage(data: ContactMessageForm) {
    try {
      const result = await sendContactMessageAction(data)

      if (result?.data?.success) {
        sileo.success({
          title: t('notifications.success_title'),
          description: t('notifications.success_description'),
        })
        reset()
      } else {
        const errorInfo = result?.serverError
        sileo.error({
          title:
            (typeof errorInfo === 'object' ? errorInfo?.title : errorInfo) ||
            t('notifications.error_title'),
          description:
            (typeof errorInfo === 'object' ? errorInfo?.description : undefined) ||
            t('notifications.error_description'),
        })
      }
    } catch (_error) {
      sileo.error({
        title: t('notifications.error_title'),
        description: t('notifications.error_description'),
      })
    }
  }

  return (
    <div
      className={`relative rounded-3xl border border-border/70 bg-card/60 p-7 sm:p-9 shadow-xl backdrop-blur-sm ${className || ''}`}
    >
      <form onSubmit={handleSubmit(handleSendMessage)} noValidate className="space-y-6">
        <FieldGroup>
          {/* Name & Email Row */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <ControlledInput
              control={control}
              name="name"
              label={t('labels.name')}
              placeholder={t('placeholders.name')}
              autoComplete="name"
            />

            <ControlledInput
              control={control}
              name="email"
              type="email"
              label={t('labels.email')}
              placeholder={t('placeholders.email')}
              autoComplete="email"
            />
          </div>

          {/* Subject Field */}
          <ControlledInput
            control={control}
            name="subject"
            label={t('labels.subject')}
            placeholder={t('placeholders.subject')}
          />

          {/* Message Textarea */}
          <Controller
            name="message"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor="message-input">{t('labels.message')}</FieldLabel>
                <Textarea
                  {...field}
                  id="message-input"
                  rows={5}
                  placeholder={t('placeholders.message')}
                  aria-invalid={fieldState.invalid || undefined}
                  className="min-h-32 resize-y"
                />
                {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
              </Field>
            )}
          />
        </FieldGroup>

        {/* Submit Action Button */}
        <div className="pt-2">
          <ActionButton
            type="submit"
            size="lg"
            variant="default"
            className="w-full gap-2 sm:w-auto"
            isLoading={isSubmitting}
            loadingText={t('actions.sending')}
          >
            <Send className="size-4" />
            <span>{t('actions.send')}</span>
          </ActionButton>
        </div>
      </form>
    </div>
  )
}
