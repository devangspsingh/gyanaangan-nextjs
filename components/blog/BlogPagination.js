import Link from 'next/link';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function BlogPagination({ currentPage, totalPages }) {
  // Simple URL creator without client-side hooks
  const createPageUrl = (page) => {
    return page === 1 ? '/blog' : `/blog?page=${page}`;
  };

  // Calculate page numbers to display
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const pages = [];
    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

    // Always show first page
    pages.push(1);

    // Add ellipsis after first page if needed
    if (rangeStart > 2) {
      pages.push('...');
    }

    // Add pages around current page
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (rangeEnd < totalPages - 1) {
      pages.push('...');
    }

    // Always show last page (if more than 1 page)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) return null;

  return (
    <Pagination className="mt-12">
      <PaginationContent>
        {/* Previous Button */}
        <PaginationItem>
          {currentPage > 1 ? (
            <Link href={createPageUrl(currentPage - 1)} passHref legacyBehavior>
              <PaginationPrevious />
            </Link>
          ) : (
            <PaginationPrevious 
              className="pointer-events-none opacity-50"
              aria-disabled="true"
            />
          )}
        </PaginationItem>

        {/* Page Numbers */}
        {pageNumbers.map((pageNum, idx) => {
          if (pageNum === '...') {
            return (
              <PaginationItem key={`ellipsis-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          const isActive = pageNum === currentPage;
          
          return (
            <PaginationItem key={pageNum}>
              {isActive ? (
                <PaginationLink isActive>
                  {pageNum}
                </PaginationLink>
              ) : (
                <Link href={createPageUrl(pageNum)} passHref legacyBehavior>
                  <PaginationLink>
                    {pageNum}
                  </PaginationLink>
                </Link>
              )}
            </PaginationItem>
          );
        })}

        {/* Next Button */}
        <PaginationItem>
          {currentPage < totalPages ? (
            <Link href={createPageUrl(currentPage + 1)} passHref legacyBehavior>
              <PaginationNext />
            </Link>
          ) : (
            <PaginationNext 
              className="pointer-events-none opacity-50"
              aria-disabled="true"
            />
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
