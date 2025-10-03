import move from './move.icon.svg?raw'
import entity from './draw-entity.icon.svg?raw'
import select from './select.icon.svg?raw'
import connect from './connect.icon.svg?raw'
import chevron from './chevron.icon.svg?raw'
import stack from './stack.icon.svg?raw'
import close from './close.icon.svg?raw'
import menu from './menu.icon.svg?raw'
import newMicrocosm from './newMicrocosm.icon.svg?raw'
import ellipsis from './ellipsis-vertical.icon.svg?raw'
import pin from './pin.icon.svg?raw'
import tool from './tool.icon.svg?raw'
import plus from './plus.icon.svg?raw'
import region from './draw-region.icon.svg?raw'
import home from './home.icon.svg?raw'
import spatialview from './spatialview.icon.svg?raw'
import collectview from './collectview.icon.svg?raw'
import _new from './new.icon.svg?raw'
import help from './help.icon.svg?raw'
import discuss from './discuss.icon.svg?raw'
import github from './github.icon.svg?raw'

export type IconName = keyof typeof icons

export const icons = {
  move,
  entity,
  select,
  connect,
  chevron,
  stack,
  close,
  menu,
  ellipsis,
  pin,
  tool,
  newMicrocosm,
  plus,
  region,
  home,
  help,
  discuss,
  github,
  ['new']: _new,
  ['collect-view']: collectview,
  ['spatial-view']: spatialview
} as const
