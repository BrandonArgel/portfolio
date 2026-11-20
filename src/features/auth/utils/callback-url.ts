export function resolveSafeCallbackUrl(rawCallbackUrl: string | null | undefined): string | null {
  if (!rawCallbackUrl) return null
  // Reject protocol-relative (`//evil.com`) and external origins; allow internal app paths only.
  if (!rawCallbackUrl.startsWith('/') || rawCallbackUrl.startsWith('//')) {
    return null
  }
  return rawCallbackUrl
}

export function getSafeCallbackUrlFromLocation(): string | null {
  if (typeof window === 'undefined') return null
  const rawCallbackUrl = new URLSearchParams(window.location.search).get('callbackUrl')
  return resolveSafeCallbackUrl(rawCallbackUrl)
}
