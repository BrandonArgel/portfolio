import { describe, expect, test } from 'bun:test'
import { siteConfig } from '@/config/site'
import {
  buildBlogPostingJsonLd,
  buildBlogPostMetadata,
  buildPostLanguageAlternates,
  buildSeoDescription,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  resolvePostOgImage,
  SEO_DESCRIPTION_MAX_LENGTH,
  stripMarkdown,
  toAbsoluteUrl,
  truncateText,
} from './post-seo'

const BASE = 'https://brandonargel.com'

describe('stripMarkdown', () => {
  test('removes headings, emphasis, links, images, code and MDX syntax', () => {
    const md = [
      '---',
      'title: x',
      '---',
      "import Foo from './foo'",
      '# Heading',
      'Some **bold** and _italic_ text with a [link](https://a.b) and `code`.',
      '![alt](img.png)',
      '```ts',
      'const secret = 1',
      '```',
      '<Callout type="info">Inside</Callout>',
      '- list item',
    ].join('\n')

    const result = stripMarkdown(md)

    expect(result).toBe('Heading Some bold and italic text with a link and code. Inside list item')
    expect(result).not.toContain('secret')
  })
})

describe('truncateText / buildSeoDescription', () => {
  test('truncates at a word boundary with an ellipsis', () => {
    const result = truncateText('one two three four five six seven', 20)
    expect(result.endsWith('…')).toBe(true)
    expect(result.length).toBeLessThanOrEqual(20)
  })

  test('prefers the explicit description', () => {
    expect(buildSeoDescription('Hand-written **summary**', '# Body')).toBe('Hand-written summary')
  })

  test('falls back to a clean excerpt when the description is empty (~155 chars max)', () => {
    expect(SEO_DESCRIPTION_MAX_LENGTH).toBe(155)
    const result = buildSeoDescription('', `# Title\n\n${'word '.repeat(100)}`)
    expect(result.startsWith('Title word')).toBe(true)
    expect(result.length).toBeLessThanOrEqual(SEO_DESCRIPTION_MAX_LENGTH)
  })
})

describe('resolvePostOgImage', () => {
  const post = {
    title: 'Hello',
    slug: 'hello',
    locale: 'es',
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  }

  test('uses the cover image as an absolute URL and prefers coverImageAlt over title', () => {
    const image = resolvePostOgImage({ ...post, coverImage: '/uploads/a.jpg' }, BASE)
    expect(image).toEqual({
      url: `${BASE}/uploads/a.jpg`,
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      alt: 'Hello',
    })

    const withAlt = resolvePostOgImage(
      { ...post, coverImage: '/uploads/a.jpg', coverImageAlt: '  Architecture diagram  ' },
      BASE,
    )
    expect(withAlt.alt).toBe('Architecture diagram')
  })

  test('keeps absolute cover URLs untouched', () => {
    const url = 'https://cdn.example.com/a.webp'
    expect(resolvePostOgImage({ ...post, coverImage: url }, BASE).url).toBe(url)
  })

  test.each([null, undefined, '', '   '])('falls back to /api/og for %p', (coverImage) => {
    const { url } = resolvePostOgImage({ ...post, coverImage }, BASE)
    expect(url).toBe(`${BASE}/api/og?slug=hello&locale=es&v=${post.updatedAt.getTime()}`)
  })

  test('falls back to /api/og for formats social crawlers do not render', () => {
    const { url } = resolvePostOgImage({ ...post, coverImage: 'https://x.y/a.svg' }, BASE)
    expect(url.startsWith(`${BASE}/api/og?`)).toBe(true)
  })

  test('trims whitespace around cover URLs and rejects non-HTTP schemes', () => {
    expect(resolvePostOgImage({ ...post, coverImage: '  /uploads/clean.webp  ' }, BASE).url).toBe(
      `${BASE}/uploads/clean.webp`,
    )

    const { url } = resolvePostOgImage({ ...post, coverImage: 'data:image/png;base64,abc' }, BASE)
    expect(url).toBe(`${BASE}/api/og?slug=hello&locale=es&v=${post.updatedAt.getTime()}`)
  })
})

