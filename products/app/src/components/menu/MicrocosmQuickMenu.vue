<script setup lang="ts">
import { type PropType, ref, computed, watch } from 'vue'
import { getTimeSince } from '@figureland/kit/tools/time';
import { MicrocosmSchema, type MicrocosmID } from '@nodenogg.in/schema'
import { ComboboxContent, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxLabel, ComboboxRoot, ComboboxViewport } from 'reka-ui'
import Input from '../input/Input.vue';

const { createMicrocosmID, isValidMicrocosmID, parseMicrocosmID, sanitizeMicrocosmIDTitle } = MicrocosmSchema.utils

const props = defineProps({
    onCreate: {
        type: Function as PropType<(m: MicrocosmID) => void>,
        required: true
    },
    onSelect: {
        type: Function as PropType<(m: MicrocosmID) => void>,
        required: true
    },
    options: {
        type: Array as PropType<any[]>,
        required: true
    },
    limit: {
        type: Number,
        default: 10
    },
    placeholder: {
        type: String,
        default: 'Choose a microcosm name...'
    }
})

const selectedValue = ref<string | null>(null)
const searchTerm = ref<string>('')
const open = ref(false)

const newMicrocosmID = computed(() => createMicrocosmID(searchTerm.value))

const inputIsValidMicrocosmID = computed(() => {
    return isValidMicrocosmID(searchTerm.value)
})

const existingMicrocosm = computed(() =>
    inputIsValidMicrocosmID.value
    && !!props.options.find(microcosm => microcosm.id === searchTerm.value)
)

const showCreateOption = computed(() =>
    true
)

const filteredOptions = computed(() => {
    if (!searchTerm.value) return props.options.slice(0, props.limit)

    return props.options.filter(option =>
        parseMicrocosmID(option.id).toLowerCase().includes(searchTerm.value.toLowerCase())
    ).slice(0, props.limit)
})

const onCreate = () => {
    const id = createMicrocosmID(searchTerm.value)
    props.onCreate(id)
    selectedValue.value = id
    searchTerm.value = ''
    open.value = false
}

const onSelectMicrocosm = (microcosmId: string) => {
    props.onSelect(microcosmId)
    selectedValue.value = microcosmId
    open.value = false
}

// Display value function for the input
const displayValue = (value: string | null) => {
    if (!value) return ''
    const microcosm = props.options.find(m => m.id === value)
    return microcosm ? parseMicrocosmID(microcosm.id) : value
}

</script>

<template>
    <ComboboxRoot v-model="selectedValue" v-model:searchTerm="searchTerm" v-model:open="open"
        :display-value="displayValue">
        <ComboboxInput asChild>
            <Input large :placeholder="placeholder" autoFocus />
        </ComboboxInput>
        <ComboboxContent>
            <ComboboxViewport class="viewport">
                <ComboboxGroup v-if="filteredOptions.length > 0">
                    <ComboboxLabel class="group-label">Recent microcosms</ComboboxLabel>
                    <ComboboxItem v-for="(m) in filteredOptions" :key="m.id" :value="m.id" asChild
                        @select="onSelectMicrocosm(m.id)">
                        <article class="item">
                            <span>{{ parseMicrocosmID(m.id) }}</span>
                            <span class="secondary">{{ getTimeSince(m.lastAccessed) }}</span>
                        </article>
                    </ComboboxItem>
                </ComboboxGroup>

                <ComboboxItem v-if="showCreateOption" value="__create__" asChild @select="onCreate">
                    <article class="item new">
                        <p>Create <span class="bold">{{ sanitizeMicrocosmIDTitle(searchTerm) }}</span></p>
                        <div class="instruction">Press<span class="keycommand">enter</span></div>
                    </article>
                </ComboboxItem>
            </ComboboxViewport>
        </ComboboxContent>
    </ComboboxRoot>
</template>

<style scoped>
.instruction-tray {
    display: flex;
    padding: var(--size-8);
    gap: var(--size-12);
}

.instruction {
    font-size: 0.85em;
}

.p-2 {
    padding: var(--size-16);
}

:deep(.item) {
    padding: var(--size-8);
    display: relative;
    border-radius: var(--ui-radius);
    display: flex;
    justify-content: space-between;
}

:deep(.item.new) {
    margin-top: var(--size-8);
}


:deep(.item[data-highlighted]) {
    background-color: var(--ui-primary-100);
    color: var(--ui-100);
}

/* :deep(.item[data-highlighted])::before { */
/* content: '↲'; */
/* position: absolute; */
/* right: var(--size-8); */
/* } */

.item-id {
    opacity: 0.5;
    color: var(--ui-95);
}

:deep(.bold) {
    font-weight: bold;
}

:deep(.viewport) {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    max-height: 50vh;
    overflow-y: scroll;
    padding: 0 var(--size-4) var(--size-4) var(--size-4);
}

.keycommand {
    padding: var(--size-2) var(--size-4) var(--size-2) var(--size-4);
    line-height: 0.85em;
    margin: 0 var(--size-4);
    position: relative;
    border: 1px solid currentColor;
    border-radius: var(--ui-radius);
}

/* .keycommand::after {
    content: ' ';
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    position: absolute;
    border-radius: var(--ui-radius);
} */

:deep(.group-label) {
    margin-top: var(--size-16);
    padding: var(--size-4) var(--size-8);
    font-weight: 400;
    color: var(--ui-50);
}

.secondary {
    opacity: 0.5;
    font-size: 0.9em;
}
</style>