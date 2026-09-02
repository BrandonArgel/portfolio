export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
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

export type SiteConfig = typeof siteConfig
