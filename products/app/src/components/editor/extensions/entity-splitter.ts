import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { InputRule, nodeInputRule } from '@tiptap/core'

export interface EntitySplitterOptions {
  /**
   * Callback function when entity should be split
   */
  onSplit?: (beforeContent: string, afterContent: string) => void
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    entitySplitter: {
      /**
       * Split entity at current cursor position
       */
      splitEntity: () => ReturnType
    }
  }
}

/**
 * Extension that intercepts horizontal rule syntax (---) and splits entities instead
 */
export const EntitySplitter = Extension.create<EntitySplitterOptions>({
  name: 'entitySplitter',

  addOptions() {
    return {
      onSplit: undefined,
    }
  },

  addStorage() {
    return {
      lastSplitTime: 0
    }
  },

  addCommands() {
    return {
      splitEntity: () => ({ tr, state, dispatch }) => {
        const { selection } = state
        const { from, to } = selection
        
        // Get content before cursor
        const beforeContent = state.doc.cut(0, from).textContent
        
        // Get content after cursor  
        const afterContent = state.doc.cut(to, state.doc.content.size).textContent
        
        // Call the split callback
        this.options.onSplit?.(beforeContent, afterContent)
        
        // Clear content after cursor (it will be moved to new entity)
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
        handler: ({ state, range, match, commands }) => {
          const { from, to } = range
          
          // Prevent double execution
          const now = Date.now()
          if (now - this.storage.lastSplitTime < 50) {
            console.log('Split prevented - too soon after last split')
            return null
          }
          this.storage.lastSplitTime = now
          
          // Get content before the split point
          const beforeContent = state.doc.textBetween(0, from, '\n')
          
          // Get content after the split point - BEFORE we delete it
          const afterContent = state.doc.textBetween(to, state.doc.content.size, '\n')
          
          console.log('Split detected:', { 
            beforeContent, 
            afterContent, 
            from, 
            to,
            match: match[0]
          })
          
          // Call the split callback
          this.options.onSplit?.(beforeContent, afterContent)
          
          // Create transaction to remove the --- and everything after
          const tr = state.tr
          tr.delete(from, state.doc.content.size)
          
          return tr
        }
      })
    ]
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('entitySplitter'),
        props: {
          // Handle keyboard shortcuts
          handleKeyDown: (view, event) => {
            // Optional: Handle Ctrl+Shift+Enter to split
            if (event.key === 'Enter' && event.ctrlKey && event.shiftKey) {
              return this.editor.commands.splitEntity()
            }
            return false
          }
        }
      })
    ]
  }
})