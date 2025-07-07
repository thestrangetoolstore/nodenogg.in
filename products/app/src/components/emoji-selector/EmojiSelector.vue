<script setup lang="ts">
import { emojis } from '@/utils/emojis'
import { type PropType } from 'vue'

const props = defineProps({
  onEmojiSelect: {
    type: Function as PropType<(emoji: string) => void>,
    required: true
  }
})

const handleEmojiClick = (emoji: string) => {
  props.onEmojiSelect(emoji)
}
</script>

<template>
  <div class="emoji-selector">
    <button
      v-for="emoji in emojis"
      :key="emoji"
      class="emoji-button"
      @click="handleEmojiClick(emoji)"
      :aria-label="`Add ${emoji} emoji`"
    >
      {{ emoji }}
    </button>
  </div>
</template>

<style scoped>
.emoji-selector {
  display: flex;
  flex-wrap: wrap;
  gap: var(--size-4);
  padding: var(--size-4);
  width: 100%;
  max-width: 200px;
}

.emoji-button {
  all: unset;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--size-32);
  height: var(--size-32);
  border-radius: var(--ui-radius);
  font-size: 1.2rem;
  transition: all 0.2s ease;
  background: transparent;
}

.emoji-button:hover {
  background: var(--ui-90);
  transform: scale(1.1);
}

.emoji-button:active {
  transform: scale(0.95);
}

@media (prefers-color-scheme: dark) {
  .emoji-button:hover {
    background: var(--ui-80);
  }
}
</style>