<template>
  <div class="custom-footer">
    <p>{{ copyright }}</p>
  </div>
</template>

<script setup>
defineProps({
  copyright: {
    type: String,
    default: "© 2024 University of Southampton. All rights reserved."
  }
})
</script>

<style scoped>
.custom-footer {
  margin-top: 2rem;
  padding: 1rem 0;
  border-top: 1px solid var(--vp-c-border);
  text-align: center;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}
</style>