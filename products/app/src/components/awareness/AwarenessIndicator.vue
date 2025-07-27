<script setup lang="ts">
import { computed } from 'vue'
import type { Identity } from '@nodenogg.in/schema'

type AwarenessIdentity = Identity & {
  joined?: boolean
  timestamp?: number
}

const props = defineProps<{
  identities: AwarenessIdentity[]
}>()

const connectedCount = computed(() => {
  return props.identities.filter(identity => identity.joined === true).length
})

const statusColor = computed(() => {
  if (connectedCount.value === 0) return '#ef4444' // red-500
  return '#22c55e' // green-500
})

const statusLabel = computed(() => {
  if (connectedCount.value === 0) return 'No one connected'
  if (connectedCount.value === 1) return '1 person connected'
  return `${connectedCount.value} people connected`
})
</script>

<template>
  <div class="awareness-indicator" :title="statusLabel">
    <div 
      class="status-dot" 
      :style="{ backgroundColor: statusColor }"
    />
    <span class="count">{{ connectedCount }}</span>
  </div>
</template>

<style scoped>
.awareness-indicator {
  display: flex;
  align-items: center;
  gap: var(--size-4);
  padding: var(--size-4) var(--size-8);
  background: var(--ui-95);
  border-radius: var(--ui-radius);
  box-shadow: var(--ui-container-shadow);
  font-size: 1rem;
  font-weight: 600;
  color: var(--ui-20);
}

.status-dot {
  width: var(--size-8);
  height: var(--size-8);
  border-radius: 50%;
  flex-shrink: 0;
}

.count {
  min-width: var(--size-12);
  text-align: center;
}

@media (prefers-color-scheme: dark) {
  .awareness-indicator {
    background: var(--ui-95);
    color: var(--ui-85);
  }
}
</style>