<script setup lang="ts">
import { ref, computed, watch } from 'vue'

import { NodeResizer } from '../node-resizer'
import type { EntityOfType } from '@nodenogg.in/schema';
import { useSpatialSelection } from '../composables/useSpatialSelection'

const props = defineProps<{
  entity: EntityOfType<'html'>;
  Editor?: any;
  onUpdate?: (id: string, data: any) => void;
  isSelected?: boolean;
  editable?: boolean;
}>()

// Default to editable if not specified
const isEditable = computed(() => props.editable !== false)

const { startEditing, stopEditing, isNodeEditing } = useSpatialSelection()
const isEditing = computed(() => isNodeEditing.value(props.entity.id))

// Handler for content changes
const handleContentChange = (html: string) => {
  if (props.onUpdate && props.entity) {
    props.onUpdate(props.entity.id, { content: html })
  }
}

// Handler for when editing is cancelled
const handleCancel = () => {
  stopEditing()
}

// Handler for double-clicking to edit
const handleDoubleClick = (event: MouseEvent) => {
  event.stopPropagation()
  if (isEditable.value) {
    startEditing(props.entity.id)
  }
}

// Handler for single click (prevent propagation when editing)
const handleClick = (event: MouseEvent) => {
  if (isEditing.value) {
    event.stopPropagation()
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if ((event.key === 'Enter' || event.key === ' ') && !isEditing.value && isEditable.value) {
    event.preventDefault()
    startEditing(props.entity.id)
  }
  // ESC key to stop editing
  if (event.key === 'Escape' && isEditing.value) {
    event.preventDefault()
    stopEditing()
  }
}

// Stop propagation of mouse events when editing to prevent node dragging
const handleMouseDown = (event: MouseEvent) => {
  if (isEditing.value) {
    event.stopPropagation()
  }
}

// Prevent wheel events from bubbling when editing
const handleWheel = (event: WheelEvent) => {
  if (isEditing.value) {
    event.stopPropagation()
  }
}
</script>

<template>
  <!-- Only show NodeResizer for editable entities -->
  <NodeResizer v-if="isEditable" :min-width="50" :min-height="50" :node-id="entity.id" />
  <div class="resizable-container" :class="{ 
    'is-selected': isSelected, 
    'is-editing': isEditing,
    'read-only': !isEditable
  }" tabindex="0"
    @keydown="handleKeydown" @dblclick="handleDoubleClick" @click="handleClick" @mousedown="handleMouseDown"
    @wheel="handleWheel">
    <div class="content-wrapper">
      <component v-if="Editor" :is="Editor" :value="entity?.data.content" :onChange="handleContentChange"
        :editable="isEditing && isEditable" @cancel="handleCancel" />
    </div>

  </div>
</template>

<style scoped>
.resizable-container {
  background: var(--ui-80);
  color: var(--ui-0);
  border-radius: var(--ui-radius);
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  outline: none;
  transition: outline 0.2s ease;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.resizable-container:focus {
  outline: 2px solid var(--ui-primary-100);
  outline-offset: 2px;
}

/* Selection state */
.resizable-container.is-selected {
  outline: 2px solid var(--ui-primary-100);
  outline-offset: 2px;
}

/* Editing state */
.resizable-container.is-editing {
  outline: 3px solid var(--ui-primary-100);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(var(--ui-primary-100-rgb), 0.2);
}

/* Read-only state */
.resizable-container.read-only {
  background: var(--ui-85);
  opacity: 0.8;
  border: 1px solid var(--ui-70);
}

.resizable-container.read-only:focus {
  outline: 2px solid var(--ui-60);
  outline-offset: 2px;
}

.resizable-container.read-only.is-selected {
  outline: 2px solid var(--ui-60);
  outline-offset: 2px;
}

.resizable-container.read-only .content-wrapper {
  pointer-events: none; /* Prevent text selection in read-only mode */
}

/* Content wrapper to handle overflow */
.content-wrapper {
  flex: 1;
  min-height: 0;
  overflow: auto;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* Ensure editor content respects container */
.content-wrapper :deep(*) {
  max-width: 100%;
}


@media (prefers-color-scheme: dark) {
  .resizable-container.read-only {
    background: var(--ui-80);
    border-color: var(--ui-60);
  }
}
</style>