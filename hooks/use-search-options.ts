// hooks/use-search-options.ts

// React
import { useMemo } from "react"

// Types
import { AppColumnDef } from "@/lib/types/data-table"

export function useSearchOptions<T>(columns: AppColumnDef<T>[]) {
  return useMemo(() => {
    return columns
      .filter((col) => col.enableSearch)
      .map((col, idx) => {
        const value =
          typeof col.id === "string"
            ? col.id
            : typeof col.accessorKey === "string"
            ? col.accessorKey
            : `column_${idx}`

        const label =
          typeof col.header === "string"
            ? col.header
            : typeof col.id === "string"
            ? col.id
            : typeof col.accessorKey === "string"
            ? col.accessorKey
            : `Column ${idx + 1}`

        return { value, label }
      })
  }, [columns])
}
