<script setup lang="ts">
import { computed } from 'vue'
import type { EntityOfType } from '@nodenogg.in/schema'

const props = defineProps<{
  entity: EntityOfType<'emoji'>
  isSelected?: boolean
  currentUserIdentityId?: string
  onDelete?: (entity: EntityOfType<'emoji'>) => void
}>()

// Check if current user owns this emoji
const isOwner = computed(() => {
  return props.currentUserIdentityId && props.entity.identity_id === props.currentUserIdentityId
})

// Handler for delete action
const handleDelete = (event: Event) => {
  event.stopPropagation()
  if (props.onDelete && props.entity) {
    props.onDelete(props.entity)
  }
}
</script>

<template>
  <div class="emoji-container">
    <span class="emoji-content">{{ entity.data.content }}</span>
    
    <!-- Delete button - only show for owners on hover -->
    <button 
      v-if="isOwner"
      class="emoji-delete-button"
      @click="handleDelete"
      aria-label="Delete emoji"
      title="Delete emoji"
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
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
  position: relative;
}

.emoji-content {
  line-height: 1;
  background: transparent;
}

/* Delete button */
.emoji-delete-button {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s ease;
  z-index: 10;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.emoji-container:hover .emoji-delete-button {
  opacity: 1;
}

.emoji-delete-button:hover {
  background: #ff4757;
  color: white;
  border-color: #ff4757;
  transform: scale(1.1);
}

.emoji-delete-button:active {
  transform: scale(0.95);
}

@media (prefers-color-scheme: dark) {
  .emoji-delete-button {
    background: rgba(40, 40, 40, 0.9);
    border-color: rgba(255, 255, 255, 0.2);
    color: #ccc;
  }
  
  .emoji-delete-button:hover {
    background: #ff4757;
    color: white;
    border-color: #ff4757;
  }
}
</style>