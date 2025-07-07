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

@media (max-width: 768px) {
    .container {
        padding: var(--size-8);
        border-radius: 0;
    }
}


.outline {
    box-shadow: var(--ui-shadow-10);
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
    /* background: var(--ui-95);
    border-radius: var(--size-64); */
}


@media (prefers-color-scheme: dark) {
    .floating-actions-toolbar {
        /* background: var(--ui-90);
        border-color: var(--ui-70); */
    }
}
</style>
