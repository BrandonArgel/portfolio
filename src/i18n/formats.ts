import type { Formats } from 'next-intl'

export const formats: Formats = {
  dateTime: {
    short: { day: 'numeric', month: 'short', year: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' },
  },
  number: {},
}
