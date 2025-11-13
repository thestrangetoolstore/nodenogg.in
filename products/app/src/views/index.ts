import { freeze } from '@figureland/kit/tools/object'
import { defineAsyncComponent, type Component } from 'vue'

export interface ViewDefinition {
  component: Component
  title: string
  description: string
  icon: string
}

export const viewRegistry = freeze({
  spatial: {
    component: defineAsyncComponent(() => import('./spatial/MicrocosmSpatialView.vue')),
    title: 'Spatial',
    description: 'Arrange and connect stuff on a canvas',
    icon: 'spatial-view'
  },
  collect: {
    component: defineAsyncComponent(() => import('./collect/MicrocosmCollectView.vue')),
    title: 'Collect',
    description: 'Simple list view for quick note-taking',
    icon: 'collect-view'
  },
  stack: {
    component: defineAsyncComponent(() => import('./stack/MicrocosmStackView.vue')),
    title: 'Stack',
    description: 'Organize nodes by tags in columns',
    icon: 'stack'
  }
} satisfies Record<string, ViewDefinition>)

export type ViewType = keyof typeof viewRegistry

export const DEFAULT_VIEW: ViewType = 'collect'

export const getViewComponent = (type?: string) => {
  if (type && type in viewRegistry) {
    return viewRegistry[type as ViewType].component
  }
  return viewRegistry[DEFAULT_VIEW].component
}

export const getViewDefinition = (type?: string): ViewDefinition => {
  if (type && type in viewRegistry) {
    return viewRegistry[type as ViewType]
  }
  return viewRegistry[DEFAULT_VIEW]
}
