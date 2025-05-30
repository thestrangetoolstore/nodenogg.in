<script setup lang="ts">
import { ref } from 'vue'

import { NodeResizer, OnResize } from '../node-resizer'
import type { EntityOfType, EntityUpdate } from '@nodenogg.in/schema';

const props = defineProps<{
  entity: EntityOfType<'html'>;
  Editor?: unknown;
}>()

const emit = defineEmits<{
  resize: [nodeId: string, dimensions: { width: number; height: number }]
}>()

const nodeRef = ref<HTMLElement | null>(null)


// Handle node resize events
const onResize = ({ params }: OnResize) => {
  // Emit resize event with just the dimensions
  emit('resize', props.entity.uuid, {
    width: params.width,
    height: params.height
  })
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    console.log('Enter edit mode for node:', props.entity.uuid)
  }
}
</script>

<template>
  <NodeResizer :min-width="50" :min-height="50" :node-id="entity.uuid" @resize="onResize" />
  <div class="resizable-container" tabindex="0" @keydown="handleKeydown" ref="nodeRef">
    <component v-if="Editor" :is="Editor" :value="entity?.data.content" :onChange="(html) => { }" :editable="false"
      @click="() => { }" @cancel="() => { }" />
    {{ entity.data }}

    <div class="screen-space-element">
      {{ entity.uuid }}
    </div>
  </div>
</template>

<style scoped>
.resizable-container {
  padding: var(--size-8);
  background: var(--ui-80);
  color: var(--ui-0);
  border-radius: var(--ui-radius);
  width: 100%;
  height: 100%;
  position: relative;
  outline: none;
  transition: outline 0.2s ease;
}

.resizable-container:focus {
  outline: 2px solid var(--ui-primary-100);
  outline-offset: 2px;
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