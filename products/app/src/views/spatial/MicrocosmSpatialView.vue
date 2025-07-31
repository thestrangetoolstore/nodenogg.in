<script setup lang="ts">
import { computed, ref, inject } from 'vue'
import { SpatialView, EmojiEntity } from '@nodenogg.in/spatial-view'
import HTMLEntity from '@/components/entity/HTMLEntity.vue'
import { useCurrentMicrocosm } from '@/state'
import { EntitySchema, type Entity } from '@nodenogg.in/schema'
import { client } from '@/state/app'
import Editor from '@/components/editor/Editor.vue'
import type { NodeChange } from '@vue-flow/core'
import { useVueFlow } from '@vue-flow/core'
import { storeToRefs } from 'pinia'
import ViewContainer from '@/components/ViewContainer.vue'
import ActionButton from '@/components/ActionButton.vue'
import Icon from '@/components/icon/Icon.vue'
import ZoomControls from './components/ZoomControls.vue'
import {
  ContextMenuContent,
  // ContextMenuItem,
  ContextMenuPortal,
  ContextMenuRoot,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from 'reka-ui'
import ContextMenuItem from '@/components/context-menu/ContextMenuItem.vue'
import { COPY } from '@/constants/copy'

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
const { update, create, deleteEntity } = microcosm

const { entities } = storeToRefs(microcosm)

// Get current user identity
const currentIdentity = client.identity.get()

// Helper function to check if entity is owned by current user
const isOwnedByCurrentUser = (entity: Entity) => {
  return currentIdentity && entity.identity_id === currentIdentity.id
}

// Access vue-flow instance for coordinate transformation and interaction control
const { screenToFlowCoordinate, panOnDrag, zoomOnScroll, zoomOnPinch, project, dimensions, setCenter, viewport } = useVueFlow()

// Compute positioned nodes for the spatial view
const positionedNodes = computed(() => {
  return entities.value.filter(e =>
    EntitySchema.utils.isType(e, 'html') || EntitySchema.utils.isType(e, 'emoji')
  ).map((entity) => {
    const { x, y } = entity.data

    const isEmoji = EntitySchema.utils.isType(entity, 'emoji')
    const width = isEmoji ? 50 : entity.data.width
    const height = isEmoji ? 50 : entity.data.height

    return {
      id: entity.id,
      type: isEmoji ? 'emoji' : 'resizable', // Use different types for emoji vs HTML
      data: entity,
      position: {
        x,
        y
      },
      dimensions: {
        width,
        height
      },
      style: {
        width: `${width}px`,
        height: `${height}px`
      },
      // Add property to indicate if entity is editable for the resizer
      draggable: isOwnedByCurrentUser(entity),
      selectable: true, // All entities can be selected
      deletable: isOwnedByCurrentUser(entity)
    }
  })
})

// Handle node changes from the spatial view
const handleNodeChange = async (changes: NodeChange[]) => {
  // Process position and dimension changes
  for (const change of changes) {
    if (!('id' in change))
      return
    if (change.type === 'position' && change.position) {
      await update(change.id, change.position)
    }

    // Handle dimension changes
    if (change.type === 'dimensions' && change.dimensions && change.resizing) {
      await update(change.id, change.dimensions)
    }
  }
}

// Context menu state
const contextMenuOpen = ref(false)
const contextMenuTarget = ref<Entity | null>(null)
const contextMenuPosition = ref({ x: 0, y: 0 })

// Store original interaction settings
const originalInteractions = ref({
  panOnDrag: true,
  zoomOnScroll: true,
  zoomOnPinch: true
})

// Handle context menu open state changes
const handleContextMenuOpenChange = (open: boolean) => {
  contextMenuOpen.value = open

  if (open) {
    // Store current interaction settings and disable them
    originalInteractions.value = {
      panOnDrag: panOnDrag.value,
      zoomOnScroll: zoomOnScroll.value,
      zoomOnPinch: zoomOnPinch.value
    }

    // Disable interactions while context menu is open
    panOnDrag.value = false
    zoomOnScroll.value = false
    zoomOnPinch.value = false
  } else {
    // Restore original interaction settings when menu closes
    panOnDrag.value = originalInteractions.value.panOnDrag
    zoomOnScroll.value = originalInteractions.value.zoomOnScroll
    zoomOnPinch.value = originalInteractions.value.zoomOnPinch

    // Reset target
    contextMenuTarget.value = null
  }
}

// Handle right-click to determine context
const handleContextMenuTrigger = (event: MouseEvent) => {
  // Get the target element
  const target = event.target as HTMLElement

  // Try to find if we're clicking on a node
  const nodeElement = target.closest('.vue-flow__node')
  let targetEntity: Entity | null = null

  if (nodeElement) {
    const nodeId = nodeElement.getAttribute('data-id')
    if (nodeId) {
      targetEntity = entities.value.find(e => e.id === nodeId) || null
    }
  }

  // Convert screen coordinates to flow coordinates and store
  const flowPosition = screenToFlowCoordinate({
    x: event.clientX,
    y: event.clientY
  })

  contextMenuTarget.value = targetEntity
  contextMenuPosition.value = flowPosition
}

// Context menu actions
const handleAddReactionToEntity = (entity: Entity) => {
  if (EntitySchema.utils.isType(entity, 'html')) {
    // Generate random position around the entity
    const entityWidth = entity.data.width || 200
    const entityHeight = entity.data.height || 200
    const entityCenterX = entity.data.x + entityWidth / 2
    const entityCenterY = entity.data.y + entityHeight / 2

    // Random angle around the entity (0 to 2π)
    const angle = Math.random() * 2 * Math.PI

    // Random distance from edge of entity (50-100 pixels outside)
    const minDistance = Math.max(entityWidth, entityHeight) / 2 + 50
    const maxDistance = Math.max(entityWidth, entityHeight) / 2 + 100
    const distance = minDistance + Math.random() * (maxDistance - minDistance)

    // Calculate position using polar coordinates
    const emojiX = entityCenterX + Math.cos(angle) * distance - 25 // -25 to center the 50px emoji
    const emojiY = entityCenterY + Math.sin(angle) * distance - 25

    create({
      type: 'emoji',
      content: '❤️',
      x: emojiX,
      y: emojiY
    })
  }
}

const handleDeleteEntity = (entity: Entity) => {
  deleteEntity(entity)
}

const handleCreateNodeAtPosition = () => {
  create({
    type: 'html',
    x: contextMenuPosition.value.x - 100, // Center the node
    y: contextMenuPosition.value.y - 100,
    width: 200,
    height: 200,
    content: ''
  })
}

const handleCreateEmojiAtPosition = () =>
  create({ type: 'emoji', content: '❤️', x: contextMenuPosition.value.x, y: contextMenuPosition.value.y })


// Action handlers for spatial view
const handleCreateNode = async () => {
  // Get the viewport dimensions
  const viewportDimensions = dimensions.value

  // Calculate the center of the viewport in screen coordinates
  const centerScreenX = viewportDimensions.width / 2
  const centerScreenY = viewportDimensions.height / 2

  // Convert screen coordinates to flow coordinates using project
  const flowPosition = project({
    x: centerScreenX,
    y: centerScreenY
  })

  // Create node at viewport center
  await create({
    type: 'html',
    x: flowPosition.x - 100, // Subtract half the width to center the node
    y: flowPosition.y - 100, // Subtract half the height to center the node
    width: 200,
    height: 200,
    content: ''
  })
}

// Handler for emoji creation from HTMLEntity dropdown
const handleEmojiCreateFromEntity = (emoji: string, entity: Entity) => {
  if (EntitySchema.utils.isType(entity, 'html')) {
    // Generate random position around the entity
    const entityWidth = entity.data.width || 200
    const entityHeight = entity.data.height || 200
    const entityCenterX = entity.data.x + entityWidth / 2
    const entityCenterY = entity.data.y + entityHeight / 2

    // Random angle around the entity (0 to 2π)
    const angle = Math.random() * 2 * Math.PI

    // Random distance from edge of entity (50-100 pixels outside)
    const minDistance = Math.max(entityWidth, entityHeight) / 2 + 50
    const maxDistance = Math.max(entityWidth, entityHeight) / 2 + 100
    const distance = minDistance + Math.random() * (maxDistance - minDistance)

    // Calculate position using polar coordinates
    const emojiX = entityCenterX + Math.cos(angle) * distance - 25 // -25 to center the 50px emoji
    const emojiY = entityCenterY + Math.sin(angle) * distance - 25

    create({
      type: 'emoji',
      content: emoji,
      x: emojiX,
      y: emojiY
    })
  }
}

// Store reference to the currently editing entity for split handler
const currentEditingEntity = ref<Entity | null>(null)

const handleEntitySplit = async (beforeContent: string, afterContent: string) => {
  const entity = currentEditingEntity.value
  if (!entity || !EntitySchema.utils.isType(entity, 'html')) {
    console.log('No current editing entity for split:', { entity: currentEditingEntity.value })
    return
  }

  console.log('SpatialView handleEntitySplit called:', {
    entityId: entity.id,
    beforeContent,
    afterContent,
    originalPosition: { x: entity.data.x, y: entity.data.y, width: entity.data.width, height: entity.data.height }
  })

  // Update current entity with content before split
  await update(entity.id, { content: beforeContent })

  // Create new entity positioned directly underneath with 16px padding
  const newEntity = await create({
    type: 'html',
    x: entity.data.x, // Same X position as parent
    y: entity.data.y + entity.data.height + 16, // Position below parent with 16px gap
    width: entity.data.width, // Same width as parent
    height: entity.data.height, // Same height as parent
    content: afterContent,
    backgroundColor: entity.data.backgroundColor // Inherit background color
  })

  console.log('New spatial entity created:', newEntity?.id)

  if (newEntity?.id) {
    // Focus the new entity for editing
    handleStartEditing(newEntity.id)

    // Center the canvas on the new entity with a slight delay to ensure it's rendered
    setTimeout(() => {
      const centerX = entity.data.x + entity.data.width / 2
      const centerY = entity.data.y + entity.data.height + 16 + entity.data.height / 2
      const currentZoom = viewport.value.zoom
      setCenter(centerX, centerY, { duration: 300, zoom: currentZoom })
      console.log('Centering view on new entity:', { centerX, centerY, zoom: currentZoom })
    }, 100)
  }
}

const handleStartEditing = (entityId: string) => {
  const entity = entities.value.find(e => e.id === entityId)
  currentEditingEntity.value = entity || null
  console.log('SpatialView handleStartEditing:', { entityId, entity: currentEditingEntity.value })
}

const handleStopEditing = () => {
  currentEditingEntity.value = null
}

</script>

<template>
  <ViewContainer>
    <div class="spatial-canvas">
      <SpatialView :view_id="view_id" :ui="ui" :nodes="positionedNodes" :HTMLEntity="HTMLEntity" :Editor="Editor"
        :onUpdate="update" :onDelete="deleteEntity" :onDuplicate="create" :editable="true"
        :current-user-identity-id="currentIdentity?.id" :zoom-controls="true" :zoom-controls-copy="COPY.zoomControls"
        :on-emoji-create="handleEmojiCreateFromEntity" :on-start-editing="handleStartEditing"
        :on-stop-editing="handleStopEditing" :on-split="handleEntitySplit" @nodes-change="handleNodeChange">
        <template #node-resizable="resizableNodeProps">
          <!-- HTML entities with resizable handles will now use the app's HTMLEntity -->
        </template>

        <template #node-emoji="emojiNodeProps">
          <!-- Emoji entities without resizable handles -->
          <EmojiEntity :entity="emojiNodeProps.data" :is-selected="emojiNodeProps.isSelected"
            :current-user-identity-id="currentIdentity?.id" :on-delete="deleteEntity" />
        </template>
      </SpatialView>

      <!-- Enhanced Zoom Controls -->
      <!-- <ZoomControls /> -->
    </div>
    <template #actions>
      <ActionButton icon="new" label="Add" @click="handleCreateNode" />
    </template>
  </ViewContainer>
</template>

<style scoped>
.spatial-canvas {
  width: 100%;
  height: 100%;
  position: relative;
}

/* Context Menu Styles */
:deep(.context-menu-content) {
  min-width: 160px;
  background: var(--ui-95);
  border: 1px solid var(--ui-80);
  border-radius: calc(var(--ui-radius));
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: var(--size-4);
  z-index: 1000;
}

@media (prefers-color-scheme: dark) {
  :deep(.context-menu-content) {
    background: var(--ui-90);
    border-color: var(--ui-70);
  }
}

/* :deep(.context-menu-item) {
  display: flex;
  align-items: center;
  gap: var(--size-8);
  padding: var(--size-6) var(--size-8);
  border-radius: calc(var(--ui-radius) - 2px);
  cursor: pointer;
  color: var(--ui-20);
  font-size: 0.875rem;
  transition: background-color 0.2s ease;
  outline: none;
  user-select: none;
}

:deep(.context-menu-item:hover),
:deep(.context-menu-item[data-highlighted]) {
  background: var(--ui-80);
}

:deep(.context-menu-item.destructive) {
  color: var(--ui-red);
}

:deep(.context-menu-item.destructive:hover),
:deep(.context-menu-item.destructive[data-highlighted]) {
  background: var(--ui-red);
  color: var(--ui-100);
}

:deep(.context-menu-icon) {
  width: var(--size-16);
  height: var(--size-16);
  flex-shrink: 0;
}

:deep(.context-menu-separator) {
  height: 1px;
  background: var(--ui-80);
  margin: var(--size-4) 0;
} */
</style>
