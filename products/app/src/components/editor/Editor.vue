<script setup lang="ts">
import { type PropType, ref, watch, computed, nextTick, onBeforeUnmount } from 'vue'
import { FocusTrap } from 'focus-trap-vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import Scrollable from './Scrollable.vue'
import { createExtensions } from './tiptap-editor'
import { MAX_CHARACTER_COUNT } from '@nodenogg.in/core'

const props = defineProps({
  value: {
    type: String,
    default: ''
  },
  onChange: {
    type: Function as PropType<(html: string) => void>,
    required: true
  },
  onCancel: {
    type: Function as PropType<() => void>
  },
  scroll: {
    type: Boolean
  },
  editable: {
    type: Boolean,
    default: false
  },
  onSplit: {
    type: Function as PropType<() => void>
  }
})


const emit = defineEmits(['cancel', 'click'])

const focusActive = ref(false)
const isInitialized = ref(false)
const lastEmittedContent = ref(props.value)
const characterCount = ref(0)

// Shows a brief "saved" tick after the user pauses typing, since content
// syncs instantly and there's no explicit submit action to confirm it.
const SAVED_INDICATOR_DELAY = 600
const SAVED_INDICATOR_DURATION = 1400
const showSaved = ref(false)
let savedShowTimer: ReturnType<typeof setTimeout> | undefined
let savedHideTimer: ReturnType<typeof setTimeout> | undefined

const scheduleSavedIndicator = () => {
  clearTimeout(savedShowTimer)
  clearTimeout(savedHideTimer)
  showSaved.value = false

  savedShowTimer = setTimeout(() => {
    showSaved.value = true
    savedHideTimer = setTimeout(() => {
      showSaved.value = false
    }, SAVED_INDICATOR_DURATION)
  }, SAVED_INDICATOR_DELAY)
}

onBeforeUnmount(() => {
  clearTimeout(savedShowTimer)
  clearTimeout(savedHideTimer)
})

const handleSplit = () => props.onSplit?.()

const editor = useEditor({
  editable: props.editable,
  extensions: createExtensions({ onSplit: handleSplit }),
  injectCSS: false,
  content: props.value,
  onCreate: () => {
    nextTick(() => {
      isInitialized.value = true
      lastEmittedContent.value = editor.value?.getHTML() || ''
      characterCount.value = editor.value?.storage.characterCount.characters() ?? 0
    })
  },
  onUpdate: ({ editor }) => {
    if (!isInitialized.value) return

    characterCount.value = editor.storage.characterCount.characters()

    const html = editor.getHTML()
    if (html !== lastEmittedContent.value) {
      lastEmittedContent.value = html
      props.onChange(html)
      if (props.editable) {
        scheduleSavedIndicator()
      }
    }
  },
  onBlur: () => {
    if (!props.editable) return

    focusActive.value = false
    props.onCancel?.()
    emit('cancel')
  }
})

const active = computed(() => props.editable && focusActive.value)

const focus = () => {
  if (!props.editable || !editor.value) return

  focusActive.value = true
  editor.value.chain().focus('start').run()
}

const onClick = () => {
  if (!active.value && props.editable) {
    focus()
  }
  emit('click')
}

// Handle external content changes
watch(() => props.value, (newValue) => {
  if (!editor.value || !isInitialized.value) return

  const currentContent = editor.value.getHTML()
  if (newValue !== currentContent && newValue !== lastEmittedContent.value) {
    lastEmittedContent.value = newValue
    editor.value.commands.setContent(newValue, { emitUpdate: false })
    characterCount.value = editor.value.storage.characterCount.characters()
  }
})

defineExpose({
  characterCount,
  maxCharacterCount: MAX_CHARACTER_COUNT,
  showSaved
})

// Handle editable state changes
watch(() => props.editable, (newValue) => {
  if (!editor.value) return

  editor.value.setEditable(newValue)

  if (newValue) {
    nextTick(() => focus())
  } else {
    focusActive.value = false
  }
})
</script>

<template>
  <FocusTrap v-model:active="focusActive" :disabled="!editor || !editable">
    <div class="wrapper" :class="{ 'is-active': active }" @click="onClick">
      <template v-if="!!editor">
        <!-- <EditorMenu :editor="editor" v-if="editor" :blur="onBlur" /> -->
        <Scrollable :scroll="scroll">
          <editor-content :editor="editor" class="tiptap-wrapper" />
        </Scrollable>
      </template>
    </div>
  </FocusTrap>
</template>

<style>
.wrapper {
  width: 100%;
  height: 100%;
  border: 2px solid transparent;
  border-radius: var(--ui-radius);
  transition: border-color 0.2s ease;
}

.wrapper.is-active {
  border-color: var(--ui-0);
}

.tiptap-wrapper {
  outline: none;
}

.tiptap {
  white-space: pre-wrap;
  outline: none;
  padding: var(--size-12);
}

.tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: var(--ui-50);
  pointer-events: none;
  height: 0;
}

.tiptap .is-empty::before {
  content: attr(data-placeholder);
  float: left;
  color: var(--ui-50);
  pointer-events: none;
  height: 0;
}
</style>