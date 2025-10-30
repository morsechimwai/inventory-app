import type { Product } from "@prisma/client"

export type ProductEntity = Product
export type CreateProductInput = Omit<ProductDTO, "id">
export type ProductDTO = Omit<Product, "userId" | "createdAt" | "updatedAt">
