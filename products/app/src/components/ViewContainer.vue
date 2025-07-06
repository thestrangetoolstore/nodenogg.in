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
</style>
