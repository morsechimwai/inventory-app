import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const demoUserId = "e584e73e-001a-429d-81ac-2d8dde57f266";

  await prisma.product.createMany({
    data: Array.from({ length: 20 }).map((_, i) => ({
      userId: demoUserId,
      name: `Product ${i + 1}`,
      price: Math.floor(Math.random() * 90 + 10).toFixed(2),
      quantity: Math.floor(Math.random() * 20),
      lowStockAt: 5,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * (i * 5)),
    })),
  });

  console.log("Seeding data created successfully!");
  console.log(`Created 20 products for user ID: ${demoUserId}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
