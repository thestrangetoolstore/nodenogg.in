/**
 * Centralized location for all UX/product copy throughout the application
 */

export const COPY = {
  emptyStates: {
    collect: {
      title: 'This is your solo data view',
      description: 'This view shows only your nodes. Other users\' nodes are not visible here.',
      actionText: 'Add'
    },
    stack: {
      title: 'This is the Stack view',
      description: 'Create nodes and add tags to organize them in columns',
      actionText: 'Add'
    }
  },
  
  buttons: {
    add: 'Add',
    delete: 'Delete',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel'
  },
  
  views: {
    collect: {
      title: 'Collect',
      description: 'Your personal data collection'
    },
    spatial: {
      title: 'Spatial',
      description: 'Collaborative spatial view'
    },
    stack: {
      title: 'Stack',
      description: 'Organize nodes by tags in columns'
    }
  },
  
  footer: {
    madeBy: 'Made by the University of Southampton, Winchester School of Art'
  },
  
  dialogs: {
    joinMicrocosm: {
      buttonText: 'Join or Create Microcosm',
      title: 'Join or Create Microcosm',
      description: 'Enter a microcosm name and press enter to join or create',
      placeholder: 'Enter microcosm name...',
      instruction: 'Type a microcosm name to get started',
      enterToCreate: 'create',
      enterToJoin: 'join',
      keyLabel: 'Enter'
    }
  }
} as const

export type CopyKeys = typeof COPY