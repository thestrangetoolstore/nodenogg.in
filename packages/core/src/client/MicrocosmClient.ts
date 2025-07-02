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
  uuid: MicrocosmID
  lastAccessed: number
  password?: string
}

type MicrocosmMap = Map<MicrocosmID, MicrocosmReference>

export type MicrocosmEntryRequest = {
  uuid: MicrocosmID
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
    state((get) =>
      sortMapToArray(get(this.state), 'uuid').filter((m) => isValidMicrocosmID(m.uuid))
    )
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

  private removeReference = (uuid: MicrocosmID) => {
    this.state.mutate((microcosms) => {
      microcosms.delete(uuid)
    })
  }

  private registerReference = ({ uuid, password }: MicrocosmEntryRequest): MicrocosmReference => {
    const existing = this.state.get().get(uuid)
    const updatedReference = {
      uuid,
      lastAccessed: createTimestamp(),
      password: password || existing?.password
    }
    this.state.mutate((microcosms) => {
      microcosms.set(uuid, updatedReference)
    })
    return updatedReference
  }

  public isActive = (uuid: MicrocosmID) =>
    this.store.unique(uuid, () => state((get) => get(this.active) === uuid))

  public setActive = (uuid: MicrocosmID) => this.active.set(uuid)

  public register = async (config: MicrocosmEntryRequest): Promise<M> => {
    if (!isValidMicrocosmID(config.uuid)) {
      throw new Error(`Invalid microcosm ID: ${config.uuid}`)
    }

    const promise = this.performRegistration(config).finally(() => {
      this.ongoingRegistrations.delete(config.uuid)
    })

    this.ongoingRegistrations.set(config.uuid, promise)

    return promise
  }

  private performRegistration = async (config: MicrocosmEntryRequest): Promise<M> => {
    const reference = this.registerReference(config)
    this.setActive(config.uuid)

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

    if (this.microcosms.has(config.uuid)) {
      // timer?.finish()
      return this.microcosms.get(config.uuid) as M
    }

    const microcosm = await this.config.api(reference)

    this.microcosms.set(config.uuid, microcosm)
    // timer?.finish()
    return microcosm
  }

  public remove = async (uuid: MicrocosmID) => {
    const microcosm = this.microcosms.get(uuid)
    if (microcosm) {
      microcosm.dispose()
      this.removeReference(uuid)
      this.microcosms.delete(uuid)
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
