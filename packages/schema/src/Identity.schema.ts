import { createVersionedSchema, type InferVersionedSchema } from '@figureland/versioned-schema'
import { string, optional, custom, object, boolean, InferInput, parse, number } from 'valibot'
import { createUUID, isValidUUID } from './uuid'
import { isString } from './utils'
import { freeze } from '@figureland/kit/tools/object'

export const isValidIdentityID = (input: unknown): input is IdentityID =>
  isString(input) && input.startsWith('@') && input.length === 17 && isValidUUID(input.slice(1))

const createIdentityID = (): IdentityID => createUUID('@') as IdentityID

export type IdentityID = `@${string}`

export const identityID = custom<IdentityID>(isValidIdentityID)

const schema = createVersionedSchema({
  base: {
    id: identityID
  },
  versions: {
    '1': {
      nickname: optional(string())
    }
  }
})

const create = (nickname?: string) =>
  schema.parse({
    id: createIdentityID(),
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

export const IdentityWithStatusSchema = object({
  identity: schema.schema,
  timestamp: number(),
  joined: boolean()
})

export const validateIdentityWithStatus = (o: unknown) => {
  try {
    parse(IdentityWithStatusSchema, o)
    return true
  } catch {
    return false
  }
}

export type IdentityWithStatus = InferInput<typeof IdentityWithStatusSchema>
