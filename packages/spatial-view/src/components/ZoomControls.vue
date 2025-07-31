<script setup lang="ts">
import { computed } from 'vue'
import { useVueFlow } from '@vue-flow/core'

const props = withDefaults(defineProps<{
  copy?: {
    zoomIn: string
    zoomOut: string
    resetZoom: string
    miniMap: string
  }
}>(), {
  copy: () => ({
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    resetZoom: 'Reset zoom',
    miniMap: 'Mini map'
  })
})

const { viewport, zoomIn, zoomOut, zoomTo } = useVueFlow()

// Zoom controls functionality
const currentZoom = computed(() => viewport.value.zoom)

const handleZoomIn = () => {
  zoomIn()
}

const handleZoomOut = () => {
  zoomOut()
}

const handleFitView = () => {
  zoomTo(1)
}
</script>

<template>
  <div class="zoom-controls">
    <button class="zoom-button" @click="handleZoomIn" :aria-label="copy.zoomIn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>

    <div class="zoom-level">{{ Math.round(currentZoom * 100) }}%</div>

    <button class="zoom-button" @click="handleZoomOut" :aria-label="copy.zoomOut">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>

    <!-- <button class="zoom-button fit-button" @click="handleFitView" :aria-label="copy.resetZoom">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15,3 21,3 21,9"></polyline>
        <polyline points="9,21 3,21 3,15"></polyline>
        <line x1="21" y1="3" x2="14" y2="10"></line>
        <line x1="3" y1="21" x2="10" y2="14"></line>
      </svg>
    </button> -->
  </div>
</template>

<style scoped>
.zoom-controls {
  position: absolute;
  bottom: var(--size-16);
  right: var(--size-16);
  display: flex;
  flex-direction: column;
  gap: var(--size-4);
  z-index: 1000;
  background: var(--ui-100);
  border-radius: var(--size-32);
  padding: var(--size-8);
  box-shadow: var(--ui-container-shadow);
}

.zoom-button {
  width: var(--size-32);
  height: var(--size-32);
  border-radius: var(--size-16);
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--ui-20);
  cursor: pointer;
  transition: all 0.2s ease;
}

.zoom-button:hover {
  background: var(--ui-primary-100);
}

.zoom-button:active {
  transform: scale(0.95);
}

.fit-button {
  margin-top: var(--size-4);
  border-top: 1px solid var(--ui-80);
  padding-top: var(--size-8);
}

.zoom-level {
  font-size: 0.75rem;
  color: var(--ui-40);
  text-align: center;
  padding: var(--size-4) 0;
  font-weight: 600;
}

@media (prefers-color-scheme: dark) {
  .zoom-controls {
    background: var(--ui-90);
  }

  .zoom-button {
    color: var(--ui-30);
  }

  .zoom-button:hover {
    background: var(--ui-80);
    color: var(--ui-primary-100);
  }
}
</style>