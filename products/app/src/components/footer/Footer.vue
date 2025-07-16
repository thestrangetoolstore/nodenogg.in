<script setup lang="ts">
const version = import.meta.env.VITE_APP_VERSION;
</script>

<template>
    <footer >
        <div class="footer-info">
            <p>Made by the University of Southampton, Winchester School of Art.</p>
        <p>v{{ version }}</p>
        </div>
    </footer>
</template>

<style scoped>

</style>