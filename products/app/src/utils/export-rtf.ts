import type { Entity, MicrocosmID, IdentityID } from '@nodenogg.in/schema'
import { APP_VERSION } from '@nodenogg.in/core'
import type { MicrocosmAPI } from '@nodenogg.in/core'
import JSZip from 'jszip'

export interface RtfFileExport {
  filename: string
  content: string
  entity_id: string
  created: number
  lastEdited: number
}

export interface MicrocosmRtfExport {
  microcosm_id: MicrocosmID
  generated_at: string
  app_version: string
  total_identities: number
  files: RtfFileExport[]
}

/**
 * Creates a safe filename from entity content
 */
function createFilename(entity: Entity, index: number): string {
  const timestamp = new Date(entity.created).toISOString().split('T')[0]

  if (entity.data.type === 'html' && entity.data.content) {
    // Extract first line or first few words as filename
    const firstLine = entity.data.content.split('\n')[0]
    const cleaned = firstLine
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[^\w\s-]/g, '') // Remove special chars except word chars, spaces, hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .toLowerCase()
      .substring(0, 50) // Limit length
      .trim()

    if (cleaned) {
      return `${timestamp}-${cleaned}.rtf`
    }
  }

  // Fallback filename
  return `${timestamp}-entity-${index + 1}.rtf`
}

/**
 * Converts a Unicode character to RTF Unicode escape sequence
 */
function unicodeToRtf(char: string): string {
  const codePoint = char.codePointAt(0)
  if (!codePoint) return char

  // For characters above 0x7F (non-ASCII), use RTF Unicode escape
  if (codePoint > 0x7F) {
    // For characters in the BMP (Basic Multilingual Plane)
    if (codePoint <= 0xFFFF) {
      return `\\u${codePoint}?`
    }
    // For characters outside BMP (like most emojis), we need surrogate pairs
    // Convert to UTF-16 surrogate pairs
    const high = Math.floor((codePoint - 0x10000) / 0x400) + 0xD800
    const low = ((codePoint - 0x10000) % 0x400) + 0xDC00
    return `\\u${high}?\\u${low}?`
  }

  return char
}

/**
 * Escapes special characters for RTF format and handles Unicode
 */
function escapeRtf(text: string): string {
  let result = ''

  // First escape RTF special characters
  text = text
    .replace(/\\/g, '\\\\')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')

  // Process each character, converting Unicode to RTF format
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const codePoint = char.charCodeAt(0)

    if (char === '\n') {
      result += '\\par\n'
    } else if (codePoint > 0x7F || (codePoint >= 0xD800 && codePoint <= 0xDFFF)) {
      // Handle Unicode characters (including emoji with surrogate pairs)
      if (codePoint >= 0xD800 && codePoint <= 0xDBFF && i + 1 < text.length) {
        // High surrogate, combine with low surrogate
        const nextChar = text[i + 1]
        const nextCode = nextChar.charCodeAt(0)
        if (nextCode >= 0xDC00 && nextCode <= 0xDFFF) {
          const fullChar = char + nextChar
          result += unicodeToRtf(fullChar)
          i++ // Skip the low surrogate
          continue
        }
      }
      result += unicodeToRtf(char)
    } else {
      result += char
    }
  }

  return result
}

/**
 * Escapes text content for RTF (but doesn't convert newlines)
 */
function escapeTextForRtf(text: string): string {
  let result = ''

  // First escape RTF special characters
  text = text
    .replace(/\\/g, '\\\\')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')

  // Process each character, converting Unicode to RTF format
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const codePoint = char.charCodeAt(0)

    if (codePoint > 0x7F || (codePoint >= 0xD800 && codePoint <= 0xDFFF)) {
      // Handle Unicode characters (including emoji with surrogate pairs)
      if (codePoint >= 0xD800 && codePoint <= 0xDBFF && i + 1 < text.length) {
        // High surrogate, combine with low surrogate
        const nextChar = text[i + 1]
        const nextCode = nextChar.charCodeAt(0)
        if (nextCode >= 0xDC00 && nextCode <= 0xDFFF) {
          const fullChar = char + nextChar
          result += unicodeToRtf(fullChar)
          i++ // Skip the low surrogate
          continue
        }
      }
      result += unicodeToRtf(char)
    } else {
      result += char
    }
  }

  return result
}

