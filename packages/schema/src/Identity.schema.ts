import { createVersionedSchema, type InferVersionedSchema } from '@figureland/versioned-schema'
import { string, optional, custom } from 'valibot'
import { createUUID, isValidUUID } from './uuid'
import { isString } from './utils'
import { freeze } from '@figureland/kit/tools/object'

export const isValidIdentityID = (input: unknown): input is IdentityID =>
  isString(input) && input.startsWith('@') && input.length === 17 && isValidUUID(input.slice(1))

const createIdentityID = (): IdentityID => createUUID('@') as IdentityID

export type IdentityID = `@${string}`

const schema = createVersionedSchema({
  base: {
    uuid: custom<IdentityID>(isValidIdentityID)
  },
  versions: {
    '1': {
      nickname: optional(string())
    }
  }
})

const create = (nickname?: string) =>
  schema.parse({
    uuid: createIdentityID(),
    nickname,
    version: schema.latest
  })

export type Identity = InferVersionedSchema<typeof schema>

export const IdentitySchema = freeze({
  api: {
    create
  },
  schema,
  utils: {
    isValidIdentityID
  }
})
