<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWindowSize } from '@vueuse/core'
import {
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogOverlay,
    AlertDialogPortal,
    AlertDialogRoot,
    AlertDialogTitle,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarPortal,
    MenubarRoot,
    MenubarSeparator,
    MenubarTrigger,
} from 'reka-ui'
import { useRouter, useRoute } from 'vue-router'
import { useApp, useAppRouter } from '@/state';
import { client } from '@/state/app';
import { exportAndDownloadMicrocosm, deleteAllUserEntities } from '@/utils/export';
import { exportAndDownloadMarkdownFiles } from '@/utils/export-md';
import { exportAndDownloadRtfFiles } from '@/utils/export-rtf';
import { viewRegistry, getViewDefinition } from '@/views';
import Icon from '@/components/icon/Icon.vue';
import Tooltip from '../Tooltip.vue';
import IdentityCount from '@/components/IdentityCount.vue';

const app = useApp()
const router = useRouter()
const route = useRoute()
const appRouter = useAppRouter()
const appMenu = ref('')
const deleteDialogOpen = ref(false)

// Window size for responsive behavior
const { width } = useWindowSize()
const isMobile = computed(() => width.value <= 768)

const debugIdentities = computed(() =>
    app.activeMicrocosmStore?.joinedIdentitiesCount || 0
)

// View switching logic
const switchView = (viewType: string) => {
    if (!viewType) return

    router.push({
        path: route.path,
        query: {
            ...route.query,
            view: viewType
        }
    })
}

// Get current view type
const currentViewType = computed({
    get: () => appRouter.value.viewType as string,
    set: (value: string) => switchView(value)
})

