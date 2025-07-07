<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import { VueFlow, useVueFlow, type NodeChange } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { MiniMap } from '@vue-flow/minimap'

import type { MicrocosmSpatialViewEmits, VueFlowEntity } from './types'
import { useSpatialSelection } from './composables/useSpatialSelection'

const props = withDefaults(defineProps<{
  view_id: string;
  nodes: VueFlowEntity[];
  ui?: boolean;
  minimap?: boolean;
  zoomControls?: boolean;
  HTMLEntity?: any;
  currentUserIdentityId?: string;
}>(), {
  ui: false,
  minimap: false,
  zoomControls: true
})

const emit = defineEmits<MicrocosmSpatialViewEmits>()

const { onNodesChange, viewport, zoomIn, zoomOut, zoomTo } = useVueFlow()
const { selectedNodeId, isEditing, selectNode, clearSelection, startEditing, stopEditing, isNodeEditing } = useSpatialSelection()

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


// Reactive reference to track the canvas element
const canvasContainer = ref<HTMLElement | null>(null)

const setCSSVariables = (newZoom: string | number) => {
  if (canvasContainer.value) {
    // canvasContainer.value.style.setProperty('--zoom-value', String(newZoom))
  }

}
// Watch for zoom changes and update CSS variable
watch(() => viewport.value.zoom, setCSSVariables)

onMounted(() => {
  setCSSVariables(1.)
})

// This will capture ALL node changes: position (drag), dimensions (resize), etc.
const handleNodeChange = (changes: NodeChange[]) => {
  emit('nodes-change', changes)
}

// Handle node clicks for selection
const handleNodeClick = (event: MouseEvent, node: any) => {
  if (node && node.id) {
    selectNode(node.id)
  }
}

// Handle pane clicks for deselection
const handlePaneClick = () => {
  if (!isEditing.value) {
    clearSelection()
  }
}

// Register the node change handler
onNodesChange(handleNodeChange)

// Computed properties for controlling interactions
const panOnDrag = computed(() => !isEditing.value)
const zoomOnScroll = computed(() => !isEditing.value)
const zoomOnPinch = computed(() => !isEditing.value)
const zoomOnDoubleClick = computed(() => !isEditing.value)
const preventScrolling = computed(() => isEditing.value)
const nodesDraggable = computed(() => !isEditing.value)
const nodesConnectable = computed(() => !isEditing.value)
const elementsSelectable = computed(() => !isEditing.value)
</script>

<template>
  <VueFlow vueFlowRef="canvasContainer" :nodes="nodes" class="pinia-flow" @nodes-change="handleNodeChange"
    @node-click="handleNodeClick" @pane-click="handlePaneClick" :pan-on-drag="panOnDrag" :pan-on-scroll="panOnDrag"
    :zoom-on-scroll="zoomOnScroll" :zoom-on-pinch="zoomOnPinch" :zoom-on-double-click="zoomOnDoubleClick"
    :prevent-scrolling="preventScrolling" :nodes-draggable="nodesDraggable" :nodes-connectable="nodesConnectable"
    :elements-selectable="elementsSelectable">
    <Background variant="lines" patternColor="var(--ui-80)" />
    <MiniMap v-if="minimap" pannable zoomable class="mini-map" title="Mini map" />

    <!-- Built-in Zoom Controls -->
    <div v-if="zoomControls" class="zoom-controls">
      <button class="zoom-button" @click="handleZoomIn" aria-label="Zoom in">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      <div class="zoom-level">{{ Math.round(currentZoom * 100) }}%</div>

      <button class="zoom-button" @click="handleZoomOut" aria-label="Zoom out">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      <!-- <button class="zoom-button fit-button" @click="handleFitView" aria-label="Reset zoom">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15,3 21,3 21,9"></polyline>
          <polyline points="9,21 3,21 3,15"></polyline>
          <line x1="21" y1="3" x2="14" y2="10"></line>
          <line x1="3" y1="21" x2="10" y2="14"></line>
        </svg>
      </button> -->
    </div>
    <template #node-resizable="resizableNodeProps">
      <slot name="node-resizable"
        v-bind="{ ...resizableNodeProps, isSelected: selectedNodeId === resizableNodeProps.id }">
        <component v-if="HTMLEntity" :is="HTMLEntity" :entity="resizableNodeProps.data"
          :is-selected="selectedNodeId === resizableNodeProps.id" :is-editing="isNodeEditing(resizableNodeProps.id)"
          :on-start-editing="startEditing" :on-stop-editing="stopEditing"
          :current-user-identity-id="currentUserIdentityId" v-bind="$attrs" />
      </slot>
    </template>
    <template #node-emoji="emojiNodeProps">
      <slot name="node-emoji" v-bind="{ ...emojiNodeProps, isSelected: selectedNodeId === emojiNodeProps.id }">
        <!-- Default emoji rendering can go here if needed -->
      </slot>
    </template>
  </VueFlow>
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

@media (prefers-color-scheme: dark) {
  .zoom-controls {
    background: var(--ui-85);
  }

  .zoom-button {
    color: var(--ui-30);
  }

  .zoom-button:hover {
    background: var(--ui-80);
    color: var(--ui-primary-100);
  }
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

/* Override Vue Flow default styles for emoji nodes */
:deep(.vue-flow__node-emoji) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
}

:deep(.vue-flow__node-emoji .vue-flow__node-default) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
}
</style>