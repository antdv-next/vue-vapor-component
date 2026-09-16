export function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value !== undefined && value !== null
}

export function isVueRenderable<T>(
  value: T,
): value is Exclude<NonNullable<T>, false | ''> {
  return isNonNullable(value) && value !== false && value !== ''
}
