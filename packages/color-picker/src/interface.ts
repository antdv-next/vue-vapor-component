export interface HSB {
  h: number | string
  s: number | string
  b: number | string
}

export interface RGB {
  r: number | string
  g: number | string
  b: number | string
}

export interface HSBA extends HSB {
  a: number
}

export interface RGBA extends RGB {
  a: number
}

export type ColorGenInput<T = any> =
  | string
  | number
  | RGB
  | RGBA
  | HSB
  | HSBA
  | T

export type ColorValueType<T = any> = T | string

export type ColorFormatType = 'hex' | 'rgb' | 'hsb'

export type HsbaColorType = 'hue' | 'alpha'

export interface TransformOffset {
  x: number
  y: number
}

export interface ColorPickerProps {
  prefixCls?: string
  value?: ColorGenInput
  defaultValue?: ColorGenInput
  valueFormat?: ColorFormatType | ((value: any) => string)
  disabled?: boolean
  disabledAlpha?: boolean
}

export interface PickerProps {
  prefixCls: string
  color?: any
  disabled?: boolean
}

export interface SliderProps {
  prefixCls: string
  colors: { percent: number; color: string }[]
  min: number
  max: number
  value: number
  disabled?: boolean
  type: HsbaColorType
  color?: any
}

export interface ColorBlockProps {
  color: string
  prefixCls?: string
}

export interface TransformProps {
  x: number
  y: number
}

export interface HandlerProps {
  size?: 'default' | 'small'
  color?: string
  prefixCls?: string
}

export interface GradientProps {
  colors: (string | any)[]
  direction?: string
  type?: HsbaColorType
  prefixCls?: string
}
