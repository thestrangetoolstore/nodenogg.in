import { StarterKit } from '@tiptap/starter-kit'
import { Link } from '@tiptap/extension-link'
import { CharacterCount } from '@tiptap/extension-character-count'
import { Placeholder } from '@tiptap/extension-placeholder'
import type { Extensions } from '@tiptap/core'
import { MAX_CHARACTER_COUNT } from '@nodenogg.in/core'
import { EntitySplitter } from './extensions/entity-splitter'

const UNDO_REDO = false

export const baseExtensions: Extensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3]
    },
    link: false,
    horizontalRule: false,
    undoRedo: UNDO_REDO
  }),
  Link.configure({
    HTMLAttributes: {
      rel: 'noopener noreferrer',
      target: null,
      tabindex: '-1'
    },
    linkOnPaste: true
  }),
  CharacterCount.configure({
    limit: MAX_CHARACTER_COUNT
  })
]

export const createExtensions = (options?: {
  onSplit?: (beforeContent: string, afterContent: string) => void
}): Extensions => [
  ...baseExtensions,
  Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === 'heading') {
        return 'Heading'
      }
      return ''
    }
  }),
  EntitySplitter.configure({
    onSplit: options?.onSplit
  })
]

export const extensions: Extensions = createExtensions()
