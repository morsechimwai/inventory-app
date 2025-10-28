import { z } from "zod";

export const productFormSchema = z.object({
  name: z.string().trim().min(1, "Product Name is required"),
  sku: z.string().trim().optional(),

  price: z.coerce
    .number<number>()
    .int("Price must be an integer")
    .min(0, "Price must be at least 0")
    .max(9999999999.99, "Price must be less than 10,000,000,000.00")
    .catch(() => {
      throw new Error("Price is required");
    }),

  quantity: z.coerce
    .number<number>()
    .int("Quantity must be an integer")
    .min(0, "Quantity must be at least 0")
    .max(9999999999, "Quantity must be less than 10,000,000,000")
    .catch(() => {
      throw new Error("Quantity is required");
    }),

  lowStockAt: z.coerce
    .number<number>()
    .int("Low stock must be an integer")
    .min(0, "Low stock must be at least 0")
    .max(9999999999, "Low stock must be less than 10,000,000,000")
    .optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const defaultFormValues: ProductFormValues = {
  name: "",
  sku: undefined,
  price: 0,
  quantity: 0,
  lowStockAt: undefined,
};
