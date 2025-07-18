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
.footer-info{
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  text-align: center;
  padding: 10px;
  height: 80px; /* fixed height */
  line-height: 50px; /* vertically centers text */
}
</style>