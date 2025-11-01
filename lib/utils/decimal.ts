import { Prisma } from "@prisma/client"

// ─────────────────────────────────────────────────────────────
// Decimal → number Safe Conversion
// ไม่ใช้ .toNumber() ตรงๆ ป้องกัน floating precision error
// ─────────────────────────────────────────────────────────────
export const decimalToNumber = (val: Prisma.Decimal | number | string) => {
  return typeof val === "object" && "toNumber" in val ? val.toNumber() : Number(val)
}

// ─────────────────────────────────────────────────────────────
// number → Decimal Conversion
// ─────────────────────────────────────────────────────────────
export const numberToDecimal = (num: number | string): Prisma.Decimal => {
  return new Prisma.Decimal(num)
}
