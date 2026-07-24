<script setup lang="ts">
defineProps<{
  characterCount: number
  maxCharacterCount: number
  showSaved: boolean
}>()
</script>

<template>
  <div class="editor-footer">
    <span class="character-count">{{ characterCount }} / {{ maxCharacterCount }}</span>
    <Transition name="saved-indicator">
      <span class="saved-indicator" v-if="showSaved">
        <svg class="saved-indicator-tick" viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
          <path d="M4 12.5L9.5 18L20 6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
        Saved
      </span>
    </Transition>
  </div>
</template>

<style scoped>
.editor-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--size-12) var(--size-4) var(--size-12);
  pointer-events: none;
  font-size: 0.75em;
  opacity: 0.5;
}

.saved-indicator {
  display: flex;
  align-items: center;
  gap: 3px;
}

.saved-indicator-tick {
  flex-shrink: 0;
}

.saved-indicator-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.saved-indicator-leave-active {
  transition: opacity 0.5s ease;
}

.saved-indicator-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.saved-indicator-leave-to {
  opacity: 0;
}
</style>
