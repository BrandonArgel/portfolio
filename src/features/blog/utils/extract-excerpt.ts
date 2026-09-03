export function extractExcerpt(content: string, maxLength = 200): string {
  // Strip basic markdown syntax
  const clean = content
    .replace(/#+\s+/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[*_`~]/g, '')
    .trim()

  if (clean.length <= maxLength) return clean
  return `${clean.slice(0, maxLength).trim()}...`
}
