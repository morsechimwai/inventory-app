import { Prisma } from "@prisma/client"

export const decimalToNumber = (dec: Prisma.Decimal): number => {
  return dec.toNumber()
}

export const numberToDecimal = (num: number): Prisma.Decimal => {
  return new Prisma.Decimal(num)
}
