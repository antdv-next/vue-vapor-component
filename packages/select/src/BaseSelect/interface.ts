import type { AlignType, BuildInPlacements } from '@v-c/trigger'
import type { VueNode } from '@v-c/util/dist/type'
import type { ScrollConfig } from '@v-c/virtual-list'
import type { CSSProperties } from 'vue'

import type { ComponentsConfig } from '../hooks'
import type {
  DisplayInfoType,
  DisplayValueType,
  Mode,
  Placement,
  RawValueType,
  RenderNode,
} from '../interface'

export interface BaseSelectPublicShared {
  // Style
  className?: string
  style?: CSSProperties
  classNames?: Partial<Record<BaseSelectSemanticName, string>>
  styles?: Partial<Record<BaseSelectSemanticName, CSSProperties>>

  // Selector
  tagRender?: (props: CustomTagProps) => any
  direction?: 'ltr' | 'rtl'
  autoFocus?: boolean
  placeholder?: VueNode
  maxCount?: number

  // MISC
  title?: string
  tabIndex?: number
  notFoundContent?: VueNode
  onClear?: () => void
  maxLength?: number
  showScrollBar?: boolean | 'optional'
  choiceTransitionName?: string

  // Mode
  mode?: Mode

  // Status
  disabled?: boolean
  loading?: boolean

  // Open
  open?: boolean
  defaultOpen?: boolean
  onPopupVisibleChange?: (open: boolean) => void

  // Customize Input
  getInputElement?: () => any
  getRawInputElement?: () => any

  // Selector
  maxTagTextLength?: number
  maxTagCount?: number | 'responsive'
  maxTagPlaceholder?: VueNode | ((omittedValues: DisplayValueType[]) => any)

  // Search
  tokenSeparators?: string[] | ((input: string) => string[])

  // Icons
  allowClear?: boolean | { clearIcon?: VueNode; label?: string }
  prefix?: VueNode
  suffixIcon?: RenderNode
  suffix?: RenderNode
  clearIcon?: VueNode
  removeIcon?: RenderNode

  // Dropdown/Popup
  animation?: string
  transitionName?: string
  popupStyle?: CSSProperties
  popupClassName?: string
  popupMatchSelectWidth?: boolean | number
  popupRender?: (menu: any) => any
  popupAlign?: AlignType

  placement?: Placement
  builtinPlacements?: BuildInPlacements
  getPopupContainer?: (element: HTMLElement) => HTMLElement

  // Focus
  showAction?: ('focus' | 'click')[]
  onBlur?: (event: FocusEvent) => void
  onFocus?: (event: FocusEvent) => void

  // Search
  onSearch?: (
    searchText: string,
    info: { source: 'typing' | 'effect' | 'submit' | 'blur' },
  ) => void

  onKeyUp?: (event: KeyboardEvent) => void
  onKeyDown?: (event: KeyboardEvent) => void
  onMouseDown?: (event: MouseEvent) => void
  onPopupScroll?: (e: Event) => void
  onInputKeyDown?: (event: KeyboardEvent) => void
  onMouseEnter?: (event: MouseEvent) => void
  onMouseLeave?: (event: MouseEvent) => void
  onClick?: (event: MouseEvent) => void

  // Components
  components?: ComponentsConfig
}

export type BaseSelectSemanticName =
  | 'prefix'
  | 'suffix'
  | 'input'
  | 'clear'
  | 'placeholder'
  | 'content'
  | 'item'
  | 'itemContent'
  | 'itemRemove'

export type {
  DisplayInfoType,
  DisplayValueType,
  Mode,
  Placement,
  RawValueType,
  RenderNode,
}

export interface RefOptionListProps {
  onKeyDown: (event: KeyboardEvent) => void
  onKeyUp: (event: KeyboardEvent) => void
  scrollTo: (args: number | ScrollConfig) => void
}

export interface CustomTagProps {
  label: VueNode
  value: any
  disabled: boolean
  onClose: (event?: MouseEvent) => void
  closable: boolean
  isMaxTag: boolean
  index: number
}

export interface BaseSelectRef {
  focus: (options?: FocusOptions) => void
  blur: () => void
  scrollTo: (arg: any) => void
  nativeElement: HTMLElement
}

export interface BaseSelectPrivateProps {
  id: string
  prefixCls: string
  omitDomProps?: string[]
  role?: string

  displayValues: DisplayValueType[]

  activeValue?: string
  activeDescendantId?: string

  searchValue: string
  autoClearSearchValue?: boolean

  OptionList?: any
  emptyOptions: boolean
}

export type BaseSelectPropsWithoutPrivate = Omit<
  BaseSelectProps,
  keyof BaseSelectPrivateProps
>

export interface BaseSelectProps extends BaseSelectPrivateProps {
  // Style
  className?: string
  style?: CSSProperties
  classNames?: Partial<Record<BaseSelectSemanticName, string>>
  styles?: Partial<Record<BaseSelectSemanticName, CSSProperties>>

  // Selector
  showSearch?: boolean
  tagRender?: (props: CustomTagProps) => any
  direction?: 'ltr' | 'rtl'
  autoFocus?: boolean
  placeholder?: VueNode
  maxCount?: number

  // MISC
  title?: string
  tabIndex?: number
  notFoundContent?: VueNode
  onClear?: () => void
  maxLength?: number
  showScrollBar?: boolean | 'optional'
  choiceTransitionName?: string

  // Mode
  mode?: Mode

  // Status
  disabled?: boolean
  loading?: boolean

  // Open
  open?: boolean
  defaultOpen?: boolean
  onPopupVisibleChange?: (open: boolean) => void

  // Customize Input
  getInputElement?: () => any
  getRawInputElement?: () => any

  // Selector
  maxTagTextLength?: number
  maxTagCount?: number | 'responsive'
  maxTagPlaceholder?: VueNode | ((omittedValues: DisplayValueType[]) => any)

  // Search
  tokenSeparators?: string[] | ((input: string) => string[])

  // Icons
  allowClear?: boolean | { clearIcon?: VueNode; label?: string }
  prefix?: VueNode
  suffixIcon?: RenderNode
  suffix?: RenderNode
  clearIcon?: VueNode
  removeIcon?: RenderNode

  // Dropdown/Popup
  animation?: string
  transitionName?: string
  popupStyle?: CSSProperties
  popupClassName?: string
  popupMatchSelectWidth?: boolean | number
  popupRender?: (menu: any) => any
  popupAlign?: AlignType

  placement?: Placement
  builtinPlacements?: BuildInPlacements
  getPopupContainer?: (element: HTMLElement) => HTMLElement

  // Focus
  showAction?: ('focus' | 'click')[]
  onBlur?: (event: FocusEvent) => void
  onFocus?: (event: FocusEvent) => void

  // Search
  onSearch?: (
    searchText: string,
    info: { source: 'typing' | 'effect' | 'submit' | 'blur' },
  ) => void

  onKeyUp?: (event: KeyboardEvent) => void
  onKeyDown?: (event: KeyboardEvent) => void
  onMouseDown?: (event: MouseEvent) => void
  onPopupScroll?: (e: Event) => void
  onInputKeyDown?: (event: KeyboardEvent) => void
  onMouseEnter?: (event: MouseEvent) => void
  onMouseLeave?: (event: MouseEvent) => void
  onClick?: (event: MouseEvent) => void

  // Components
  components?: ComponentsConfig
}

export const isMultiple = (mode: Mode) => mode === 'tags' || mode === 'multiple'
