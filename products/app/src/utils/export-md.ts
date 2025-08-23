import type { Entity, MicrocosmID, IdentityID } from '@nodenogg.in/schema'
import { APP_VERSION } from '@nodenogg.in/core'
import type { MicrocosmAPI } from '@nodenogg.in/core'

export interface MarkdownFileExport {
  filename: string
  content: string
  entity_id: string
  created: number
  lastEdited: number
}

export interface MicrocosmMarkdownExport {
  microcosm_id: MicrocosmID
  generated_at: string
  app_version: string
  total_identities: number
  files: MarkdownFileExport[]
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
      .replace(/[^\w\s-]/g, '') // Remove special chars except word chars, spaces, hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .toLowerCase()
      .substring(0, 50) // Limit length
      .trim()
    
    if (cleaned) {
      return `${timestamp}-${cleaned}.md`
    }
  }
  
  // Fallback filename
  return `${timestamp}-entity-${index + 1}.md`
}

/**
 * Converts HTML to markdown syntax
 */
function htmlToMarkdown(html: string): string {
  // Handle ordered lists first (preserve numbering)  
  let result = html.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
    let counter = 1
    return content.replace(/<li[^>]*>(.*?)<\/li>/gi, (liMatch, liContent) => {
      return `${counter++}. ${liContent}\n`
    })
  })

  result = result
    // Headers
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1')
    .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1')
    .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1')
    
    // Bold and italic
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    
    // Code
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<pre[^>]*>(.*?)<\/pre>/gi, '```\n$1\n```')
    
    // Links
    .replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    
    // Task lists (TipTap)
    .replace(/<ul[^>]*data-type=["']taskList["'][^>]*>/gi, '')
    .replace(/<li[^>]*data-type=["']taskItem["'][^>]*data-checked=["']true["'][^>]*>(.*?)<\/li>/gi, '- [x] $1')
    .replace(/<li[^>]*data-type=["']taskItem["'][^>]*data-checked=["']false["'][^>]*>(.*?)<\/li>/gi, '- [ ] $1')
    .replace(/<li[^>]*data-type=["']taskItem["'][^>]*>(.*?)<\/li>/gi, '- [ ] $1')
    
    // Regular unordered lists
    .replace(/<ul[^>]*>/gi, '')
    .replace(/<\/ul>/gi, '')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1')
    
    // Paragraphs
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '\n\n')
    
    // Line breaks
    .replace(/<br\s*\/?>/gi, '\n')
    
    // Blockquotes
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1')
    
    // Images
    .replace(/<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, '![$2]($1)')
    .replace(/<img[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']*)["'][^>]*\/?>/gi, '![$1]($2)')
    .replace(/<img[^>]*src=["']([^"']*)["'][^>]*\/?>/gi, '![]($1)')
    
    // Horizontal rules
    .replace(/<hr[^>]*\/?>/gi, '---')
    
    // Tables (basic)
    .replace(/<table[^>]*>/gi, '')
    .replace(/<\/table>/gi, '')
    .replace(/<tr[^>]*>/gi, '')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<td[^>]*>(.*?)<\/td>/gi, '| $1 ')
    .replace(/<th[^>]*>(.*?)<\/th>/gi, '| $1 ')
    
    // Remove remaining HTML tags
    .replace(/<[^>]*>/g, '')
    
    // Decode HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    
    // Clean up extra whitespace and newlines
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')

  return result
}

/**
 * Converts an entity to markdown content
 */
function entityToMarkdown(entity: Entity, identityId: IdentityID): string {
  const metadata = `---
entity_id: ${entity.id}
identity_id: ${identityId}
created: ${new Date(entity.created).toISOString()}
lastEdited: ${new Date(entity.lastEdited).toISOString()}
type: ${entity.data.type}
---

`

  switch (entity.data.type) {
    case 'html':
      const htmlContent = entity.data.content || ''
      const markdownContent = htmlToMarkdown(htmlContent)
      return metadata + markdownContent
    
    case 'emoji':
      return metadata + `# ${entity.data.content}`
    
    case 'connection':
      return metadata + `Connection from ${entity.data.from || 'unknown'} to ${entity.data.to || 'unknown'}`
  }
}

/**
 * Exports all entities from all identities in a microcosm as individual markdown files
 */
export async function exportMicrocosmEntitiesAsMarkdown(
  microcosmApi: MicrocosmAPI,
  microcosmId: MicrocosmID
): Promise<MicrocosmMarkdownExport> {
  const files: MarkdownFileExport[] = []
  let index = 0
  let identityCount = 0

  // Collect all entities from all identities
  for await (const identityId of microcosmApi.getCollections()) {
    identityCount++
    
    for await (const entityId of microcosmApi.getCollection(identityId)) {
      try {
        const entity = await microcosmApi.getEntity({
          entity_id: entityId,
          identity_id: identityId
        })

        if (entity) {
          const filename = createFilename(entity, index)
          const content = entityToMarkdown(entity, identityId)
          
          files.push({
            filename,
            content,
            entity_id: entity.id,
            created: entity.created,
            lastEdited: entity.lastEdited
          })
          
          index++
        }
      } catch (error) {
        console.warn(`Failed to export entity ${entityId} from identity ${identityId}:`, error)
      }
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
 * Downloads individual markdown files as a ZIP archive
 */
export function downloadMarkdownFiles(data: MicrocosmMarkdownExport, zipFilename?: string): void {
  // For now, we'll create a simple implementation that downloads each file individually
  // In a production environment, you might want to use a library like JSZip
  
  const filename = zipFilename || `microcosm-${data.microcosm_id}-markdown-${new Date().toISOString().split('T')[0]}`
  
  // Create a manifest file that lists all the markdown files
  const manifest = `# Microcosm Export Manifest

**Microcosm ID:** ${data.microcosm_id}  
**Generated:** ${data.generated_at}  
**App Version:** ${data.app_version}  
**Total Identities:** ${data.total_identities}  
**Total Files:** ${data.files.length}

## Files

${data.files.map(file => `- ${file.filename} (Entity: ${file.entity_id})`).join('\n')}

## Instructions

This export contains ${data.files.length} markdown files from your microcosm. Each file contains:
- YAML frontmatter with metadata (entity_id, created, lastEdited, type)
- The original content preserved as markdown

To use these files:
1. Extract all files to a directory
2. Each .md file can be opened in any markdown editor
3. The frontmatter contains the original entity metadata
`

  // Download manifest first
  downloadTextFile(manifest, `${filename}-manifest.md`)
  
  // Download each markdown file
  data.files.forEach(file => {
    downloadTextFile(file.content, file.filename)
  })
}

/**
 * Downloads a text file to the user's device
 */
function downloadTextFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
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
 * Exports microcosm entities as markdown files and triggers downloads
 */
export async function exportAndDownloadMarkdownFiles(
  microcosmApi: MicrocosmAPI,
  microcosmId: MicrocosmID,
  zipFilename?: string
): Promise<void> {
  try {
    const exportData = await exportMicrocosmEntitiesAsMarkdown(microcosmApi, microcosmId)
    downloadMarkdownFiles(exportData, zipFilename)
  } catch (error) {
    console.error('Failed to export microcosm as markdown:', error)
    throw error
  }
}