<script setup lang="ts">
import { type PropType, ref, watch, computed, nextTick } from 'vue'
import { FocusTrap } from 'focus-trap-vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import Scrollable from './Scrollable.vue'
import { createExtensions } from './tiptap-extensions'
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
  onSplit: {
    type: Function as PropType<(beforeContent: string, afterContent: string) => void>
  },
  onFocusChange: {
    type: Function as PropType<(isFocused: boolean) => void>
  },
  scroll: {
    type: Boolean
  },
  editable: {
    type: Boolean,
    default: false
  }
})


const emit = defineEmits(['cancel', 'click', 'split'])

const focusActive = ref(false)
const isInitialized = ref(false)
const lastEmittedContent = ref(props.value)

// Create a stable reference for the split handler that can access current props
const handleSplit = (beforeContent: string, afterContent: string) => {
  console.log('EntitySplitter called, emitting split event and calling prop callback')
  emit('split', beforeContent, afterContent)
  props.onSplit?.(beforeContent, afterContent)
}

const editor = useEditor({
  editable: props.editable,
  extensions: createExtensions({ onSplit: handleSplit }),
  injectCSS: false,
  content: props.value,
  onCreate: () => {
    nextTick(() => {
      isInitialized.value = true
      lastEmittedContent.value = editor.value?.getHTML() || ''
    })
  },
  onUpdate: ({ editor }) => {
    if (!isInitialized.value) return

    const html = editor.getHTML()
    if (html !== lastEmittedContent.value) {
      lastEmittedContent.value = html
      props.onChange(html)
    }
  },
  onBlur: () => {
    focusActive.value = false
    props.onFocusChange?.(false)

    if (props.editable) {
      props.onCancel?.()
      emit('cancel')
    }
  },
  onFocus: () => {
    focusActive.value = true
    props.onFocusChange?.(true)
  }
})

const active = computed(() => props.editable && focusActive.value)

const focus = () => {
  console.log('Editor focus method called:', {
    editor: editor.value,
    editable: props.editable,
    focusActive: focusActive.value
  })
  if (!editor.value) {
    console.log('No editor instance available')
    return
  }

  focusActive.value = true
  if (props.editable) {
    console.log('Focusing editable editor at start')
    editor.value.chain().focus('start').run()
  } else {
    console.log('Focusing read-only editor')
    // For read-only, just set focus without editing cursor
    editor.value.chain().focus().run()
  }
  props.onFocusChange?.(true)
}

const onClick = () => {
  if (!focusActive.value) {
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
    editor.value.commands.setContent(newValue)
  }
})

// Handle editable state changes
watch(() => props.editable, (newValue) => {
  if (!editor.value) return

  editor.value.setEditable(newValue)

  // Don't auto-focus when becoming editable
  // User will click within editor content to start editing
  if (!newValue) {
    focusActive.value = false
    props.onFocusChange?.(false)
  }
})

// Expose methods for parent components
defineExpose({
  focus
})
</script>

<template>
  <FocusTrap v-model:active="focusActive" :disabled="!editor || !editable">
    <div class="wrapper" :class="{ 'is-active': active }" @click="onClick">
      <template v-if="!!editor">
        <!-- <EditorMenu :editor="editor" v-if="editor" :blur="onBlur" /> -->
        <Scrollable :scroll="scroll">
          <editor-content :editor="editor" class="tiptap-wrapper" />
          <span class="character-count" v-if="editable"> {{ editor.storage.characterCount.characters() }} / {{
            MAX_CHARACTER_COUNT }}
          </span>
        </Scrollable>
      </template>
    </div>
  </FocusTrap>
</template>

<style>
.wrapper {
  width: 100%;
  height: 100%;
  padding-bottom: var(--size-16);
}


.character-count {
  position: absolute;
  bottom: var(--size-8);
  left: var(--size-12);
  pointer-events: none;
  font-size: 0.75em;
  opacity: 0.5;
  transform: scale(calc(1 / var(--zoom-value)));
  transform-origin: 0% 100%;
}

.tiptap-wrapper {
  outline: none;
}

.tiptap {
  white-space: pre-wrap;
  outline: none;
  padding: var(--size-12);
}

.tiptap .is-empty::before,
.tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: var(--ui-50);
  mix-blend-mode: multiply;
  pointer-events: none;
  height: 0;
}

/* .tiptap .is-empty::before {
  content: attr(data-placeholder);
  float: left;
  color: var(--ui-50);
  pointer-events: none;
  mix-blend-mode: multiply;
  height: 0;
} */
</style>