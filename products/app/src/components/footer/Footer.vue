<script setup lang="ts">
import { COPY } from '@/constants/copy'

const version = import.meta.env.VITE_APP_VERSION;
</script>

<template>
    <footer>
        <div class="footer-info">
            <p>{{ COPY.footer.madeBy }} <span>v{{ version }}</span></p>

        </div>
    </footer>
</template>

<style scoped>
.footer-info {
    position: fixed;
    left: var(--size-16);
    bottom: var(--size-16);
    pointer-events: none;
    color: var(--ui-30);
    background-color: var(--ui-90);
    padding: var(--size-2) var(--size-4);
    border-radius: var(--ui-radius);
    white-space: nowrap;

}

p {
    font-size: 0.9em;
}

@media (max-width: 768px) {
    .footer-info {
        left: 0;
        bottom: 0;
        box-shadow: var(--ui-shadow-10);
        padding: var(--size-4) var(--size-8);
        font-size: 0.5em;
    }
}
</style>