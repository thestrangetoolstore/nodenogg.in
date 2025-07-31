<script setup lang="ts">
import { computed, watch } from 'vue'
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from 'reka-ui'
import Icon from '@/components/icon/Icon.vue'
import ColorSelector from '@/components/color-selector/ColorSelector.vue'
import EmojiSelector from '@/components/emoji-selector/EmojiSelector.vue'
import type { EntityOfType } from '@nodenogg.in/schema'
import { getColor } from '@/utils/color'
import { NodeResizer } from '@nodenogg.in/spatial-view'
import Editor from '../editor/Editor.vue'

const props = defineProps<{
  entity: EntityOfType<'html'>
  Editor?: any
  onUpdate?: (id: string, data: any) => void
  onDelete?: (id: string) => void
  onDuplicate?: (id: string) => void
  onEmojiCreate?: (emoji: string, entity: EntityOfType<'html'>) => void
  isSelected?: boolean
  hasMultiSelection?: boolean
  editable?: boolean
  isEditing?: boolean
  onStartEditing?: (id: string) => void
  onStopEditing?: () => void
  onSplit?: (beforeContent: string, afterContent: string) => void
  currentUserIdentityId?: string
}>()

// Check if current user owns this entity
const isOwner = computed(() => {
  return props.currentUserIdentityId && props.entity.identity_id === props.currentUserIdentityId
})

// Entity is editable if explicitly allowed AND user owns the entity
const isEditable = computed(() => {
  return (props.editable !== false && isOwner.value) as boolean
})

// Show resizer only when single selection (no multi-selection) and is selected and editable
const showResizer = computed(() => {
  return isEditable.value && props.isSelected && !props.hasMultiSelection
})

// Show outline when selected OR editing
const showOutline = computed(() => {
  return props.isSelected || props.isEditing
})

// Debug selection state
watch(() => props.isSelected, (newVal) => {
  console.log('HTMLEntity selection changed:', props.entity.id, 'isSelected:', newVal, 'isEditable:', isEditable.value, 'hasMultiSelection:', props.hasMultiSelection)
})

// Handler for content changes
const handleContentChange = (html: string) => {
  if (props.onUpdate && props.entity) {
    props.onUpdate(props.entity.id, { content: html })
  }
}

// Handler for color changes
const handleColorChange = (backgroundColor: string) => {
  if (props.onUpdate && props.entity) {
    props.onUpdate(props.entity.id, { backgroundColor })
  }
}

// Handler for when editing is cancelled
const handleCancel = () => {
  if (props.onStopEditing) {
    props.onStopEditing()
  }
}

// Handler for double-clicking to edit
const handleDoubleClick = (event: MouseEvent) => {
  event.stopPropagation()
  if (isEditable.value && props.onStartEditing) {
    props.onStartEditing(props.entity.id)
  }
}

// Handler for single click (prevent propagation when editing)
const handleClick = (event: MouseEvent) => {
  console.log('HTMLEntity clicked:', props.entity.id, 'isEditing:', props.isEditing)
  if (props.isEditing) {
    event.stopPropagation()
  }
  // Let the click bubble up to VueFlow for selection
}

const handleKeydown = (event: KeyboardEvent) => {
  if ((event.key === 'Enter' || event.key === ' ') && !props.isEditing && isEditable.value && props.onStartEditing) {
    event.preventDefault()
    props.onStartEditing(props.entity.id)
  }
  // ESC key to stop editing
  if (event.key === 'Escape' && props.isEditing && props.onStopEditing) {
    event.preventDefault()
    props.onStopEditing()
  }
}

// Stop propagation of mouse events when editing to prevent node dragging
const handleMouseDown = (event: MouseEvent) => {
  if (props.isEditing) {
    event.stopPropagation()
  }
}

// Prevent wheel events from bubbling when editing
const handleWheel = (event: WheelEvent) => {
  if (props.isEditing) {
    event.stopPropagation()
  }
}

// Handler functions for dropdown menu actions
const handleDelete = () => {
  if (props.onDelete && props.entity) {
    props.onDelete(props.entity)
  }
}

const handleDuplicate = () => {
  if (props.onDuplicate && props.entity) {
    // For spatial view, we need to create a duplicate with offset position
    const newEntity = {
      ...props.entity.data,
      x: props.entity.data.x + 20,
      y: props.entity.data.y + 20
    }
    props.onDuplicate(newEntity)
  }
}

