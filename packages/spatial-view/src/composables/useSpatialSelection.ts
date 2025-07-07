import { ref, computed } from 'vue'

// Global state for spatial view selection
const selectedNodeId = ref<string | null>(null)
const editingNodeId = ref<string | null>(null)

export function useSpatialSelection() {
  // Computed properties
  const isNodeSelected = computed(() => (nodeId: string) => selectedNodeId.value === nodeId)
  const isNodeEditing = computed(() => (nodeId: string) => editingNodeId.value === nodeId)
  const hasSelection = computed(() => selectedNodeId.value !== null)
  const isEditing = computed(() => editingNodeId.value !== null)

  // Actions
  const selectNode = (nodeId: string | null) => {
    selectedNodeId.value = nodeId
    // If deselecting, also stop editing
    if (!nodeId) {
      editingNodeId.value = null
    }
  }

  const startEditing = (nodeId: string) => {
    selectedNodeId.value = nodeId
    editingNodeId.value = nodeId
  }

  const stopEditing = () => {
    editingNodeId.value = null
  }

  const clearSelection = () => {
    selectedNodeId.value = null
    editingNodeId.value = null
  }

  return {
    // State
    selectedNodeId,
    editingNodeId,
    
    // Computed
    isNodeSelected,
    isNodeEditing,
    hasSelection,
    isEditing,
    
    // Actions
    selectNode,
    startEditing,
    stopEditing,
    clearSelection
  }
}