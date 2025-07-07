import { defineStore } from 'pinia'
import { inject, ref } from 'vue'
import { vue } from '@figureland/kit/state/vue'
import {
  type Entity,
  type EntityUpdate,
  type Identity,
  type MicrocosmID
} from '@nodenogg.in/schema'
import { app, client } from './app'
import { randomInt } from '@figureland/kit/math/random'

export const useMicrocosm = async (id: MicrocosmID) => {
  const microcosm = await client.register({ id })
  let identity = client.identity.get()

  if (identity) {
    await microcosm.identify(identity.id)
    microcosm.join(identity)
  }

  return defineStore(`microcosm/${id}`, () => {
    const entities = vue(
      microcosm.entities.derive((e) =>
        Array.from(e.values()).sort((a, b) => (b.created || 0) - (a.created || 0))
      )
    )

    const editingNodeId = ref<string | null>(null)

    // Set the active node for editing
    const setEditingNode = (nodeId: string | null) => {
      editingNodeId.value = nodeId
    }

    // Check if a specific entity is being edited
    const isEditing = (entityId: string) => {
      return editingNodeId.value === entityId
    }

    // Update entity content
    const update = async (entity_id: string, update: EntityUpdate) => {
      // Get current microcosm when the function is called rather than at store initialization

      await microcosm?.update([[entity_id, update]])
    }

    // Delete entity
    const deleteEntity = async (entity: Entity) => {
      // Get current microcosm when the function is called
      const identity = client.identity.get()

      if (identity && microcosm) {
        await microcosm.delete([
          {
            entity_id: entity.id,
            identity_id: identity.id
          }
        ])
      }
    }

    const create = async (data: Entity['data']) => {
      if (microcosm) {
        const result = await microcosm.create(data)

        if (result && result.id) {
          editingNodeId.value = result.id
          return result
        }
      }

      return null
    }

    const status = vue(microcosm.state)
    const identities: Identity[] = []

    return {
      id,
      api: microcosm,
      status,
      identities,
      entities,
      editingNodeId,
      setEditingNode,
      isEditing,
      update,
      deleteEntity,
      create
    }
  })()
}

export type MicrocosmStore = Awaited<ReturnType<typeof useMicrocosm>>

export const MICROCOSM_DATA_INJECTION_KEY = Symbol()

export const useCurrentMicrocosm = () =>
  inject<MicrocosmStore>(MICROCOSM_DATA_INJECTION_KEY) as MicrocosmStore & {
    api: typeof app
  }
