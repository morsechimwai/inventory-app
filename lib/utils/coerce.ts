// Utils to coerce values
export const coerceString = (v: unknown) => {
  return String(v)
}

export const coerceNumber = (v: unknown) => {
  return Number(v)
}

export const coerceStringOrNull = (v: unknown) => (v === "" || v == null ? null : String(v))
export const coerceNumberOrNull = (v: unknown) => (v === "" || v == null ? null : Number(v))
