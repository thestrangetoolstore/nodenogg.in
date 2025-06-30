<script setup lang="ts">
import { ref, computed } from 'vue'

import { NodeResizer } from '../node-resizer'
import type { EntityOfType } from '@nodenogg.in/schema';

const props = defineProps<{
  entity: EntityOfType<'html'>;
  Editor?: any; // TODO: Type this properly when Editor component types are available
  onUpdate?: (uuid: string, data: any) => void;
}>()

const isEditing = ref(false)

// Handler for content changes
const handleContentChange = (html: string) => {
  if (props.onUpdate && props.entity) {
    props.onUpdate(props.entity.uuid, { content: html })
  }
}

// Handler for when editing is cancelled
const handleCancel = () => {
  isEditing.value = false
}

// Handler for clicking on the content
const handleClick = () => {
  if (!isEditing.value) {
    isEditing.value = true
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if ((event.key === 'Enter' || event.key === ' ') && !isEditing.value) {
    event.preventDefault()
    isEditing.value = true
  }
}
</script>

<template>
  <NodeResizer :min-width="50" :min-height="50" :node-id="entity.uuid" />
  <div class="resizable-container" tabindex="0" @keydown="handleKeydown">
    <div class="content-wrapper">
      <component v-if="Editor" :is="Editor" :value="entity?.data.content" :onChange="handleContentChange"
        :editable="isEditing" @click="handleClick" @cancel="handleCancel" />
    </div>

    <div class="screen-space-element">
      {{ entity.uuid }}
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

/* This element will maintain a consistent size regardless of zoom level */
.screen-space-element {
  position: absolute;
  bottom: 10px;
  right: 10px;
  padding: 5px 10px;
  background-color: var(--ui-primary-100);
  color: white;
  border-radius: 4px;
  font-size: 12px;

  /* The key part: scale inversely to the zoom level to maintain size */
  transform: scale(calc(1 / var(--zoom-value)));
  transform-origin: bottom right;
}
</style>