/**
 * Converts HTML to RTF syntax
 */
function htmlToRtf(html: string): string {
  let result = html

  // Remove remaining HTML tags first
  result = result.replace(/<[^>]*>/g, '')

  // Decode HTML entities
  result = result
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')

  // Escape the text content for RTF
  result = escapeTextForRtf(result)

  // Now apply RTF formatting by processing the ORIGINAL html
  // We need to work with the original HTML to detect tags
  let formattedResult = html

  // Convert headings (escape content)
  formattedResult = formattedResult.replace(/<h1[^>]*>(.*?)<\/h1>/gi, (_, content) => {
    const cleaned = content.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    return `\\fs48\\b ${escapeTextForRtf(cleaned)}\\b0\\fs24\\par\n`
  })
  formattedResult = formattedResult.replace(/<h2[^>]*>(.*?)<\/h2>/gi, (_, content) => {
    const cleaned = content.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    return `\\fs40\\b ${escapeTextForRtf(cleaned)}\\b0\\fs24\\par\n`
  })
  formattedResult = formattedResult.replace(/<h3[^>]*>(.*?)<\/h3>/gi, (_, content) => {
    const cleaned = content.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    return `\\fs32\\b ${escapeTextForRtf(cleaned)}\\b0\\fs24\\par\n`
  })
  formattedResult = formattedResult.replace(/<h4[^>]*>(.*?)<\/h4>/gi, (_, content) => {
    const cleaned = content.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    return `\\fs28\\b ${escapeTextForRtf(cleaned)}\\b0\\fs24\\par\n`
  })
  formattedResult = formattedResult.replace(/<h5[^>]*>(.*?)<\/h5>/gi, (_, content) => {
    const cleaned = content.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    return `\\fs26\\b ${escapeTextForRtf(cleaned)}\\b0\\fs24\\par\n`
  })
  formattedResult = formattedResult.replace(/<h6[^>]*>(.*?)<\/h6>/gi, (_, content) => {
    const cleaned = content.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    return `\\fs24\\b ${escapeTextForRtf(cleaned)}\\b0\\fs24\\par\n`
  })

  // Convert bold and italic
  formattedResult = formattedResult.replace(/<strong[^>]*>(.*?)<\/strong>/gi, (_, content) => {
    const cleaned = content.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    return `\\b ${escapeTextForRtf(cleaned)}\\b0 `
  })
  formattedResult = formattedResult.replace(/<b[^>]*>(.*?)<\/b>/gi, (_, content) => {
    const cleaned = content.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    return `\\b ${escapeTextForRtf(cleaned)}\\b0 `
  })
  formattedResult = formattedResult.replace(/<em[^>]*>(.*?)<\/em>/gi, (_, content) => {
    const cleaned = content.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    return `\\i ${escapeTextForRtf(cleaned)}\\i0 `
  })
  formattedResult = formattedResult.replace(/<i[^>]*>(.*?)<\/i>/gi, (_, content) => {
    const cleaned = content.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    return `\\i ${escapeTextForRtf(cleaned)}\\i0 `
  })

  // Convert code (using monospace font)
  formattedResult = formattedResult.replace(/<code[^>]*>(.*?)<\/code>/gi, (_, content) => {
    const cleaned = content.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    return `\\f1 ${escapeTextForRtf(cleaned)}\\f0 `
  })
  formattedResult = formattedResult.replace(/<pre[^>]*>(.*?)<\/pre>/gi, (_, content) => {
    const cleaned = content.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    return `\\f1\\par\n${escapeTextForRtf(cleaned)}\\par\n\\f0 `
  })

  // Convert links (just show text and URL)
  formattedResult = formattedResult.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, (_, href, content) => {
    const cleaned = content.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    return `${escapeTextForRtf(cleaned)} (${escapeTextForRtf(href)})`
  })

  // Convert task lists
  formattedResult = formattedResult.replace(/<li[^>]*data-type=["']taskItem["'][^>]*data-checked=["']true["'][^>]*>(.*?)<\/li>/gi, (_, content) => {
    const cleaned = content.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    return `[x] ${escapeTextForRtf(cleaned)}\\par\n`
  })
  formattedResult = formattedResult.replace(/<li[^>]*data-type=["']taskItem["'][^>]*data-checked=["']false["'][^>]*>(.*?)<\/li>/gi, (_, content) => {
    const cleaned = content.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    return `[ ] ${escapeTextForRtf(cleaned)}\\par\n`
  })
  formattedResult = formattedResult.replace(/<li[^>]*data-type=["']taskItem["'][^>]*>(.*?)<\/li>/gi, (_, content) => {
    const cleaned = content.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    return `[ ] ${escapeTextForRtf(cleaned)}\\par\n`
  })

  // Convert regular lists
  formattedResult = formattedResult.replace(/<ul[^>]*>/gi, '')
  formattedResult = formattedResult.replace(/<\/ul>/gi, '\\par\n')
  formattedResult = formattedResult.replace(/<ol[^>]*>/gi, '')
  formattedResult = formattedResult.replace(/<\/ol>/gi, '\\par\n')
  formattedResult = formattedResult.replace(/<li[^>]*>(.*?)<\/li>/gi, (_, content) => {
    const cleaned = content.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    return `\\bullet  ${escapeTextForRtf(cleaned)}\\par\n`
  })

  // Convert paragraphs
  formattedResult = formattedResult.replace(/<p[^>]*>/gi, '')
  formattedResult = formattedResult.replace(/<\/p>/gi, '\\par\n')

  // Convert line breaks
  formattedResult = formattedResult.replace(/<br\s*\/?>/gi, '\\line\n')

  // Convert blockquotes
  formattedResult = formattedResult.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, (_, content) => {
    const cleaned = content.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    return `\\li720 ${escapeTextForRtf(cleaned)}\\li0\\par\n`
  })

  // Convert images (just show alt text or filename)
  formattedResult = formattedResult.replace(/<img[^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, (_, alt) => `[Image: ${escapeTextForRtf(alt)}]`)
  formattedResult = formattedResult.replace(/<img[^>]*src=["']([^"']*)["'][^>]*\/?>/gi, (_, src) => `[Image: ${escapeTextForRtf(src)}]`)

  // Convert horizontal rules
  formattedResult = formattedResult.replace(/<hr[^>]*\/?>/gi, '\\par\n\\brdrb\\brdrs\\par\n')

  // Remove any remaining HTML tags
  formattedResult = formattedResult.replace(/<[^>]*>/g, '')

  return formattedResult
}

