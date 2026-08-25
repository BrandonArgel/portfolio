export const getInitials = (name?: string | null, fallback = 'U'): string => {
  const cleanName = name?.trim()
  if (!cleanName) return fallback

  return cleanName
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}
