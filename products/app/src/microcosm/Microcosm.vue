<script setup lang="ts">
import { computed, provide, onUnmounted, onMounted, onBeforeUnmount, type PropType } from 'vue'
import type { MicrocosmID } from '@nodenogg.in/schema'
import MicrocosmContainer from './MicrocosmContainer.vue'
import {
  MICROCOSM_DATA_INJECTION_KEY,
  useApp,
  useAppRouter,
  useMicrocosm,
  client
} from '@/state'
import { getViewComponent } from '@/views'

const props = defineProps({
  view_id: {
    type: String,
    required: true
  },
  id: {
    type: String as unknown as PropType<MicrocosmID>,
    required: true
  },
  ui: {
    type: Boolean,
    default: false
  }
})

const app = useApp()
const router = useAppRouter()
const microcosm = await useMicrocosm(props.id)

provide(MICROCOSM_DATA_INJECTION_KEY, microcosm)

const ActiveViewComponent = computed(() => {
  return getViewComponent(router.value.viewType)
})

// Handle visibility changes to update awareness when tab becomes hidden/visible
let visibilityHandler: (() => void) | null = null

onMounted(() => {
  visibilityHandler = () => {
    const identity = client.identity.get()
    if (identity) {
      if (document.hidden) {
        microcosm.api.leave(identity)
      } else {
        microcosm.api.join(identity)
      }
    }
  }
  
  document.addEventListener('visibilitychange', visibilityHandler)
})

// Handle cleanup when leaving the microcosm (call before unmount for faster updates)
onBeforeUnmount(() => {
  const identity = client.identity.get()
  if (identity) {
    microcosm.api.leave(identity)
  }
})

// Final cleanup
onUnmounted(() => {
  // Clean up visibility listener
  if (visibilityHandler) {
    document.removeEventListener('visibilitychange', visibilityHandler)
  }
})

</script>

<template>
  <MicrocosmContainer v-if="microcosm.status.ready && app.ready && app.identity">
    <component :is="ActiveViewComponent" :ui="ui" :view_id="view_id" />
  </MicrocosmContainer>
</template>
