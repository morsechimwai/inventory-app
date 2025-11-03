// lib/services/products.ts

// Types
import type { ProductEntity, ProductInput, ProductDTO } from "@/lib/types/product"

// Database client
import { prisma } from "@/lib/db/prisma"

// Security
import { sanitizeInput } from "@/lib/security/sanitize"

// Utils
import { decimalToNumber } from "../utils/decimal"

// App error handling
import { AppError } from "../errors/app-error"

// Helper to assert product ownership
async function assertProductOwnership(userId: string, productId: string) {
  const product = await prisma.product.findFirst({
    where: { id: productId, userId },
    select: { id: true },
  })

  if (!product) throw new AppError("NOT_FOUND", "Product not found.")
}

// Create a new product (CRUD - Create)
export async function createProduct(userId: string, data: ProductInput): Promise<ProductEntity> {
  try {
    // Sanitize input
    const cleanName = sanitizeInput(data.name)
    const cleanSku = data.sku ? sanitizeInput(data.sku) : undefined

    // Create product
    return prisma.product.create({
      data: { ...data, name: cleanName, sku: cleanSku, userId },
    })
  } catch {
    throw new AppError("DB_CREATE_FAILED", "Failed to create product.", { data })
  }
}

// Get products by user ID (CRUD - Read)
export async function getProductsByUserId(userId: string): Promise<ProductDTO[]> {
  const products = await prisma.product.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      sku: true,
      lowStockAt: true,
      currentStock: true,
      avgCost: true,
      category: { select: { id: true, name: true } },
      unit: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return products.map((p) => ({
    ...p,
    currentStock: decimalToNumber(p.currentStock),
    avgCost: decimalToNumber(p.avgCost),
  }))
}

// Update existing product (CRUD - Update)
export async function updateProduct(
  userId: string,
  id: string,
  data: Partial<ProductInput>
): Promise<ProductEntity> {
  try {
    // Ensure the product belongs to the user
    await assertProductOwnership(userId, id)

    // Sanitize input if name or sku is being updated
    const cleanName = data.name ? sanitizeInput(data.name) : undefined
    const cleanSku = data.sku ? sanitizeInput(data.sku) : undefined

    // Update product
    return prisma.product.update({
      where: { id },
      data: { ...data, name: cleanName, sku: cleanSku },
    })
  } catch {
    throw new AppError("DB_UPDATE_FAILED", "Failed to update product.", { id, data })
  }
}

// Delete product by ID (CRUD - Delete)
export async function deleteProductById(userId: string, id: string): Promise<ProductEntity> {
  try {
    // Ensure the product belongs to the user
    await assertProductOwnership(userId, id)

    // Delete product
    return prisma.product.delete({ where: { id } })
  } catch {
    throw new AppError("DB_DELETE_FAILED", "Failed to delete product.", { id })
  }
}