/**
 * Converts an entity to RTF content, optionally including related emojis
 */
function entityToRtf(entity: Entity, identityId: IdentityID, relatedEmojis: Entity[] = []): string {
  // Build RTF header with metadata
  const metadata = [
    `Created: ${new Date(entity.created).toISOString()}`,
    `Last Edited: ${new Date(entity.lastEdited).toISOString()}`,
    `Type: ${entity.data.type}`
  ]

  // Add backgroundColor if it exists (only for HTML entities)
  if (entity.data.type === 'html' && entity.data.backgroundColor) {
    metadata.push(`Background Color: ${entity.data.backgroundColor}`)
  }

  // Add emoji information if there are related emojis
  if (entity.data.type === 'html' && relatedEmojis.length > 0) {
    const emojiList = relatedEmojis
      .map(e => e.data.type === 'emoji' ? e.data.content : '')
      .filter(Boolean)
      .join(', ')
    if (emojiList) {
      metadata.push(`Emojis: ${emojiList}`)
    }
  }

  // RTF document structure with Unicode support
  let rtfContent = '{\\rtf1\\ansi\\ansicpg1252\\deff0\\deflang1033{\\fonttbl{\\f0\\fnil\\fcharset0 Arial;}{\\f1\\fmodern\\fcharset0 Courier New;}}{\\colortbl;\\red128\\green128\\blue128;\\red0\\green0\\blue0;}\\viewkind4\\uc1\\pard\\sa200\\sl276\\slmult1\\f0\\fs24\n'

  // Add metadata section
  rtfContent += '\\cf1\\fs20\n' // Gray, smaller font
  metadata.forEach(item => {
    rtfContent += escapeTextForRtf(item) + '\\par\n'
  })
  rtfContent += '\\cf2\\fs24\n' // Back to black, normal size
  rtfContent += '\\brdrb\\brdrs\\par\n' // Separator line

  // Add content based on entity type
  switch (entity.data.type) {
    case 'html':
      const htmlContent = entity.data.content || ''
      const rtfBody = htmlToRtf(htmlContent)
      rtfContent += rtfBody

      // Append emoji section if there are related emojis
      if (relatedEmojis.length > 0) {
        rtfContent += '\\par\n\\brdrb\\brdrs\\par\n' // Separator
        rtfContent += '\\b Emojis\\b0\\par\n'
        relatedEmojis.forEach(emoji => {
          if (emoji.data.type === 'emoji') {
            rtfContent += escapeTextForRtf(emoji.data.content) + ' '
          }
        })
        rtfContent += '\\par\n'
      }
      break

    case 'emoji':
      rtfContent += '\\fs48 ' + escapeTextForRtf(entity.data.content) + '\\fs24\\par\n'
      break

    case 'connection':
      rtfContent += escapeTextForRtf(`Connection from ${entity.data.from || 'unknown'} to ${entity.data.to || 'unknown'}`)
      break
  }

  // Close RTF document
  rtfContent += '}'

  return rtfContent
}

