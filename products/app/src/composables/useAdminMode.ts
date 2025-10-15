import { ref, computed } from 'vue'

const adminMode = ref(false)
// Check multiple ways to detect Tauri
const isTauri = typeof window !== 'undefined' && (
  '__TAURI__' in window ||
  '__TAURI_INTERNALS__' in window ||
  ('__TAURI_IPC__' in window)
)

// Dynamically import Tauri API only when available
let invoke: ((cmd: string, args?: Record<string, unknown>) => Promise<unknown>) | null = null

if (isTauri) {
  import('@tauri-apps/api/core').then((module) => {
    invoke = module.invoke
  }).catch((err) => {
    console.error('Failed to load Tauri API:', err)
  })
}

/**
 * Composable for managing admin mode in Tauri
 * Admin mode allows moving all nodes regardless of ownership
 */
export function useAdminMode() {
  const isAdminMode = computed(() => adminMode.value)
  const isTauriApp = computed(() => isTauri)

  const initAdminMode = async () => {
    if (!isTauri || !invoke) return

    try {
      const mode = await invoke('get_admin_mode') as boolean
      adminMode.value = mode
    } catch (error) {
      console.warn('Failed to get admin mode:', error)
      adminMode.value = false
    }
  }

  const setAdminMode = async (enabled: boolean) => {
    if (!isTauri || !invoke) {
      console.warn('Admin mode is only available in Tauri app')
      return false
    }

    try {
      const result = await invoke('set_admin_mode', { enabled }) as boolean
      adminMode.value = result
      return result
    } catch (error) {
      console.error('Failed to set admin mode:', error)
      return false
    }
  }

  const toggleAdminMode = async () => {
    if (!isTauri || !invoke) {
      console.warn('Admin mode is only available in Tauri app')
      return false
    }

    try {
      const result = await invoke('toggle_admin_mode') as boolean
      adminMode.value = result
      return result
    } catch (error) {
      console.error('Failed to toggle admin mode:', error)
      return false
    }
  }

  return {
    isAdminMode,
    isTauriApp,
    initAdminMode,
    setAdminMode,
    toggleAdminMode
  }
}
