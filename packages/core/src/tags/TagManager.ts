import type { Entity, EntityOfType } from '@nodenogg.in/schema'

/**
 * Maximum length for a single tag
 */
export const MAX_TAG_LENGTH = 30

/**
 * Maximum number of tags per entity
 */
export const MAX_TAGS_PER_ENTITY = 20

/**
 * Normalizes a tag string by trimming whitespace, converting to lowercase,
 * and enforcing max length
 */
export const normalizeTag = (tag: string): string => {
  return tag.trim().toLowerCase().slice(0, MAX_TAG_LENGTH)
}

/**
 * Validates if a tag string is valid
 */
export const isValidTag = (tag: string): boolean => {
  const normalized = normalizeTag(tag)
  return normalized.length > 0 && normalized.length <= MAX_TAG_LENGTH
}

/**
 * Gets tags from an entity (only HTML entities can have tags)
 */
export const getTags = (entity: Entity): string[] => {
  if (entity.data.type !== 'html') {
    return []
  }
  return entity.data.tags ?? []
}

/**
 * Checks if an entity has a specific tag
 */
export const hasTag = (entity: Entity, tag: string): boolean => {
  const tags = getTags(entity)
  const normalizedTag = normalizeTag(tag)
  return tags.includes(normalizedTag)
}

/**
 * Adds a tag to an entity's tag list (returns new array, does not mutate)
 * Returns the updated tags array or undefined if the operation would exceed limits
 */
export const addTag = (entity: Entity, tag: string): string[] | undefined => {
  if (entity.data.type !== 'html') {
    return undefined
  }

  const normalizedTag = normalizeTag(tag)

  if (!isValidTag(normalizedTag)) {
    return undefined
  }

  const currentTags = getTags(entity)

  // Don't add if already exists
  if (currentTags.includes(normalizedTag)) {
    return currentTags
  }

  // Check max tags limit
  if (currentTags.length >= MAX_TAGS_PER_ENTITY) {
    return undefined
  }

  return [...currentTags, normalizedTag]
}

/**
 * Removes a tag from an entity's tag list (returns new array, does not mutate)
 */
export const removeTag = (entity: Entity, tag: string): string[] | undefined => {
  if (entity.data.type !== 'html') {
    return undefined
  }

  const normalizedTag = normalizeTag(tag)
  const currentTags = getTags(entity)

  return currentTags.filter((t) => t !== normalizedTag)
}

/**
 * Sets the complete tag list for an entity (returns new array)
 * Normalizes all tags and removes duplicates
 */
export const setTags = (entity: Entity, tags: string[]): string[] | undefined => {
  if (entity.data.type !== 'html') {
    return undefined
  }

  const normalizedTags = tags
    .map(normalizeTag)
    .filter(isValidTag)
    .filter((tag, index, self) => self.indexOf(tag) === index) // Remove duplicates
    .slice(0, MAX_TAGS_PER_ENTITY) // Enforce max limit

  return normalizedTags
}

/**
 * Filters entities by tag(s)
 */
export const filterByTags = (
  entities: Entity[],
  tags: string[],
  matchAll: boolean = false
): Entity[] => {
  const normalizedSearchTags = tags.map(normalizeTag)

  return entities.filter((entity) => {
    const entityTags = getTags(entity)

    if (matchAll) {
      // Entity must have ALL specified tags
      return normalizedSearchTags.every((tag) => entityTags.includes(tag))
    } else {
      // Entity must have AT LEAST ONE of the specified tags
      return normalizedSearchTags.some((tag) => entityTags.includes(tag))
    }
  })
}

/**
 * Gets all unique tags from a collection of entities
 */
export const getAllTags = (entities: Entity[]): string[] => {
  const tagSet = new Set<string>()

  entities.forEach((entity) => {
    const tags = getTags(entity)
    tags.forEach((tag) => tagSet.add(tag))
  })

  return Array.from(tagSet).sort()
}

/**
 * Gets tag usage statistics from a collection of entities
 */
export const getTagStats = (
  entities: Entity[]
): Array<{ tag: string; count: number }> => {
  const tagCounts = new Map<string, number>()

  entities.forEach((entity) => {
    const tags = getTags(entity)
    tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
    })
  })

  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count) // Sort by count descending
}

/**
 * Type guard to check if an entity can have tags (is HTML type)
 */
export const canHaveTags = (entity: Entity): entity is EntityOfType<'html'> => {
  return entity.data.type === 'html'
}
