<script setup lang="ts">
import { client, useCurrentMicrocosm } from '@/state'
import CollectNode from './CollectNode.vue'
import { storeToRefs } from 'pinia'
import ViewContainer from '@/components/ViewContainer.vue'
import ActionButton from '@/components/ActionButton.vue'
import { computed } from 'vue'
import { EntitySchema, type Entity } from '@nodenogg.in/schema'

// Utility function to generate random position offset
const getRandomOffset = () => Math.floor(Math.random() * 1000) - 500 // Range: -500 to 500

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

const identity = client.identity.get()

const { entities } = storeToRefs(microcosm)

const htmlEntities = computed(() => entities.value.filter(e =>
  EntitySchema.utils.isType(e, 'html') && identity?.id === e.identity_id
))

const { setEditingNode, isEditing, update, deleteEntity, create, duplicateEntity } = microcosm

const handleCreateEntity = async () => {
  await create({
    type: 'html',
    x: getRandomOffset(),
    y: getRandomOffset(),
    width: 300,
    height: 200,
    content: ''
  })
}

const handleDuplicateEntity = async (e: Entity) => {
  await duplicateEntity(e)
}

const handleCreateEmoji = async () => {
  await create({
    type: 'emoji',
    x: getRandomOffset(),
    y: getRandomOffset(),
    content: `❤️`
  })
}
</script>

<template>
  <ViewContainer>
    <div class="entities">
      <CollectNode v-for="e in htmlEntities" v-bind:key="`entity/${e.id}`" :entity="e" :onChange="u => update(e.id, u)"
        :onDelete="() => deleteEntity(e)" :isEditing="isEditing(e.id)" :onDuplicate="() => handleDuplicateEntity(e)"
        @startEditing="setEditingNode(e.id)" @stopEditing="setEditingNode(null)" />

      <div v-if="htmlEntities.length === 0" class="empty-state">
        <h2>This is your solo data view</h2>
        <p>This view shows only your nodes. Other users' nodes are not visible here.</p>
        <p>Click <span class="button-style">Add</span> to create your first node.</p>
      </div>
    </div>

    <template #actions>
      <ActionButton icon="new" label="Add" @click="handleCreateEntity" />
    </template>
  </ViewContainer>
</template>

<style scoped>
.entities {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  position: absolute;
  gap: 1em;
  width: 100%;
  height: 100%;
  padding: var(--size-12);
  top: 0;
  left: 0;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-top: 10vh;
  max-width: 400px;
  gap: var(--size-8);
}

.empty-state h2 {
  color: var(--ui-20);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.empty-state p {
  color: var(--ui-40);
  font-size: 1rem;
  margin: 0;
}

.button-style {
  display: inline-flex;
  align-items: center;
  background: var(--ui-100);
  border-radius: var(--size-24);
  box-shadow: var(--ui-shadow-10);
  color: var(--ui-30);
  padding: var(--size-4) var(--size-12);
  white-space: nowrap;
  border: none;
}

@media (prefers-color-scheme: dark) {
  .button-style {
    background: var(--ui-90);
    color: var(--ui-20);
  }
}
</style>