'use client'

import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { usePathname } from '@/i18n/navigation'

interface BlogPaginationProps {
  totalPages: number
  currentPage: number
}

export function BlogPagination({ totalPages, currentPage }: BlogPaginationProps) {
  const t = useTranslations('features.blog.reader.pagination')
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 'ellipsis', totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(
          1,
          'ellipsis',
          currentPage - 1,
          currentPage,
          currentPage + 1,
          'ellipsis',
          totalPages,
        )
      }
    }

    return pages
  }

  const pages = getPageNumbers()
  const isFirstPage = currentPage <= 1
  const isLastPage = currentPage >= totalPages

  return (
    <Pagination className="pt-6 sm:pt-8">
      <PaginationContent>
        {/* Previous Page Link */}
        <PaginationItem>
          <PaginationPrevious
            href={isFirstPage ? '#' : createPageURL(currentPage - 1)}
            disabled={isFirstPage}
            text={t('previous')}
          />
        </PaginationItem>

        {/* Page Number Items with Smart Ellipsis */}
        {pages.map((p, idx) => {
          if (p === 'ellipsis') {
            return (
              <PaginationItem key={`ellipsis-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            )
          }

          const isActive = p === currentPage
          return (
            <PaginationItem key={p}>
              <PaginationLink
                href={createPageURL(p)}
                isActive={isActive}
                aria-label={t(isActive ? 'aria_current' : 'aria_page', { page: p })}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          )
        })}

        {/* Next Page Link */}
        <PaginationItem>
          <PaginationNext
            href={isLastPage ? '#' : createPageURL(currentPage + 1)}
            disabled={isLastPage}
            text={t('next')}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
