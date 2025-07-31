import { ref, computed } from 'vue'

// Global state for spatial view editing (only editing, not selection)
const editingNodeId = ref<string | null>(null)

export function useSpatialSelection() {
  // Computed properties
  const isNodeEditing = computed(() => (nodeId: string) => editingNodeId.value === nodeId)
  const isEditing = computed(() => editingNodeId.value !== null)

  // Actions
  const startEditing = (nodeId: string) => {
    editingNodeId.value = nodeId
  }

  const stopEditing = () => {
    editingNodeId.value = null
  }

  return {
    // State
    editingNodeId,
    
    // Computed
    isNodeEditing,
    isEditing,
    
    // Actions
    startEditing,
    stopEditing
  }
}