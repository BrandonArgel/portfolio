'use server'

import { actionClient } from '@/lib/safe-action'
import { contactMessageSchema } from '../schemas/contact.schema'

export const sendContactMessageAction = actionClient
  .schema(contactMessageSchema)
  .action(async ({ parsedInput: { name, email, subject, message } }) => {
    try {
      // Integrate email provider (Resend Nodemailer, etc.) or webhook
      console.log('Incoming contact message:', {
        name,
        email,
        subject,
        message,
        timestamp: new Date().toISOString(),
      })

      return {
        success: true,
        message: 'Message delivered successfully.',
      }
    } catch (_error) {
      throw new Error('Failed to deliver message. Please try again later.')
    }
  })
