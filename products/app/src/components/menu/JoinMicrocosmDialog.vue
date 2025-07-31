<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { MicrocosmSchema, type MicrocosmID } from '@nodenogg.in/schema';
import { useApp } from '@/state';
import Dialog from '../dialog/Dialog.vue';
import { computed, ref } from 'vue';
import Button from '../button/Button.vue';
import Icon from '../icon/Icon.vue';
import Input from '../input/Input.vue';
import { COPY } from '@/constants/copy';

const { createMicrocosmID, sanitizeMicrocosmIDTitle } = MicrocosmSchema.utils

const router = useRouter()
const app = useApp()
const inputValue = ref<string>('')

const handleConfirm = (microcosm_id: MicrocosmID) => {
    app.showCommandMenu = false
    router.push({
        name: 'microcosm',
        params: {
            microcosm_id
        }
    })
}

const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && inputValue.value.trim()) {
        event.preventDefault()
        const sanitizedInput = sanitizeMicrocosmIDTitle(inputValue.value)
        const microcosmId = createMicrocosmID(sanitizedInput)
        handleConfirm(microcosmId)
        inputValue.value = ''
    }
}

const sanitizedInput = computed(() => {
    if (!inputValue.value.trim()) return ''
    return sanitizeMicrocosmIDTitle(inputValue.value)
})

const newMicrocosmID = computed(() => createMicrocosmID(inputValue.value))

</script>

<template>
    <Button class="menu-button" @click="() => app.showCommandMenu = true">
        <Icon type="plus" :size="32" />
        {{ COPY.dialogs.joinMicrocosm.buttonText }}
    </Button>
    <!-- </Tooltip> -->
    <Dialog v-model:open="app.showCommandMenu" :title="COPY.dialogs.joinMicrocosm.title"
        :description="COPY.dialogs.joinMicrocosm.description" :onConfirm="() => { }">
        <template v-slot:content>
            <div class="input-container">
                <Input v-model="inputValue" large :placeholder="COPY.dialogs.joinMicrocosm.placeholder" autoFocus
                    @keydown="handleKeydown" />

                <div class="message" v-if="inputValue.trim()">
                    <div class="enter-instruction">
                        Press <kbd class="key">{{ COPY.dialogs.joinMicrocosm.keyLabel }}</kbd> to {{ sanitizedInput ?
                            COPY.dialogs.joinMicrocosm.enterToCreate : COPY.dialogs.joinMicrocosm.enterToJoin }} {{
                            sanitizedInput }}
                    </div>
                </div>

                <div class="message" v-else>
                    <div class="instruction">{{ COPY.dialogs.joinMicrocosm.instruction }}</div>
                </div>
            </div>
        </template>
    </Dialog>
</template>

<style scoped>
.small {
    display: block;
    padding: var(--size-8) 0;
    font-weight: 600;
    color: var(--ui-50);
    font-size: 12px;
}

.menu-button {
    background: var(--ui-0);
    color: var(--ui-100);
    padding-left: var(--size-4);
    padding-right: var(--size-16);
}

.input-container {
    display: flex;
    flex-direction: column;
    gap: var(--size-12);
}

.confirmation-message {
    display: flex;
    flex-direction: column;
    gap: var(--size-4);
    padding: var(--size-8) 0;
}

.sanitized-preview {
    font-size: 0.875rem;
    color: var(--ui-50);
}

.preview-value {
    font-weight: 600;
    color: var(--ui-primary-100);
    font-family: monospace;
}

.enter-instruction {
    font-size: 0.875rem;
    color: var(--ui-30);
    display: flex;
    align-items: center;
    gap: var(--size-4);
}

.key {
    display: inline-block;
    padding: var(--size-2) var(--size-6);
    background: var(--ui-90);
    border: 1px solid var(--ui-70);
    border-radius: var(--ui-radius);
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--ui-20);
    font-family: monospace;
}

.message {
    font-size: 0.875rem;
    color: var(--ui-50);
    padding: var(--size-8)
}


.key {
    background: var(--ui-80);
    border: none;
    padding: var(--size-2) var(--size-4);
    color: var(--ui-40);
    font: inherit;
}
</style>