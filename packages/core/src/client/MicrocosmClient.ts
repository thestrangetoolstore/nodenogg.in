import { state, persist, store } from '@figureland/kit/state'
import { sortMapToArray } from '@figureland/kit/tools/map'
import { storage } from '@figureland/kit/state/local-storage'
import { MicrocosmSchema, type MicrocosmID } from '@nodenogg.in/schema'

import { getPersistenceName } from '../app/App'
import { isMap } from '@figureland/kit/tools/guards'
import { createIdentitySession } from '../identity/identity'
import { createTimestamp } from '@figureland/kit/tools/time'
import { MicrocosmAPI, MicrocosmAPIFactory } from '..'

const { isValidMicrocosmID } = MicrocosmSchema.utils

export type MicrocosmReference = {
  id: MicrocosmID
  lastAccessed: number
  password?: string
}

type MicrocosmMap = Map<MicrocosmID, MicrocosmReference>

export type MicrocosmEntryRequest = {
  id: MicrocosmID
  password?: string
}

export class MicrocosmClient<M extends MicrocosmAPI = MicrocosmAPI> {
  private store = store()
  private use = this.store.use
  readonly identity = this.use(createIdentitySession())

  private microcosms = new Map<MicrocosmID, M>()
  private state = this.use(state<MicrocosmMap>(new Map()))
  public active = this.use(state<MicrocosmID | undefined>(undefined))
  public ready = this.use(state(false))
  private ongoingRegistrations = new Map<MicrocosmID, Promise<M>>()
  public references = this.use(
    state((get) => sortMapToArray(get(this.state), 'id').filter((m) => isValidMicrocosmID(m.id)))
  )

  constructor(
    private config: {
      api: MicrocosmAPIFactory<M>
    }
  ) {
    persist(
      this.state,
      storage<MicrocosmMap>({
        name: getPersistenceName(['session', 'microcosms']),
        validate: isMap,
        fallback: () => new Map(),
        parse: (v) => new Map(JSON.parse(v)),
        stringify: (v) => JSON.stringify(Array.from(v.entries()))
      })
    )
    this.ready.set(true)
  }

  private removeReference = (id: MicrocosmID) => {
    this.state.mutate((microcosms) => {
      microcosms.delete(id)
    })
  }

  private registerReference = ({ id, password }: MicrocosmEntryRequest): MicrocosmReference => {
    const existing = this.state.get().get(id)
    const updatedReference = {
      id,
      lastAccessed: createTimestamp(),
      password: password || existing?.password
    }
    this.state.mutate((microcosms) => {
      microcosms.set(id, updatedReference)
    })
    return updatedReference
  }

  public isActive = (id: MicrocosmID) =>
    this.store.unique(id, () => state((get) => get(this.active) === id))

  public setActive = (id: MicrocosmID) => this.active.set(id)

  public register = async (config: MicrocosmEntryRequest): Promise<M> => {
    if (!isValidMicrocosmID(config.id)) {
      throw new Error(`Invalid microcosm ID: ${config.id}`)
    }

    const promise = this.performRegistration(config).finally(() => {
      this.ongoingRegistrations.delete(config.id)
    })

    this.ongoingRegistrations.set(config.id, promise)

    return promise
  }

  private performRegistration = async (config: MicrocosmEntryRequest): Promise<M> => {
    const reference = this.registerReference(config)
    this.setActive(config.id)

    // const timer = this.config.telemetry?.time({
    //   name: 'microcosms',
    //   message: `Retrieving microcosm ${config.microcosm_id}`,
    //   level: 'info'
    // })
    if (this.microcosms.size > 5) {
      // this.config.telemetry?.log({
      //   name: 'microcosms',
      //   message: `Performance warning: ${this.microcosms.size} active microcosms`,
      //   level: 'warn'
      // })
    }

    if (this.microcosms.has(config.id)) {
      // timer?.finish()
      return this.microcosms.get(config.id) as M
    }

    const microcosm = await this.config.api(reference)

    this.microcosms.set(config.id, microcosm)
    // timer?.finish()
    return microcosm
  }

  public remove = async (id: MicrocosmID) => {
    const microcosm = this.microcosms.get(id)
    if (microcosm) {
      microcosm.dispose()
      this.removeReference(id)
      this.microcosms.delete(id)
    }
  }

  public dispose = () => {
    for (const m of this.microcosms.values()) {
      m.dispose()
    }

    this.microcosms.clear()
    this.store.dispose()
  }
}
