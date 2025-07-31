<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { MicrocosmSchema } from '@nodenogg.in/schema'
import { COPY } from '@/constants/copy'

const router = useRouter()
const inputValue = ref('')
const isActive = ref(false)
const inputRef = ref<HTMLInputElement>()

const { createMicrocosmID, sanitizeMicrocosmIDTitle } = MicrocosmSchema.utils

const focusInput = () => {
  inputRef.value?.focus()
}

const handleFocus = () => {
  isActive.value = true
}

const handleBlur = () => {
  inputValue.value = ''
  isActive.value = false
}

const handleJoinConfirm = () => {
  if (inputValue.value.trim()) {
    const sanitizedInput = sanitizeMicrocosmIDTitle(inputValue.value)
    const microcosmId = createMicrocosmID(sanitizedInput)

    router.push({
      name: 'microcosm',
      params: {
        microcosm_id: microcosmId
      }
    })

    inputValue.value = ''
    isActive.value = false
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && inputValue.value.trim()) {
    event.preventDefault()
    handleJoinConfirm()
  }
  if (event.key === 'Escape') {
    inputValue.value = ''
    isActive.value = false
      ; (event.target as HTMLInputElement).blur()
  }
}
</script>

<template>
  <div class="create-microcosm-card" :class="{ active: isActive || inputValue.trim() }" @click="focusInput">
    <input ref="inputRef" v-model="inputValue" :placeholder="COPY.dialogs.joinMicrocosm.placeholder"
      class="microcosm-input" @focus="handleFocus" @blur="handleBlur" @keydown="handleKeydown" />

    <div v-if="inputValue.trim()" class="input-message">
      Press <kbd class="key">Enter</kbd> to join or create {{ sanitizeMicrocosmIDTitle(inputValue) }}
    </div>
    <div v-else-if="isActive" class="input-message">
      {{ COPY.dialogs.joinMicrocosm.instruction }}
    </div>
  </div>
</template>

<style scoped>
.create-microcosm-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: var(--ui-shadow-10);
  border-radius: var(--size-4);
  padding: var(--size-16);
  min-height: 140px;
  transition: all 0.2s ease;
  color: inherit;
  cursor: text;
}

/* .create-microcosm-card:hover {
  background-color: var(--ui-10);
  color: var(--ui-100);
}
 */
/* .create-microcosm-card.active {
  background-color: var(--ui-10);
  color: var(--ui-100);
} */

.microcosm-input {
  background: transparent;
  border: none;
  outline: none;
  font-weight: 500;
  font-size: 1rem;
  color: inherit;
  width: 100%;
  height: 100%;
  padding: 0;
  flex: 1;
  resize: none;
}

.input-message {
  font-size: 0.875rem;
  color: var(--ui-40);
  margin-top: var(--size-2);
  line-height: 1.4;
}

.key {
  display: inline-block;
  padding: var(--size-2) var(--size-4);
  background: var(--ui-80);
  border-radius: var(--ui-radius);
  font-weight: 600;
  color: var(--ui-20);
  font-family: inherit;
}
</style>