function normalizeBaseUrl(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

  try {
    const parsed = new URL(withScheme)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null
    }
    return parsed.toString().replace(/\/+$/, '')
  } catch {
    return null
  }
}

export function getBaseUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ]

  for (const candidate of candidates) {
    if (!candidate) continue
    const normalized = normalizeBaseUrl(candidate)
    if (normalized) return normalized
  }

  return 'http://localhost:3000'
}

export const siteConfig = {
  name: 'Brandon Argel',
  shortName: 'Brandon',
  title: 'Brandon Argel | Full Stack Developer & UI/UX Specialist',
  description:
    'Full Stack Developer specialized in React, Next.js, and TypeScript. Building high-performance web applications and scalable architectures.',
  url: getBaseUrl(),
  ogImage: `${getBaseUrl()}/opengraph-image.jpg`,
  author: {
    name: 'Brandon Argel',
    role: 'Full Stack Developer',
    url: 'https://brandonargel.com',
    handle: '@brandonargel',
  },
  links: {
    github: 'https://github.com/BrandonArgel',
    linkedin: 'https://www.linkedin.com/in/brandon-argel-verdeja-dominguez-448202213',
    facebook: 'https://www.facebook.com/brandonargel.dominguez',
    youtube: 'https://www.youtube.com/@brandonargelverdejadomingu338',
    email: 'mailto:contact@brandonargel.com',
  },
} as const
