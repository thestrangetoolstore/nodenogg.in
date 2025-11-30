<script setup lang="ts">
import { client, useCurrentMicrocosm } from '@/state'
import StackNode from './StackNode.vue'
import { storeToRefs } from 'pinia'
import ViewContainer from '@/components/ViewContainer.vue'
import ActionButton from '@/components/ActionButton.vue'
import EmptyState from '@/components/EmptyState.vue'
import { computed, nextTick } from 'vue'
import { EntitySchema, type Entity, type EntityOfType } from '@nodenogg.in/schema'
import { getTags, getAllTags } from '@nodenogg.in/core'
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

// Get all HTML entities from all users
const htmlEntities = computed(() => entities.value.filter(e =>
  EntitySchema.utils.isType(e, 'html')
) as EntityOfType<'html'>[])

const { setEditingNode, isEditing, update, deleteEntity, create, duplicateEntity } = microcosm

// Get all unique tags from all entities
const allTags = computed(() => {
  return getAllTags(htmlEntities.value).sort()
})

// Group entities by their tags - an entity can appear in multiple columns
const entitiesByTag = computed(() => {
  const grouped = new Map<string, EntityOfType<'html'>[]>()

  // Initialize with all tags
  allTags.value.forEach(tag => {
    grouped.set(tag, [])
  })

  // Add entities to their tag columns
  htmlEntities.value.forEach(entity => {
    const entityTags = getTags(entity)

    if (entityTags.length === 0) {
      // Untagged entities go to a special "untagged" column
      if (!grouped.has('untagged')) {
        grouped.set('untagged', [])
      }
      grouped.get('untagged')!.push(entity)
    } else {
      // Add entity to each of its tag columns
      entityTags.forEach(tag => {
        if (!grouped.has(tag)) {
          grouped.set(tag, [])
        }
        grouped.get(tag)!.push(entity)
      })
    }
  })

  // Move untagged to the end if it exists
  if (grouped.has('untagged')) {
    const untagged = grouped.get('untagged')!
    grouped.delete('untagged')
    grouped.set('untagged', untagged)
  }

  return grouped
})

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

  const newEntity = await create({
    type: 'html',
    x: position.x,
    y: position.y,
    width: dimensions.width,
    height: dimensions.height,
    content: ''
  })

  // Scroll to and focus the newly created node
  if (newEntity) {
    await nextTick()
    // Wait for the DOM to fully update and editor to initialize
    setTimeout(() => {
      const nodeElement = document.querySelector(`[data-entity-id="${newEntity.id}"]`)
      if (nodeElement) {
        nodeElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Find and focus the editor within the node
        const editorElement = nodeElement.querySelector('.tiptap') as HTMLElement
        if (editorElement) {
          editorElement.focus()
        }
      }
    }, 100)
  }
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
</script>

<template>
  <ViewContainer>
    <div class="stack-view">
      <!-- Columns for each tag -->
      <div v-if="entitiesByTag.size > 0" class="columns-container">
        <div v-for="[tag, tagEntities] in entitiesByTag" :key="tag" class="tag-column">
          <div class="column-header">
            <h3 class="tag-name">{{ tag }}</h3>
            <span class="tag-count">{{ tagEntities.length }}</span>
          </div>
          <div class="column-content">
            <StackNode
              v-for="e in tagEntities"
              :key="`${tag}/${e.id}`"
              :entity="e"
              :onChange="u => update(e.id, u)"
              :onDelete="() => deleteEntity(e)"
              :isEditing="isEditing(e.id)"
              :onDuplicate="() => handleDuplicateEntity(e)"
              @startEditing="setEditingNode(e.id)"
              @stopEditing="setEditingNode(null)"
            />
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <EmptyState v-else :title="COPY.emptyStates.stack.title"
        :description="COPY.emptyStates.stack.description">
        <template #action>
          <p class="action-message">
            Click <span class="button-style">{{ COPY.emptyStates.stack.actionText }}</span> to create your first node.
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
.stack-view {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  overflow-x: auto;
  overflow-y: hidden;
}

.columns-container {
  display: flex;
  gap: var(--size-16);
  padding: var(--size-12);
  height: 100%;
  min-width: min-content;
}

.tag-column {
  flex: 0 0 320px;
  min-width: 320px;
  max-width: 320px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.02);
  border-radius: var(--ui-radius);
  padding: var(--size-8);
}

@media (prefers-color-scheme: dark) {
  .tag-column {
    background: rgba(255, 255, 255, 0.03);
  }
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--size-8) var(--size-12);
  margin-bottom: var(--size-8);
  background: rgba(0, 0, 0, 0.05);
  border-radius: var(--ui-radius);
}

@media (prefers-color-scheme: dark) {
  .column-header {
    background: rgba(255, 255, 255, 0.05);
  }
}

.tag-name {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: capitalize;
  color: var(--ui-20);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-count {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--ui-50);
  background: rgba(0, 0, 0, 0.1);
  padding: var(--size-2) var(--size-6);
  border-radius: var(--size-12);
  min-width: var(--size-20);
  text-align: center;
}

@media (prefers-color-scheme: dark) {
  .tag-count {
    background: rgba(255, 255, 255, 0.1);
  }
}

.column-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--size-4);
}

/* Scrollbar styling for columns */
.column-content::-webkit-scrollbar {
  width: 6px;
}

.column-content::-webkit-scrollbar-track {
  background: transparent;
}

.column-content::-webkit-scrollbar-thumb {
  background: var(--ui-70);
  border-radius: 3px;
}

.column-content::-webkit-scrollbar-thumb:hover {
  background: var(--ui-60);
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
