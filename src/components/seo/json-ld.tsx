interface JsonLdProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>
}

/**
 * Safely renders JSON-LD schema markup into the HTML document.
 * Escapes `<`, `>`, `&` and the U+2028/U+2029 line separators so user-authored strings
 * (titles, descriptions, category names) can never break out of the script tag.
 */
export function JsonLd({ data }: JsonLdProps) {
  const jsonString = JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for injecting JSON-LD schema markup
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  )
}
