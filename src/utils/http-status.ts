import { NextResponse } from 'next/server'

const HTTP_STATUS_BY_REASON: Readonly<Record<string, number>> = {
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  VALIDATION_ERROR: 400,
  DATABASE_ERROR: 500,
}

export function handleApiError(err: { reason: string; details?: unknown }) {
  const status = HTTP_STATUS_BY_REASON[err.reason] ?? 500
  return NextResponse.json({ success: false, error: err.reason }, { status })
}
