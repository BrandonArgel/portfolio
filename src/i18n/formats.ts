import type { Formats } from 'next-intl'

export const formats: Formats = {
  dateTime: {
    short: { day: 'numeric', month: 'short', year: 'numeric' },
  },
  number: {},
}
