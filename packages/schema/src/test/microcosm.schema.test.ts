import { describe, it, expect } from 'vitest'
import { MicrocosmSchema } from '../Microcosm.schema'

describe('isValidMicrocosmID', () => {
  it('should validate correct microcosm IDs', () => {
    const validID = MicrocosmSchema.utils.createMicrocosmID()
    expect(MicrocosmSchema.utils.isValidMicrocosmID(validID)).toBe(true)
  })
})
