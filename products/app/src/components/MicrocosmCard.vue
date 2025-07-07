<script setup lang="ts">
import { type PropType } from 'vue'
import { MicrocosmSchema } from '@nodenogg.in/schema'
import { getTimeSince } from '@figureland/kit/tools/time'

defineProps({
  microcosm: {
    type: Object as PropType<{ id: string; lastAccessed: number }>,
    required: true
  }
})
</script>

<template>
  <router-link :class="{ link: true, ui: true, 'microcosm-card': true }" :to="{
    name: 'microcosm',
    params: {
      microcosm_id: microcosm.id
    }
  }">
    <span class="microcosm-name">{{ MicrocosmSchema.utils.parseMicrocosmID(microcosm.id) }}</span>
    <span class="microcosm-time">{{ getTimeSince(microcosm.lastAccessed) }}</span>
  </router-link>
</template>

<style scoped>
.microcosm-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: var(--ui-shadow-10);
  border-radius: var(--size-4);
  padding: var(--size-16);
  min-height: 140px;
  color: inherit;
  text-decoration: none;
  transition: all 0.2s ease;
  background: var(--ui-90);
}

.microcosm-card:hover {
  background-color: var(--ui-10);
  color: var(--ui-100);
}

.microcosm-card:focus {
  outline: 2px solid var(--ui-primary-100);
}

.microcosm-name {
  font-weight: 500;
  font-size: 1rem;
  word-break: break-all;
}

.microcosm-time {
  font-size: 0.875rem;
  color: var(--ui-40);
  margin-top: var(--size-2);
}
</style>