/**
 * Exports all entities from all identities in a microcosm as individual RTF files
 */
export async function exportMicrocosmEntitiesAsRtf(
  microcosmApi: MicrocosmAPI,
  microcosmId: MicrocosmID
): Promise<MicrocosmRtfExport> {
  const files: RtfFileExport[] = []
  let index = 0
  let identityCount = 0

  // First pass: collect all entities
  const allEntities: Entity[] = []
  for await (const identityId of microcosmApi.getCollections()) {
    identityCount++

    for await (const entityId of microcosmApi.getCollection(identityId)) {
      try {
        const entity = await microcosmApi.getEntity({
          entity_id: entityId,
          identity_id: identityId
        })

        if (entity) {
          allEntities.push(entity)
        }
      } catch (error) {
        console.warn(`Failed to fetch entity ${entityId} from identity ${identityId}:`, error)
      }
    }
  }

  // Build a map of parent HTML entities to their related emojis
  const emojiMap = new Map<string, Entity[]>()

  allEntities.forEach(entity => {
    if (entity.data.type === 'emoji') {
      if (entity.data.parentNodeId) {
        // This emoji is connected to a parent HTML entity
        const emojis = emojiMap.get(entity.data.parentNodeId) || []
        emojis.push(entity)
        emojiMap.set(entity.data.parentNodeId, emojis)
      }
    }
  })

  // Second pass: export entities with their related emojis
  for (const entity of allEntities) {
    try {
      // Skip emojis that have a parent (they'll be included with their parent)
      if (entity.data.type === 'emoji' && entity.data.parentNodeId) {
        continue
      }

      let filename: string
      let content: string

      if (entity.data.type === 'html') {
        // Include related emojis for HTML entities
        const relatedEmojis = emojiMap.get(entity.id) || []
        filename = createFilename(entity, index)
        content = entityToRtf(entity, entity.identity_id, relatedEmojis)
      } else {
        // For other entity types (standalone emojis, connections)
        filename = createFilename(entity, index)
        content = entityToRtf(entity, entity.identity_id)
      }

      files.push({
        filename,
        content,
        entity_id: entity.id,
        created: entity.created,
        lastEdited: entity.lastEdited
      })

      index++
    } catch (error) {
      console.warn(`Failed to export entity ${entity.id}:`, error)
    }
  }

  return {
    microcosm_id: microcosmId,
    generated_at: new Date().toISOString(),
    app_version: APP_VERSION,
    total_identities: identityCount,
    files
  }
}

/**
 * Creates a single combined RTF document with all entities
 */
