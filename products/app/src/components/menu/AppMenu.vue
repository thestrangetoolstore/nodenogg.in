<script setup lang="ts">
import { ref } from 'vue'
import {
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogOverlay,
    AlertDialogPortal,
    AlertDialogRoot,
    AlertDialogTitle,
    AlertDialogTrigger,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarPortal,
    MenubarRoot,
    MenubarSeparator,
    MenubarTrigger,
} from 'reka-ui'
import { useApp } from '@/state';
import { client } from '@/state/app';
import { exportAndDownloadMicrocosm, deleteAllUserEntities } from '@/utils/export';
import JoinMicrocosmDialog from './JoinMicrocosmDialog.vue';
import Icon from '@/components/icon/Icon.vue';
import Tooltip from '../Tooltip.vue';

const app = useApp()
const appMenu = ref('')
const deleteDialogOpen = ref(false)

// Microcosm menu actions
const handleLeave = () => {
    // TODO: Implement leave functionality
    console.log('Leave microcosm')
}

const handleDeleteData = () => {
    deleteDialogOpen.value = true
}

const confirmDeleteData = async () => {
    if (!app.activeMicrocosm) {
        console.warn('No active microcosm to delete data from')
        return
    }

    const identity = client.identity.get()
    if (!identity) {
        console.warn('No identity available for deletion')
        return
    }

    try {
        // Get the microcosm API instance
        const microcosmApi = await client.register({ id: app.activeMicrocosm.id })

        // Delete all user entities
        const deletedCount = await deleteAllUserEntities(microcosmApi, identity.id)

        console.log(`Successfully deleted ${deletedCount} entities`)
        deleteDialogOpen.value = false

        // TODO: Show success notification
    } catch (error) {
        console.error('Failed to delete user data:', error)
        // TODO: Show user-friendly error notification
    }
}

const handleExport = async () => {
    if (!app.activeMicrocosm) {
        console.warn('No active microcosm to export')
        return
    }

    const identity = client.identity.get()
    if (!identity) {
        console.warn('No identity available for export')
        return
    }

    try {
        // Get the microcosm API instance
        const microcosmApi = await client.register({ id: app.activeMicrocosm.id })

        await exportAndDownloadMicrocosm(
            microcosmApi,
            app.activeMicrocosm.id,
            identity.id
        )

        console.log('Microcosm exported successfully')
    } catch (error) {
        console.error('Failed to export microcosm:', error)
        // TODO: Show user-friendly error notification
    }
}

</script>

<template>
    <nav>
        <MenubarRoot v-model="appMenu" class="menubar-root">
            <MenubarMenu value="home">
                <MenubarTrigger as-child>
                    <router-link to="/" class="menubar-trigger home-trigger">
                        <Tooltip tooltip="Home" side="bottom" align="center" disableClosingTrigger>
                            <Icon type="home" />
                        </Tooltip>
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
                                Export to JSON
                            </MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem class="menubar-item" @click="handleDeleteData">
                                Delete my data
                            </MenubarItem>
                        </MenubarContent>
                    </MenubarPortal>
                </MenubarMenu>
            </template>
        </MenubarRoot>
        <JoinMicrocosmDialog />

        <!-- Delete Data Confirmation Dialog -->
        <AlertDialogRoot v-model:open="deleteDialogOpen">
            <AlertDialogPortal>
                <AlertDialogOverlay class="alert-dialog-overlay" />
                <AlertDialogContent class="alert-dialog-content">
                    <AlertDialogTitle class="alert-dialog-title">
                        Delete My Data
                    </AlertDialogTitle>
                    <AlertDialogDescription class="alert-dialog-description">
                        This will permanently delete all your entities in this microcosm. This action cannot be undone.
                        Note
                        that other users who you've shared with may still have old copies of your data.
                    </AlertDialogDescription>
                    <div class="alert-dialog-actions">
                        <AlertDialogCancel class="alert-dialog-cancel">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction class="alert-dialog-action warning" @click="confirmDeleteData">
                            Delete All My Data
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialogPortal>
        </AlertDialogRoot>
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
    width: 1px;
    height: 20px;
    background: var(--ui-70);
    transform: rotate(12deg);
    margin: 0 var(--size-4);
}

:deep(.menubar-trigger),
.home-trigger {
    padding: 0;
    outline: none;
    user-select: none;
    height: var(--size-32);
    border-radius: 4px;
    color: var(--grass-11);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2px;
    text-decoration: none;
}

:deep(.menubar-trigger:hover),
:deep(.menubar-trigger[data-highlighted]),
:deep(.menubar-trigger[data-state='open']),
.home-trigger:hover {
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

.microcosm-name {
    font-weight: 500;
    color: var(--ui-20);
}

.microcosm-trigger {
    padding: var(--size-8) var(--size-4) var(--size-8) var(--size-8);
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

/* Alert Dialog Styles */
.alert-dialog-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
}

.alert-dialog-content {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--ui-95);
    border-radius: calc(var(--ui-radius));
    box-shadow: var(--ui-container-shadow);
    padding: var(--size-24);
    min-width: 400px;
    max-width: 500px;
    z-index: 1001;
}

@media (prefers-color-scheme: dark) {
    .alert-dialog-content {
        background: var(--ui-90);
    }
}

.alert-dialog-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--ui-10);
    margin-bottom: var(--size-8);
}

.alert-dialog-description {
    color: var(--ui-40);
    margin-bottom: var(--size-24);
    line-height: 1.5;
}

.alert-dialog-actions {
    display: flex;
    gap: var(--size-12);
    justify-content: flex-end;
}

.alert-dialog-cancel,
.alert-dialog-action {
    padding: var(--size-8) var(--size-16);
    border-radius: calc(var(--ui-radius) - 2px);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    outline: none;
}

.alert-dialog-cancel {
    background: var(--ui-85);
    color: var(--ui-30);
}

.alert-dialog-cancel:hover {
    background: var(--ui-80);
}

.alert-dialog-action {
    background: var(--ui-primary-100);
    color: var(--ui-100);
}

.alert-dialog-action:hover {
    background: var(--ui-primary-90);
}

.alert-dialog-action.warning {
    background: var(--ui-red);
    color: var(--ui-100);
}

.alert-dialog-action.warning:hover {
    background: var(--ui-red-90);
}
</style>