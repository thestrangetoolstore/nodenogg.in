import { createVersionedSchema, type InferVersionedSchema } from '@figureland/versioned-schema'
import { freeze } from '@figureland/kit/tools/object'
import { custom } from 'valibot'
import { createUUID } from './uuid'
import { isString } from './utils'

const DEFAULT_NAME = 'untitled'

const sanitizeMicrocosmIDTitle = (input?: string): string => {
  if (input) {
    if (isValidMicrocosmID(input)) {
      return input
    } else {
      return (input as string).toLowerCase().replace(/[^a-z0-9]/g, '')
    }
  } else {
    return DEFAULT_NAME
  }
}

const createMicrocosmID = (input?: string): MicrocosmID => {
  if (isValidMicrocosmID(input)) return input
  if (!input) {
    return createUUID()
  }
  return sanitizeMicrocosmIDTitle(input)
}

export const parseMicrocosmID = (id: string) => {
  if (!isValidMicrocosmID(id)) {
    throw new Error()
  }
  return id
}

export const isValidMicrocosmID = (input: unknown): input is MicrocosmID =>
  isString(input) && /^[0-9A-Za-z]+$/i.test(input)
// isString(input) && input.length > 2

export type MicrocosmID = string

const schema = createVersionedSchema({
  base: {
    id: custom<string>(isValidMicrocosmID)
  },
  versions: {
    '1': {}
  }
})

export type Microcosm = InferVersionedSchema<typeof schema>

export const MicrocosmSchema = freeze({
  schema,
  utils: {
    createMicrocosmID,
    isValidMicrocosmID,
    parseMicrocosmID,
    sanitizeMicrocosmIDTitle
  }
})
