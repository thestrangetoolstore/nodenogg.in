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
  return findFallbackPosition(preferredPosition, dimensions, existingEntities)
}

/**
 * Generate positions in a circle around a center point
 */
function generateCirclePositions(center: NodePosition, radius: number, count: number): NodePosition[] {
  const positions: NodePosition[] = []

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI
    positions.push({
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius
    })
  }

  return positions
}

/**
 * Find a fallback position when all else fails
 */
function findFallbackPosition(
  preferredPosition: NodePosition,
  dimensions: { width: number; height: number },
  existingEntities: Entity[]
): NodePosition {
  // Find the rightmost node and place the new node to its right
  let rightmostX = preferredPosition.x

  existingEntities.forEach(entity => {
    if (EntitySchema.utils.isType(entity, 'html')) {
      const bounds = getNodeBounds(entity)
      rightmostX = Math.max(rightmostX, bounds.x + bounds.width)
    }

    if (EntitySchema.utils.isType(entity, 'emoji')) {
      const emojiData = entity.data as Extract<Entity['data'], { type: 'emoji' }>
      if (!emojiData.parentNodeId) {
        const bounds = getNodeBounds(entity)
        rightmostX = Math.max(rightmostX, bounds.x + bounds.width)
      }
    }
  })

  return {
    x: rightmostX + 50, // 50px gap
    y: preferredPosition.y
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