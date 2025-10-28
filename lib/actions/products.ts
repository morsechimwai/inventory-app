"use server";

// Next.js
import { revalidatePath } from "next/cache";

// Stack Auth
import { getCurrentUser } from "@/lib/auth/auth";

// Services
import {
  getProductsByUserId,
  deleteProductById,
  createProduct,
  updateProduct,
} from "@/lib/services/products";

// Types
import type { ActionResult } from "@/lib/types/error";
import type { CreateProductInput, ProductDTO } from "@/lib/types/product";

// Error Handling
import { withErrorHandling } from "@/lib/errors/with-error-handling";
import { AppError } from "../errors/app-error";

export interface ProductCreateResult {
  message: string;
  data?: ProductDTO;
  meta?: { userId: string };
}

export interface ProductListResult {
  message: string;
  data: ProductDTO[];
  meta: { count: number; userId: string };
}

export interface ProductUpdateResult {
  message: string;
  meta?: { id: string; userId: string; updatedAt?: string };
}

export interface ProductDeleteResult {
  message: string;
  meta?: { id: string; userId: string };
}

// Create a new product
export async function createProductAction(
  data: CreateProductInput
): Promise<ActionResult<ProductCreateResult>> {
  return withErrorHandling(async () => {
    const user = await getCurrentUser();
    if (!user) throw new AppError("UNAUTHORIZED", "Please log in first.");

    const product = await createProduct(user.id, data);
    revalidatePath("/inventory");
    return {
      message: "Product created successfully",
      data: { ...product, price: Number(product.price) },
      meta: { userId: user.id },
    };
  });
}

// Read all products for the current user
export async function getAllProducts(): Promise<
  ActionResult<ProductListResult>
> {
  return withErrorHandling(async () => {
    const user = await getCurrentUser();
    if (!user) throw new AppError("UNAUTHORIZED", "Please log in first.");

    const products = await getProductsByUserId(user.id);
    revalidatePath("/inventory");
    return {
      message: "Products fetched successfully",
      data: products,
      meta: { count: products.length, userId: user.id },
    };
  });
}

// Update an existing product
export async function updateProductAction(
  id: string,
  data: Partial<ProductDTO>
): Promise<ActionResult<ProductUpdateResult>> {
  return withErrorHandling(async () => {
    const user = await getCurrentUser();
    if (!user) throw new AppError("UNAUTHORIZED", "Please log in first.");

    await updateProduct(user.id, id, data);
    revalidatePath("/inventory");
    return {
      message: "Product updated successfully",
      meta: { id, userId: user.id, updatedAt: new Date().toISOString() },
    };
  });
}

// Delete a product by ID
export async function deleteProductAction(
  id: string
): Promise<ActionResult<ProductDeleteResult>> {
  return withErrorHandling(async () => {
    const user = await getCurrentUser();
    if (!user) throw new AppError("UNAUTHORIZED", "Please log in first.");

    await deleteProductById(user.id, id);
    revalidatePath("/inventory");

    return {
      message: "Product deleted successfully",
      meta: { id, userId: user.id },
    };
  });
}
