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
  HTMLEntity?: any;
  currentUserIdentityId?: string;
}>(), {
  ui: false,
  minimap: false
})

const emit = defineEmits<MicrocosmSpatialViewEmits>()

const { onNodesChange, viewport } = useVueFlow()
const { selectedNodeId, isEditing, selectNode, clearSelection, startEditing, stopEditing, isNodeEditing } = useSpatialSelection()


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
    <template #node-resizable="resizableNodeProps">
      <slot name="node-resizable"
        v-bind="{ ...resizableNodeProps, isSelected: selectedNodeId === resizableNodeProps.id }">
        <component 
          v-if="HTMLEntity" 
          :is="HTMLEntity" 
          :entity="resizableNodeProps.data" 
          :is-selected="selectedNodeId === resizableNodeProps.id"
          :is-editing="isNodeEditing(resizableNodeProps.id)"
          :on-start-editing="startEditing"
          :on-stop-editing="stopEditing"
          :current-user-identity-id="currentUserIdentityId"
          v-bind="$attrs" />
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