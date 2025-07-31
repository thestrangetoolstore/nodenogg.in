<script setup lang="ts">
import { client, useCurrentMicrocosm } from '@/state'
import CollectNode from './CollectNode.vue'
import { storeToRefs } from 'pinia'
import ViewContainer from '@/components/ViewContainer.vue'
import ActionButton from '@/components/ActionButton.vue'
import EmptyState from '@/components/EmptyState.vue'
import { computed } from 'vue'
import { EntitySchema, type Entity } from '@nodenogg.in/schema'
import { COPY } from '@/constants/copy'

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

const handleEntitySplit = async (entity: Entity, beforeContent: string, afterContent: string) => {
  
  console.log('CollectView handleEntitySplit called:', { 
    entityId: entity.id, 
    beforeContent, 
    afterContent,
    beforeLength: beforeContent.length,
    afterLength: afterContent.length
  })
  
  // Update current entity with content before split
  await update(entity.id, { content: beforeContent })
  
  // Always create new entity (even if blank) and give it focus
  const newEntity = await create({
    type: 'html',
    x: entity.data.x, // Same X position as parent
    y: entity.data.y + entity.data.height + 20, // Position below parent with 20px gap
    width: entity.data.width, // Same width as parent
    height: 200, // Default height
    content: afterContent,
    backgroundColor: entity.data.backgroundColor // Inherit background color
  })
  
  // Give focus to the new entity (create() already sets editingNodeId)
  console.log('New entity created:', newEntity?.id)
}
</script>

<template>
  <ViewContainer>
    <div class="entities">
      <CollectNode v-for="e in htmlEntities" v-bind:key="`entity/${e.id}`" :entity="e" :onChange="u => update(e.id, u)"
        :onDelete="() => deleteEntity(e)" :isEditing="isEditing(e.id)" :onDuplicate="() => handleDuplicateEntity(e)"
        :onSplit="(before, after) => handleEntitySplit(e, before, after)"
        @startEditing="setEditingNode(e.id)" @stopEditing="setEditingNode(null)" />

      <EmptyState v-if="htmlEntities.length === 0" :title="COPY.emptyStates.collect.title"
        :description="COPY.emptyStates.collect.description">
        <template #action>
          <p class="action-message">
            Click <span class="button-style">{{ COPY.emptyStates.collect.actionText }}</span> to create your first node.
          </p>
        </template>
      </EmptyState>
    </div>

    <template #actions>
      <ActionButton icon="new" :label="COPY.buttons.add" @click="handleCreateEntity" />
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
  gap: var(--size-4);
  width: 100%;
  height: 100%;
  padding: var(--size-12);
  top: 0;
  left: 0;
  overflow-y: auto;
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

.action-message {
  color: var(--ui-40);
}
</style>