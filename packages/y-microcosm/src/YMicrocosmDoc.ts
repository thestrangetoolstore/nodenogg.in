import { state } from '@figureland/kit/state'
import { Doc, UndoManager, Map as YMap } from 'yjs'

import type { Persistence, PersistenceFactory } from './persistence'
import type { Provider, ProviderFactory } from './provider'
import { isString } from '@figureland/kit/tools'

import {
  Entity,
  Identity,
  IdentityID,
  EntityLocation,
  EntitySchema,
  createTimestamp,
  validateIdentityWithStatus,
  IdentityWithStatus
} from '@nodenogg.in/schema'
import { MicrocosmAPIConfig, MicrocosmAPIState, NNError, collectNNErrors } from '@nodenogg.in/core'
import { YMicrocosmAPIOptions } from '.'

const resolvePromises = async <T>(promises: Promise<T>[]) => {
  const results: PromiseSettledResult<T>[] = await Promise.allSettled(promises)

  return {
    rejected: results.filter((r): r is PromiseRejectedResult => r.status === 'rejected'),
    fulfilled: results
      .filter((r): r is PromiseFulfilledResult<T> => r.status === 'fulfilled')
      .map((i) => i.value)
  }
}

export type Signed<T> = {
  content: T
  signature: string
}

export type SignedEntity = Signed<Entity>

export type YCollection = YMap<SignedEntity>

export class YMicrocosmDoc {
  public readonly yDoc = new Doc()
  public readonly identities = this.yDoc.getMap<boolean>('identities')
  public readonly state = state<MicrocosmAPIState>({
    ready: false,
    identities: [],
    persisted: false,
    connected: false
  })

  private persistence!: Persistence[]
  private providers!: Provider[]
  private identity_id!: IdentityID
  private undoStore: UndoManager
  private collection: YCollection
  private providerFactories?: ProviderFactory[]
  private persistenceFactories?: PersistenceFactory[]
  private config: MicrocosmAPIConfig

  constructor({ config, providers, persistence }: YMicrocosmAPIOptions) {
    this.config = structuredClone(config)
    this.providerFactories = providers
    this.persistenceFactories = persistence
  }

  public init = async () => {
    await this.createPersistences()
    await this.createProviders()
  }

  public identify = async (identity_id: IdentityID) => {
    if (!this.identity_id || this.identity_id !== identity_id) {
      this.identity_id = identity_id
      this.undoStore?.destroy()
      this.collection = this.getYCollection(this.identity_id)
      this.undoStore = new UndoManager(this.collection)
      this.identities.set(this.identity_id, true)
    }
  }

  private sign = async (entity: Entity): Promise<Signed<Entity>> => {
    return {
      content: entity,
      signature: ''
    }
  }

  public getEntity = async (
    entityLocation: { identity_id: IdentityID; entity_id: string } | EntityLocation
  ): Promise<Entity | undefined> => {
    try {
      const parsed = isString(entityLocation)
        ? EntitySchema.utils.parseEntityLocation(entityLocation)
        : entityLocation

      if (!parsed) {
        throw new Error('Invalid entity location')
      }

      const collection = this.getYCollection(parsed.identity_id)
      const e = collection?.get(parsed.entity_id)
      return EntitySchema.schema.parse(e?.content)
    } catch {
      return undefined
    }
  }

  public getYCollection = (identity_id: IdentityID): YCollection =>
    this.yDoc.getMap<SignedEntity>(identity_id)

  /**
   * Updates a single {@link Entity}
   */
  public update = async (entity_id: string, u: Partial<Omit<Entity['data'], 'type'>>) => {
    try {
      if (!this.collection) {
        throw new NNError({
          level: 'warn',
          message: 'No identity available for microcosm operations',
          name: 'YMicrocosmAPI'
        })
      }
      const target = await this.getEntity({
        identity_id: this.identity_id,
        entity_id
      })
      if (target) {
        const payload = await this.sign(EntitySchema.api.update(target, u))
        this.collection.set(entity_id, payload)
        return payload.content
      }
    } catch (error) {
      throw new NNError({
        level: 'warn',
        message: `Could not update entity ${entity_id}`,
        name: 'YMicrocosmAPI',
        error
      })
    }
  }

  public create = async (data: Entity['data']) => {
    try {
      if (!this.collection) {
        throw new NNError({
          level: 'warn',
          message: 'No identity available for microcosm operations',
          name: 'YMicrocosmAPI'
        })
      }
      const payload = await this.sign(EntitySchema.api.create(this.identity_id, data))
      this.collection.set(payload.content.id, payload)
      return payload.content
    } catch (error) {
      throw new NNError({
        level: 'warn',
        message: `Could not create entity ${JSON.stringify(data)}`,
        name: 'YMicrocosmAPI',
        error
      })
    }
  }

  public delete = async (entity_id: string) => {
    if (!this.collection) {
      throw new NNError({
        level: 'warn',
        message: 'No identity available for microcosm operations',
        name: 'YMicrocosmAPI'
      })
    }
    this.collection?.delete(entity_id)
  }

