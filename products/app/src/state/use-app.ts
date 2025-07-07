import { ref, computed } from 'vue'
import { app, client } from '@/state'
import { defineStore } from 'pinia'
import { vue } from '@figureland/kit/state/vue'

export const useApp = defineStore('app', () => {
  const ready = vue(client.ready)
  const active = vue(client.active)
  const microcosms = vue(client.references)

  const showCommandMenu = ref(false)

  const toggleCommandMenu = () => (showCommandMenu.value = !showCommandMenu.value)

  app.keycommands.on({
    j: toggleCommandMenu,
    command: toggleCommandMenu
  })

  // Get the active microcosm reference
  const activeMicrocosm = computed(() => {
    const activeId = active.value
    if (activeId) {
      return microcosms.value.find(m => m.id === activeId)
    }
    return null
  })

  return {
    identity: vue(client.identity),
    // pointer: vue<Pointer>(app.pointer),
    screen: vue(app.screen),
    device: vue(app.device),
    filedrop: vue(app.filedrop.state),
    state: vue(app.ui),
    ready,
    toggleMenu: () => app.ui.key('menuOpen').set((m) => !m),
    showCommandMenu,
    active,
    activeMicrocosm,
    microcosms
  }
})
