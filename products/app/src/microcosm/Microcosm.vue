<script setup lang="ts">
import { computed, provide, onMounted, onBeforeUnmount, type PropType } from 'vue'
import type { MicrocosmID } from '@nodenogg.in/schema'
import MicrocosmContainer from './MicrocosmContainer.vue'
import {
  MICROCOSM_DATA_INJECTION_KEY,
  useApp,
  useAppRouter,
  useMicrocosm,
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

// Register this microcosm store as active when mounted
onMounted(() => {
  app.setActiveMicrocosmStore(microcosm)
})

// Clean up when the component is unmounted
onBeforeUnmount(() => {
  microcosm.leave()
  app.setActiveMicrocosmStore(null)
})

</script>

<template>
  <MicrocosmContainer v-if="microcosm.state.ready && app.ready && app.identity">
    <component :is="ActiveViewComponent" :ui="ui" :view_id="view_id" />
  </MicrocosmContainer>
</template>
