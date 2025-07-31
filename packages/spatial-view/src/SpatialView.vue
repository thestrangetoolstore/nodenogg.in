<script setup lang="ts">
import { onMounted, ref, watch, computed, nextTick, toRef } from 'vue'
import { VueFlow, useVueFlow, type NodeChange } from '@vue-flow/core'
import { Background } from '@vue-flow/background'

import type { MicrocosmSpatialViewEmits, VueFlowEntity } from './types'
import { useSpatialSelection } from './composables/useSpatialSelection'
import ZoomControls from './components/ZoomControls.vue'

const props = withDefaults(defineProps<{
  view_id: string;
  nodes: VueFlowEntity[];
  ui?: boolean;
  minimap?: boolean;
  zoomControls?: boolean;
  zoomControlsCopy?: {
    zoomIn: string;
    zoomOut: string;
    resetZoom: string;
    miniMap: string;
  };
  HTMLEntity?: any;
  Editor?: any;
  currentUserIdentityId?: string;
  onEmojiCreate?: (emoji: string, entity: any) => void;
  onStartEditing?: (entityId: string) => void;
  onStopEditing?: () => void;
  onSplit?: (beforeContent: string, afterContent: string) => void;
}>(), {
  ui: false,
  minimap: false,
  zoomControls: true,
  zoomControlsCopy: () => ({
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    resetZoom: 'Reset zoom',
    miniMap: 'Mini map'
  })
})

const emit = defineEmits<MicrocosmSpatialViewEmits>()

const { onNodesChange, viewport, getSelectedNodes } = useVueFlow()
const { selectedNodeId, isEditing, selectNode, clearSelection, startEditing, stopEditing, isNodeEditing } = useSpatialSelection()

// Track selected nodes count for multi-selection handling
const selectedNodesCount = computed(() => getSelectedNodes.value.length)

// Sync VueFlow selection with our custom selection state
watch(() => getSelectedNodes.value, (selectedNodes) => {
  console.log('VueFlow selected nodes changed:', selectedNodes)
  if (selectedNodes.length > 0) {
    selectNode(selectedNodes[0].id)
  } else {
    clearSelection()
  }
})

// Wrapper functions to call both internal and parent handlers
const handleStartEditing = (entityId: string) => {
  startEditing(entityId)
  props.onStartEditing?.(entityId)
}

const handleStopEditing = () => {
  stopEditing()
  props.onStopEditing?.()
}


// Reactive reference to track the wrapper DOM element
const vueflowWrapper = ref<HTMLElement | null>(null)
// Reactive reference for VueFlow instance
const vueflowInstance = ref(null)

const setCSSVariables = (newZoom: string | number) => {
  if (vueflowWrapper.value && vueflowWrapper.value.style) {
    vueflowWrapper.value.style.setProperty('--zoom-value', String(newZoom))
  } else {
    // Try again in the next tick if element isn't ready
    nextTick(() => {
      if (vueflowWrapper.value && vueflowWrapper.value.style) {
        vueflowWrapper.value.style.setProperty('--zoom-value', String(newZoom))
      }
    })
  }
}
// Watch for zoom changes and update CSS variable
watch(() => viewport.value.zoom, setCSSVariables)

onMounted(async () => {
  await nextTick()
  setCSSVariables(viewport.value.zoom)
})

// This will capture ALL node changes: position (drag), dimensions (resize), etc.
const handleNodeChange = (changes: NodeChange[]) => {
  emit('nodes-change', changes)
}

// Handle node clicks for selection
const handleNodeClick = (event: MouseEvent, node: any) => {
  // VueFlow handles selection internally, we sync via the watcher
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
// Only disable interactions when actively editing text, allow normal spatial interactions
const panOnDrag = computed(() => true) // Always allow panning
const zoomOnScroll = computed(() => true) // Always allow zoom
const zoomOnPinch = computed(() => true) // Always allow pinch zoom
const zoomOnDoubleClick = computed(() => !isEditing.value) // Prevent double-click zoom when editing
const preventScrolling = computed(() => false) // Allow scrolling
const nodesDraggable = computed(() => !isEditing.value) // Prevent dragging when editing
const nodesConnectable = computed(() => !isEditing.value) // Prevent connections when editing
const elementsSelectable = computed(() => true) // Always allow selection
</script>

<template>
  <div ref="vueflowWrapper" class="vueflow-container">
    <VueFlow vueFlowRef="vueflowInstance" :nodes="nodes" class="pinia-flow" @nodes-change="handleNodeChange"
      @node-click="handleNodeClick" @pane-click="handlePaneClick" :pan-on-drag="panOnDrag" :pan-on-scroll="panOnDrag"
      :zoom-on-scroll="zoomOnScroll" :zoom-on-pinch="zoomOnPinch" :zoom-on-double-click="zoomOnDoubleClick"
      :prevent-scrolling="preventScrolling" :nodes-draggable="nodesDraggable" :nodes-connectable="nodesConnectable"
      :elements-selectable="elementsSelectable">
      <Background variant="lines" patternColor="var(--ui-80)" />
      <ZoomControls v-if="zoomControls" :copy="zoomControlsCopy" :initial-minimap-visible="minimap" />
      <template #node-resizable="resizableNodeProps">
        <slot name="node-resizable"
          v-bind="{ ...resizableNodeProps, isSelected: selectedNodeId === resizableNodeProps.id }">
          <component v-if="HTMLEntity" :is="HTMLEntity" :entity="resizableNodeProps.data"
            :is-selected="selectedNodeId === resizableNodeProps.id" :is-editing="isNodeEditing(resizableNodeProps.id)"
            :has-multi-selection="selectedNodesCount > 1"
            :on-start-editing="handleStartEditing" :on-stop-editing="handleStopEditing"
            :current-user-identity-id="currentUserIdentityId" :on-emoji-create="onEmojiCreate"
            :on-update="$attrs.onUpdate" :on-delete="$attrs.onDelete" :on-duplicate="$attrs.onDuplicate"
            :on-split="onSplit" :editable="true" />
        </slot>
      </template>
      <template #node-emoji="emojiNodeProps">
        <slot name="node-emoji" v-bind="{ ...emojiNodeProps, isSelected: selectedNodeId === emojiNodeProps.id }">
          <!-- Default emoji rendering can go here if needed -->
        </slot>
      </template>
    </VueFlow>
  </div>
</template>

<style scoped>
.vueflow-container {
  width: 100%;
  height: 100%;
  position: relative;
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