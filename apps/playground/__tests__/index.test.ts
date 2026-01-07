import { describe, expect, it } from 'vitest'

describe('playground test', () => {
  const sum = (a: number, b: number): number => a + b
  it('sum', () => {
    expect(sum(1, 2)).toBe(3)
  })
})
