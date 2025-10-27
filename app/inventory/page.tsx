"use client";

import SideBar from "@/components/sidebar";
import InventoryTable from "./inventory-table";
import { getAllProducts } from "@/lib/actions/products";
import { useEffect, useState } from "react";
import { ProductDTO } from "@/lib/types/product";
import TableLoading from "@/components/skeleton/table-loading";

export default function Inventory() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      try {
        const result = await getAllProducts();
        if (result.success && result.data) {
          setProducts(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <SideBar currentPath="/inventory" />
      {/* Header */}
      <main className="ml-64 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-sans">Inventory</h1>
          <p className="text-muted-foreground">
            Manage your inventory and track your products here.
          </p>
        </div>

        <section>
          {loading ? <TableLoading /> : <InventoryTable products={products} />}
        </section>
      </main>
    </>
  );
}
