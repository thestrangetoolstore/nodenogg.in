<script setup lang="ts">
import { ContextMenuItem } from 'reka-ui'

defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  command: {
    type: String
  },
  disabled: {
    type: Boolean
  }
})

defineEmits<{
  (e: 'click', id: string): void
}>()
</script>

<template>
  <ContextMenuItem v-bind="$attrs" :value="value" class="context-menu-item" :disabled="disabled"
    @click="$emit('click', value)">
    {{ title }}
    <div v-if="command" class="right-slot">
      <span>
        {{ command }}
      </span>
    </div>
  </ContextMenuItem>
</template>

<style>
.context-menu-item {
  border-radius: var(--ui-radius);
  display: flex;
  align-items: center;
  padding: var(--size-8);
  position: relative;
  user-select: none;
  outline: none;
  border-radius: var(--ui-radius);
  color: var(--ui-0);
  cursor: pointer;
}

@media (prefers-color-scheme: dark) {
  .context-menu-item {
    /* background-color: var(--ui-90); */
  }
}

.context-menu-item[data-disabled] {
  color: var(--ui-50);
  cursor: not-allowed;
}

.context-menu-item[data-highlighted] {
  background: var(--ui-90);
  color: var(--ui-0);
}

@media (prefers-color-scheme: dark) {
  .context-menu-item[data-highlighted] {
    background: var(--ui-80);
  }
}

.right-slot {
  margin-left: auto;
  padding-left: 20px;
  font-size: 0.8em;
  opacity: 0.75;
}

[data-highlighted]>.right-slot {
  color: currentColor;
}
</style>
