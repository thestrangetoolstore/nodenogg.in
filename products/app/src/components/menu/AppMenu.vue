<script setup lang="ts">
import { ref } from 'vue'
import {
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarPortal,
    MenubarRoot,
    MenubarSeparator,
    MenubarTrigger,
} from 'reka-ui'
import { useApp } from '@/state';
import JoinMicrocosmDialog from './JoinMicrocosmDialog.vue';
import Icon from '@/components/icon/Icon.vue';

const app = useApp()
const appMenu = ref('')

// Microcosm menu actions
const handleLeave = () => {
    // TODO: Implement leave functionality
    console.log('Leave microcosm')
}

const handleDeleteData = () => {
    // TODO: Implement delete data functionality
    console.log('Delete my data')
}

const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export microcosm')
}

</script>

<template>
    <nav>
        <MenubarRoot v-model="appMenu" class="menubar-root">
            <MenubarMenu value="home">
                <MenubarTrigger class="menubar-trigger home-trigger">
                    <router-link to="/">
                        Home
                    </router-link>
                </MenubarTrigger>
            </MenubarMenu>

            <template v-if="app.activeMicrocosm">
                <MenubarSeparator class="breadcrumb-separator" />
                <MenubarMenu value="microcosm">
                    <MenubarTrigger class="menubar-trigger microcosm-trigger">
                        <span class="microcosm-name">{{ app.activeMicrocosm.id }}</span>
                        <Icon type="ellipsis" class="dropdown-icon" />
                    </MenubarTrigger>
                    <MenubarPortal>
                        <MenubarContent class="menubar-content" align="start" :side-offset="5" :align-offset="-3">
                            <MenubarItem class="menubar-item" @click="handleExport">
                                Export
                            </MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem class="menubar-item" @click="handleDeleteData">
                                Delete my data
                            </MenubarItem>
                            <MenubarItem class="menubar-item warning" @click="handleLeave">
                                Leave
                            </MenubarItem>
                        </MenubarContent>
                    </MenubarPortal>
                </MenubarMenu>
            </template>
        </MenubarRoot>
        <JoinMicrocosmDialog />
    </nav>
</template>

<style scoped>
nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--size-4);
    gap: var(--size-2);
    width: 100%;
}

@media (prefers-color-scheme: dark) {
    nav {
        background: var(--ui-90);
    }
}

.menubar-root {
    display: flex;
    align-items: center;
    gap: var(--size-2);
}

:deep(.breadcrumb-separator) {
    width: 2px;
    height: 20px;
    background: var(--ui-70);
    transform: rotate(12deg);
}

:deep(.menubar-trigger) {
    padding: 0 var(--size-8);
    outline: none;
    user-select: none;
    height: var(--size-32);
    border-radius: 4px;
    color: var(--grass-11);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2px;
}

:deep(.menubar-trigger:hover),
:deep(.menubar-trigger[data-highlighted]),
:deep(.menubar-trigger[data-state='open']) {
    background-color: var(--ui-80);
}

:deep(.menubar-content) {
    min-width: 200px;
    max-height: calc(100vh - 64px);
    overflow-y: scroll;
    background: var(--ui-95);
    box-shadow: var(--ui-container-shadow);
    border-radius: calc(var(--ui-radius));
    padding: var(--size-4);
}

:deep(.menubar-item) {
    cursor: pointer;
    all: unset;
    height: var(--size-32);
    border-radius: 4px;
    display: flex;
    align-items: center;
    padding: 0 var(--size-8);
    user-select: none;
}

:deep(.menubar-item[data-highlighted]) {
    background: var(--ui-80);
}

:deep(.menubar-separator) {
    height: 1px;
    background-color: var(--ui-80);
    margin: 2px;
}

.microcosm-name {
    font-weight: 500;
    color: var(--ui-20);
}

.microcosm-trigger {
    padding: 0 var(--size-6) 0 var(--size-8);
}

.microcosm-trigger .microcosm-name {
    margin-right: var(--size-4);
}

.dropdown-icon {
    width: var(--size-24);
    height: var(--size-24);
    opacity: 0.7;
    transition: opacity 0.2s ease;
}

.microcosm-trigger:hover .dropdown-icon {
    opacity: 1;
}

/* Warning style for destructive actions */
:deep(.menubar-item.warning) {
    color: var(--ui-red);
}

:deep(.menubar-item.warning:hover),
:deep(.menubar-item.warning[data-highlighted]) {
    background: var(--ui-red);
    color: var(--ui-100);
}
</style>