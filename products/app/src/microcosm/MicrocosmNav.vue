<script setup lang="ts">
import { useCurrentMicrocosm } from '@/state';

const microcosm = useCurrentMicrocosm()
</script>

<template>
    <!-- MicrocosmNav is now simplified - view switcher moved to AppMenu breadcrumbs -->
    <!-- This component can be used for other microcosm-specific actions if needed -->
    <div v-if="!!microcosm" class="microcosm-nav-placeholder">
        <!-- Placeholder for future microcosm-specific UI elements -->
    </div>
</template>

<style scoped>
.microcosm-nav-placeholder {
    /* Placeholder for future styling if needed */
}
</style>
