<script setup lang="ts">
import { client, useCurrentMicrocosm } from '@/state'
import SimpleNode from './CollectNode.vue'
import { storeToRefs } from 'pinia'
import ViewContainer from '@/components/ViewContainer.vue'
import ActionButton from '@/components/ActionButton.vue'
import { computed } from 'vue'
import { EntitySchema } from '@nodenogg.in/schema'

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

const { setEditingNode, isEditing, update, deleteEntity, create } = microcosm

const handleCreateEntity = async () => {
  await create({
    type: 'html',
    x: 0,
    y: 0,
    width: 300,
    height: 200,
    content: ''
  })
}

const handleCreateEmoji = async () => {
  await create({ type: 'emoji', x: 0, y: 0, content: `❤️` })
}
</script>

<template>
  <ViewContainer>
    <div class="entities">
      <SimpleNode v-for="e in htmlEntities" v-bind:key="`entity/${e.id}`" :entity="e"
        :onChange="content => update(e.id, { content })" :onDelete="() => deleteEntity(e)" :isEditing="isEditing(e.id)"
        @startEditing="setEditingNode(e.id)" @stopEditing="setEditingNode(null)" />
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
</style>