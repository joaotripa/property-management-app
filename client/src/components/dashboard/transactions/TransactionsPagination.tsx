"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TransactionsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  loading?: boolean;
  canPreviousPage?: boolean;
  canNextPage?: boolean;
  pageCount?: number;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function TransactionsPagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loading = false,
  canPreviousPage = currentPage > 1,
  canNextPage = currentPage < totalPages,
}: TransactionsPaginationProps) {
  if (totalCount === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  // Generate page numbers to show
  const getPageNumbers = (isMobile = false) => {
    const delta = isMobile ? 0 : 2;
    const pages: (number | "...")[] = [];

    if (isMobile) {
      return [];
    }

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > delta + 2) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - delta);
      const end = Math.min(totalPages - 1, currentPage + delta);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - delta - 1) {
        pages.push("...");
      }

      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbersDesktop = getPageNumbers(false);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2 py-4">
      <div className="text-sm text-muted-foreground">
        {startItem}-{endItem} of {totalCount} transactions
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full sm:w-auto">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium hidden sm:inline">
            Rows per page
          </span>
          <span className="text-sm font-medium sm:hidden">Rows</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
            disabled={loading}
          >
            <SelectTrigger
              className={`h-8 w-20 ${loading ? "opacity-70" : ""}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className={`text-sm font-medium ${loading ? "opacity-70" : ""}`}>
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
              Loading...
            </div>
          ) : (
            `Page ${currentPage} of ${totalPages}`
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* First page button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={!canPreviousPage || loading}
            className={`h-8 w-8 p-0 ${loading ? "opacity-70" : ""}`}
          >
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">Go to first page</span>
          </Button>

          {/* Previous page button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canPreviousPage || loading}
            className={`h-8 w-8 p-0 ${loading ? "opacity-70" : ""}`}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Go to previous page</span>
          </Button>

          {/* Page numbers - Hidden on mobile and tablet */}
          <div className="hidden lg:flex items-center gap-1">
            {pageNumbersDesktop.map((page, index) => (
              <div key={index}>
                {page === "..." ? (
                  <span className="flex h-8 w-8 items-center justify-center text-sm">
                    ...
                  </span>
                ) : (
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page as number)}
                    disabled={loading}
                    className={`h-8 w-8 p-0 ${loading ? "opacity-70" : ""}`}
                  >
                    {page}
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Next page button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canNextPage || loading}
            className={`h-8 w-8 p-0 ${loading ? "opacity-70" : ""}`}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Go to next page</span>
          </Button>

          {/* Last page button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={!canNextPage || loading}
            className={`h-8 w-8 p-0 ${loading ? "opacity-70" : ""}`}
          >
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">Go to last page</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
