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
</script>

<template>
  <ViewContainer>
    <div class="entities">
      <CollectNode v-for="e in htmlEntities" v-bind:key="`entity/${e.id}`" :entity="e" :onChange="u => update(e.id, u)"
        :onDelete="() => deleteEntity(e)" :isEditing="isEditing(e.id)" :onDuplicate="() => handleDuplicateEntity(e)"
        @startEditing="setEditingNode(e.id)" @stopEditing="setEditingNode(null)" />

      <EmptyState 
        v-if="htmlEntities.length === 0"
        :title="COPY.emptyStates.collect.title"
        :description="COPY.emptyStates.collect.description"
        :action-text="COPY.emptyStates.collect.actionText"
      />
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
  gap: 1em;
  width: 100%;
  height: 100%;
  padding: var(--size-12);
  top: 0;
  left: 0;
  overflow-y: auto;
}

</style>