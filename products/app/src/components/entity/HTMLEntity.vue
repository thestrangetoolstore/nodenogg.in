<script setup lang="ts">
import { computed } from 'vue'
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

const props = defineProps<{
  entity: EntityOfType<'html'>
  Editor?: any
  onUpdate?: (id: string, data: any) => void
  onDelete?: (id: string) => void
  onDuplicate?: (id: string) => void
  onEmojiCreate?: (emoji: string, entity: EntityOfType<'html'>) => void
  isSelected?: boolean
  editable?: boolean
  isEditing?: boolean
  onStartEditing?: (id: string) => void
  onStopEditing?: () => void
  currentUserIdentityId?: string
}>()

// Check if current user owns this entity
const isOwner = computed(() => {
  return props.currentUserIdentityId && props.entity.identity_id === props.currentUserIdentityId
})

// Entity is editable if explicitly allowed AND user owns the entity
const isEditable = computed(() => {
  return props.editable !== false && isOwner.value
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
  if (props.isEditing) {
    event.stopPropagation()
  }
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
  <NodeResizer v-if="isEditable" :min-width="50" :min-height="50" :node-id="entity.id" />
  <div class="resizable-container" :class="{
    'is-selected': isSelected,
    'is-editing': isEditing,
    'read-only': !isEditable
  }" :style="`background-color: ${getColor(entity.data.backgroundColor || 'yellow', isEditable ? 50 : 50)}`"
    tabindex="0" @keydown="handleKeydown" @dblclick="handleDoubleClick" @click="handleClick"
    @mousedown="handleMouseDown" @wheel="handleWheel">

    <!-- Content slot with default implementation -->
    <div class="content-wrapper">
      <slot name="content" :entity="entity" :is-editing="isEditing" :is-editable="isEditable"
        :on-change="handleContentChange" :on-cancel="handleCancel">
        <!-- Default content if no slot provided -->
        <component v-if="Editor" :is="Editor" :value="entity?.data.content" :onChange="handleContentChange"
          :editable="isEditing && isEditable" @cancel="handleCancel" />
      </slot>
    </div>

    <!-- Menu trigger slot with default implementation - show for all entities -->
    <DropdownMenuRoot :modal="true">
      <DropdownMenuTrigger class="entity-menu-trigger">
        <slot name="menu-trigger">
          <Icon type="ellipsis" />
        </slot>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent class="dropdown-menu-content" :side-offset="5" :align="'end'">
          <!-- Menu items slot with default implementation -->
          <slot name="menu-items" :entity="entity" :on-delete="handleDelete" :on-duplicate="handleDuplicate"
            :on-color-change="handleColorChange" :is-owner="isOwner">
            <!-- Default menu items based on ownership -->
            <template v-if="isOwner">
              <!-- Owner actions: full control -->
              <DropdownMenuItem class="dropdown-menu-item">
                <ColorSelector :value="entity.data.backgroundColor" :onUpdate="handleColorChange" />
              </DropdownMenuItem>
              <DropdownMenuSeparator class="dropdown-menu-separator" />
              <DropdownMenuItem class="dropdown-menu-item emoji-selector-item">
                <EmojiSelector :onEmojiSelect="handleEmojiSelect" />
              </DropdownMenuItem>
              <DropdownMenuSeparator class="dropdown-menu-separator" />
              <DropdownMenuItem class="dropdown-menu-item" @click="handleDuplicate">
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem class="dropdown-menu-item" @click="handleDelete">
                Delete
              </DropdownMenuItem>
            </template>
            <template v-else>
              <!-- Non-owner actions: limited -->
              <DropdownMenuItem class="dropdown-menu-item emoji-selector-item">
                <EmojiSelector :onEmojiSelect="handleEmojiSelect" />
              </DropdownMenuItem>
              <DropdownMenuSeparator class="dropdown-menu-separator" />
              <DropdownMenuItem class="dropdown-menu-item" @click="handleDuplicate">
                Duplicate
              </DropdownMenuItem>
            </template>
          </slot>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
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
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.resizable-container:focus {
  /* outline: 2px solid var(--ui-primary-100); */
  /* outline-offset: 2px; */
}

/* Selection state */
.resizable-container.is-selected {
  /* outline: 2px solid var(--ui-primary-100); */
  /* outline-offset: 2px; */
}

/* Editing state */
.resizable-container.is-editing {
  /* outline: 3px solid var(--ui-primary-100); */
  /* outline-offset: 2px; */
  box-shadow: 0 0 0 4px rgba(var(--ui-primary-100-rgb), 0.2);
}

.resizable-container.read-only {
  opacity: 0.8;
}

.resizable-container.read-only:focus {
  /* outline: 2px solid var(--ui-60); */
  /* outline-offset: 2px; */
}

.resizable-container.read-only.is-selected {
  /* outline: 2px solid var(--ui-60); */
  /* outline-offset: 2px; */
}

.resizable-container.read-only .content-wrapper {
  pointer-events: none;
  user-select: none;
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

/* Menu trigger button styles */
.entity-menu-trigger {
  position: absolute;
  top: var(--size-4);
  right: var(--size-4);
  padding: var(--size-4);
  background: transparent;
  border: none;
  border-radius: var(--ui-radius);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ui-0);
  transition: all 0.2s ease;
  opacity: 0;
  mix-blend-mode: multiply;
}

.resizable-container:hover .entity-menu-trigger,
.resizable-container:focus-within .entity-menu-trigger {
  opacity: 1;
}

.entity-menu-trigger:hover {
  background: var(--ui-90);
  color: var(--ui-0);
}

.entity-menu-trigger[data-state="open"] {
  background: var(--ui-90);
  color: var(--ui-0);
  opacity: 1;
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