// Handler for emoji selection
const handleEmojiSelect = (emoji: string) => {
  if (props.onEmojiCreate && props.entity) {
    props.onEmojiCreate(emoji, props.entity)
  }
}
</script>

<template>
  <NodeResizer v-if="showResizer" :min-width="50" :min-height="50" :node-id="entity.id" />
  <div class="resizable-container" :class="{
    'is-selected': isSelected,
    'is-editing': isEditing,
    'read-only': !isEditable,
    'show-outline': showOutline
  }" :style="`background-color: ${getColor(entity.data.backgroundColor || 'yellow', isEditable ? 50 : 50)}`"
    tabindex="0" @keydown="handleKeydown" @dblclick="handleDoubleClick" @click="handleClick"
    @mousedown="handleMouseDown" @wheel="handleWheel">

    <!-- Content slot with default implementation -->
    <div class="content-wrapper">
      <slot name="content" :entity="entity" :is-editing="isEditing" :is-editable="isEditable"
        :on-change="handleContentChange" :on-cancel="handleCancel">
        <!-- Default content if no slot provided -->
        <Editor :value="entity?.data.content" :onChange="handleContentChange" :editable="(isEditing && isEditable)"
          @cancel="handleCancel" @split="(before: string, after: string) => props.onSplit?.(before, after)" />
      </slot>
    </div>

    <!-- Entity Toolbar - show for all entities -->
    <div class="entity-toolbar">
      <slot name="toolbar" :entity="entity" :on-delete="handleDelete" :on-duplicate="handleDuplicate"
        :on-color-change="handleColorChange" :is-owner="isOwner">
        <!-- Default toolbar based on ownership -->
        <template v-if="isOwner">
          <!-- Color picker dropdown -->
          <DropdownMenuRoot :modal="true">
            <DropdownMenuTrigger class="toolbar-button color-button">
              <div class="color-circle" :style="`background-color: ${getColor(entity.data.backgroundColor || 'yellow')}`"></div>
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
              <DropdownMenuContent class="color-dropdown-content" :side-offset="5" :align="'start'">
                <ColorSelector :value="entity.data.backgroundColor" :onUpdate="handleColorChange" />
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenuRoot>

          <!-- Emoji selector dropdown -->
          <DropdownMenuRoot :modal="true">
            <DropdownMenuTrigger class="toolbar-button">
              <Icon type="home" />
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
              <DropdownMenuContent class="emoji-dropdown-content" :side-offset="5" :align="'center'">
                <EmojiSelector :onEmojiSelect="handleEmojiSelect" />
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenuRoot>

          <!-- Duplicate button -->
          <button class="toolbar-button" @click="handleDuplicate">
            <Icon type="home" />
            <span class="button-label">Duplicate</span>
          </button>

          <!-- Delete button -->
          <button class="toolbar-button delete-button" @click="handleDelete">
            <Icon type="close" />
            <span class="button-label">Delete</span>
          </button>
        </template>
        <template v-else>
          <!-- Non-owner actions: limited -->
          <!-- Emoji selector dropdown -->
          <DropdownMenuRoot :modal="true">
            <DropdownMenuTrigger class="toolbar-button">
              <Icon type="smile" />
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
              <DropdownMenuContent class="emoji-dropdown-content" :side-offset="5" :align="'center'">
                <EmojiSelector :onEmojiSelect="handleEmojiSelect" />
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenuRoot>

          <!-- Duplicate button -->
          <button class="toolbar-button" @click="handleDuplicate">
            <Icon type="copy" />
            <span class="button-label">Duplicate</span>
          </button>
        </template>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.resizable-container {
  color: var(--ui-mono-0);
  border-radius: var(--ui-radius);
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  outline: none;
  transition: outline 0.2s ease;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.resizable-container:focus {
  /* outline: 2px solid var(--ui-primary-100); */
  /* outline-offset: 2px; */
}

/* Outline for selected or editing entities */
.resizable-container.show-outline {
  box-shadow: 0 0 0 calc(var(--ui-weight) / var(--zoom-value)) var(--ui-0);
}

/* Special styling for editing state */
.resizable-container.is-editing {
  box-shadow: 0 0 0 calc(var(--ui-weight) / var(--zoom-value)) var(--ui-0);
}

.resizable-container.read-only {
  opacity: 0.8;
}

/* Read-only entities have dimmed outline when selected */
.resizable-container.read-only.show-outline {
  box-shadow: 0 0 0 calc(var(--ui-weight) / var(--zoom-value)) var(--ui-60);
}

.resizable-container.read-only .content-wrapper {
  /* pointer-events: none;
  user-select: none; */
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


/* Dropdown menu styles matching ContextMenu */
:deep(.dropdown-menu-content) {
  z-index: 500;
  min-width: 180px;
  max-width: 220px;
  border-radius: var(--ui-radius);
  overflow: hidden;
  background: var(--ui-95);
  box-shadow: var(--ui-container-shadow);
  padding: var(--size-2);
}

@media (prefers-color-scheme: dark) {
  :deep(.dropdown-menu-content) {
    background: var(--ui-95);
  }
}

/* Dropdown menu item styles matching ContextMenuItem */
.dropdown-menu-item {
  border-radius: var(--ui-radius);
  display: flex;
  align-items: center;
  padding: var(--size-8);
  position: relative;
  user-select: none;
  outline: none;
  color: var(--ui-0);
  cursor: pointer;
}

.dropdown-menu-item[data-disabled] {
  color: var(--ui-50);
  cursor: not-allowed;
}

.dropdown-menu-item[data-highlighted] {
  background: var(--ui-90);
  color: var(--ui-0);
}

@media (prefers-color-scheme: dark) {
  .dropdown-menu-item[data-highlighted] {
    background: var(--ui-80);
  }
}

/* Entity Toolbar styles */
.entity-toolbar {
  position: absolute;
  left: 0;
  bottom: calc(100% + var(--size-8));
  display: flex;
  gap: var(--size-4);
  opacity: 0;
  transform-origin: 0% 100%;
  background-color: red;
  padding: var(--size-8);
  transform: scale(calc(1 / var(--zoom-value)));
  transition: opacity 0.2s ease;
}

.resizable-container:hover .entity-toolbar,
.resizable-container:focus-within .entity-toolbar {
  opacity: 1;
}

/* Toolbar button styles */
.toolbar-button {
  padding: var(--size-6);
  background: var(--ui-95);
  box-shadow: var(--ui-shadow-25);
  border: none;
  border-radius: var(--ui-radius);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ui-mono-0);
  min-width: var(--size-28);
  height: var(--size-28);
  gap: var(--size-4);
  transition: all 0.2s ease;
  white-space: nowrap;
}

.toolbar-button:hover {
  background: var(--ui-90);
  color: var(--ui-0);
}

.toolbar-button[data-state="open"] {
  background: var(--ui-90);
  color: var(--ui-0);
}

/* Color button specific styles */
.color-button {
  background: var(--ui-95) !important;
}

.color-button:hover {
  background: var(--ui-90) !important;
}

.color-circle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid var(--ui-80);
}

.button-label {
  font-size: 0.875rem;
  font-weight: 500;
}

/* Delete button warning style */
.delete-button:hover {
  background: var(--ui-red);
  color: var(--ui-100);
}

/* Toolbar dropdown content styles */
.color-dropdown-content,
.emoji-dropdown-content {
  z-index: 500;
  border-radius: var(--ui-radius);
  overflow: hidden;
  background: var(--ui-95);
  box-shadow: var(--ui-container-shadow);
  padding: var(--size-8);
}

@media (prefers-color-scheme: dark) {
  .color-dropdown-content,
  .emoji-dropdown-content {
    background: var(--ui-95);
  }
}

/* Dropdown menu separator */
.dropdown-menu-separator {
  height: 1px;
  background: var(--ui-90);
  margin: var(--size-2) 0;
}

/* Info item styles for non-owner menu */
.info-item {
  font-size: 0.875rem;
  color: var(--ui-50) !important;
  cursor: default !important;
  font-style: italic;
}

.info-item[data-disabled] {
  opacity: 0.8;
}

/* Emoji selector styles */
.emoji-selector-item {
  padding: var(--size-4) !important;
}

.emoji-selector-item:hover {
  background: transparent !important;
}
</style>