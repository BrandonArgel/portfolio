import { describe, expect, test } from 'bun:test'
import {
  buildBlogPostingJsonLd,
  buildPostLanguageAlternates,
  buildSeoDescription,
  resolvePostOgImage,
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

  test('falls back to a clean excerpt when the description is empty', () => {
    const result = buildSeoDescription('', `# Title\n\n${'word '.repeat(100)}`)
    expect(result.startsWith('Title word')).toBe(true)
    expect(result.length).toBeLessThanOrEqual(160)
  })
})

describe('resolvePostOgImage', () => {
  const post = {
    title: 'Hello',
    slug: 'hello',
    locale: 'es',
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  }

  test('uses the cover image as an absolute URL', () => {
    const image = resolvePostOgImage({ ...post, coverImage: '/uploads/a.jpg' }, BASE)
    expect(image).toEqual({
      url: `${BASE}/uploads/a.jpg`,
      width: 1200,
      height: 630,
      alt: 'Hello',
    })
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
  test('includes the required BlogPosting fields', () => {
    const data = buildBlogPostingJsonLd(
      {
        title: 'T',
        description: 'D',
        slug: 's',
        locale: 'en',
        authorName: 'Brandon',
        categoryNames: ['TypeScript', 'Next.js'],
        imageUrl: `${BASE}/api/og?slug=s`,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-02-01T00:00:00Z'),
      },
      BASE,
    )

    expect(data['@type']).toBe('BlogPosting')
    expect(data.headline).toBe('T')
    expect(data.image).toEqual([`${BASE}/api/og?slug=s`])
    expect(data.datePublished).toBe('2026-01-01T00:00:00.000Z')
    expect(data.dateModified).toBe('2026-02-01T00:00:00.000Z')
    expect(data.inLanguage).toBe('en')
    expect(data.mainEntityOfPage).toEqual({ '@type': 'WebPage', '@id': `${BASE}/en/blog/s` })
    expect(data.keywords).toBe('TypeScript, Next.js')
    expect((data.author as { '@type': string })['@type']).toBe('Person')
    expect((data.publisher as { '@type': string })['@type']).toBe('Organization')
  })
})

describe('toAbsoluteUrl', () => {
  test('resolves relative paths against the base URL', () => {
    expect(toAbsoluteUrl('/a/b.png', BASE)).toBe(`${BASE}/a/b.png`)
  })
})
