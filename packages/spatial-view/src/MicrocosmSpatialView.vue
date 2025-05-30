<script setup lang="ts">
import { ref, watch } from 'vue'
import { VueFlow, useVueFlow, type NodeChange } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { MiniMap } from '@vue-flow/minimap'
import ResizableNode from './ResizableNode.vue'

import type { MicrocosmSpatialViewProps, MicrocosmSpatialViewEmits } from './types'

const props = defineProps<MicrocosmSpatialViewProps>()
const emit = defineEmits<MicrocosmSpatialViewEmits>()

const { onNodesChange, viewport, ...rest } = useVueFlow()
console.log(rest)

// Reactive reference to track the canvas element
const canvasContainer = ref<HTMLElement | null>(null)

// Watch for zoom changes and update CSS variable
watch(() => viewport.value.zoom, (newZoom) => {
  if (canvasContainer.value) {
    canvasContainer.value.style.setProperty('--zoom-value', String(newZoom))
  }
})

const handleNodeChange = (changes: NodeChange[]) => {
  // Emit the changes to parent component
  emit('nodes-change', changes)
}

// Register the node change handler
onNodesChange(handleNodeChange)
</script>

<template>
  <div class="container" ref="canvasContainer">
    <VueFlow :nodes="nodes" fit-view-on-init class="pinia-flow" @nodes-change="handleNodeChange"
        pan-on-scroll :apply-default="false" >
      <Background variant="lines" patternColor="var(--ui-80)" />
      <!-- <MiniMap pannable zoomable class="mini-map" title="Mini map" /> -->
      <template #node-resizable="resizableNodeProps">
        <slot name="node-resizable" v-bind="resizableNodeProps">
          <ResizableNode :entity="resizableNodeProps.data" />
        </slot>
      </template>
    </VueFlow>
  </div>
</template>

<style scoped>
.mini-map {
  position: absolute;
  bottom: 0;
  right: 0;
  background: var(--ui-90);
  box-shadow: var(--ui-container-shadow);
  border-radius: var(--ui-radius);
  padding: 0;
}

.button {
  cursor: pointer;
  background: var(--ui-95);
  box-shadow: var(--ui-container-shadow);
  border-radius: calc(var(--ui-radius));
  padding: var(--size-8);
}

.button:hover {
  background: var(--ui-primary-100);
  color: var(--ui-100);
}

.nodes {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 1em;
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.pinia-flow {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.large {
  font-size: 14em;
  line-height: 0.95em;
}

.container {
  width: 100%;
  height: 100%;
  position: relative;
  padding: 2em;
  padding-top: 6em;
}
</style>