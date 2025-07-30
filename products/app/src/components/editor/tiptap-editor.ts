import { StarterKit } from '@tiptap/starter-kit'
import { Link } from '@tiptap/extension-link'
import { CharacterCount } from '@tiptap/extension-character-count'
import { Placeholder } from '@tiptap/extension-placeholder'
import type { Extensions } from '@tiptap/core'
import { MAX_CHARACTER_COUNT } from '@nodenogg.in/core'
import { EntitySplitter } from './extensions/entity-splitter'
// import { Document } from '@tiptap/extension-document'

// import { TaskList } from '@tiptap/extension-task-list'
// import { TaskItem } from '@tiptap/extension-task-item'

// Todo: allow these items to be sanitised? Allows ability for check lists
// TaskList,
// TaskItem,

// const NodeDocument = Document.extend({
//   content: 'heading block*'
// })

export const createExtensions = (options?: {
  onSplit?: (beforeContent: string, afterContent: string) => void
}): Extensions => [
  // NodeDocument,
  StarterKit.configure({
    // document: false,
    // Disable default horizontal rule to prevent conflicts
    link: false,
    horizontalRule: false
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
  }),
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

// Backward compatibility
export const extensions: Extensions = createExtensions()
