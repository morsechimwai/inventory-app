import type { Product } from "@prisma/client"

// Entity
export type ProductEntity = Product

// Form input
export type ProductInput = Pick<Product, "name" | "unitId"> &
  Partial<Pick<Product, "sku" | "lowStockAt" | "categoryId">>

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
