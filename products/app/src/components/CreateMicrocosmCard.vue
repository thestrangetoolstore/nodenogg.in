<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { MicrocosmSchema } from '@nodenogg.in/schema'
import { COPY } from '@/constants/copy'

const router = useRouter()
const inputValue = ref('')
const isActive = ref(false)

const { createMicrocosmID, sanitizeMicrocosmIDTitle } = MicrocosmSchema.utils

const handleFocus = () => {
  isActive.value = true
}

const handleBlur = () => {
  if (!inputValue.value.trim()) {
    isActive.value = false
  }
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
    ;(event.target as HTMLInputElement).blur()
  }
}
</script>

<template>
  <div class="create-microcosm-card" :class="{ active: isActive || inputValue.trim() }">
    <input 
      v-model="inputValue" 
      :placeholder="COPY.dialogs.joinMicrocosm.placeholder"
      class="microcosm-input" 
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
    />
    
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
  padding: 0;
}

.input-message {
  font-size: 0.875rem;
  color: var(--ui-40);
  margin-top: var(--size-2);
  line-height: 1.4;
}

.key {
  display: inline-block;
  padding: var(--size-2) var(--size-6);
  background: var(--ui-80);
  border: 1px solid var(--ui-70);
  border-radius: var(--ui-radius);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ui-20);
  font-family: monospace;
}

</style>