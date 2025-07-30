<script setup lang="ts">
const version = import.meta.env.VITE_APP_VERSION;
</script>

<template>
    <footer>
        <div class="footer-info">
            <p>Made by the University of Southampton, Winchester School of Art <span>v{{ version }}</span></p>

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
    background-color: var(--ui-80);
    padding: var(--size-2) var(--size-4);
    border-radius: var(--ui-radius);
}

p {
    font-size: 0.9em;
}

@media (max-width: 768px) {
    .footer-info {
        left: var(--size-4);
        bottom: var(--size-4);
        width: calc(100% - var(--size-8));
        max-width: 260px;
    }
}
</style>