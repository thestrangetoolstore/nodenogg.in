import { describe, it, expect } from 'vitest'
import { createEntityID, EntitySchema, type Entity } from '../Entity.schema'
import { IdentitySchema } from '../Identity.schema'

const { utils, schema } = EntitySchema

const demoId = IdentitySchema.api.create()

describe('entity', () => {
  describe('isValidEntityID', () => {
    it('should validate correct entity UUIDs', () => {
      const validID = 'ebt4nhr27z8198jp6'
      expect(utils.isValidEntityID(validID)).toBe(true)
    })

    it('should reject invalid entity UUIDs', () => {
      expect(utils.isValidEntityID('invalid')).toBe(false)
      expect(utils.isValidEntityID('e123')).toBe(false)
      expect(utils.isValidEntityID('e123456!')).toBe(false)
      expect(utils.isValidEntityID(123)).toBe(false)
      expect(utils.isValidEntityID(null)).toBe(false)
      expect(utils.isValidEntityID('a12345678')).toBe(false)
    })
  })

  describe('createEntityID', () => {
    it('should create valid entity UUID with prefix', () => {
      const id = utils.createEntityID()
      expect(utils.isValidEntityID(id)).toBe(true)
      expect(id.startsWith('e')).toBe(true)
      expect(id.length).toBe(17)
    })
  })

  describe('entity schema', () => {
    const validEntityV1: Entity = {
      identity_id: demoId.id,
      id: 'eexaji9ebltqb6i58',
      lastEdited: 1234567890,
      created: 1234567890,
      version: '1',
      data: {
        type: 'html',
        x: 100,
        y: 200,
        width: 300,
        height: 400,
        backgroundColor: '#ffffff',
        content: 'test content'
      }
    }

    it('should validate correct entity object', () => {
      const result = schema.validate(validEntityV1)
      expect(result).toBe(true)
    })

    it('should reject invalid entity objects', () => {
      const invalidEntities = [
        { id: 'invalid' },
        { id: 'e12345678', type: 'invalid' },
        {
          ...validEntityV1,
          lastEdited: 'invalid'
        },
        {
          ...validEntityV1,
          data: { ...validEntityV1.data, x: '100' }
        },
        {
          ...validEntityV1,
          data: {
            backgroundColor: 123
          }
        }
      ]

      invalidEntities.forEach((invalid) => {
        expect(() => schema.parse(invalid)).toThrow()
      })
    })
  })

  describe('create', () => {
    it('should create a valid entity with partial data', () => {
      const partial = {
        type: 'html',
        x: 100,
        y: 200,
        width: 300,
        height: 400,
        content: ''
      }

      const result = EntitySchema.api.create(demoId.id, partial as Entity['data'])

      expect(EntitySchema.utils.isValidEntityID(result.id)).toBe(true)
      expect(EntitySchema.utils.isType(result, 'html')).toBe(true)

      expect(result.lastEdited).toBeTypeOf('number')
      expect(result.created).toBeTypeOf('number')

      if (EntitySchema.utils.isType(result, 'html')) {
        expect(result.data.x).toBe(partial.x)
        expect(result.data.y).toBe(partial.y)
        expect(result.data.width).toBe(partial.width)
        expect(result.data.height).toBe(partial.height)
      }
    })

    it('should reject a new entity with missing data', () => {
      // @ts-expect-error - Testing with incomplete data
      expect(() => schema.create({ type: 'html' })).toThrow()
    })

    it('should create a valid entity with all data', () => {
      const result = EntitySchema.api.create(demoId.id, {
        type: 'html',
        x: 100,
        y: 200,
        width: 300,
        height: 400,
        content: 'test content',
        backgroundColor: '#ffffff'
      })

      expect(EntitySchema.utils.isType(result, 'html')).toBe(true)

      if (EntitySchema.utils.isType(result, 'html')) {
        expect(result.data.x).toBe(100)
        expect(result.data.y).toBe(200)
        expect(result.data.width).toBe(300)
        expect(result.data.height).toBe(400)
        expect(result.data.content).toBe('test content')
        expect(result.data.backgroundColor).toBe('#ffffff')
      }
    })
  })

  describe('patch', () => {
    it('should patch an existing entity with partial data', async () => {
      const original = EntitySchema.api.create(demoId.id, {
        type: 'html',
        x: 100,
        y: 200,
        width: 300,
        height: 400,
        content: 'original content',
        backgroundColor: '#ffffff'
      })

      const patchData = {
        x: 150,
        y: 250,
        content: 'new content',
        backgroundColor: '#000000'
      }

      await new Promise((resolve) => setTimeout(resolve, 10))

      const result = EntitySchema.api.update(original, patchData)

      expect(result.id).toBe(original.id)
      expect(result.data.type).toBe('html')
      expect(result.created).toBe(original.created)
      expect(result.lastEdited).toBeGreaterThan(original.lastEdited)

      if (
        EntitySchema.utils.isType(result, 'html') &&
        EntitySchema.utils.isType(original, 'html')
      ) {
        expect(result.data.x).toBe(patchData.x)
        expect(result.data.y).toBe(patchData.y)
        expect(result.data.width).toBe(original.data.width)
        expect(result.data.height).toBe(original.data.height)
        expect(result.data.content).toBe(patchData.content)
        expect(result.data.backgroundColor).toBe(patchData.backgroundColor)
      }
    })

    it('should maintain unchanged properties', () => {
      const original = EntitySchema.api.create(demoId.id, {
        type: 'html',
        x: 100,
        y: 200,
        width: 300,
        height: 400,
        content: 'original content',
        backgroundColor: '#ffffff'
      })

      const result = EntitySchema.api.update(original, { x: 150 })

      if (
        EntitySchema.utils.isType(result, 'html') &&
        EntitySchema.utils.isType(original, 'html')
      ) {
        expect(result.data.x).toBe(150)
        expect(result.data.y).toBe(original.data.y)
        expect(result.data.width).toBe(original.data.width)
        expect(result.data.height).toBe(original.data.height)
        expect(result.data.content).toBe(original.data.content)
        expect(result.data.backgroundColor).toBe(original.data.backgroundColor)
      }
    })
  })

  describe('isEntityType', () => {
    it('should correctly identify html entities', () => {
      const htmlEntity = EntitySchema.api.create(demoId.id, {
        type: 'html',
        x: 100,
        y: 200,
        width: 300,
        height: 400,
        content: 'test content'
      })

      expect(EntitySchema.utils.isType(htmlEntity, 'html')).toBe(true)
      expect(EntitySchema.utils.isType(htmlEntity, 'connection')).toBe(false)
    })

    it('should correctly identify connection entities', () => {
      const fromId = createEntityID()
      const toId = createEntityID()
      const connectionEntity = EntitySchema.api.create(demoId.id, {
        type: 'connection',
        from: fromId,
        to: toId
      })

      expect(EntitySchema.utils.isType(connectionEntity, 'connection')).toBe(true)
      expect(EntitySchema.utils.isType(connectionEntity, 'html')).toBe(false)
    })

    it('should reject invalid entities', () => {
      const invalidEntity = {
        id: 'invalid',
        lastEdited: 1234567890,
        created: 1234567890,
        version: '1',
        data: {
          type: 'html',
          x: 100
        }
      }

      expect(EntitySchema.utils.isType(invalidEntity, 'html')).toBe(false)
      expect(EntitySchema.utils.isType(invalidEntity, 'connection')).toBe(false)
    })
  })

  describe('connection variant', () => {
    it('should create a valid connection entity with optional fields', () => {
      const fromId = createEntityID()
      const toId = createEntityID()

      // Test with both fields
      const result1 = EntitySchema.api.create(demoId.id, {
        type: 'connection',
        from: fromId,
        to: toId
      })
      expect(EntitySchema.utils.isType(result1, 'connection')).toBe(true)
      if (EntitySchema.utils.isType(result1, 'connection')) {
        expect(result1.data.from).toBe(fromId)
        expect(result1.data.to).toBe(toId)
      }

      // Test with only from field
      const result2 = EntitySchema.api.create(demoId.id, {
        type: 'connection',
        from: fromId
      })
      expect(EntitySchema.utils.isType(result2, 'connection')).toBe(true)
      if (EntitySchema.utils.isType(result2, 'connection')) {
        expect(result2.data.from).toBe(fromId)
        expect(result2.data.to).toBeUndefined()
      }

      // Test with only to field
      const result3 = EntitySchema.api.create(demoId.id, {
        type: 'connection',
        to: toId
      })
      expect(EntitySchema.utils.isType(result3, 'connection')).toBe(true)
      if (EntitySchema.utils.isType(result3, 'connection')) {
        expect(result3.data.from).toBeUndefined()
        expect(result3.data.to).toBe(toId)
      }

      // Test with no fields
      const result4 = EntitySchema.api.create(demoId.id, {
        type: 'connection'
      })

      expect(EntitySchema.utils.isType(result4, 'connection')).toBe(true)
      if (EntitySchema.utils.isType(result4, 'connection')) {
        expect(result4.data.from).toBeUndefined()
        expect(result4.data.to).toBeUndefined()
      }
    })

    it('should reject invalid connection entities', () => {
      const invalidConnections = [
        {
          type: 'connection',
          from: 'invalid-id',
          to: createEntityID()
        },
        {
          type: 'connection',
          from: createEntityID(),
          to: 'invalid-id'
        },
        {
          type: 'connection',
          from: 'invalid-id',
          to: 'invalid-id'
        }
      ]

      invalidConnections.forEach((invalid) => {
        // @ts-expect-error - Testing invalid data
        expect(() => schema.create(invalid)).toThrow()
      })
    })

    it('should patch a connection entity', () => {
      const fromId = EntitySchema.utils.createEntityID()
      const toId = EntitySchema.utils.createEntityID()
      const newToId = EntitySchema.utils.createEntityID()

      const original = EntitySchema.api.create(demoId.id, {
        type: 'connection',
        from: fromId,
        to: toId
      })

      const result = EntitySchema.api.update(original, { to: newToId })

      expect(EntitySchema.utils.isType(result, 'connection')).toBe(true)

      if (EntitySchema.utils.isType(result, 'connection')) {
        expect(result.data.from).toBe(fromId)
        expect(result.data.to).toBe(newToId)
      }
    })
  })
})