describe('buildBlogPostMetadata', () => {
  const basePost = {
    title: 'Production Architecture Notes',
    slug: 'production-architecture-notes',
    locale: 'en',
    content: '# Heading\n\nDetailed walkthrough of resilient server rendering and caching.',
    authorName: 'Brandon Argel',
    categories: [{ name: 'Architecture' }, { name: 'Next.js' }],
    createdAt: new Date('2026-01-10T00:00:00Z'),
    updatedAt: new Date('2026-02-15T00:00:00Z'),
  }

  test('builds complete article Open Graph and Twitter metadata when coverImage is set', () => {
    const metadata = buildBlogPostMetadata(
      {
        ...basePost,
        description: 'A clear architectural summary.',
        coverImage: '/uploads/cover.png',
      },
      [{ locale: 'es', slug: 'notas-de-arquitectura' }],
      BASE,
    )

    const og = metadata.openGraph as
      | {
          title?: string
          description?: string
          url?: string
          type?: string
          images?: Array<{ url: string; width?: number; height?: number; alt?: string }>
        }
      | undefined
    const twitter = metadata.twitter as
      | {
          card?: string
          title?: string
          description?: string
          images?: Array<{ url: string; alt?: string }>
        }
      | undefined

    expect(metadata.alternates?.canonical).toBe(`${BASE}/en/blog/production-architecture-notes`)
    expect(metadata.alternates?.languages).toEqual({
      en: `${BASE}/en/blog/production-architecture-notes`,
      es: `${BASE}/es/blog/notas-de-arquitectura`,
      'x-default': `${BASE}/en/blog/production-architecture-notes`,
    })
    expect(og?.title).toBe('Production Architecture Notes')
    expect(og?.description).toBe('A clear architectural summary.')
    expect(og?.url).toBe(`${BASE}/en/blog/production-architecture-notes`)
    expect(og?.type).toBe('article')
    expect(og?.images).toEqual([
      {
        url: `${BASE}/uploads/cover.png`,
        width: 1200,
        height: 630,
        alt: 'Production Architecture Notes',
      },
    ])
    expect(twitter?.card).toBe('summary_large_image')
    expect(twitter?.images).toEqual([
      {
        url: `${BASE}/uploads/cover.png`,
        alt: 'Production Architecture Notes',
      },
    ])
  })

  test('falls back to excerpt description and absolute /api/og URL when coverImage is missing', () => {
    const metadata = buildBlogPostMetadata(
      {
        ...basePost,
        description: null,
        coverImage: null,
      },
      [],
      BASE,
    )

    const expectedOgImage = `${BASE}/api/og?slug=production-architecture-notes&locale=en&v=${basePost.updatedAt.getTime()}`
    const og = metadata.openGraph as
      | {
          description?: string
          images?: Array<{ url: string; width?: number; height?: number; alt?: string }>
        }
      | undefined
    const twitter = metadata.twitter as
      | {
          images?: Array<{ url: string; alt?: string }>
        }
      | undefined

    expect(og?.description).toBe(
      'Heading Detailed walkthrough of resilient server rendering and caching.',
    )
    expect(og?.images).toEqual([
      {
        url: expectedOgImage,
        width: 1200,
        height: 630,
        alt: 'Production Architecture Notes',
      },
    ])
    expect(twitter?.images).toEqual([
      {
        url: expectedOgImage,
        alt: 'Production Architecture Notes',
      },
    ])
  })

  test('uses coverImageAlt, custom canonicalUrl, and noindex+follow on fallback locales', () => {
    const fallbackMetadata = buildBlogPostMetadata(
      {
        ...basePost,
        requestedLocale: 'fr',
        coverImage: '/uploads/diagram.webp',
        coverImageAlt: 'System architecture overview',
      },
      [],
      BASE,
    )

    expect(fallbackMetadata.alternates?.canonical).toBe(
      `${BASE}/en/blog/production-architecture-notes`,
    )
    expect(fallbackMetadata.robots).toEqual({
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true,
      },
    })

    const customCanonicalMetadata = buildBlogPostMetadata(
      {
        ...basePost,
        canonicalUrl: 'https://external.example.com/posts/architecture',
      },
      [],
      BASE,
    )

    expect(customCanonicalMetadata.alternates?.canonical).toBe(
      'https://external.example.com/posts/architecture',
    )
  })
})

describe('buildPostLanguageAlternates', () => {
  test('only lists locales with a published translation, plus x-default', () => {
    const languages = buildPostLanguageAlternates(
      { locale: 'es', slug: 'hola' },
      [
        { locale: 'en', slug: 'hello' },
        { locale: 'es', slug: 'hola' },
      ],
      BASE,
    )

    expect(languages).toEqual({
      en: `${BASE}/en/blog/hello`,
      es: `${BASE}/es/blog/hola`,
      'x-default': `${BASE}/en/blog/hello`,
    })
  })

  test('handles posts without translations', () => {
    expect(buildPostLanguageAlternates({ locale: 'fr', slug: 'salut' }, [], BASE)).toEqual({
      fr: `${BASE}/fr/blog/salut`,
      'x-default': `${BASE}/fr/blog/salut`,
    })
  })

  test('ignores unsupported locales', () => {
    const languages = buildPostLanguageAlternates(
      { locale: 'en', slug: 'a' },
      [{ locale: 'de', slug: 'b' }],
      BASE,
    )
    expect(Object.keys(languages).sort()).toEqual(['en', 'x-default'])
  })
})

describe('buildBlogPostingJsonLd', () => {
  test('includes the required TechArticle fields, author image, sameAs, and custom canonicalUrl', () => {
    const data = buildBlogPostingJsonLd(
      {
        title: 'T',
        description: 'D',
        slug: 's',
        locale: 'en',
        authorName: 'Brandon',
        authorImage: '/uploads/avatar.png',
        canonicalUrl: 'https://canonical.example.com/articles/s',
        categoryNames: ['TypeScript', 'Next.js'],
        imageUrl: `${BASE}/api/og?slug=s`,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-02-01T00:00:00Z'),
      },
      BASE,
    )

    expect(data['@type']).toBe('TechArticle')
    expect(data.headline).toBe('T')
    expect(data.image).toEqual([`${BASE}/api/og?slug=s`])
    expect(data.datePublished).toBe('2026-01-01T00:00:00.000Z')
    expect(data.dateModified).toBe('2026-02-01T00:00:00.000Z')
    expect(data.inLanguage).toBe('en')
    expect(data.url).toBe('https://canonical.example.com/articles/s')
    expect(data.mainEntityOfPage).toEqual({
      '@type': 'WebPage',
      '@id': 'https://canonical.example.com/articles/s',
    })
    expect(data.keywords).toBe('TypeScript, Next.js')
    expect(data.author).toEqual({
      '@type': 'Person',
      name: 'Brandon',
      url: siteConfig.author.url,
      image: `${BASE}/uploads/avatar.png`,
      sameAs: [siteConfig.links.github, siteConfig.links.linkedin, siteConfig.links.youtube],
    })
    expect((data.publisher as { '@type': string })['@type']).toBe('Organization')
  })
})

describe('toAbsoluteUrl', () => {
  test('resolves relative paths against the base URL', () => {
    expect(toAbsoluteUrl('/a/b.png', BASE)).toBe(`${BASE}/a/b.png`)
  })
})
