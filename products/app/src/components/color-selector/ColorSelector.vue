<script setup lang="ts">
import { cardColors, getColor } from '@/utils/color'
import { ToggleGroupItem, ToggleGroupRoot, type AcceptableValue } from 'reka-ui'
import { type PropType } from 'vue'


const props = defineProps({
  onUpdate: {
    type: Function as PropType<(color: string) => void>,
    required: true
  },
  value: {
    type: String
  }
})

const handleUpdate = (color: AcceptableValue | AcceptableValue[]) =>
  props.onUpdate(String(Array.isArray(color) ? color[0] : color))

</script>

<template>
  <div>
    <ToggleGroupRoot :model-value="value" @update:modelValue="handleUpdate" class="ui toggle-group">
      <ToggleGroupItem v-for="color in cardColors" :value="color" :aria-label="`Change color to ${color}`"
        class="toggle-group-item" v-bind:key="`color${color}`" :style="`background-color: ${getColor(color)};`">
      </ToggleGroupItem>
    </ToggleGroupRoot>
  </div>
</template>

<style scoped>
button {
  all: unset;
}

.toggle-group {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  /* padding: var(--size-8) var(--size-8); */
  overflow-x: scroll;
  width: 100%;
  color: var(--ui-0);
  justify-content: flex-start;
  border-radius: var(--ui-radius);
}


.toggle-group-item {
  flex-shrink: 0;
  cursor: pointer;
  margin: var(--size-2);
  height: var(--size-24);
  width: var(--size-24);
  border-radius: var(--size-24);
  box-shadow: var(--ui-shadow-25);
  line-height: 1;
  align-items: center;
  justify-content: center;
  transform: scale(0.75);
  position: relative;
}

.toggle-group-item[data-state='on'] {
  transform: scale(1);
  box-shadow: var(--ui-shadow-100);
}

.toggle-group-item:focus {
  box-shadow: var(--ui-shadow-100);
}
</style>
