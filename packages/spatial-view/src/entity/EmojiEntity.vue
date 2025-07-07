<script setup lang="ts">
import type { EntityOfType } from '@nodenogg.in/schema'

defineProps<{
  entity: EntityOfType<'emoji'>
  isSelected?: boolean
}>()
</script>

<template>
  <div class="emoji-container">
    <span class="emoji-content">{{ entity.data.content }}</span>
  </div>
</template>

<style scoped>
.emoji-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  user-select: none;
  cursor: move;
  background: transparent;
  border: none;
  outline: none;
}

.emoji-content {
  line-height: 1;
  background: transparent;
}
</style>