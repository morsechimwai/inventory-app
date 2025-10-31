import type { Product } from "@prisma/client"

// Entity
export type ProductEntity = Product

// Form input
export type ProductInput = {
  name: string
  sku: string | null
  lowStockAt: number | null
  categoryId: string | null
  unitId: string
}

// DTO for output with relation
export type ProductDTO = {
  id: string
  name: string
  sku: string | null
  lowStockAt: number | null
  currentStock: number
  category: { id: string; name: string } | null
  unit: { id: string; name: string }
}
