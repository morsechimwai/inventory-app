"use client"

import React from "react"
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Input } from "../ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSearchOptions } from "@/hooks/use-search-options"
import { AppColumnDef } from "@/lib/types/data-table"

const toSearchableString = (value: unknown): string => {
  if (value === null || value === undefined) return ""
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) {
    return value.map((item) => toSearchableString(item)).join(" ")
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value)
    } catch {
      return ""
    }
  }
  return ""
}

interface DataTableProps<TData> {
  columns: AppColumnDef<TData>[]
  data: TData[]
  emptyComponent?: React.ReactNode
}

export function DataTable<TData>({ columns, data, emptyComponent }: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const rows = table.getRowModel().rows
  const hasData = rows.length > 0

  const searchOptions = useSearchOptions(columns)

  const [searchColumn, setSearchColumn] = React.useState<string>("")
  const [searchValue, setSearchValue] = React.useState("")
  const [appliedSearch, setAppliedSearch] = React.useState<{ column: string; value: string }>({
    column: "",
    value: "",
  })
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState<number | "all">(10)

  const perPageOptions: Array<number | "all"> = [10, 25, 50, "all"]

  React.useEffect(() => {
    if (searchOptions.length === 0) {
      setSearchColumn("")
      setAppliedSearch({ column: "", value: "" })
      return
    }

    setSearchColumn((prev) => {
      if (!prev) return searchOptions[0]?.value ?? ""
      return searchOptions.some((option) => option.value === prev) ? prev : searchOptions[0].value
    })
  }, [searchOptions])

  React.useEffect(() => {
    setAppliedSearch((prev) => {
      if (!prev.column) return prev
      const isAvailable = searchOptions.some((option) => option.value === prev.column)
      if (isAvailable) return prev
      return { column: "", value: "" }
    })
  }, [searchOptions])

  const filteredRows = React.useMemo(() => {
    const query = appliedSearch.value.trim().toLowerCase()
    if (!appliedSearch.column || query.length === 0) {
      return rows
    }

    const targetColumn = table.getAllColumns().find((column) => {
      const accessorKey =
        "accessorKey" in column.columnDef && typeof column.columnDef.accessorKey === "string"
          ? column.columnDef.accessorKey
          : null
      const columnDefId = typeof column.columnDef.id === "string" ? column.columnDef.id : null

      return [column.id, columnDefId, accessorKey].some(
        (candidate) => candidate === appliedSearch.column
      )
    })

    if (!targetColumn) {
      return rows
    }

    return rows.filter((row) => {
      const rawValue = row.getValue(targetColumn.id)
      const comparable = toSearchableString(rawValue).toLowerCase()
      if (!comparable) return false
      return comparable.includes(query)
    })
  }, [appliedSearch, rows, table])

  const totalItems = filteredRows.length
  const effectivePageSize =
    pageSize === "all" || totalItems === 0 ? Math.max(totalItems, 1) : pageSize
  const totalPages = Math.max(1, Math.ceil(totalItems / effectivePageSize))

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const startIndex = totalItems === 0 ? 0 : (page - 1) * effectivePageSize
  const endIndex =
    pageSize === "all" ? totalItems : Math.min(startIndex + effectivePageSize, totalItems)

  const visibleRows = pageSize === "all" ? filteredRows : filteredRows.slice(startIndex, endIndex)

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return
    setPage(nextPage)
  }

  const handlePageSizeChange = (value: string) => {
    if (value === "all") {
      setPageSize("all")
      setPage(1)
      return
    }

    const numericValue = Number(value)
    setPageSize(Number.isNaN(numericValue) ? 10 : numericValue)
    setPage(1)
  }

  return (
    <div className="w-full font-sans">
      {hasData && (
        <div className="w-full flex gap-2 flex-row  ml-auto items-center mb-4 max-w-sm">
          <Input
            className="h-8 px-3 py-1.5"
            placeholder={
              searchOptions.length === 0
                ? "Filter..."
                : `Filter by ${
                    searchOptions.find((option) => option.value === searchColumn)?.label ?? "field"
                  }..`
            }
            value={searchValue}
            onChange={(event) => {
              const nextValue = event.target.value
              setSearchValue(nextValue)

              if (searchOptions.length === 0) {
                setAppliedSearch({ column: "", value: "" })
                return
              }

              const nextColumn = searchColumn || searchOptions[0]?.value || ""
              if (!nextColumn) {
                setAppliedSearch({ column: "", value: "" })
                return
              }

              if (!searchColumn && nextColumn) {
                setSearchColumn(nextColumn)
              }

              setAppliedSearch({ column: nextColumn, value: nextValue })
              setPage(1)
            }}
            disabled={searchOptions.length === 0}
          />
          <Select
            value={searchColumn || undefined}
            onValueChange={(value) => {
              setSearchColumn(value)
              setAppliedSearch({ column: value, value: searchValue })
              setPage(1)
            }}
            disabled={searchOptions.length === 0}
          >
            <SelectTrigger
              className="w-full sm:w-40"
              size="sm"
              disabled={searchOptions.length === 0}
            >
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent>
              {searchOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table className="min-w-[640px]">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {visibleRows.length ? (
                visibleRows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {emptyComponent || "No data found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {hasData && (
          <Pagination className="border-t px-4 py-4 text-sm text-muted-foreground">
            <div className="flex w-full flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span>Rows per page</span>
                  <Select
                    value={pageSize === "all" ? "all" : String(pageSize)}
                    onValueChange={handlePageSizeChange}
                  >
                    <SelectTrigger className="h-8 w-[88px]" size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {perPageOptions.map((option) => {
                        const optionValue = option === "all" ? "all" : String(option)
                        return (
                          <SelectItem key={optionValue} value={optionValue}>
                            {option === "all" ? "All" : option}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <span>
                  Showing{" "}
                  <strong>
                    {totalItems === 0 ? 0 : startIndex + 1}–{endIndex}
                  </strong>{" "}
                  of <strong>{totalItems}</strong>
                </span>
              </div>
              <div>
                Page {page} of {totalPages}
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      aria-disabled={page === 1}
                      onClick={(event) => {
                        event.preventDefault()
                        handlePageChange(page - 1)
                      }}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        isActive={pageNumber === page}
                        onClick={(event) => {
                          event.preventDefault()
                          handlePageChange(pageNumber)
                        }}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      aria-disabled={page === totalPages}
                      onClick={(event) => {
                        event.preventDefault()
                        handlePageChange(page + 1)
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </div>
            </div>
          </Pagination>
        )}
      </div>
    </div>
  )
}
