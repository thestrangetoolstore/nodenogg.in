<script setup lang="ts">
import { type PropType, ref, watch, computed, nextTick } from 'vue'
import { FocusTrap } from 'focus-trap-vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import EditorMenu from './EditorMenu.vue'
import Scrollable from './Scrollable.vue'
import { extensions } from './tiptap-editor'

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
  }
})

watch(() => props, () => {
  console.log(props.value)
})

const emit = defineEmits(['cancel'])

const focusActive = ref(false)
const isInitialized = ref(false)
const lastEmittedContent = ref(props.value)

const editor = useEditor({
  editable: props.editable,
  extensions,
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
}

// Handle external content changes
watch(() => props.value, (newValue) => {
  if (!editor.value || !isInitialized.value) return

  const currentContent = editor.value.getHTML()
  if (newValue !== currentContent && newValue !== lastEmittedContent.value) {
    lastEmittedContent.value = newValue
    editor.value.commands.setContent(newValue, false)
  }
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
      <!-- <EditorMenu :editor="editor" v-if="editor" :blur="onBlur" /> -->
      <Scrollable :scroll="scroll">
        <editor-content :editor="editor" class="tiptap-wrapper" />
      </Scrollable>
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
  border-color: var(--ui-primary-100);
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