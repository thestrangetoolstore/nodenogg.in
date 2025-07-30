<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  count: number
}>()

const shouldAnimate = ref(false)
const previousCount = ref(props.count)

// Watch for count changes and trigger animation when someone joins
watch(() => props.count, (newCount, oldCount) => {
  // Only animate when count increases and goes above 1
  if (newCount > oldCount && newCount > 1) {
    shouldAnimate.value = true
    // Reset animation flag after animation completes
    setTimeout(() => {
      shouldAnimate.value = false
    }, 600) // Match animation duration
  }
  previousCount.value = newCount
})

const shouldShow = computed(() => props.count > 1)
</script>

<template>
  <span v-if="shouldShow" class="identity-count" :class="{ 'animate-join': shouldAnimate }">
    {{ count - 1 }}
  </span>
</template>

<style scoped>
.identity-count {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--size-8);
  width: var(--size-16);
  height: var(--size-16);
  font-weight: 500;
  background-color: var(--ui-0);
  color: var(--ui-mono-0);
  margin-left: 0.2em;
  font-size: 0.7rem;
  text-align: center;
  transition: all 0.2s ease;
}

.identity-count.animate-join {
  animation: joinBounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes joinBounce {
  0% {
    transform: scale(1) translateY(0);
  }

  50% {
    transform: scale(1.05) translateY(-4px);
  }

  100% {
    transform: scale(1) translateY(0);
  }
}
</style>