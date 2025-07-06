<script setup lang="ts">
import { provide, ref, computed } from 'vue'
import { type Entity } from '@nodenogg.in/schema'
import { useCurrentMicrocosm } from '@/state'
import SimpleNode from './CollectNode.vue'
import { storeToRefs } from 'pinia'
import ViewContainer from '@/components/ViewContainer.vue'

defineProps({
  view_id: {
    type: String,
    required: true
  },
  ui: {
    type: Boolean
  }
})

// Use the unified entity operations API
const microcosm = useCurrentMicrocosm()

const { entities } = storeToRefs(microcosm)
const { setEditingNode, isEditing, update, deleteEntity, create, createEmoji } = microcosm

const handleCreateEntity = async () => {
  await create()
}

const handleCreateEmoji = async () => {
  await createEmoji(`❤️`, 0, 0)
}

// Reactive reference to track the container element
const containerRef = ref<HTMLElement | null>(null)
</script>

<template>
  <ViewContainer background>

    <div class="actions">
      <button @click="handleCreateEntity" class="button">New node</button>
      <button @click="handleCreateEmoji" class="button">React</button>
    </div>
    <div class="nodes">
      <SimpleNode v-for="e in entities" v-bind:key="`node/${e.id}`" :entity="e"
        :onChange="content => update(e.id, { content })" :onDelete="() => deleteEntity(e)" :isEditing="isEditing(e.id)"
        @startEditing="setEditingNode(e.id)" @stopEditing="setEditingNode(null)" />
    </div>
  </ViewContainer>
</template>

<style scoped>
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

.actions {
  padding: var(--size-12);
  gap: var(--size-4);
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

.nodes {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  position: absolute;
  gap: 1em;
  width: 100%;
  height: 100%;
  padding: var(--size-56) var(--size-12) var(--size-12) var(--size-12);
  top: 0;
  left: 0;
  overflow-y: auto;
}
</style>