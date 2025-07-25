import { describe, it, expect } from 'vitest'
import { IdentitySchema, type Identity } from '../Identity.schema'

describe('identity schema', () => {
  describe('isValidIdentityID', () => {
    it('should validate correct identity UUIDs', () => {
      const validID = '@bt4nhr27z8198jp6'
      expect(IdentitySchema.utils.isValidIdentityID(validID)).toBe(true)
    })

    it('should reject invalid identity UUIDs', () => {
      expect(IdentitySchema.utils.isValidIdentityID('invalid')).toBe(false)
      expect(IdentitySchema.utils.isValidIdentityID('@short')).toBe(false)
      expect(IdentitySchema.utils.isValidIdentityID('@invalid!')).toBe(false)
      expect(IdentitySchema.utils.isValidIdentityID(123)).toBe(false)
      expect(IdentitySchema.utils.isValidIdentityID(null)).toBe(false)
    })
  })

  describe('createIdentityID', () => {
    it('should create valid identity UUID with prefix', () => {
      const { id } = IdentitySchema.api.create()
      expect(IdentitySchema.utils.isValidIdentityID(id)).toBe(true)
      expect(id.startsWith('@')).toBe(true)
      expect(id.length).toBe(17)
    })
  })

  describe('identitySchema', () => {
    it('should validate correct identity object', () => {
      const validIdentity = {
        id: '@bt4nhr27z8198jp6',
        nickname: 'test-user',
        version: '1'
      }

      const result = IdentitySchema.schema.parse(validIdentity)
      expect(result).toEqual(validIdentity)
    })

    it('should allow optional nickname', () => {
      const validIdentity: Identity = {
        id: '@bt4nhr27z8198jp6',
        version: '1'
      }

      const result = IdentitySchema.schema.parse(validIdentity)
      expect(result).toEqual(validIdentity)
    })

    it('should reject invalid identity objects', () => {
      const invalidIdentities = [
        { id: 'invalid' },
        { id: '@invalid!' },
        { id: '@short' },
        { id: '@bt4nhr27z8198jp6', nickname: 123 }
      ]

      invalidIdentities.forEach((invalid) => {
        expect(() => IdentitySchema.schema.parse(invalid)).toThrow()
      })
    })
  })
})
