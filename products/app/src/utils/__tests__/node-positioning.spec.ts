import { describe, it, expect } from 'vitest'
import { EntitySchema, IdentitySchema, type Entity } from '@nodenogg.in/schema'
import { findNonOverlappingPosition, wouldOverlap } from '../node-positioning'

const identity = IdentitySchema.api.create()
const size = { width: 200, height: 200 }

const addNodes = (count: number, preferred = { x: 0, y: 0 }) => {
  const entities: Entity[] = []
  for (let i = 0; i < count; i++) {
    const position = findNonOverlappingPosition(preferred, size, entities)
    expect(wouldOverlap(position, size, entities)).toBe(false)
    entities.push(
      EntitySchema.api.create(identity.id, {
        type: 'html',
        content: '',
        ...position,
        ...size
      })
    )
  }
  return entities
}

const centroid = (entities: Entity[]) => {
  const points = entities.map(e => e.data as { x: number; y: number })
  return {
    x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
    y: points.reduce((sum, p) => sum + p.y, 0) / points.length
  }
}

describe('findNonOverlappingPosition', () => {
  it('returns the preferred position when it is free', () => {
    expect(findNonOverlappingPosition({ x: 10, y: 20 }, size, [])).toEqual({ x: 10, y: 20 })
  })

  it('places many nodes without overlap, clustered around the preferred position', () => {
    const entities = addNodes(60)
    const center = centroid(entities)

    // Previously nodes beyond the search radius were appended to the right of
    // everything, dragging the centroid far along the x axis
    expect(Math.abs(center.x)).toBeLessThan(200)
    expect(Math.abs(center.y)).toBeLessThan(200)

    const xs = entities.map(e => (e.data as { x: number }).x)
    expect(Math.min(...xs)).toBeLessThan(-400)
    expect(Math.max(...xs)).toBeGreaterThan(400)
  })
})
