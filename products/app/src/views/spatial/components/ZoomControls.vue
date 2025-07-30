<script setup lang="ts">
import { computed } from 'vue'
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from 'reka-ui'
import { useVueFlow } from '@vue-flow/core'
import Tooltip from '../../../components/Tooltip.vue'
import Icon from '../../../components/icon/Icon.vue'

// Get VueFlow actions and state
const { zoomIn, zoomOut, zoomTo, viewport } = useVueFlow()

// Zoom configuration
const minZoom = 0.1
const maxZoom = 3
const zoomStep = 0.1

// Current zoom level from viewport
const currentZoom = computed(() => viewport.value.zoom)

// Handle slider changes
const handleZoomChange = (values?: number[]) => {
  if (values && values[0] !== undefined) {
    zoomTo(values[0])
  }
}

// Handle zoom in button
const handleZoomIn = () => {
  zoomIn()
}

// Handle zoom out button
const handleZoomOut = () => {
  zoomOut()
}

// Handle fit view (zoom to 100%)
const handleFitView = () => {
  zoomTo(1)
}
</script>

<template>
  <div class="zoom-controls">
    <!-- Zoom In Button -->
    <Tooltip tooltip="Zoom In" side="left">
      <button class="zoom-button" @click="handleZoomIn" aria-label="Zoom in">
        <Icon type="plus" :size="16" />
      </button>
    </Tooltip>

    <!-- Zoom Slider -->
    <Tooltip :tooltip="`Zoom: ${Math.round(currentZoom * 100)}%`" side="left">
      <SliderRoot @update:modelValue="handleZoomChange" :model-value="[currentZoom]" class="slider-root" :max="maxZoom"
        :min="minZoom" orientation="vertical" :step="zoomStep">
        <SliderTrack class="slider-track">
          <SliderRange class="slider-range" />
        </SliderTrack>
        <SliderThumb class="slider-thumb" aria-label="Zoom level" />
      </SliderRoot>
    </Tooltip>

    <!-- Zoom Out Button -->
    <Tooltip tooltip="Zoom Out" side="left">
      <button class="zoom-button" @click="handleZoomOut" aria-label="Zoom out">
        <Icon type="minus" :size="16" />
      </button>
    </Tooltip>

    <!-- Fit View Button -->
    <Tooltip tooltip="Reset Zoom (100%)" side="left">
      <button class="zoom-button fit-button" @click="handleFitView" aria-label="Fit view">
        <Icon type="maximize" :size="16" />
      </button>
    </Tooltip>
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
  background-color: var(--ui-90)
}

.zoom-button {
  width: var(--size-32);
  height: var(--size-32);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ui-90);
  border: none;
  border-radius: var(--ui-radius);
  color: var(--ui-20);
  cursor: pointer;
  box-shadow: var(--ui-container-shadow);
  transition: all 0.2s ease;
}

.zoom-button:hover {
  background: var(--ui-80);
  color: var(--ui-primary-100);
  box-shadow: var(--ui-shadow-10);
}

.zoom-button:active {
  transform: scale(0.95);
}

.fit-button {
  margin-top: var(--size-4);
  border-top: 1px solid var(--ui-80);
}

.slider-root {
  display: flex;
  align-items: center;
  touch-action: none;
  width: var(--size-32);
  height: 120px;
  cursor: pointer;
  background: var(--ui-90);
  box-shadow: var(--ui-container-shadow);
  border-radius: var(--ui-radius);
  color: var(--ui-60);
  padding: var(--size-8) 0;
}

.slider-root[data-orientation='vertical'] {
  flex-direction: column;
}

.slider-track {
  position: relative;
  width: 3px;
  height: 100%;
  background: var(--ui-80);
  border-radius: 2px;
}

.slider-range {
  position: absolute;
  background: var(--ui-primary-100);
  border-radius: inherit;
  width: 100%;
}

.slider-thumb {
  display: block;
  width: var(--size-16);
  height: var(--size-16);
  background: var(--ui-primary-100);
  box-shadow: var(--ui-shadow-10);
  border-radius: 50%;
  outline: none;
  cursor: grab;
  transition: all 0.2s ease;
}

.slider-thumb:hover,
.slider-thumb:focus {
  transform: scale(1.1);
  box-shadow: var(--ui-shadow-primary);
}

.slider-thumb:active {
  cursor: grabbing;
  transform: scale(1.2);
}

@media (prefers-color-scheme: dark) {
  .zoom-button {
    background: var(--ui-90);
    color: var(--ui-30);
  }

  .zoom-button:hover {
    background: var(--ui-80);
    color: var(--ui-primary-100);
  }

  .zoom-controls  {
    background-color: red;
  }
}
</style>
