import type { Entity, MicrocosmID, IdentityID } from '@nodenogg.in/schema'
import { APP_VERSION } from '@nodenogg.in/core'
import type { MicrocosmAPI } from '@nodenogg.in/core'

export interface MicrocosmExport {
  microcosm_id: MicrocosmID
  generated_at: string
  app_version: string
  identity_id: IdentityID
  entities: { [id: string]: Entity }
}

/**
 * Exports all entities from a microcosm for a specific identity to JSON format
 */
export async function exportMicrocosmEntities(
  microcosmApi: MicrocosmAPI,
  microcosmId: MicrocosmID,
  identityId: IdentityID
): Promise<MicrocosmExport> {
  const entities: { [id: string]: Entity } = {}

  // Collect all entities for this identity
  for await (const entityId of microcosmApi.getCollection(identityId)) {
    try {
      const entity = await microcosmApi.getEntity({
        entity_id: entityId,
        identity_id: identityId
      })

      if (entity) {
        entities[entityId] = entity
      }
    } catch (error) {
      console.warn(`Failed to export entity ${entityId}:`, error)
    }
  }

  return {
    microcosm_id: microcosmId,
    generated_at: new Date().toISOString(),
    app_version: APP_VERSION,
    identity_id: identityId,
    entities
  }
}

/**
 * Downloads a JSON file to the user's device
 */
export function downloadJSON(data: any, filename: string): void {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()

  // Cleanup
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Exports microcosm entities and triggers a JSON download
 */
export async function exportAndDownloadMicrocosm(
  microcosmApi: MicrocosmAPI,
  microcosmId: MicrocosmID,
  identityId: IdentityID
): Promise<void> {
  try {
    const exportData = await exportMicrocosmEntities(microcosmApi, microcosmId, identityId)
    const filename = `microcosm-${microcosmId}-${new Date().toISOString().split('T')[0]}.json`
    downloadJSON(exportData, filename)
  } catch (error) {
    console.error('Failed to export microcosm:', error)
    throw error
  }
}

/**
 * Deletes all entities for a specific identity from a microcosm
 */
export async function deleteAllUserEntities(
  microcosmApi: MicrocosmAPI,
  identityId: IdentityID
): Promise<number> {
  let deletedCount = 0

  // Collect all entity IDs first to avoid iteration issues during deletion
  const entityIds: string[] = []
  for await (const entityId of microcosmApi.getCollection(identityId)) {
    entityIds.push(entityId)
  }

  // Delete all entities
  for (const entityId of entityIds) {
    try {
      await microcosmApi.delete([{
        entity_id: entityId,
        identity_id: identityId
      }])
      deletedCount++
    } catch (error) {
      console.warn(`Failed to delete entity ${entityId}:`, error)
    }
  }

  return deletedCount
}
