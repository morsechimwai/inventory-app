import { PrismaClient } from "@prisma/client"
import { faker } from "@faker-js/faker/locale/th"

const prisma = new PrismaClient()

async function main() {
  const demoUserId = "e584e73e-001a-429d-81ac-2d8dde57f266"

  const units = await prisma.unit.findMany({ where: { userId: demoUserId } })
  const categories = await prisma.category.findMany({ where: { userId: demoUserId } })

  if (units.length === 0 || categories.length === 0) {
    throw new Error("❌ Units or Categories not found. Seed them first.")
  }

  const productNames = [
    "น้ำดื่ม 1.5 ลิตร",
    "ไข่ไก่เบอร์ 2",
    "ปลากระป๋อง",
    "ปลาทูสด",
    "ข้าวสารหอมมะลิ",
    "บะหมี่กึ่งสำเร็จรูป",
    "นมกล่อง UHT",
    "น้ำปลา",
    "ซอสปรุงรส",
    "น้ำมันพืช",
    "น้ำตาลทราย",
    "เกลือ",
    "ซอสมะเขือเทศ",
    "ซอสพริก",
    "กระดาษทิชชู่",
    "ผงซักฟอก",
    "น้ำยาล้างจาน",
    "แชมพู",
    "สบู่ก้อน",
    "แปรงสีฟัน",
    "ยาสีฟัน",
    "ปลากรอบ",
    "ขนมปังแผ่น",
    "แฮมไก่",
    "ไส้กรอก",
    "หมูบด",
    "อกไก่",
    "เส้นสปาเก็ตตี้",
    "ซอสพาสต้า",
    "ปลาสวรรค์",
    "ขนมขาไก่",
    "ข้าวโพดกระป๋อง",
    "นมข้นหวาน",
    "โกโก้ผง",
    "กาแฟสำเร็จรูป",
    "ปลากัด",
    "หลอดไฟ LED",
    "สายไฟ",
    "ปากกาเจล",
    "สมุดจด",
  ]

  const products = Array.from({ length: 40 }).map((_, i) => {
    const unit = faker.helpers.arrayElement(units)
    const category = faker.helpers.arrayElement(categories)
    const name = productNames[i % productNames.length]

    return {
      userId: demoUserId,
      name,
      sku: `PRD-${faker.string.alphanumeric(5).toUpperCase()}`,
      lowStockAt: faker.number.int({ min: 3, max: 20 }),
      categoryId: category?.id ?? categories[0].id,
      unitId: unit?.id ?? units[0].id,
      createdAt: faker.date.recent({ days: 90 }),
    }
  })

  await prisma.product.createMany({
    data: products,
    skipDuplicates: true,
  })

  console.log("✅ Seeded Thai products successfully.")
  console.log(`Created or skipped: ${products.length} items`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
