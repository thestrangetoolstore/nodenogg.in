import { defineStore } from 'pinia'
import { inject, ref } from 'vue'
import { vue } from '@figureland/kit/state/vue'
import {
  type Entity,
  type EntityUpdate,
  type Identity,
  type MicrocosmUUID
} from '@nodenogg.in/schema'
import { app, client } from './app'
import { randomInt } from '@figureland/kit/math/random'

export const useMicrocosm = async (uuid: MicrocosmUUID) => {
  const microcosm = await client.register({ uuid })
  let identity = client.identity.get()

  const id = client.identity.get()

  if (id) {
    await microcosm.identify(id.uuid)
    microcosm.join(id)
  }

  return defineStore(`microcosm/${uuid}`, () => {
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

      await microcosm?.update([
        [
          {
            entity_id,
            identity_id: identity.uuid
          },
          update
        ]
      ])
    }

    // Delete entity
    const deleteEntity = async (entity: Entity) => {
      // Get current microcosm when the function is called
      const microcosm = useCurrentMicrocosm()
      const identity = client.identity.get()

      if (identity && microcosm && microcosm.api) {
        await microcosm.api.delete([
          {
            entity_id: entity.uuid,
            identity_id: identity.uuid
          }
        ])
      }
    }

    // Create a new entity
    const create = async () => {
      // Get current microcosm when the function is called

      if (microcosm) {
        const result = await microcosm.create({
          type: 'html',
          x: randomInt(-400, 400),
          y: randomInt(-400, 400),
          width: 200,
          height: 200,
          content: ''
        })

        if (result && result.uuid) {
          editingNodeId.value = result.uuid
          return result
        }
      }

      return null
    }

    const status = vue(microcosm.state)
    const identities: Identity[] = []

    const getUser = (identityID: string) => {
      return undefined
    }

    return {
      uuid,
      api: microcosm,
      getUser,
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
