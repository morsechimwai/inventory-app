import { prisma } from "@/lib/db/prisma";
import type { ProductDTO, ProductEntity } from "@/lib/types/product";

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

  if (!existing) throw new Error("Product not found or unauthorized");

  return await prisma.product.delete({ where: { id } });
}

// Create a new product
export async function createProduct(
  userId: string,
  data: CreateProductInput
): Promise<ProductEntity> {
  return prisma.product.create({
    data: { ...data, userId },
  });
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

  if (!existing) throw new Error("Product not found or unauthorized");

  return prisma.product.update({
    where: { id },
    data,
  });
}
