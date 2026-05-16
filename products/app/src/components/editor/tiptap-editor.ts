import { StarterKit } from '@tiptap/starter-kit'
import { Link } from '@tiptap/extension-link'
import { CharacterCount } from '@tiptap/extension-character-count'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Extension, InputRule } from '@tiptap/core'
import type { Extensions } from '@tiptap/core'
import { MAX_CHARACTER_COUNT } from '@nodenogg.in/core'
// import { Document } from '@tiptap/extension-document'

// import { TaskList } from '@tiptap/extension-task-list'
// import { TaskItem } from '@tiptap/extension-task-item'

// Todo: allow these items to be sanitised? Allows ability for check lists
// TaskList,
// TaskItem,

// const NodeDocument = Document.extend({
//   content: 'heading block*'
// })

const SplitNode = Extension.create<{ onSplit?: () => void }>({
  name: 'splitNode',
  addInputRules() {
    return [
      new InputRule({
        find: /---$/,
        handler: ({ commands, range }) => {
          commands.deleteRange(range)
          this.options.onSplit?.()
        }
      })
    ]
  }
})

export const createExtensions = (options: { onSplit?: () => void } = {}): Extensions => [
  // NodeDocument,
  StarterKit.configure({
    // document: false
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
  SplitNode.configure({ onSplit: options.onSplit })
]
