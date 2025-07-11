<script lang="ts" setup>
import { ref, type PropType, onMounted } from 'vue'

const element = ref<HTMLInputElement | null>(null)

const props = defineProps({
  class: {
    type: String,
    default: ''
  },
  modelValue: {
    type: String,
    default: ''
  },
  autoFocus: {
    type: Boolean
  },
  autocapitalize: {
    type: String as PropType<HTMLInputElement['autocapitalize']>,
    default: 'off'
  },
  spellcheck: {
    type: Boolean as PropType<HTMLInputElement['spellcheck']>,
    default: false
  },
  autocomplete: {
    type: String as PropType<HTMLInputElement['autocomplete']>,
    default: 'off'
  },
  label: {
    type: String,
    default: ''
  },
  large: {
    type: Boolean
  },
  placeholder: {
    type: String,
    default: ''
  }
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

defineOptions({
  inheritAttrs: false
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

onMounted(() => {
  if (props.autoFocus) {
    setTimeout(() => {
      element.value?.focus()
    }, 20)
  }
})
</script>
<template>
  <label v-if="label" class="label" :for="label">{{ label }}</label>
  <input 
    ref="element" 
    :name="label" 
    type="text" 
    :value="modelValue"
    :placeholder="placeholder"
    :class="{ base: true, [props.class]: true, large }"
    :autocapitalize="autocapitalize" 
    :spellcheck="spellcheck" 
    :autocomplete="autocomplete" 
    data-lpignore="true"
    data-form-type="other"
    @input="handleInput"
    v-bind="$attrs" />
</template>

<style scoped>
.base {
  border: initial;
  padding: var(--size-8);
  width: 100%;
  height: var(--size-40);
  border-radius: var(--ui-radius);
  background: var(--ui-primary-20);
  color: var(--ui-primary-100);
  outline: initial;
  caret-color: var(--ui-primary-100);
}

.base.large {
  font-size: 1.5em;
  padding: var(--size-24) var(--size-16);
}

.base::selection {
  color: var(--ui-mono-0);
  background-color: var(--ui-primary-100);
}

.base::placeholder {
  color: var(--ui-primary-70);
  opacity: 1;
}

.base:hover:not(:focus) {
  background: var(--ui-primary-20);
}

.base:hover:not(:focus)::placeholder {
  color: var(--ui-primary-100);
  opacity: 1;
}

.base:focus {
  box-shadow: var(--ui-shadow-primary);
}

@media (prefers-color-scheme: dark) {
  .base {
    /* background: var(--ui-80); */
  }
}

.label {
  display: block;
  padding: var(--size-8) 0 var(--size-4) 0;
  color: var(--ui-30);
  font-size: 1em;
}
</style>
