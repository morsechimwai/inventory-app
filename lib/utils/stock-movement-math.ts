import { MovementType, Prisma, type StockMovement } from "@prisma/client"
import { AppError } from "../errors/app-error"

const STOCK_SCALE = 3
const COST_SCALE = 2
const ZERO = new Prisma.Decimal(0)

export interface ProductSnapshot {
  currentStock: Prisma.Decimal
  avgCost: Prisma.Decimal
}

export interface MovementComputationInput {
  movementType: MovementType
  quantity: number
  unitCost?: number | null
}

export interface MovementComputationResult {
  nextState: ProductSnapshot
  unitCost: Prisma.Decimal | null
  totalCost: Prisma.Decimal | null
}

export type MovementSnapshot = Pick<
  StockMovement,
  "movementType" | "quantity" | "unitCost" | "totalCost"
>

const roundStock = (value: Prisma.Decimal) => value.toDecimalPlaces(STOCK_SCALE)
const roundCost = (value: Prisma.Decimal) => value.toDecimalPlaces(COST_SCALE)

const toDecimal = (value: Prisma.Decimal | number | string): Prisma.Decimal => {
  return value instanceof Prisma.Decimal ? value : new Prisma.Decimal(value)
}

export function applyMovementMAC(
  product: ProductSnapshot,
  input: MovementComputationInput
): MovementComputationResult {
  const quantityDecimal = new Prisma.Decimal(input.quantity)

  if (quantityDecimal.lte(0)) {
    throw new AppError("INVALID_INPUT", "Quantity must be greater than zero.")
  }

  const currentStock = product.currentStock
  const currentAvgCost = product.avgCost

  let delta: Prisma.Decimal
  switch (input.movementType) {
    case MovementType.IN:
      delta = quantityDecimal
      break
    case MovementType.OUT:
      delta = quantityDecimal.neg()
      break
    default:
      throw new AppError("INVALID_INPUT", "Unsupported movement type.")
  }

  const nextStock = currentStock.plus(delta)

  if (nextStock.lt(0)) {
    throw new AppError(
      "INVALID_OPERATION",
      "Not enough stock to complete this action. Please review the available quantity."
    )
  }

  let unitCostDecimal: Prisma.Decimal | null = null
  let totalCostDecimal: Prisma.Decimal | null = null
  let nextAvgCost = currentAvgCost

  if (input.movementType === MovementType.IN) {
    if (input.unitCost === null || input.unitCost === undefined) {
      throw new AppError("INVALID_INPUT", "Unit cost is required for stock in movements.")
    }

    unitCostDecimal = new Prisma.Decimal(input.unitCost)

    if (unitCostDecimal.lt(0)) {
      throw new AppError("INVALID_INPUT", "Unit cost cannot be negative.")
    }

    totalCostDecimal = unitCostDecimal.mul(quantityDecimal)
    const totalValueBefore = currentAvgCost.mul(currentStock)
    const numerator = totalValueBefore.plus(totalCostDecimal)
    nextAvgCost = nextStock.gt(0) ? numerator.div(nextStock) : unitCostDecimal
  } else if (input.movementType === MovementType.OUT) {
    unitCostDecimal = currentAvgCost
    totalCostDecimal = unitCostDecimal.mul(quantityDecimal)
  }

  const nextState: ProductSnapshot = {
    currentStock: roundStock(nextStock),
    avgCost: nextStock.gt(0) ? roundCost(nextAvgCost) : roundCost(nextAvgCost),
  }

  return {
    nextState,
    unitCost: unitCostDecimal ? roundCost(unitCostDecimal) : null,
    totalCost: totalCostDecimal ? roundCost(totalCostDecimal) : null,
  }
}

export function revertMovementMAC(
  product: ProductSnapshot,
  movement: MovementSnapshot
): ProductSnapshot {
  const quantityDecimal = toDecimal(movement.quantity)
  const unitCostDecimal = movement.unitCost ? toDecimal(movement.unitCost) : null
  const totalCostDecimal = movement.totalCost ? toDecimal(movement.totalCost) : null
  const currentStock = product.currentStock
  const currentAvgCost = product.avgCost

  switch (movement.movementType) {
    case MovementType.IN: {
      const previousStock = currentStock.minus(quantityDecimal)
      if (previousStock.lt(0)) {
        throw new AppError("INVALID_OPERATION", "Cannot revert stock below zero.")
      }

      const totalValueAfter = currentAvgCost.mul(currentStock)
      const movementValue = totalCostDecimal ?? unitCostDecimal?.mul(quantityDecimal) ?? ZERO
      const totalValueBefore = totalValueAfter.minus(movementValue)

      const previousAvg =
        previousStock.gt(0) && !totalValueBefore.isZero()
          ? totalValueBefore.div(previousStock)
          : ZERO

      return {
        currentStock: roundStock(previousStock),
        avgCost: previousStock.gt(0) ? roundCost(previousAvg) : ZERO,
      }
    }

    case MovementType.OUT: {
      const restoredStock = currentStock.plus(quantityDecimal)
      if (restoredStock.lt(0)) {
        throw new AppError("INVALID_OPERATION", "Cannot revert stock below zero.")
      }

      const restoredAvg = restoredStock.gt(0) ? roundCost(unitCostDecimal ?? currentAvgCost) : ZERO

      return {
        currentStock: roundStock(restoredStock),
        avgCost: restoredAvg,
      }
    }
  }

  throw new AppError("INVALID_INPUT", "Unsupported movement type.")
}
