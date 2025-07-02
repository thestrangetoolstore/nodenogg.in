<script setup lang="ts">
import { computed, provide, type PropType } from 'vue'
import type { MicrocosmID } from '@nodenogg.in/schema'
import MicrocosmContainer from './MicrocosmContainer.vue'
import MicrocosmNav from './MicrocosmNav.vue'
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

</script>

<template>
  <MicrocosmContainer v-if="microcosm.status.ready && app.ready && app.identity">
    <MicrocosmNav v-if="ui && app.state.showUI" />
    <component :is="ActiveViewComponent" :ui="ui" :view_id="view_id" />
  </MicrocosmContainer>
</template>
