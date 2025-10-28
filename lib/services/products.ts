import { prisma } from "@/lib/db/prisma";
import type { ProductDTO, ProductEntity } from "@/lib/types/product";
import { AppError } from "../errors/app-error";

type CreateProductInput = Omit<ProductDTO, "id">;

// Get products by user ID
export async function getProductsByUserId(
  userId: string
): Promise<ProductDTO[]> {
  const products = await prisma.product.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      sku: true,
      price: true,
      quantity: true,
      lowStockAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return products.map((product) => ({
    ...product,
    price: Number(product.price),
  }));
}

// Delete product by ID
export async function deleteProductById(
  userId: string,
  id: string
): Promise<ProductEntity> {
  const existing = await prisma.product.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!existing) throw new AppError("NOT_FOUND", "Product not found.");

  try {
    return await prisma.product.delete({ where: { id } });
  } catch {
    throw new AppError("DB_DELETE_FAILED", "Failed to delete product.", {
      id,
    });
  }
}

// Create a new product
export async function createProduct(
  userId: string,
  data: CreateProductInput
): Promise<ProductEntity> {
  try {
    return prisma.product.create({
      data: { ...data, userId },
    });
  } catch {
    throw new AppError("DB_CREATE_FAILED", "Failed to create product.", {
      data,
    });
  }
}

// Update an existing product
export async function updateProduct(
  userId: string,
  id: string,
  data: Partial<ProductDTO>
): Promise<ProductEntity> {
  const existing = await prisma.product.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!existing) throw new AppError("NOT_FOUND", "Product not found.");

  try {
    return prisma.product.update({
      where: { id },
      data,
    });
  } catch {
    throw new AppError("DB_UPDATE_FAILED", "Failed to update product.", {
      id,
      data,
    });
  }
}
