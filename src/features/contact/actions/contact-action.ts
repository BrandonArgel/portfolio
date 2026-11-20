'use server'

import { error, fromPromise, type Result } from '@/utils/result'
import { type ContactMessageForm, contactMessageSchema } from '../schemas/contact-schema'
import type { ContactError } from '../types/errors'

export async function sendContactMessageAction(
  input: ContactMessageForm,
): Promise<Result<{ delivered: true }, ContactError>> {
  const parsed = contactMessageSchema.safeParse(input)
  if (!parsed.success) {
    return error({ reason: 'VALIDATION_ERROR' })
  }

  const { name, email, subject, message } = parsed.data

  return fromPromise(
    async () => {
      // Integrate email provider (Resend, Nodemailer, etc.) or webhook
      console.log('Incoming contact message:', {
        name,
        email,
        subject,
        message,
        timestamp: new Date().toISOString(),
      })

      return { delivered: true as const }
    },
    (thrown) => {
      console.error('Error delivering contact message:', thrown)
      return { reason: 'DELIVERY_FAILED', details: thrown }
    },
  )
}
