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
import { findNonOverlappingPosition } from '@/utils/node-positioning'

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
  // Use a preferred position around origin with some variance
  const preferredPosition = {
    x: Math.floor(Math.random() * 400) - 200, // Range: -200 to 200
    y: Math.floor(Math.random() * 400) - 200  // Range: -200 to 200
  }

  const dimensions = { width: 300, height: 200 }
  const position = findNonOverlappingPosition(preferredPosition, dimensions, entities.value, {
    searchRadius: 500,
    gridSize: 30
  })

  await create({
    type: 'html',
    x: position.x,
    y: position.y,
    width: dimensions.width,
    height: dimensions.height,
    content: ''
  })
}

const handleDuplicateEntity = async (e: Entity) => {
  if (EntitySchema.utils.isType(e, 'html')) {
    const htmlData = e.data as Extract<Entity['data'], { type: 'html' }>

    // Try to place the duplicate near the original with some offset
    const preferredPosition = {
      x: htmlData.x + 50, // Offset by 50 pixels
      y: htmlData.y + 50
    }

    const dimensions = {
      width: htmlData.width || 300,
      height: htmlData.height || 200
    }

    const position = findNonOverlappingPosition(preferredPosition, dimensions, entities.value, {
      searchRadius: 400,
      gridSize: 30
    })

    await create({
      ...htmlData,
      x: position.x,
      y: position.y
    })
  } else {
    // For non-HTML entities, use the original duplicate function
    await duplicateEntity(e)
  }
}

const handleCreateEmoji = async () => {
  // Use a preferred position around origin with some variance
  const preferredPosition = {
    x: Math.floor(Math.random() * 400) - 200, // Range: -200 to 200
    y: Math.floor(Math.random() * 400) - 200  // Range: -200 to 200
  }

  const dimensions = { width: 50, height: 50 }
  const position = findNonOverlappingPosition(preferredPosition, dimensions, entities.value, {
    searchRadius: 500,
    gridSize: 20
  })

  await create({
    type: 'emoji',
    x: position.x,
    y: position.y,
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
  gap: 1em;
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