<script setup lang="ts">
import Icon from '@/components/icon/Icon.vue'

defineProps<{
  icon?: string
  label?: string
  disabled?: boolean
}>()

defineEmits<{
  click: []
}>()
</script>

<template>
  <button class="action-button" :class="{ disabled }" :disabled="disabled" @click="$emit('click')">
    <Icon v-if="icon" :type="icon" class="action-icon" />
    <span v-if="label" class="action-label">{{ label }}</span>
  </button>
</template>

<style scoped>
.action-button {
  display: flex;
  align-items: center;
  gap: var(--size-4);
  background: var(--ui-0);
  border-radius: var(--size-24);
  box-shadow: var(--ui-shadow-10);
  color: var(--ui-90);
  padding-left: var(--size-8);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  outline: none;
}

.action-button:hover:not(.disabled) {
  background: var(--ui-primary-100);
  color: var(--ui-100);
}

.action-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-icon {
  width: var(--size-32);
  height: var(--size-32);
}

.action-label {
  padding: var(--size-8) var(--size-12) var(--size-8) 0;
  white-space: nowrap;
}

@media (prefers-color-scheme: dark) {
  .action-button {
    background: var(--ui-10);
    color: var(--ui-90);
  }
}
</style>