// Get view display information
const currentViewDefinition = computed(() => getViewDefinition(currentViewType.value))

 const helpExport = () => {
      window.location.href = "https://docs.nodenogg.in/guide/export";
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

const handleMarkdownExport = async () => {
    if (!app.activeMicrocosm) {
        console.warn('No active microcosm to export')
        return
    }

    try {
        // Get the microcosm API instance
        const microcosmApi = await client.register({ id: app.activeMicrocosm.id })

        await exportAndDownloadMarkdownFiles(
            microcosmApi,
            app.activeMicrocosm.id
        )

        console.log('Microcosm exported as markdown files successfully')
    } catch (error) {
        console.error('Failed to export microcosm as markdown:', error)
        // TODO: Show user-friendly error notification
    }
}

const handleRtfExport = async () => {
    if (!app.activeMicrocosm) {
        console.warn('No active microcosm to export')
        return
    }

    try {
        // Get the microcosm API instance
        const microcosmApi = await client.register({ id: app.activeMicrocosm.id })

        await exportAndDownloadRtfFiles(
            microcosmApi,
            app.activeMicrocosm.id
        )

        console.log('Microcosm exported as RTF files successfully')
    } catch (error) {
        console.error('Failed to export microcosm as RTF:', error)
        // TODO: Show user-friendly error notification
    }
}

</script>

<template>
    <nav>
        <!-- Left Region: Breadcrumb -->
        <div class="nav-region nav-left">
            <MenubarRoot v-model="appMenu" class="breadcrumb-menubar">
                <MenubarMenu value="home">
                    <MenubarTrigger as-child>
                        <router-link to="/" class="menubar-trigger home-trigger">
                            <Tooltip tooltip="Home" side="bottom" align="center" disableClosingTrigger>
                                <Icon type="home" />
                            </Tooltip>
                        </router-link>
                    </MenubarTrigger>
                </MenubarMenu>

                <MenubarMenu value="help">
                    <MenubarTrigger as-child>
                        <a href="https://docs.nodenogg.in" target="_blank" rel="noopener noreferrer" class="menubar-trigger home-trigger">
                            <Tooltip tooltip="Help" side="bottom" align="center" disableClosingTrigger>
                                <Icon type="help" />
                            </Tooltip>
                        </a>
                    </MenubarTrigger>
                </MenubarMenu>

                <MenubarMenu value="discuss">
                    <MenubarTrigger as-child>
                        <a href="https://discuss.strangetool.store" target="_blank" rel="noopener noreferrer" class="menubar-trigger home-trigger">
                            <Tooltip tooltip="Discuss" side="bottom" align="center" disableClosingTrigger>
                                <Icon type="discuss" />
                            </Tooltip>
                        </a>
                    </MenubarTrigger>
                </MenubarMenu>

                <MenubarMenu value="github">
                    <MenubarTrigger as-child>
                        <a href="https://github.com/thestrangetoolstore/nodenogg.in/" target="_blank" rel="noopener noreferrer" class="menubar-trigger home-trigger">
                            <Tooltip tooltip="GitHub" side="bottom" align="center" disableClosingTrigger>
                                <Icon type="github" />
                            </Tooltip>
                        </a>
                    </MenubarTrigger>
                </MenubarMenu>

                <template v-if="app.activeMicrocosm">
                    <MenubarSeparator class="breadcrumb-separator" />
                    <span class="microcosm-name-text">
                        <span class="name-wrapper">{{ app.activeMicrocosm.id }}</span>
                        <IdentityCount :count="debugIdentities" />
                    </span>
                </template>
            </MenubarRoot>
        </div>

        <!-- Center Region: View Switcher (desktop only) -->
        <div v-if="app.activeMicrocosm && !isMobile" class="nav-region nav-center">
            <MenubarRoot v-model="appMenu" class="view-menubar">
                <MenubarMenu value="view">
                    <MenubarTrigger class="menubar-trigger view-trigger">
                        <Icon :type="currentViewDefinition.icon" />
                        <span class="view-name">{{ currentViewDefinition.title }}</span>
                    </MenubarTrigger>
                    <MenubarPortal>
                        <MenubarContent class="menubar-content" align="center" :side-offset="5">
                            <MenubarItem v-for="(viewDef, viewType) in viewRegistry" :key="viewType"
                                class="menubar-item view-item" :class="{ active: currentViewType === viewType }"
                                @click="switchView(viewType)">
                                <Icon :type="viewDef.icon" />
                                <div class="view-content">
                                    <div class="view-title">{{ viewDef.title }} view</div>
                                    <div class="view-description">{{ viewDef.description }}</div>
                                </div>
                            </MenubarItem>
                        </MenubarContent>
                    </MenubarPortal>
                </MenubarMenu>
            </MenubarRoot>
        </div>

        <!-- Right Region: View Switcher (mobile) + Options -->
        <div v-if="app.activeMicrocosm" class="nav-region nav-right">
            <!-- View Switcher (mobile only) -->
            <MenubarRoot v-if="isMobile" v-model="appMenu" class="view-menubar">
                <MenubarMenu value="view">
                    <MenubarTrigger class="menubar-trigger view-trigger">
                        <Icon :type="currentViewDefinition.icon" />
                    </MenubarTrigger>
                    <MenubarPortal>
                        <MenubarContent class="menubar-content" align="center" :side-offset="5">
                            <MenubarItem v-for="(viewDef, viewType) in viewRegistry" :key="viewType"
                                class="menubar-item view-item" :class="{ active: currentViewType === viewType }"
                                @click="switchView(viewType)">
                                <Icon :type="viewDef.icon" />
                                <div class="view-content">
                                    <div class="view-title">{{ viewDef.title }} view</div>
                                    <div class="view-description">{{ viewDef.description }}</div>
                                </div>
                            </MenubarItem>
                        </MenubarContent>
                    </MenubarPortal>
                </MenubarMenu>
            </MenubarRoot>
            <MenubarRoot v-model="appMenu" class="options-menubar">
                <MenubarMenu value="options">
                    <MenubarTrigger class="menubar-trigger options-trigger">
                        <Tooltip tooltip="Options" side="bottom" align="center" disableClosingTrigger>
                            <span class="options-text">Export</span>
                            <Icon type="ellipsis" />
                        </Tooltip>
                    </MenubarTrigger>
                    <MenubarPortal>
                        <MenubarContent class="menubar-content" align="end" :side-offset="5" :align-offset="-3">
                            <MenubarItem class="menubar-item" @click="handleExport">
                                <Icon type="download" />
                                <span>Export to JSON</span>
                            </MenubarItem>
                            <MenubarItem class="menubar-item" @click="handleMarkdownExport">
                                <Icon type="download" />
                                <span>Export all to Markdown files</span>
                            </MenubarItem>
                            <MenubarItem class="menubar-item" @click="handleRtfExport">
                                <Icon type="download" />
                                <span>Export all to Text files</span>
                            </MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem class="menubar-item warning" @click="handleDeleteData">
                                <Icon type="trash" />
                                <span>Delete my data</span>
                            </MenubarItem>
                               <MenubarSeparator />
                            <MenubarItem class="menubar-item exporthelp" @click="helpExport">
                                <Icon type="trash" />
                                <span>Export Help</span>
                            </MenubarItem>
                        </MenubarContent>
                    </MenubarPortal>
                </MenubarMenu>
            </MenubarRoot>
        </div>
        <!-- <JoinMicrocosmDialog /> -->

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
    padding: var(--size-4) 0 var(--size-8) 0;
    width: 100%;
}

