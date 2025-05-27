<script setup lang="ts">
import { ResizableNode } from '@nodenogg.in/spatial-view'
import type { Entity } from '@nodenogg.in/schema'
import Editor from '@/components/editor/Editor.vue'
import { NodeResizer } from '@/components/node-resizer'

const { entity } = defineProps<{
  entity: Entity
}>()
</script>

<template>
  <ResizableNode 
    :entity="entity" 
    :NodeResizer="NodeResizer"
    :Editor="Editor"
  />
</template>

