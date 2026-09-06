import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

interface AdminPaginationProps {
  currentPage: number
  totalPages: number
  searchParams: Record<string, string | undefined>
  prevText?: string
  nextText?: string
}

function buildHref(page: number, searchParams: Record<string, string | undefined>): string {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(searchParams)) {
    if (value && key !== 'page') {
      params.set(key, value)
    }
  }

  if (page > 1) {
    params.set('page', String(page))
  }

  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | 'ellipsis')[] = [1]

  if (current > 3) {
    pages.push('ellipsis')
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 2) {
    pages.push('ellipsis')
  }

  pages.push(total)

  return pages
}

export function AdminPagination({
  currentPage,
  totalPages,
  searchParams,
  prevText = 'Previous',
  nextText = 'Next',
}: AdminPaginationProps) {
  if (totalPages <= 1) return null

  const pageNumbers = getPageNumbers(currentPage, totalPages)

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={buildHref(currentPage - 1, searchParams)}
            disabled={currentPage <= 1}
            text={prevText}
          />
        </PaginationItem>

        {pageNumbers.map((pageNum, idx) => (
          <PaginationItem key={pageNum === 'ellipsis' ? `ellipsis-${idx}` : pageNum}>
            {pageNum === 'ellipsis' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href={buildHref(pageNum, searchParams)}
                isActive={pageNum === currentPage}
              >
                {pageNum}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            href={buildHref(currentPage + 1, searchParams)}
            disabled={currentPage >= totalPages}
            text={nextText}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