@media (max-width: 768px) {
    nav {
        padding: var(--size-8);
    }
}


@media (prefers-color-scheme: dark) {
    nav {
        background: var(--ui-90);
    }
}

/* Three-region layout */
.nav-region {
    display: flex;
    align-items: center;
}

.nav-left {
    justify-content: flex-start;
    flex: 1;
}

.nav-center {
    justify-content: center;
    flex: 0 0 auto;
}

.nav-right {
    justify-content: flex-end;
    flex: 1;
    gap: var(--size-8);
}


/* Menubar styling for each region */
.breadcrumb-menubar,
.view-menubar,
.options-menubar {
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
    background: var(--ui-90);
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
    gap: var(--size-8);
    padding: 0 var(--size-8);
    user-select: none;
}

:deep(.menubar-item[data-highlighted]) {
    background: var(--ui-80);
}

/* Microcosm name in breadcrumb */
.microcosm-name-text {
    font-weight: 500;
    color: var(--ui-20);
    padding: 0 var(--size-8);
    height: var(--size-32);
    display: flex;
    align-items: center;
    gap: var(--size-4);
}

.name-wrapper {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}


/* Options trigger specific styles */
.options-trigger {
    padding: 0 0 0 var(--size-8);
}

.options-text {
    display: inline;
}

@media (max-width: 768px) {
    .options-text {
        display: none;
    }

    .options-trigger {
        padding: 0;
    }

    /* Hide view name text on mobile */
    .view-name {
        display: none;
    }
}

:deep(.menubar-item.exporthelp) {
    color: var(--ui-primary-100);
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
    background: var(--ui-90);
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

/* View trigger styles */
.view-trigger {
    padding: 0 var(--size-8) 0 var(--size-4);
    gap: var(--size-4);
}

.view-name {
    font-weight: 500;
    color: var(--ui-20);
}

/* View menu item styles */
.view-item {
    gap: var(--size-8);
    align-items: flex-start;
    padding: var(--size-12);
}

.view-content {
    display: flex;
    flex-direction: column;
    gap: var(--size-2);
}

.view-title {
    font-weight: 500;
    color: var(--ui-20);
    line-height: 1.2;
}

.view-description {
    font-size: 0.875rem;
    color: var(--ui-50);
    line-height: 1.3;
}

.view-item.active {
    background: var(--ui-primary-100);
    color: var(--ui-100);
}

.view-item.active .view-title {
    color: var(--ui-100);
}

.view-item.active .view-description {
    color: var(--ui-90);
}

.view-item.active:hover {
    background: var(--ui-primary-90);
}
</style>