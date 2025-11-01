import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://stockit-nextjs-prisma-neon.vercel.app"

  const pages = ["", "/login", "/dashboard", "/products", "/inventory-activity"]

  return pages.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily",
    priority: path === "" ? 1.0 : 0.8,
  }))
}
