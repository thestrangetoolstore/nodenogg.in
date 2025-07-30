<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <div class="empty-state">
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
    <slot name="action" />
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-top: 10vh;
  max-width: 400px;
  gap: var(--size-8);
}

.empty-state h2 {
  color: var(--ui-20);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.empty-state p {
  max-width: 300px;
  color: var(--ui-40);
  margin: 0;
}
</style>