function createCombinedRtfDocument(data: MicrocosmRtfExport): string {
  // RTF document structure with Unicode support
  let rtfContent = '{\\rtf1\\ansi\\ansicpg1252\\deff0\\deflang1033{\\fonttbl{\\f0\\fnil\\fcharset0 Arial;}{\\f1\\fmodern\\fcharset0 Courier New;}}{\\colortbl;\\red128\\green128\\blue128;\\red0\\green0\\blue0;}\\viewkind4\\uc1\\pard\\sa200\\sl276\\slmult1\\f0\\fs24\n'

  // Add title section
  rtfContent += '\\fs56\\b Microcosm Export\\b0\\fs24\\par\n'
  rtfContent += '\\cf1\\fs20\n' // Gray, smaller font
  rtfContent += escapeTextForRtf(`Microcosm ID: ${data.microcosm_id}`) + '\\par\n'
  rtfContent += escapeTextForRtf(`Generated: ${data.generated_at}`) + '\\par\n'
  rtfContent += escapeTextForRtf(`Total Entities: ${data.files.length}`) + '\\par\n'
  rtfContent += escapeTextForRtf(`Total Identities: ${data.total_identities}`) + '\\par\n'
  rtfContent += '\\cf2\\fs24\n' // Back to black, normal size
  rtfContent += '\\brdrb\\brdrs\\par\n' // Separator line

  // Add each entity with page breaks between them
  data.files.forEach((file, index) => {
    // Extract the content body from the individual RTF file
    // The RTF structure is: {\rtf1...\viewkind4\uc1\pard...\fs24\n CONTENT }
    // We need to extract just the CONTENT part

    let content = file.content

    // Find where the content starts (after the last \fs24\n in the header)
    const headerEndMatch = content.match(/\\viewkind4\\uc1\\pard\\sa200\\sl276\\slmult1\\f0\\fs24\n/)
    if (headerEndMatch && headerEndMatch.index !== undefined) {
      // Extract everything after the header
      content = content.substring(headerEndMatch.index + headerEndMatch[0].length)
      // Remove the closing brace at the end
      content = content.replace(/\}$/, '').trim()

      rtfContent += content

      // Add page break after each entity (except the last one)
      if (index < data.files.length - 1) {
        rtfContent += '\\par\n\\page\n'
      }
    }
  })

  // Close RTF document
  rtfContent += '\n}'

  return rtfContent
}

/**
 * Downloads individual RTF files as a ZIP archive
 */
export async function downloadRtfFiles(data: MicrocosmRtfExport, zipFilename?: string): Promise<void> {
  const filename = zipFilename || `microcosm-${data.microcosm_id}-rtf-${new Date().toISOString().split('T')[0]}`

  // Create a manifest file
  const manifest = `# Microcosm RTF Export Manifest

**Microcosm ID:** ${data.microcosm_id}
**Generated:** ${data.generated_at}
**App Version:** ${data.app_version}
**Total Identities:** ${data.total_identities}
**Total Files:** ${data.files.length}

## Files

- all-entities.rtf (Combined document with all entities)
${data.files.map(file => `- ${file.filename}`).join('\n')}

## Instructions

This export contains ${data.files.length + 1} RTF (Rich Text Format) files from your microcosm:

1. **all-entities.rtf** - A single document containing all entities, separated by page breaks
2. **Individual entity files** - Each entity exported as a separate RTF file

Each file contains:
- Metadata header with entity information (created, lastEdited, type)
- The original content preserved in RTF format
- Rich text formatting (bold, italic, headers, lists, etc.)

RTF files can be opened in:
- Microsoft Word
- Apple Pages
- LibreOffice Writer
- Google Docs (upload and convert)
- Most word processors
`

  // Create a new JSZip instance
  const zip = new JSZip()

  // Add manifest file to the zip
  zip.file('README.txt', manifest)

  // Create and add the combined RTF file
  const combinedRtf = createCombinedRtfDocument(data)
  zip.file('all-entities.rtf', combinedRtf)

  // Add each individual RTF file to the zip
  data.files.forEach(file => {
    zip.file(file.filename, file.content)
  })

  // Generate the zip file and trigger download
  const blob = await zip.generateAsync({ type: 'blob' })
  downloadBlob(blob, `${filename}.zip`)
}

/**
 * Downloads a blob to the user's device
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()

  // Cleanup
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Exports microcosm entities as RTF files and triggers downloads
 */
export async function exportAndDownloadRtfFiles(
  microcosmApi: MicrocosmAPI,
  microcosmId: MicrocosmID,
  zipFilename?: string
): Promise<void> {
  try {
    const exportData = await exportMicrocosmEntitiesAsRtf(microcosmApi, microcosmId)
    await downloadRtfFiles(exportData, zipFilename)
  } catch (error) {
    console.error('Failed to export microcosm as RTF:', error)
    throw error
  }
}
