export function generateSlug(text: string): string {
  if (!text) return ''

  return text
    .toString()
    .normalize('NFD') // Separate the accents (ej. á -> a + ´)
    .replace(/[\u0300-\u036f]/g, '') // Eliminate the accents ortographics
    .toLowerCase() // Everything to lowercase
    .trim() // Remove spaces at the beginning and end
    .replace(/\s+/g, '-') // Replace spaces for hyphens
    .replace(/[^\w-]+/g, '') // Remove what is not a letter, number or hyphen
    .replace(/--+/g, '-') // Avoid double hyphens
}
