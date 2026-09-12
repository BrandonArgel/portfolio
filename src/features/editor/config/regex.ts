import { CALLOUT_TYPES } from './callout'

const calloutTypes = CALLOUT_TYPES.join('|')

export const MDX_REGEX = {
  calloutPrefix: new RegExp(`^:::(${calloutTypes})\\s$`),
  imagePrefix: /(?:^|\s)(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/,
} as const
