<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApp } from '@/state'
import { MicrocosmSchema } from '@nodenogg.in/schema'
import { getTimeSince } from '@figureland/kit/tools/time'

const app = useApp()

// View mode: 'grid' or 'list'
const viewMode = ref<'grid' | 'list'>('grid')

// Sort mode: 'name' or 'lastAccessed'
const sortMode = ref<'name' | 'lastAccessed'>('lastAccessed')

// Load preferences from localStorage
onMounted(() => {
  const savedViewMode = localStorage.getItem('microcosm-view-mode')
  const savedSortMode = localStorage.getItem('microcosm-sort-mode')
  
  if (savedViewMode === 'list' || savedViewMode === 'grid') {
    viewMode.value = savedViewMode
  }
  
  if (savedSortMode === 'name' || savedSortMode === 'lastAccessed') {
    sortMode.value = savedSortMode
  }
})

// Save preferences to localStorage
const setViewMode = (mode: 'grid' | 'list') => {
  viewMode.value = mode
  localStorage.setItem('microcosm-view-mode', mode)
}

const setSortMode = (mode: 'name' | 'lastAccessed') => {
  sortMode.value = mode
  localStorage.setItem('microcosm-sort-mode', mode)
}

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
    <!-- Controls -->
    <div class="controls">
      <div class="view-toggle">
        <button 
          @click="setViewMode('grid')" 
          :class="{ active: viewMode === 'grid' }"
          class="toggle-button"
          title="Grid view"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="1" width="5" height="5" />
            <rect x="9" y="1" width="5" height="5" />
            <rect x="1" y="9" width="5" height="5" />
            <rect x="9" y="9" width="5" height="5" />
          </svg>
        </button>
        <button 
          @click="setViewMode('list')" 
          :class="{ active: viewMode === 'list' }"
          class="toggle-button"
          title="List view"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="2" width="14" height="2" />
            <rect x="1" y="7" width="14" height="2" />
            <rect x="1" y="12" width="14" height="2" />
          </svg>
        </button>
      </div>
      
      <div class="sort-control">
        <label for="sort-select">Sort by:</label>
        <select 
          id="sort-select"
          :value="sortMode" 
          @change="setSortMode(($event.target as HTMLSelectElement).value as 'name' | 'lastAccessed')"
          class="sort-select"
        >
          <option value="lastAccessed">Last accessed</option>
          <option value="name">Name</option>
        </select>
      </div>
    </div>

    <!-- Grid view -->
    <div v-if="viewMode === 'grid'" class="microcosm-grid">
      <router-link 
        v-for="microcosm of sortedMicrocosms" 
        :key="microcosm.id"
        :class="{ link: true, ui: true, 'microcosm-card': true }" 
        :to="{
          name: 'microcosm',
          params: {
            microcosm_id: microcosm.id
          }
        }"
      >
        <span class="microcosm-name">{{ MicrocosmSchema.utils.parseMicrocosmID(microcosm.id) }}</span>
        <span class="microcosm-time">{{ getTimeSince(microcosm.lastAccessed) }}</span>
      </router-link>
    </div>

    <!-- List view -->
    <div v-else class="microcosm-list-view">
      <router-link 
        v-for="microcosm of sortedMicrocosms" 
        :key="microcosm.id"
        :class="{ link: true, ui: true, 'microcosm-list-item': true }" 
        :to="{
          name: 'microcosm',
          params: {
            microcosm_id: microcosm.id
          }
        }"
      >
        <span class="microcosm-name">{{ MicrocosmSchema.utils.parseMicrocosmID(microcosm.id) }}</span>
        <span class="microcosm-time">{{ getTimeSince(microcosm.lastAccessed) }}</span>
      </router-link>
    </div>
  </main>
</template>

<style scoped>
.homepage {
  padding: 4rem 1rem 1rem 1rem;
  width: 100%;
  height: auto;
}

/* Controls */
.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.view-toggle {
  display: flex;
  gap: 0.25rem;
  background: var(--ui-95);
  border-radius: var(--ui-radius);
  padding: 0.25rem;
}

.toggle-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border: none;
  background: transparent;
  color: var(--ui-40);
  cursor: pointer;
  border-radius: calc(var(--ui-radius) - 2px);
  transition: all 0.2s ease;
}

.toggle-button:hover {
  color: var(--ui-20);
}

.toggle-button.active {
  background: var(--ui-100);
  color: var(--ui-primary-100);
  box-shadow: var(--ui-container-shadow);
}

.sort-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-control label {
  font-size: 0.875rem;
  color: var(--ui-40);
}

.sort-select {
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  border: 1px solid var(--ui-80);
  border-radius: var(--ui-radius);
  background: var(--ui-100);
  color: var(--ui-0);
  font-size: 0.875rem;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.sort-select:hover {
  border-color: var(--ui-60);
}

.sort-select:focus {
  outline: none;
  border-color: var(--ui-primary-100);
}

/* Grid view */
.microcosm-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: flex-start;
  align-content: flex-start;
}

.microcosm-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid var(--ui-80);
  border-radius: var(--ui-radius);
  padding: 1.5rem;
  width: 100%;
  max-width: 300px;
  min-height: 120px;
  color: inherit;
  text-decoration: none;
  transition: all 0.2s ease;
}

.microcosm-card:hover {
  background-color: var(--ui-95);
  border-color: var(--ui-60);
  transform: translateY(-2px);
  box-shadow: var(--ui-container-shadow);
}

.microcosm-card:focus {
  outline: 2px solid var(--ui-primary-100);
  outline-offset: 2px;
}

/* List view */
.microcosm-list-view {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 800px;
}

.microcosm-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border: 1px solid var(--ui-90);
  border-radius: var(--ui-radius);
  color: inherit;
  text-decoration: none;
  transition: all 0.2s ease;
}

.microcosm-list-item:hover {
  background-color: var(--ui-95);
  border-color: var(--ui-70);
  transform: translateX(4px);
}

.microcosm-list-item:focus {
  outline: 2px solid var(--ui-primary-100);
  outline-offset: 2px;
}

/* Shared styles */
.microcosm-name {
  font-weight: 500;
  font-size: 1rem;
  word-break: break-all;
}

.microcosm-time {
  font-size: 0.875rem;
  color: var(--ui-40);
  margin-top: 0.25rem;
}

.microcosm-list-item .microcosm-time {
  margin-top: 0;
}
</style>