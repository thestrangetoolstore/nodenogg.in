import type { Node } from '@tiptap/pm/model'
import { generateHTML } from '@tiptap/core'
import { baseExtensions } from './tiptap-extensions'

type RenderHTMLOptions = {
  trimStart?: boolean
  trim?: boolean
}

export const renderHTML = (
  n: Node,
  options: RenderHTMLOptions = { trimStart: true, trim: false }
) => {
  try {
    const json = n.toJSON()
    const content = json.content || []

    return generateHTML(
      {
        type: 'doc',
        content: content.filter((node: Node, i: number) => {
          if ((options.trimStart && i === 0) || options.trim) {
            return 'content' in node
          } else {
            return true
          }
        })
      },
      baseExtensions
    )
  } catch (e) {
    console.log(e)
    return ''
  }
}
