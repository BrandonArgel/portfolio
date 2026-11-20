export const PUBLIC_VIEWS_THRESHOLD = 50

export const ADMIN_POST_SORT_OPTIONS = ['latest', 'oldest', 'views_desc', 'views_asc'] as const
export type AdminPostSort = (typeof ADMIN_POST_SORT_OPTIONS)[number]

export function normalizeAdminPostSort(value?: string): AdminPostSort {
  return ADMIN_POST_SORT_OPTIONS.find((option) => option === value) ?? 'latest'
}
