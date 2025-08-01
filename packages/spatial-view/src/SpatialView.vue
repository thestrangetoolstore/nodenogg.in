<script setup lang="ts">
import { onMounted, ref, watch, computed, nextTick, toRef } from 'vue'
import { VueFlow, useVueFlow, type NodeChange } from '@vue-flow/core'
import { Background } from '@vue-flow/background'

import type { MicrocosmSpatialViewEmits, VueFlowEntity } from './types'
import { useSpatialSelection } from './composables/useSpatialSelection'
import ZoomControls from './components/ZoomControls.vue'
import { EntityOfType } from '@nodenogg.in/schema'

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
  onSplit?: (entity: EntityOfType<'html'>, beforeContent: string, afterContent: string) => void;
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
const { isEditing, startEditing, stopEditing, isNodeEditing } = useSpatialSelection()

// Track selected nodes count for multi-selection handling
const selectedNodesCount = computed(() => getSelectedNodes.value.length)
const selectedNodeIds = computed(() => getSelectedNodes.value.map(node => node.id))

// Helper function to check if a node is selected in VueFlow
const isNodeSelectedInVueFlow = (nodeId: string) => {
  return selectedNodeIds.value.includes(nodeId)
}

// Wrapper functions to call both internal and parent handlers
const handleStartEditing = (entityId: string) => {
  console.log('SpatialView handleStartEditing called for:', entityId)
  startEditing(entityId)
  console.log('editingNodeId after startEditing:', isEditing.value, 'isNodeEditing:', isNodeEditing.value(entityId))
  props.onStartEditing?.(entityId)
}

const handleStopEditing = () => {
  stopEditing()
  props.onStopEditing?.()
}


// Reactive reference to track the wrapper DOM element
const vueflowWrapper = ref<HTMLElement | null>(null)

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

// Handle node clicks for selection - VueFlow handles this automatically
const handleNodeClick = (event: MouseEvent, node: any) => {
  // No custom logic needed, VueFlow handles selection
}

// Handle pane clicks for deselection - VueFlow handles this automatically
const handlePaneClick = () => {
  // Only stop editing when clicking on empty pane
  if (isEditing.value) {
    stopEditing()
  }
}

// Register the node change handler
onNodesChange(handleNodeChange)

// Computed properties for controlling interactions
// Only disable interactions when actively editing text, allow normal spatial interactions
const panOnDrag = computed(() => false) // Disable pan on drag
const panOnScroll = computed(() => true) // Always allow panning
const zoomOnScroll = computed(() => true) // Always allow zoom
const zoomOnPinch = computed(() => true) // Always allow pinch zoom
const zoomOnDoubleClick = computed(() => !isEditing.value) // Prevent double-click zoom when editing
const preventScrolling = computed(() => false) // Allow scrolling
const nodesDraggable = computed(() => !isEditing.value) // Prevent dragging when editing
const nodesConnectable = computed(() => !isEditing.value) // Prevent connections when editing
const elementsSelectable = computed(() => true) // Always allow selection

// Cursor management based on interaction state
const canvasCursor = computed(() => {
  if (isEditing.value) {
    return 'text' // Text cursor when editing or selecting text
  }
  return 'default' // Default cursor for normal canvas interactions
})
</script>

<template>
  <div ref="vueflowWrapper" class="vueflow-container">
    <VueFlow vueFlowRef="vueflowInstance" :nodes="nodes" class="pinia-flow" :style="{ cursor: canvasCursor }"
      @nodes-change="handleNodeChange" @node-click="handleNodeClick" @pane-click="handlePaneClick"
      :pan-on-drag="panOnDrag" :pan-on-scroll="panOnScroll" :zoom-on-scroll="zoomOnScroll" :zoom-on-pinch="zoomOnPinch"
      :zoom-on-double-click="zoomOnDoubleClick" :prevent-scrolling="preventScrolling" :nodes-draggable="nodesDraggable"
      :nodes-connectable="nodesConnectable" :elements-selectable="elementsSelectable"
      :only-render-visible-elements="true">
      <Background variant="lines" patternColor="var(--ui-80)" />
      <ZoomControls v-if="zoomControls" :copy="zoomControlsCopy" :initial-minimap-visible="minimap" />
      <template #node-resizable="resizableNodeProps">
        <slot name="node-resizable"
          v-bind="{ ...resizableNodeProps, isSelected: isNodeSelectedInVueFlow(resizableNodeProps.id) }">
          <component v-if="HTMLEntity" :is="HTMLEntity" :entity="resizableNodeProps.data"
            :is-selected="isNodeSelectedInVueFlow(resizableNodeProps.id)"
            :is-editing="isNodeEditing(resizableNodeProps.id)" :has-multi-selection="selectedNodesCount > 1"
            :on-start-editing="handleStartEditing" :on-stop-editing="handleStopEditing"
            :current-user-identity-id="currentUserIdentityId" :on-emoji-create="onEmojiCreate"
            :on-update="$attrs.onUpdate" :on-delete="$attrs.onDelete" :on-duplicate="$attrs.onDuplicate"
            :on-split="onSplit" :editable="true" :auto-focus="resizableNodeProps.data.autoFocus" />
        </slot>
      </template>
      <template #node-emoji="emojiNodeProps">
        <slot name="node-emoji" v-bind="{ ...emojiNodeProps, isSelected: isNodeSelectedInVueFlow(emojiNodeProps.id) }">
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