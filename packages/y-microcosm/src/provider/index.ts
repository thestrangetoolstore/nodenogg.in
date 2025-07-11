import type { Awareness } from 'y-protocols/awareness'
import type { Doc } from 'yjs'

export interface Provider {
  /**
   * The provider's yjs awareness instance
   */
  awareness: Awareness | null
  /**
   * Destroy the provider instance
   */
  destroy: () => void
  /**
   * Disconnect the provider from the signaling server and closes open connections
   */
  disconnect: () => void
  /**
   * Connect the provider to the signaling server
   */
  connect: () => void
  /**
   * Whether the provider should connect to the signaling server
   */
  shouldConnect?: boolean
  /**
   * The signaling server URLs
   */
  signalingUrls?: string[]
}

export type ProviderFactory<T extends Provider = Provider> = (
  microcosm_id: string,
  doc: Doc,
  password?: string
) => Promise<T>

export * from './create-webrtc-provider'
export * from './create-hocuspocus-provider'
