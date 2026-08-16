import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import type { CSSProperties } from 'vue'

import type { DrawerClassNames, DrawerStyles } from './inter'

export type Placement = 'left' | 'top' | 'right' | 'bottom'

export interface PushConfig {
  distance?: number | string
}

export interface DrawerPanelProps {
  prefixCls: string
  id?: string
}

export interface DrawerPopupProps {
  prefixCls: string
  open?: boolean
  inline?: boolean
  push?: boolean | PushConfig
  forceRender?: boolean
  autoFocus?: boolean
  focusTrap?: boolean
  keyboard?: boolean

  rootClassName?: string
  rootStyle?: CSSProperties
  zIndex?: number

  placement?: Placement
  id?: string

  width?: number | string
  height?: number | string
  size?: number | string
  maxSize?: number

  mask?: boolean
  maskClosable?: boolean
  maskClassName?: string
  maskStyle?: CSSProperties

  motion?:
    | CSSMotionProps
    | ((placement: Placement | undefined) => CSSMotionProps)
  maskMotion?: CSSMotionProps

  afterOpenChange?: (open: boolean) => void

  classNames?: DrawerClassNames
  styles?: DrawerStyles
  drawerRender?: (node: any) => any

  defaultSize?: number | string
  resizable?:
    | boolean
    | {
        onResize?: (size: number) => void
        onResizeStart?: () => void
        onResizeEnd?: () => void
      }
}

export interface DrawerProps extends Omit<
  DrawerPopupProps,
  'prefixCls' | 'inline' | 'afterOpenChange'
> {
  prefixCls?: string
  open?: boolean
  destroyOnHidden?: boolean
  getContainer?: any
  panelRef?: any
  wrapperClassName?: string
  classNames?: DrawerClassNames
  styles?: DrawerStyles
  focusTriggerAfterClose?: boolean
}
