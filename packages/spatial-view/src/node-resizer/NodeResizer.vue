<script lang="ts" setup>
import { computed, inject, toRef, watch } from 'vue'
import type { NodeDimensionChange } from '@vue-flow/core'
import { NodeIdInjection, useVueFlow } from '@vue-flow/core'
import ResizeControl from './ResizeControl.vue'
import type { ControlLinePosition, ControlPosition, NodeResizerEmits, NodeResizerProps } from './types'
import { ResizeControlVariant } from './types'

const props = withDefaults(defineProps<NodeResizerProps>(), {
  isVisible: true,
})

const emits = defineEmits<NodeResizerEmits>()

const { findNode, emits: triggerEmits } = useVueFlow()

const handleControls: ControlPosition[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right']

const lineControls: ControlLinePosition[] = ['top', 'right', 'bottom', 'left']

const contextNodeId = inject(NodeIdInjection, null)

const nodeId = toRef(() => (typeof props.nodeId === 'string' ? props.nodeId : contextNodeId))

const node = computed(() => findNode(nodeId.value))

let isFirstRun = true

watch(
  [
    () => props.minWidth,
    () => props.minHeight,
    () => props.maxWidth,
    () => props.maxHeight,
    () => !!node.value?.dimensions.width && !!node.value.dimensions.height,
  ],
  ([minWidth, minHeight, maxWidth, maxHeight, isInitialized]) => {
    const n = node.value

    if (n && isInitialized) {
      // Skip the first run to avoid firing resize events on mount
      if (isFirstRun) {
        isFirstRun = false
        return
      }

      const dimensionChange: NodeDimensionChange = {
        id: n.id,
        type: 'dimensions',
        updateStyle: true,
        dimensions: {
          width: n.dimensions.width,
          height: n.dimensions.height,
        },
      }

      if (minWidth && n.dimensions.width < minWidth) {
        dimensionChange.dimensions!.width = minWidth
      }

      if (minHeight && n.dimensions.height < minHeight) {
        dimensionChange.dimensions!.height = minHeight
      }

      if (maxWidth && n.dimensions.width > maxWidth) {
        dimensionChange.dimensions!.width = maxWidth
      }

      if (maxHeight && n.dimensions.height > maxHeight) {
        dimensionChange.dimensions!.height = maxHeight
      }

      if (
        dimensionChange.dimensions!.width !== n.dimensions.width ||
        dimensionChange.dimensions!.height !== n.dimensions.height
      ) {
        triggerEmits.nodesChange([dimensionChange])
      }
    }
  },
  { flush: 'post', immediate: true },
)
</script>

<script lang="ts">
export default {
  name: 'NodeResizer',
  compatConfig: { MODE: 3 },
  inheritAttrs: false,
}
</script>

<template>
  <template v-if="isVisible">
    <ResizeControl
      v-for="c of lineControls"
      :key="c"
      :class="lineClassName"
      :style="lineStyle"
      :node-id="nodeId"
      :position="c"
      :variant="ResizeControlVariant.Line"
      :keep-aspect-ratio="keepAspectRatio"
      :color="color"
      :min-width="minWidth"
      :min-height="minHeight"
      :max-width="maxWidth"
      :max-height="maxHeight"
      :should-resize="shouldResize"
      @resize-start="emits('resizeStart', $event)"
      @resize="emits('resize', $event)"
      @resize-end="emits('resizeEnd', $event)"
    />

    <ResizeControl
      v-for="c of handleControls"
      :key="c"
      :class="handleClassName"
      :style="handleStyle"
      :node-id="nodeId"
      :position="c"
      :color="color"
      :min-width="minWidth"
      :min-height="minHeight"
      :max-width="maxWidth"
      :max-height="maxHeight"
      :should-resize="shouldResize"
      :keep-aspect-ratio="keepAspectRatio"
      @resize-start="emits('resizeStart', $event)"
      @resize="emits('resize', $event)"
      @resize-end="emits('resizeEnd', $event)"
    />
  </template>
</template>

<style>
.vue-flow__resize-control {
  position: absolute;
}

.vue-flow__resize-control.left,
.vue-flow__resize-control.right {
  cursor: ew-resize;
}

.vue-flow__resize-control.top,
.vue-flow__resize-control.bottom {
  cursor: ns-resize;
}

.vue-flow__resize-control.top.left,
.vue-flow__resize-control.bottom.right {
  cursor: nwse-resize;
}

.vue-flow__resize-control.bottom.left,
.vue-flow__resize-control.top.right {
  cursor: nesw-resize;
}

/* handle styles */
.vue-flow__resize-control.handle {
  width: var(--size-8);
  height: var(--size-8);
  /* border: 1px solid var(--ui-90); */
  /* border-radius: 1px; */
  background-color: var(--ui-primary-100);
  transform: translate(-50%, -50%) scale(calc(1 / var(--zoom-value)));
  z-index: 1;
}

.vue-flow__resize-control.handle.left {
  /* outline: 5px solid green; */
  top: 50%;
}
.vue-flow__resize-control.handle.right {
  left: 100%;
  top: 50%;
}
.vue-flow__resize-control.handle.top {
  left: 50%;
  top: 0;
}
.vue-flow__resize-control.handle.bottom {
  left: 50%;
  top: 100%;
}
.vue-flow__resize-control.handle.top.left {
  left: 0;
}
.vue-flow__resize-control.handle.bottom.left {
  left: 0;
}
.vue-flow__resize-control.handle.top.right {
  left: 100%;
}
.vue-flow__resize-control.handle.bottom.right {
  left: 100%;
}

/* line styles */
.vue-flow__resize-control.line {
  border-color: var(--ui-primary-100);
  border-width: calc(2px / var(--zoom-value));
  border-style: solid;
}

.vue-flow__resize-control.line.left,
.vue-flow__resize-control.line.right {
  width: 1px;
  transform: translate(-50%, 0);
  top: 0;
  height: 100%;
}

.vue-flow__resize-control.line.left {
  left: 0;
  border-left-width: 1px;
}
.vue-flow__resize-control.line.right {
  left: 100%;
  border-right-width: 1px;
}

.vue-flow__resize-control.line.top,
.vue-flow__resize-control.line.bottom {
  height: 1px;
  transform: translate(0, -50%);
  left: 0;
  width: 100%;
}

.vue-flow__resize-control.line.top {
  top: 0;
  border-top-width: 1px;
}
.vue-flow__resize-control.line.bottom {
  border-bottom-width: 1px;
  top: 100%;
}
</style>