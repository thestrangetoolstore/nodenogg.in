<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { MicrocosmSchema, type MicrocosmID } from '@nodenogg.in/schema';
import { useApp } from '@/state';
import Dialog from '../dialog/Dialog.vue';
import { ref } from 'vue';
import Button from '../button/Button.vue';
import Icon from '../icon/Icon.vue';
import Input from '../input/Input.vue';

const { createMicrocosmID, sanitizeMicrocosmIDTitle } = MicrocosmSchema.utils

const router = useRouter()
const app = useApp()
const inputValue = ref<string>('')

const handleConfirm = (microcosm_id: MicrocosmID) => {
    console.log(microcosm_id)
    app.showCommandMenu = false
    router.push({
        name: 'microcosm',
        params: {
            microcosm_id
        }
    })
}

const handleKeydown = (event: KeyboardEvent) => {
    console.log(inputValue.value)
    if (event.key === 'Enter' && inputValue.value.trim()) {
        event.preventDefault()
        const sanitizedInput = sanitizeMicrocosmIDTitle(inputValue.value)
        const microcosmId = createMicrocosmID(sanitizedInput)
        handleConfirm(microcosmId)
        inputValue.value = ''
    }
}
</script>

<template>
    <!-- <Tooltip tooltip="New microcosm" command="m" side="bottom" align="center" disableClosingTrigger :delay="200"> -->
    <Button class="menu-button" @click="() => app.showCommandMenu = true">
        <Icon type="plus" :size="32" />
        Join or Create Microcosm
    </Button>
    <!-- </Tooltip> -->
    <Dialog v-model:open="app.showCommandMenu" title="Join or Create Microcosm"
        description="Enter a microcosm name and press enter to join or create" :onConfirm="() => { }">
        <template v-slot:content>
            <Input v-model="inputValue" large placeholder="Enter microcosm name..." autoFocus
                @keydown="handleKeydown" />
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
    background: var(--ui-80);
    padding-left: var(--size-4);
    padding-right: var(--size-16);
}
</style>