<script setup lang="ts">
import { watch, ref } from 'vue'
import {
    DropdownMenuRoot,
    DropdownMenuTrigger,
    DropdownMenuPortal,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator
} from 'reka-ui'
import Editor from '@/components/editor/Editor.vue'
import Icon from '@/components/icon/Icon.vue'
import { EntitySchema, type Entity } from '@nodenogg.in/schema'
import ColorSelector from '@/components/color-selector/ColorSelector.vue'

const props = defineProps<{
    onChange: (html: string) => void
    onDelete: () => void
    onDuplicate: () => void
    entity: Entity
    isEditing: boolean
}>()

const emit = defineEmits(['startEditing', 'stopEditing'])

// Handle when editor should activate
const onStartEditing = () => {
    emit('startEditing')
}

// Handle when editor loses focus
const onStopEditing = () => {
    emit('stopEditing')
}

// Handle keyboard events
const handleKeydown = (event: KeyboardEvent) => {
    // Handle Space or Enter key to enter edit mode
    // if (event.key === 'Enter' || event.key === ' ') {
    //     event.preventDefault()
    //     onStartEditing()
    // }
}

// Watch for changes in isEditing prop
watch(() => props.isEditing, (newValue) => {
    if (!newValue) {
        // Handle cleanup when editing stops
    }
})

const { isType } = EntitySchema.utils

</script>

<template>
    <div class="node" v-if="isType(entity, 'html')" :class="{ 'is-editing': isEditing }" tabindex="0">
        <Editor :value="entity.data.content" :onChange="onChange" :editable="isEditing" @click="onStartEditing"
            @cancel="onStopEditing" />
        <DropdownMenuRoot :modal="true">
            <DropdownMenuTrigger class="node-menu-trigger">
                <Icon type="ellipsis" />
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
                <DropdownMenuContent class="dropdown-menu-content" :side-offset="5" :align="'end'">
                    <DropdownMenuItem class="dropdown-menu-item">
                        <ColorSelector />
                    </DropdownMenuItem>
                    <DropdownMenuSeparator class="dropdown-menu-separator" />
                    <DropdownMenuItem class="dropdown-menu-item" @click="onDuplicate">
                        Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem class="dropdown-menu-item" @click="onDelete">
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenuPortal>
        </DropdownMenuRoot>
    </div>
</template>

<style scoped>
.node {
    position: relative;
    width: 100%;
    max-width: calc(256 * var(--size-2));
    min-height: calc(var(--size-2) * 100);
    background: var(--card-yellow-50);
    color: var(--ui-0);
    border-radius: var(--ui-radius);
    display: inline-block;
    transition: border-color 0.2s ease, outline 0.2s ease;
    outline: none;
}

.node:focus {
    outline: 2px solid var(--ui-primary-100);
    outline-offset: 2px;
}

.node.is-editing {
    box-shadow: 0 0 8px rgba(var(--ui-primary-rgb), 0.5);
}

/* Dropdown menu styles matching ContextMenu */
:deep(.dropdown-menu-content) {
    z-index: 500;
    min-width: 180px;
    max-width: 220px;
    border-radius: var(--ui-radius);
    overflow: hidden;
    background: var(--ui-95);
    box-shadow: var(--ui-container-shadow);
    padding: var(--size-2);
}

@media (prefers-color-scheme: dark) {
    :deep(.dropdown-menu-content) {
        background: var(--ui-95);
    }
}

/* Dropdown menu item styles matching ContextMenuItem */
.dropdown-menu-item {
    border-radius: var(--ui-radius);
    display: flex;
    align-items: center;
    padding: var(--size-8);
    position: relative;
    user-select: none;
    outline: none;
    color: var(--ui-0);
    cursor: pointer;
}

.dropdown-menu-item[data-disabled] {
    color: var(--ui-50);
    cursor: not-allowed;
}

.dropdown-menu-item[data-highlighted] {
    background: var(--ui-90);
    color: var(--ui-0);
}

@media (prefers-color-scheme: dark) {
    .dropdown-menu-item[data-highlighted] {
        background: var(--ui-80);
    }
}

/* Menu trigger button styles */
.node-menu-trigger {
    position: absolute;
    top: var(--size-4);
    right: var(--size-4);
    padding: var(--size-4);
    background: transparent;
    border: none;
    border-radius: var(--ui-radius);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ui-0);
    transition: all 0.2s ease;
    opacity: 0;
    mix-blend-mode: multiply;

}

.node:hover .node-menu-trigger,
.node:focus-within .node-menu-trigger {
    opacity: 1;
}

.node-menu-trigger:hover {
    background: var(--ui-90);
    color: var(--ui-0);
}

.node-menu-trigger[data-state="open"] {
    background: var(--ui-90);
    color: var(--ui-0);
    opacity: 1;
}

/* Dropdown menu separator */
.dropdown-menu-separator {
    height: 1px;
    background: var(--ui-90);
    margin: var(--size-2) 0;
}
</style>
