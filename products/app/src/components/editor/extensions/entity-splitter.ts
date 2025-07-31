import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { InputRule } from '@tiptap/core'
import { renderHTML } from '../html-renderer'

export interface EntitySplitterOptions {
  onSplit?: (beforeContent: string, afterContent: string) => void
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    entitySplitter: {
      splitEntity: () => ReturnType
    }
  }
}

export const EntitySplitter = Extension.create<EntitySplitterOptions>({
  name: 'entitySplitter',

  addOptions() {
    return {
      onSplit: undefined
    }
  },

  addStorage() {
    return {
      lastSplitTime: 0
    }
  },

  addCommands() {
    return {
      splitEntity:
        () =>
        ({ tr, state, dispatch }) => {
          const { selection } = state
          const { from, to } = selection

          const before = state.doc.cut(0, from)
          const after = state.doc.cut(to, state.doc.content.size)

          this.options.onSplit?.(renderHTML(before), renderHTML(after))

          if (dispatch) {
            tr.delete(from, state.doc.content.size)
          }

          return true
        }
    }
  },

  addInputRules() {
    return [
      new InputRule({
        find: /^(?:---|—-|___)\s?$/,
        handler: ({ state, range }) => {
          const { from, to } = range

          const now = Date.now()
          if (now - this.storage.lastSplitTime < 50) {
            return null
          }

          this.storage.lastSplitTime = now

          const before = state.doc.cut(0, from)
          const after = state.doc.cut(to, state.doc.content.size)

          this.options.onSplit?.(renderHTML(before), renderHTML(after))
          state.tr.delete(from, state.doc.content.size)
        }
      })
    ]
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('entitySplitter'),
        props: {
          handleKeyDown: (_view, event) => {
            if (event.key === 'Enter' && event.metaKey) {
              return this.editor.commands.splitEntity()
            }
            return false
          }
        }
      })
    ]
  }
})
