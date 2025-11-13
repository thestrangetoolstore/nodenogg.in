<script setup lang="ts">
import { ref, computed } from 'vue'
import type { EntityOfType } from '@nodenogg.in/schema'
import {
  getTags,
  addTag,
  removeTag,
  normalizeTag,
  isValidTag,
  MAX_TAGS_PER_ENTITY
} from '@nodenogg.in/core'
import Icon from '@/components/icon/Icon.vue'

const props = defineProps<{
  entity: EntityOfType<'html'>
  onUpdate: (id: string, data: any) => void
  disabled?: boolean
}>()

const tags = computed(() => getTags(props.entity))

const inputValue = ref('')
const isAddingTag = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

const canAddMoreTags = computed(() => tags.value.length < MAX_TAGS_PER_ENTITY)

const handleAddTag = () => {
  if (!inputValue.value.trim() || !canAddMoreTags.value) {
    return
  }

  const normalized = normalizeTag(inputValue.value)

  if (!isValidTag(normalized)) {
    return
  }

  const newTags = addTag(props.entity, normalized)

  if (newTags && props.onUpdate) {
    props.onUpdate(props.entity.id, { tags: newTags })
    inputValue.value = ''
    isAddingTag.value = false
  }
}

const handleRemoveTag = (tag: string) => {
  if (props.disabled) {
    return
  }

  const newTags = removeTag(props.entity, tag)

  if (newTags !== undefined && props.onUpdate) {
    props.onUpdate(props.entity.id, { tags: newTags })
  }
}

const startAddingTag = () => {
  if (!props.disabled && canAddMoreTags.value) {
    isAddingTag.value = true
    setTimeout(() => {
      inputRef.value?.focus()
    }, 0)
  }
}

const cancelAddingTag = () => {
  isAddingTag.value = false
  inputValue.value = ''
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    handleAddTag()
  } else if (event.key === 'Escape') {
    event.preventDefault()
    cancelAddingTag()
  }
}

const handleInputBlur = () => {
  // Small delay to allow click events to fire first
  setTimeout(() => {
    if (inputValue.value.trim()) {
      handleAddTag()
    } else {
      cancelAddingTag()
    }
  }, 100)
}
</script>

<template>
  <div class="tag-input-container" @click.stop>
    <div class="tags-list">
      <!-- Existing tags -->
      <button
        v-for="tag in tags"
        :key="tag"
        class="tag-badge"
        :disabled="disabled"
        @click="handleRemoveTag(tag)"
        :title="disabled ? tag : `Remove '${tag}'`"
      >
        <span class="tag-text">{{ tag }}</span>
        <Icon v-if="!disabled" type="x" class="tag-remove-icon" />
      </button>

      <!-- Add tag input -->
      <input
        v-if="isAddingTag"
        ref="inputRef"
        v-model="inputValue"
        type="text"
        class="tag-input"
        placeholder="tag name..."
        maxlength="30"
        @keydown="handleKeydown"
        @blur="handleInputBlur"
        @click.stop
      />

      <!-- Add tag button -->
      <button
        v-if="!isAddingTag && canAddMoreTags && !disabled"
        class="add-tag-button"
        @click.stop="startAddingTag"
        title="Add tag"
      >
        <Icon type="plus" class="add-icon" />
        <span class="add-label">Add tag</span>
      </button>

      <!-- Max tags message -->
      <span v-if="!canAddMoreTags && !disabled" class="max-tags-message">
        Max {{ MAX_TAGS_PER_ENTITY }} tags
      </span>
    </div>
  </div>
</template>

<style scoped>
.tag-input-container {
  padding: var(--size-8);
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--ui-radius);
  margin: var(--size-4) var(--size-4) var(--size-8) var(--size-4);
  position: relative;
  z-index: 1;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--size-4);
  align-items: center;
  min-height: var(--size-24);
}

.tag-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--size-2);
  padding: var(--size-2) var(--size-6);
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: var(--size-12);
  font-size: 0.75rem;
  color: var(--ui-mono-0);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  outline: none;
}

.tag-badge:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(0, 0, 0, 0.3);
  transform: scale(1.05);
}

.tag-badge:disabled {
  cursor: default;
  opacity: 0.8;
}

.tag-text {
  font-weight: 500;
}

.tag-remove-icon {
  width: var(--size-12);
  height: var(--size-12);
  opacity: 0.7;
}

.tag-badge:hover:not(:disabled) .tag-remove-icon {
  opacity: 1;
}

.tag-input {
  padding: var(--size-2) var(--size-6);
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: var(--size-12);
  font-size: 0.75rem;
  color: var(--ui-mono-10);
  outline: none;
  min-width: 100px;
  max-width: 150px;
}

.tag-input::placeholder {
  color: var(--ui-50);
  opacity: 0.7;
}

.tag-input:focus {
  border-color: var(--ui-primary-100);
  box-shadow: 0 0 0 2px rgba(var(--ui-primary-100-rgb), 0.2);
}

.add-tag-button {
  display: inline-flex;
  align-items: center;
  gap: var(--size-2);
  padding: var(--size-2) var(--size-6);
  background: rgba(255, 255, 255, 0.2);
  border: 1px dashed rgba(0, 0, 0, 0.2);
  border-radius: var(--size-12);
  font-size: 0.75rem;
  color: var(--ui-mono-0);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  outline: none;
}

.add-tag-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(0, 0, 0, 0.3);
  border-style: solid;
}

.add-icon {
  width: var(--size-12);
  height: var(--size-12);
  opacity: 0.8;
}

.add-label {
  font-weight: 500;
  opacity: 0.9;
}

.max-tags-message {
  font-size: 0.7rem;
  color: rgba(0, 0, 0, 0.5);
  font-style: italic;
  padding: var(--size-2) var(--size-4);
}

@media (prefers-color-scheme: dark) {
  .tag-input-container {
    background: rgba(0, 0, 0, 0.2);
  }

  .tag-badge {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .tag-badge:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .tag-input {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: var(--ui-mono-100);
  }

  .add-tag-button {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .add-tag-button:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .max-tags-message {
    color: rgba(255, 255, 255, 0.5);
  }
}
</style>
