<script setup lang="ts">
import { watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { TooltipProvider } from 'reka-ui'
import AppMenu from '@/components/menu/AppMenu.vue'
import Footer from '@/components/footer/Footer.vue'
import { useApp } from './state'
import { client } from './state'

const app = useApp()
const route = useRoute()

// Clear active microcosm when navigating away from microcosm routes
watch(() => route.name, (routeName) => {
  if (routeName !== 'microcosm' && client.active.get()) {
    // Clear the active microcosm by setting it to undefined
    client.active.set(undefined)
  }
})
</script>

<template>
  <TooltipProvider>
    <AppMenu v-if="app.state.showUI" />
    <Suspense>
      <RouterView />
    </Suspense>
      <Footer></Footer>
  </TooltipProvider>
</template>

<style scoped>
@media (max-width: 768px) {
  :deep(.homepage) {
    height: 100vh;
    overflow-y: hidden;
    display: flex;
    flex-direction: column;
  }
  
  :deep(.microcosm-grid) {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    gap: var(--size-8);
    padding-bottom: var(--size-4);
    -webkit-overflow-scrolling: touch;
    flex: 1;
    max-height: calc(100vh - 180px);
  }
  
  :deep(.microcosm-grid .microcosm-card) {
    flex: none;
    width: 100%;
    max-width: none;
    min-width: auto;
  }
  
  :deep(.microcosm-grid)::-webkit-scrollbar {
    width: 8px;
  }
  
  :deep(.microcosm-grid)::-webkit-scrollbar-track {
    background: var(--ui-80);
    border-radius: 4px;
  }
  
  :deep(.microcosm-grid)::-webkit-scrollbar-thumb {
    background: var(--ui-40);
    border-radius: 4px;
  }
  
  :deep(.microcosm-grid)::-webkit-scrollbar-thumb:hover {
    background: var(--ui-30);
  }
  

}

</style>
