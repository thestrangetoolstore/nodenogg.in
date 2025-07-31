<script setup lang="ts">
import { computed, ref } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import { MiniMap } from '@vue-flow/minimap'

const props = withDefaults(defineProps<{
  copy?: {
    zoomIn: string
    zoomOut: string
    resetZoom: string
    miniMap: string
  }
  initialMinimapVisible?: boolean
}>(), {
  copy: () => ({
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    resetZoom: 'Reset zoom',
    miniMap: 'Mini map'
  }),
  initialMinimapVisible: false
})

const { viewport, zoomIn, zoomOut, zoomTo } = useVueFlow()

// State for minimap visibility
const showMinimap = ref(props.initialMinimapVisible)

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

const toggleMinimap = () => {
  showMinimap.value = !showMinimap.value
}
</script>

<template>
  <div class="zoom-controls-container" :class="{ expanded: showMinimap }">
    <div v-if="showMinimap" class="minimap-container">
      <MiniMap pannable zoomable :title="copy.miniMap" node-color="var(--ui-50)" mask-color="rgba(150,150,150,0.5)" />
    </div>

    <div class="zoom-controls">
      <button class="zoom-button" @click="handleZoomIn" :aria-label="copy.zoomIn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      <button class="zoom-level" @click="handleFitView" :aria-label="copy.resetZoom">{{ Math.round(currentZoom * 100)
      }}%</button>

      <button class="zoom-button" @click="handleZoomOut" :aria-label="copy.zoomOut">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      <button class="zoom-button expand-button" @click="toggleMinimap" :aria-label="copy.miniMap"
        :class="{ active: showMinimap }">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <rect x="9" y="9" width="6" height="6"></rect>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.zoom-controls-container {
  position: absolute;
  bottom: var(--size-16);
  right: var(--size-16);
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: var(--size-4);
  z-index: 1000;
  background: var(--ui-100);
  border-radius: var(--ui-radius);
  padding: var(--size-4);
  box-shadow: var(--ui-container-shadow);
  transition: width 0.3s ease;
  height: 158px;
  /* Fixed height: 150px minimap + 8px padding */
}

.zoom-controls {
  display: flex;
  flex-direction: column;
  gap: var(--size-4);
  padding: var(--size-4);
  justify-content: center;
}

.minimap-container {
  width: 200px;
  height: 150px;
  overflow: hidden;
  position: relative;
  border-radius: calc(var(--ui-radius) - var(--size-2));
}

.minimap-container :deep(.vue-flow__minimap) {
  position: absolute !important;
  bottom: 0 !important;
  right: 0 !important;
  width: 100% !important;
  height: 100% !important;
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

.expand-button {
  margin-top: var(--size-4);
  border-top: 1px solid var(--ui-80);
  padding-top: var(--size-8);
}

.expand-button.active {
  background: var(--ui-primary-100);
  color: var(--ui-100);
}

.expand-button.active:hover {
  background: var(--ui-primary-90);
}

.zoom-level {
  font-size: 0.75rem;
  color: var(--ui-40);
  text-align: center;
  padding: var(--size-4) 0;
  font-weight: 600;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
  outline: none;
}

.zoom-level:hover {
  color: var(--ui-20);
}

.zoom-level:active {
  transform: scale(0.95);
}

@media (prefers-color-scheme: dark) {
  .zoom-controls-container {
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