  public undo = () => {
    this.undoStore?.undo()
  }

  public redo = () => {
    this.undoStore?.redo()
  }

  public dispose = () => {
    this.destroyPersistence()
    this.destroyProviders()
    this.yDoc.destroy()
    this.undoStore?.destroy()
  }

  private createPersistence = async (createPersistenceFn: PersistenceFactory) => {
    const { id } = this.config
    try {
      const persistence = await createPersistenceFn(id, this.yDoc)
      return persistence
    } catch (error) {
      throw new NNError({
        name: 'YMicrocosmDoc',
        message: `Could not create persistence for ${id}`,
        level: 'fail',
        error
      })
    }
  }

  private createProvider = async (createProviderFn: ProviderFactory) => {
    const { id, password } = this.config

    try {
      const provider = await createProviderFn(id, this.yDoc, password)
      return provider
    } catch (error) {
      throw new NNError({
        name: 'YMicrocosmDoc',
        message: `Could not create provider for ${id}`,
        level: 'warn',
        error
      })
    }
  }

  private createPersistences = async () => {
    try {
      if (!this.persistenceFactories) {
        throw new NNError({
          name: 'YMicrocosmDoc',
          message: `No persistence methods available`,
          level: 'warn'
        })
      }
      const { fulfilled, rejected } = await resolvePromises(
        this.persistenceFactories.map(this.createPersistence)
      )

      if (fulfilled.length === 0) {
        const reasons = collectNNErrors(rejected)

        throw new NNError({
          name: 'YMicrocosmAPI',
          level: 'warn',
          message: `No persistence available (${rejected.length}/${this.persistenceFactories.length} failed: ${reasons.join(', ')})`
        })
      }

      this.persistence = fulfilled

      this.state.set({
        persisted: true
      })

      return this.persistence
    } catch (error) {
      this.state.set({
        persisted: false
      })
      throw error
    }
  }

  private createProviders = async () => {
    try {
      if (!this.providerFactories) {
        throw new NNError({
          name: 'YMicrocosmDoc',
          message: `No providers available`,
          level: 'warn'
        })
      }
      const { fulfilled, rejected } = await resolvePromises(this.providerFactories.map(this.createProvider))

      if (fulfilled.length === 0) {
        const reasons = collectNNErrors(rejected)

        throw new NNError({
          name: 'YMicrocosmAPI',
          level: 'warn',
          message: `No providers available (${rejected.length}/${this.providerFactories.length} failed: ${reasons.join(', ')})`
        })
      }

      this.providers = fulfilled

      this.providers?.forEach((p) => {
        p.awareness?.on('update', this.handleAwareness)
        p.shouldConnect = true
        p.connect()
      })

      this.state.set({
        connected: true
      })

      return this.providers
    } catch (error) {
      this.state.set({
        connected: false
      })
      throw error
    }
  }

  private disconnectProviders = async () => {
    this.providers?.forEach((p) => {
      p.awareness?.off('change', this.handleAwareness)
      p.shouldConnect = false
      p.disconnect()
    })

    this.state.set({
      identities: [],
      connected: false
    })
  }

  private destroyProviders = () => {
    this.disconnectProviders().then(() => {
      this.providers?.forEach((p) => p.destroy())
    })
  }

  private destroyPersistence = () => {
    this.persistence?.forEach((p) => p.destroy())
  }

  public updatePassword = async (password: string) => {
    if (password === this.config.password) {
      await this.disconnectProviders()
      this.config.password = password
      await this.createProviders()
    }
  }

  private handleAwareness = (_: unknown, provider: string | Provider) => {
    if (isString(provider)) {
      return
    }

    const states = Array.from(provider?.awareness?.getStates() || new Map())
      .map(([, state]) => state?.identity || {})
      .filter(validateIdentityWithStatus)

    this.state.set({
      identities: filterByIdentityID(states)
    })
  }

  /**
   * Erases this Microcosm's locally stored content and disposes this instance
   */
  public clearPersistence = async (reset?: boolean) => {
    this.persistence?.forEach((p) => {
      p.clearData()
      p.destroy()
    })

    if (reset) {
      await this.createPersistences()
    }
  }

  public destroy = () => {
    this.clearPersistence()
  }

  public join = (identity: Identity) => {
    this.providers.forEach((p) => {
      p?.awareness?.setLocalStateField('identity', {
        identity,
        timestamp: createTimestamp(),
        joined: true
      } as IdentityWithStatus)
    })
  }

  public leave = (identity: Identity) => {
    this.providers.forEach((p) => {
      p?.awareness?.setLocalStateField('identity', {
        identity,
        timestamp: createTimestamp(),
        joined: false
      } as IdentityWithStatus)
    })
  }
}

const filterByIdentityID = (array: IdentityWithStatus[]): IdentityWithStatus[] => {
  const uniqueMap = new Map<IdentityID, IdentityWithStatus>()

  array.forEach((item) => {
    uniqueMap.set(item.identity.id, item)
  })

  return Array.from(uniqueMap.values())
}
