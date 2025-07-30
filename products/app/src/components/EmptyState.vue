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
  color: var(--ui-40);
  font-size: 1rem;
  margin: 0;
}

.button-style {
  display: inline-flex;
  align-items: center;
  background: var(--ui-100);
  border-radius: var(--size-24);
  box-shadow: var(--ui-shadow-10);
  color: var(--ui-30);
  padding: var(--size-4) var(--size-12);
  white-space: nowrap;
  border: none;
}

@media (prefers-color-scheme: dark) {
  .button-style {
    background: var(--ui-90);
    color: var(--ui-20);
  }
}
</style>