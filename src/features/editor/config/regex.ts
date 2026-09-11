export const MDX_REGEX = {
  calloutPrefix: /^>\[!([a-zA-Z]+)\]\s$/,
  imagePrefix: /(?:^|\s)(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/,
  // taskItemPrefix: /^\s*\[([ xX]?)\] $/,
} as const
