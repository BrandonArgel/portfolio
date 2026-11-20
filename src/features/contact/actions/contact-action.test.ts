import { describe, expect, spyOn, test } from 'bun:test'
import { sendContactMessageAction } from './contact-action'

describe('sendContactMessageAction', () => {
  test('returns VALIDATION_ERROR on invalid contact input', async () => {
    const res = await sendContactMessageAction({
      name: 'A',
      email: 'bad',
      subject: 'Hi',
      message: 'Short',
    })

    expect(res).toEqual([{ reason: 'VALIDATION_ERROR' }, null])
  })

  test('returns okay({ delivered: true }) for valid contact submissions', async () => {
    const logSpy = spyOn(console, 'log').mockImplementation(() => {})

    const res = await sendContactMessageAction({
      name: 'Brandon Argel',
      email: 'brandon@example.com',
      subject: 'New collaboration',
      message: 'Let us build something awesome together with Next.js.',
    })

    expect(res).toEqual([null, { delivered: true }])
    expect(logSpy).toHaveBeenCalledTimes(1)
    logSpy.mockRestore()
  })
})
