<script setup lang="ts">
import { computed } from 'vue'
import { SpatialView, HTMLEntity } from '@nodenogg.in/spatial-view'
import { useCurrentMicrocosm } from '@/state'
import { EntitySchema } from '@nodenogg.in/schema'
import Editor from '@/components/editor/Editor.vue'
import type { NodeChange } from '@vue-flow/core'
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
const { update } = microcosm

const { entities } = storeToRefs(microcosm)

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
      type: 'resizable',
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
      }
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
</script>

<template>
  <ViewContainer>
    <SpatialView :view_id="view_id" :ui="ui" :nodes="positionedNodes" @nodes-change="handleNodeChange">
      <template #node-resizable="resizableNodeProps">
        <HTMLEntity :entity="resizableNodeProps.data" :Editor="Editor" :onUpdate="update"
          :is-selected="resizableNodeProps.isSelected" />
      </template>
    </SpatialView>
  </ViewContainer>
</template>
