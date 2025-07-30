<script setup lang="ts">
const version = import.meta.env.VITE_APP_VERSION;
</script>

<template>
    <footer>
        <div class="footer-info">
            <p>Made by the University of Southampton, Winchester School of Art </p>
            <span>v{{ version }}</span>
        </div>
    </footer>
</template>

<style scoped>
.footer-info {
    position: fixed;
    left: var(--size-24);
    bottom: var(--size-24);
    pointer-events: none;
    color: var(--ui-30);
}

p {
    font-size: 0.9em;
}
</style>