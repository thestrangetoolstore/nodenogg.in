<script setup lang="ts">
import { watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { TooltipProvider } from 'reka-ui'
import AppMenu from '@/components/menu/AppMenu.vue'
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
  </TooltipProvider>
</template>
