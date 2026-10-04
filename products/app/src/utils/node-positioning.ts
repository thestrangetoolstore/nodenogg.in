import type { Entity } from '@nodenogg.in/schema'
import { EntitySchema } from '@nodenogg.in/schema'

export interface NodeBounds {
  x: number
  y: number
  width: number
  height: number
}

export interface NodePosition {
  x: number
  y: number
}

/**
 * Get the bounds (position and dimensions) of a node entity
 */
export function getNodeBounds(entity: Entity): NodeBounds {
  if (EntitySchema.utils.isType(entity, 'html')) {
    const htmlData = entity.data as Extract<Entity['data'], { type: 'html' }>
    return {
      x: htmlData.x,
      y: htmlData.y,
      width: htmlData.width || 200,
      height: htmlData.height || 200
    }
  }

  if (EntitySchema.utils.isType(entity, 'emoji')) {
    const emojiData = entity.data as Extract<Entity['data'], { type: 'emoji' }>
    return {
      x: emojiData.x,
      y: emojiData.y,
      width: 50,
      height: 50
    }
  }

  // Default fallback for other entity types
  return {
    x: 0,
    y: 0,
    width: 200,
    height: 200
  }
}

/**
 * Calculate absolute bounds for emoji entities with parent nodes
 */
export function getAbsoluteNodeBounds(entity: Entity, entities: Entity[]): NodeBounds {
  const bounds = getNodeBounds(entity)

  // For emojis with parent nodes, calculate absolute position
  if (EntitySchema.utils.isType(entity, 'emoji')) {
    const emojiData = entity.data as Extract<Entity['data'], { type: 'emoji' }>
    if (emojiData.parentNodeId) {
      const parentNode = entities.find(e => e.id === emojiData.parentNodeId)
      if (parentNode && EntitySchema.utils.isType(parentNode, 'html')) {
        const parentData = parentNode.data as Extract<Entity['data'], { type: 'html' }>
        return {
          x: parentData.x + emojiData.x,
          y: parentData.y + emojiData.y,
          width: bounds.width,
          height: bounds.height
        }
      }
    }
  }

  return bounds
}

/**
 * Check if two rectangular bounds overlap
 */
export function boundsOverlap(bounds1: NodeBounds, bounds2: NodeBounds): boolean {
  return (
    bounds1.x < bounds2.x + bounds2.width &&
    bounds1.x + bounds1.width > bounds2.x &&
    bounds1.y < bounds2.y + bounds2.height &&
    bounds1.y + bounds1.height > bounds2.y
  )
}

/**
 * Check if a position would cause overlap with existing nodes
 */
export function wouldOverlap(
  position: NodePosition,
  dimensions: { width: number; height: number },
  existingEntities: Entity[]
): boolean {
  const newBounds: NodeBounds = {
    x: position.x,
    y: position.y,
    width: dimensions.width,
    height: dimensions.height
  }

  return existingEntities.some(entity => {
    // Only check HTML nodes and standalone emoji nodes for overlap
    if (EntitySchema.utils.isType(entity, 'html')) {
      const entityBounds = getAbsoluteNodeBounds(entity, existingEntities)
      return boundsOverlap(newBounds, entityBounds)
    }

    if (EntitySchema.utils.isType(entity, 'emoji')) {
      const emojiData = entity.data as Extract<Entity['data'], { type: 'emoji' }>
      if (!emojiData.parentNodeId) {
        const entityBounds = getAbsoluteNodeBounds(entity, existingEntities)
        return boundsOverlap(newBounds, entityBounds)
      }
    }

    return false
  })
}

/**
 * Find a non-overlapping position for a new node
 */
export function findNonOverlappingPosition(
  preferredPosition: NodePosition,
  dimensions: { width: number; height: number },
  existingEntities: Entity[],
  options: {
    maxAttempts?: number
    searchRadius?: number
    gridSize?: number
  } = {}
): NodePosition {
  const {
    maxAttempts = 50,
    searchRadius = 300,
    gridSize = 20
  } = options

  // First, check if the preferred position is already free
  if (!wouldOverlap(preferredPosition, dimensions, existingEntities)) {
    return preferredPosition
  }

  // Try positions in expanding spirals around the preferred position
  for (let radius = gridSize; radius <= searchRadius; radius += gridSize) {
    // Try positions in a circle around the preferred position
    const positions = generateCirclePositions(preferredPosition, radius, Math.max(8, Math.floor(radius / gridSize)))

    for (const position of positions) {
      if (!wouldOverlap(position, dimensions, existingEntities)) {
        return position
      }
    }
  }

  // If we still haven't found a position, try random positions as fallback
  for (let i = 0; i < maxAttempts; i++) {
    const angle = Math.random() * 2 * Math.PI
    const distance = Math.random() * searchRadius + gridSize
    const position = {
      x: preferredPosition.x + Math.cos(angle) * distance,
      y: preferredPosition.y + Math.sin(angle) * distance
    }

    if (!wouldOverlap(position, dimensions, existingEntities)) {
      return position
    }
  }

  // Last resort: return a position that's guaranteed to be away from existing nodes
  return findFallbackPosition(preferredPosition, dimensions, existingEntities, searchRadius, gridSize)
}

/**
 * Generate positions in a circle around a center point
 */
function generateCirclePositions(
  center: NodePosition,
  radius: number,
  count: number,
  startAngle = 0
): NodePosition[] {
  const positions: NodePosition[] = []

  for (let i = 0; i < count; i++) {
    const angle = startAngle + (i / count) * 2 * Math.PI
    positions.push({
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius
    })
  }

  return positions
}

// Rotates each ring's starting angle so no single direction is always tried first
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

/**
 * Find a fallback position when all else fails by continuing to spiral
 * outward from the preferred position until a free spot is found.
 * Nodes therefore fill in around where they were requested rather than
 * being pushed off to one side of the canvas.
 */
function findFallbackPosition(
  preferredPosition: NodePosition,
  dimensions: { width: number; height: number },
  existingEntities: Entity[],
  startRadius: number,
  gridSize: number,
  maxRings = 100
): NodePosition {
  // Step by roughly half the node size: fine enough to find gaps,
  // coarse enough to stay cheap at large radii
  const step = Math.max(gridSize, Math.min(dimensions.width, dimensions.height) / 2)

  let radius = startRadius
  for (let ring = 0; ring < maxRings; ring++) {
    radius += step
    const count = Math.max(8, Math.ceil((2 * Math.PI * radius) / step))
    const positions = generateCirclePositions(preferredPosition, radius, count, ring * GOLDEN_ANGLE)

    for (const position of positions) {
      if (!wouldOverlap(position, dimensions, existingEntities)) {
        return position
      }
    }
  }

  // Extremely crowded canvas: place just beyond the outermost ring searched
  return {
    x: preferredPosition.x,
    y: preferredPosition.y + radius + step
  }
}

/**
 * Get all visible nodes bounds for spatial awareness
 */
export function getAllNodeBounds(entities: Entity[]): NodeBounds[] {
  return entities
    .filter(entity => {
      if (EntitySchema.utils.isType(entity, 'html')) {
        return true
      }

      if (EntitySchema.utils.isType(entity, 'emoji')) {
        const emojiData = entity.data as Extract<Entity['data'], { type: 'emoji' }>
        if (!emojiData.parentNodeId) {
          return true
        }
      }

      return false
    })
    .map(entity => getAbsoluteNodeBounds(entity, entities))
}