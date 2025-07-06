<script setup lang="ts">
withDefaults(defineProps<{
    outline?: boolean
    background?: boolean
}>(), {
    outline: true,
    background: false,
})
</script>

<template>
    <section :class="{
        container: true,
        outline,
        background
    }">
        <slot></slot>
        
        <!-- Floating Actions Toolbar -->
        <div v-if="$slots.actions" class="floating-actions-toolbar">
            <slot name="actions"></slot>
        </div>
    </section>
</template>

<style scoped>
.container {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: var(--size-8);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.outline {
    box-shadow: 0 0 0 1px hsla(var(--mono-base-hue), 8%, 90%, 0.07);
}

.background {
    background: hsla(var(--mono-base-hue), 8%, 90%, 0.03);
}

/* Floating Actions Toolbar */
.floating-actions-toolbar {
    position: fixed;
    bottom: var(--size-24);
    left: 50%;
    transform: translateX(-50%);
    z-index: 300;
    display: flex;
    align-items: center;
    gap: var(--size-8);
    padding: var(--size-12);
    background: var(--ui-95);
    border: 1px solid var(--ui-80);
    border-radius: var(--ui-radius);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@media (prefers-color-scheme: dark) {
    .floating-actions-toolbar {
        background: var(--ui-90);
        border-color: var(--ui-70);
    }
}
</style>
