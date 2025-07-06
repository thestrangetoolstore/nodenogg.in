<script setup lang="ts">
import { RouterView } from 'vue-router'
import { TooltipProvider } from 'reka-ui'
import AppMenu from '@/components/menu/AppMenu.vue'
import { useApp } from './state';
const app = useApp()
</script>

<template>
  <TooltipProvider>
    <AppMenu v-if="app.state.showUI" />
    <div class="view-container">
      <Suspense>
        <RouterView />
      </Suspense>
    </div>
  </TooltipProvider>
</template>

<style scoped>
.view-container {
  width: 100%;
  height: 100%;
  padding: var(--size-16);
}
</style>