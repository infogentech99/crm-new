"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@lib/utils"
import { ButtonProps, buttonVariants } from "@components/ui/button"

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="Pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

type PaginationLinkProps = {
  isActive?: boolean;
  size?: ButtonProps["size"];
} & React.ComponentProps<typeof Link>;

const PaginationLink = ({
  className,
  isActive,
  size,
  ...props
}: PaginationLinkProps) => (
  <Link
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className
    )}
    {...props}
  />
)
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

interface PaginationComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const generatePaginationItems = (currentPage: number, totalPages: number) => {
  const maxPagesToShow = 2;
  const items: (number | string)[] = [];

  if (totalPages <= maxPagesToShow) {
    for (let i = 1; i <= totalPages; i++) {
      items.push(i);
    }
  } else {
    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (startPage > 1) {
      items.push(1);
      if (startPage > 2) {
        items.push('...');
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push('...');
      }
      items.push(totalPages);
    }
  }
  return items;
};

const PaginationComponent: React.FC<PaginationComponentProps> = ({ currentPage, totalPages, onPageChange }) => {
  const paginationItems = generatePaginationItems(currentPage, totalPages);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e: React.MouseEvent) => { e.preventDefault(); onPageChange(currentPage - 1); }}
            className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
        {paginationItems.map((item, index) => (
          <PaginationItem key={index}>
            {typeof item === 'number' ? (
              <PaginationLink
                href="#"
                onClick={(e: React.MouseEvent) => { e.preventDefault(); onPageChange(item); }}
                isActive={currentPage === item}
              >
                {item}
              </PaginationLink>
            ) : (
              <PaginationEllipsis />
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e: React.MouseEvent) => { e.preventDefault(); onPageChange(currentPage + 1); }}
            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationComponent,
}
