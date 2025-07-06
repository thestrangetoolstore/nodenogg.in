<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
    ToolbarRoot,
    ToolbarButton,
    ToolbarSeparator,
    ToolbarToggleGroup,
    ToolbarToggleItem,
    ToolbarLink
} from 'reka-ui'
import { useApp, useCurrentMicrocosm, useAppRouter } from '@/state';
import { clamp } from '@figureland/kit/math/number';
import Icon from '@/components/icon/Icon.vue';
import { type ViewType, viewRegistry } from '@/views';

const microcosm = useCurrentMicrocosm()
const router = useRouter()
const route = useRoute()
const appRouter = useAppRouter()

// Switch to a different view
const switchView = (viewType: string) => {
    if (!viewType) return
    
    router.push({
        path: route.path,
        query: {
            ...route.query,
            view: viewType
        }
    })
}

// Get current view type
const currentViewType = computed({
    get: () => appRouter.value.viewType as string,
    set: (value: string) => switchView(value)
})

// Capitalize first letter of view name for display
const formatViewName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1)
}


</script>

<template>
    <ToolbarRoot class="floating-toolbar" v-if="!!microcosm">
        <!-- View switcher toggle group -->
        <ToolbarToggleGroup 
            type="single" 
            v-model="currentViewType"
            class="view-switcher">
            <ToolbarToggleItem v-for="(_, viewType) in viewRegistry" :key="viewType" :value="viewType"
                class="toolbar-toggle-item" :title="`Switch to ${formatViewName(viewType)} view`">
                <Icon :type="viewType === 'collect' ? 'list' : 'grid'" />
                <span>{{ formatViewName(viewType) }}</span>
            </ToolbarToggleItem>
        </ToolbarToggleGroup>

        <!-- Separator -->
        <ToolbarSeparator class="toolbar-separator" />

        <!-- Additional toolbar actions -->
        <div class="toolbar-actions">
        </div>
    </ToolbarRoot>
</template>

<style scoped>
/* Floating toolbar styles */
.floating-toolbar {
    position: fixed;
    bottom: var(--size-24);
    left: 50%;
    transform: translateX(-50%);
    z-index: 300;
    display: flex;
    align-items: center;
    gap: var(--size-8);
    padding: var(--size-6);
    background: var(--ui-95);
    border: 1px solid var(--ui-80);
    border-radius: var(--ui-radius);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: var(--size-16);
}

@media (prefers-color-scheme: dark) {
    .floating-toolbar {
        background: var(--ui-90);
        border-color: var(--ui-70);
    }
}

/* View switcher toggle group */
.view-switcher {
    display: flex;
    gap: var(--size-2);
    background: var(--ui-100);
    padding: var(--size-2);
    border-radius: calc(var(--ui-radius) - 2px);
}

/* Toolbar toggle items */
.toolbar-toggle-item {
    display: flex;
    align-items: center;
    gap: var(--size-6);
    padding: var(--size-6) var(--size-12);
    border: none;
    background: transparent;
    color: var(--ui-40);
    font-size: 0.875rem;
    font-weight: 500;
    border-radius: calc(var(--ui-radius) - 4px);
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
}

.toolbar-toggle-item:hover {
    background: var(--ui-95);
    color: var(--ui-20);
}

.toolbar-toggle-item[data-state="on"] {
    background: var(--ui-primary-100);
    color: var(--ui-100);
}

.toolbar-toggle-item[data-state="on"]:hover {
    background: var(--ui-primary-90);
}

/* Toolbar separator */
.toolbar-separator {
    width: 1px;
    height: 20px;
    background: var(--ui-80);
    margin: 0 var(--size-4);
}

/* Toolbar actions */
.toolbar-actions {
    display: flex;
    align-items: center;
    gap: var(--size-12);
}

/* Connection status */
.connection-status {
    display: flex;
    align-items: center;
    gap: var(--size-6);
    padding: var(--size-6) var(--size-12);
    background: var(--ui-100);
    border-radius: calc(var(--ui-radius) - 2px);
    cursor: default;
}

.status-dot {
    width: var(--size-6);
    height: var(--size-6);
    border-radius: 50%;
    background: var(--ui-50);
    transition: background 0.3s ease;
}

.status-dot.connected {
    background: var(--ui-green);
    box-shadow: 0 0 0 2px rgba(var(--ui-green-rgb), 0.2);
}

.status-text {
    font-size: 0.75rem;
    color: var(--ui-40);
    font-weight: 500;
}
</style>
