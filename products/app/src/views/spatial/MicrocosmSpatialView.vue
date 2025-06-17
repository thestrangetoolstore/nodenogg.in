<script setup lang="ts">
import { computed } from 'vue'
import { SpatialView, HTMLEntity } from '@nodenogg.in/spatial-view'
import { useCurrentMicrocosm } from '@/state'
import { EntitySchema } from '@nodenogg.in/schema'
import Editor from '@/components/editor/Editor.vue'
import type { NodeChange } from '@vue-flow/core'

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
const { entities, update } = microcosm

// Compute positioned nodes for the spatial view
const positionedNodes = computed(() => {
  return entities.filter(e => EntitySchema.utils.isType(e, 'html')).map((entity) => {
    const { width, height, x, y } = entity.data
    return {
      id: entity.uuid,
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
    }
  })
})

// Handle node changes from the spatial view
const handleNodeChange = async (changes: NodeChange[]) => {
  // Process position and dimension changes
  for (const change of changes) {
    const { id } = change
    // Handle position changes
    if (change.type === 'position' && change.position) {
      await update(id, change.position)
    }

    // Handle dimension changes
    if (change.type === 'dimensions' && change.dimensions) {

      await update(id, change.dimensions)
    }
  }
}
</script>

<template>
  <SpatialView :view_id="view_id" :ui="ui" :nodes="positionedNodes" @nodes-change="handleNodeChange">
    <template #node-resizable="resizableNodeProps">
      <HTMLEntity :entity="resizableNodeProps.data" :Editor="Editor" :onUpdate="update" />
    </template>
  </SpatialView>
</template>
