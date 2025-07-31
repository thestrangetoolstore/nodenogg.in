<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApp } from '@/state'
import Select from '@/components/select/Select.vue'
import SelectItem from '@/components/select/SelectItem.vue'
import MicrocosmCard from '@/components/MicrocosmCard.vue'

const app = useApp()

// Sort mode: 'name' or 'lastAccessed'
const sortMode = ref<'name' | 'lastAccessed'>('lastAccessed')

// Load preferences from localStorage
onMounted(() => {
  const savedSortMode = localStorage.getItem('microcosm-sort-mode')

  if (savedSortMode === 'name' || savedSortMode === 'lastAccessed') {
    sortMode.value = savedSortMode
  }
})

// Watch for sort mode changes to save to localStorage
import { watch } from 'vue'
watch(sortMode, (newMode) => {
  localStorage.setItem('microcosm-sort-mode', newMode)
})

// Sorted microcosms
const sortedMicrocosms = computed(() => {
  const microcosms = [...app.microcosms]

  if (sortMode.value === 'name') {
    return microcosms.sort((a, b) => a.id.localeCompare(b.id))
  } else {
    return microcosms.sort((a, b) => b.lastAccessed - a.lastAccessed)
  }
})
</script>

<template>
  <main class="homepage">
    <!-- Grid view -->
    <div class="microcosm-grid">
      <!-- Create New Card -->
      <div class="create-new-card">
        <span class="create-new-text">Create new microcosm</span>
      </div>

      <MicrocosmCard v-for="microcosm of sortedMicrocosms" :key="microcosm.id" :microcosm="microcosm" />
    </div>
  </main>
</template>

<style scoped>
.homepage {
  padding: var(--size-4) var(--size-4) var(--size-8) var(--size-4);
  width: 100%;
  height: auto;
}

/* Grid view */
.microcosm-grid {
  padding: var(--size-8);
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--size-8);
  width: 100%;
}

/* Create New Card */
.create-new-card {
  border: 1px dashed var(--ui-70);
  border-radius: var(--size-4);
  padding: var(--size-16);
  min-height: 140px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
  padding: var(--size-16);
  min-height: 140px;
  color: var(--ui-50);
}

.create-new-card:hover {
  border-color: var(--ui-primary-100);
  background: var(--ui-95);
}

.create-new-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--size-8);
  color: var(--ui-40);
  transition: color 0.2s ease;
}

.create-new-card:hover .create-new-content {
  color: var(--ui-primary-100);
}

.create-new-text {
  font-weight: 500;
  font-size: 1rem;
}

@media (prefers-color-scheme: dark) {
  .create-new-card {
    border-color: var(--ui-60);
  }

  .create-new-card:hover {
    background: var(--ui-85);
  }
}
</style>