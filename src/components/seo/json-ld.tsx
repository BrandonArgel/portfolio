interface JsonLdProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>
}

/**
 * Safely renders JSON-LD schema markup into the HTML document.
 * Escapes `<` characters to prevent potential XSS injection inside script tags.
 */
export function JsonLd({ data }: JsonLdProps) {
  const jsonString = JSON.stringify(data).replace(/</g, '\\u003c')

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for injecting JSON-LD schema markup
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  )
}
