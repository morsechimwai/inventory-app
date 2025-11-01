import type { ColumnDef } from "@tanstack/react-table"

export type AppColumnDef<T> = ColumnDef<T> & {
  id?: string
  accessorKey?: string
  header?: string | React.ReactNode
  enableSearch?: boolean // this column can be used in search select
}
