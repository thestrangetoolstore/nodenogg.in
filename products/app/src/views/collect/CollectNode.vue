<script setup lang="ts">
import {
    DropdownMenuRoot,
    DropdownMenuTrigger,
    DropdownMenuPortal,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator
} from 'reka-ui'
import { computed } from 'vue'
import Editor from '@/components/editor/Editor.vue'
import Icon from '@/components/icon/Icon.vue'
import TagInput from '@/components/tags/TagInput.vue'
import { EntitySchema, type Entity, type EntityUpdate } from '@nodenogg.in/schema'
import ColorSelector from '@/components/color-selector/ColorSelector.vue'
import { getColor } from '@/utils/color'

const props = defineProps<{
    onChange: (update: EntityUpdate) => void
    onDelete: () => void
    onDuplicate: () => void
    entity: Entity
    isEditing: boolean
}>()

const emit = defineEmits(['startEditing', 'stopEditing'])

const onStartEditing = () => {
    emit('startEditing')
}

const onStopEditing = () => {
    emit('stopEditing')
}

// Adapter function for TagInput - it expects (id: string, data: any) but we have onChange(update)
const handleTagUpdate = (_id: string, data: EntityUpdate) => {
    props.onChange(data)
}

// Handler for visibility toggle
const handleToggleVisibility = () => {
    // Toggle visibility: if undefined or true, set to false; if false, set to true
    const newVisibility = props.entity.data.visible === false ? true : false
    props.onChange({ visible: newVisibility })
}

// Compute visibility status for display
const isVisible = computed(() => {
    // Default to visible (true) if not explicitly set
    if (isType(props.entity, 'html')) {
        return props.entity.data.visible !== false
    }
    return true
})

const { isType } = EntitySchema.utils

</script>

<template>
    <div class="node" :style="`background-color: ${getColor(entity.data.backgroundColor || 'yellow')}`"
        v-if="isType(entity, 'html')" :class="{ 'is-editing': isEditing, 'is-hidden': !isVisible }" tabindex="0" :data-entity-id="entity.id">
        <Editor :value="entity.data.content" :onChange="content => onChange({ content })" :editable="isEditing"
            @click="onStartEditing" @cancel="onStopEditing" />

        <!-- Tag input section -->
        <TagInput :entity="entity" :onUpdate="handleTagUpdate" />

        <DropdownMenuRoot :modal="true">
            <DropdownMenuTrigger class="node-menu-trigger">
                <Icon type="ellipsis" />
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
                <DropdownMenuContent class="dropdown-menu-content" :side-offset="5" :align="'end'">
                    <DropdownMenuItem class="dropdown-menu-item">
                        <ColorSelector :value="entity.data.backgroundColor"
                            :onUpdate="backgroundColor => onChange({ backgroundColor })" />
                    </DropdownMenuItem>
                    <DropdownMenuSeparator class="dropdown-menu-separator" />
                    <DropdownMenuItem class="dropdown-menu-item" @click="onDuplicate">
                        Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem class="dropdown-menu-item" @click="handleToggleVisibility">
                        {{ isVisible ? 'Hide' : 'Show' }}
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
    background: var(--card-yellow-50);
    color: var(--ui-mono-0);
    border-radius: var(--ui-radius);
    display: flex;
    flex-direction: column;
    transition: border-color 0.2s ease, outline 0.2s ease;
    outline: none;
    padding-bottom: var(--size-8);
}

.node:focus {
    /* outline: 2px solid var(--ui-primary-100);
    outline-offset: 2px; */
}

.node.is-editing {
    box-shadow: 0 0 8px rgba(var(--ui-primary-rgb), 0.5);
}

/* Hidden state - only visible to owner */
.node.is-hidden {
    opacity: 0.5;
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
    color: var(--ui-mono-0);
    transition: all 0.2s ease;
    opacity: 1;
    mix-blend-mode: multiply;

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
