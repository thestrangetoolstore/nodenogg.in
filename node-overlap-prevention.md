# Node Overlap Prevention Implementation

## Overview
I've implemented a comprehensive node overlap prevention system for the nodenogg.in spatial view. This ensures that when users add new nodes (HTML or emoji entities), they don't overlap with existing nodes.

## Files Created/Modified

### New Utility File: `products/app/src/utils/node-positioning.ts`
This file contains the core overlap prevention logic:

- **`getNodeBounds(entity)`**: Gets position and dimensions of any node entity
- **`getAbsoluteNodeBounds(entity, entities)`**: Calculates absolute positions for emoji nodes with parent relationships
- **`boundsOverlap(bounds1, bounds2)`**: Checks if two rectangular bounds overlap
- **`wouldOverlap(position, dimensions, existingEntities)`**: Determines if a new node at a given position would overlap existing nodes
- **`findNonOverlappingPosition(preferredPosition, dimensions, existingEntities, options)`**: Finds the best non-overlapping position for a new node

### Updated: `products/app/src/views/spatial/MicrocosmSpatialView.vue`
Modified four node creation functions to use the overlap prevention utility:

1. **`handleCreateNode()`** - Creates nodes via the "Add" button (viewport center)
2. **`handleCreateNodeAtPosition()`** - Creates nodes via right-click context menu
3. **`handleCreateEmojiAtPosition()`** - Creates emoji nodes via right-click context menu
4. **`handleDuplicateEntity()`** - Duplicates existing nodes with smart positioning

### Updated: `products/app/src/views/collect/MicrocosmCollectView.vue`
Modified three node creation functions to use the overlap prevention utility:

1. **`handleCreateEntity()`** - Creates HTML nodes via the "Add" button
2. **`handleCreateEmoji()`** - Creates emoji nodes (if implemented)
3. **`handleDuplicateEntity()`** - Duplicates existing nodes with smart positioning

### New Index File: `products/app/src/utils/index.ts`
Created to export all utility functions including the new node positioning utilities.

## How It Works

### Algorithm Overview
1. **Preferred Position**: Start with the user's intended position (viewport center or click location)
2. **Overlap Check**: Check if the preferred position would cause overlap with existing nodes
3. **Alternative Search**: If overlap detected, search in expanding spirals around the preferred position
4. **Grid-based Search**: Use configurable grid size (default 20px) for systematic position testing
5. **Fallback Strategy**: If no position found within search radius, place to the right of all existing nodes

### Configuration Options
The `findNonOverlappingPosition` function accepts options:
- `maxAttempts`: Maximum random attempts (default: 50)
- `searchRadius`: How far to search around preferred position (default: 300px)
- `gridSize`: Grid spacing for systematic search (default: 20px)

### Node Types Supported
- **HTML Nodes**: Uses actual width/height dimensions, defaults to 200x200px
- **Emoji Nodes**: Fixed 50x50px dimensions
- **Parent-Child Relationships**: Emoji nodes with parent HTML nodes are positioned relative to their parent

## Key Features

1. **Smart Positioning**: Tries to place nodes as close as possible to the user's intended position
2. **Collision Detection**: Accurately detects overlaps using rectangular bounding box math
3. **Performance Optimized**: Only checks relevant node types (ignores connection entities)
4. **Configurable**: Adjustable search parameters for different use cases
5. **Fallback Safe**: Always finds a position, even if it means placing nodes further away

## Usage
The overlap prevention is now automatically applied to all node creation methods in both views:

**Spatial View:**
- Clicking the "Add" button
- Right-clicking and selecting "Create Node"
- Right-clicking and selecting "Create Emoji"
- Duplicating nodes via the dropdown menu

**Collect View:**
- Clicking the "Add" button to create HTML nodes
- Duplicating nodes via the "Duplicate" button

No user interface changes are needed - the system works transparently in the background to ensure a clean, organized layout in both spatial and collect views.

## Testing
The development server is running on http://localhost:8080 and the functionality can be tested by:
1. Creating multiple nodes and observing they don't overlap
2. Right-clicking to create nodes and seeing they intelligently avoid existing nodes
3. Testing with different viewport positions and zoom levels

## Technical Notes
- Uses TypeScript type assertions to handle discriminated union narrowing issues
- Integrates seamlessly with existing YJS collaborative editing system
- Maintains compatibility with existing Vue 3 + Vue Flow architecture
- Handles both standalone and parent-child entity relationships