import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  total,
  limit,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const from = (currentPage - 1) * limit + 1
  const to = Math.min(currentPage * limit, total)

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (page) =>
      page === 1 ||
      page === totalPages ||
      (page >= currentPage - 1 && page <= currentPage + 1)
  )

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <p className="text-sm text-warm-500">
        Showing <span className="font-medium text-rail-800">{from}–{to}</span> of{' '}
        <span className="font-medium text-rail-800">{total}</span>
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="gap-1"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Prev
        </Button>

        {pages.map((page, idx) => {
          const prev = pages[idx - 1]
          const showEllipsis = prev !== undefined && page - prev > 1
          return (
            <span key={page} className="flex items-center gap-1">
              {showEllipsis && (
                <span className="px-1.5 text-warm-400 text-sm">…</span>
              )}
              <Button
                variant={currentPage === page ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onPageChange(page)}
                className="min-w-[32px]"
              >
                {page}
              </Button>
            </span>
          )
        })}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="gap-1"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
