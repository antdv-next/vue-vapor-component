import type { OperationIcons } from './types'

export interface PrevNextProps {
  prefixCls: string
  onActive: (offset: number) => void
  current: number
  count: number
  icons: OperationIcons
}
