import ColorPicker from './ColorPicker.vue'
import ColorBlock from './components/ColorBlock.vue'
import Picker from './components/Picker.vue'
import Slider from './components/Slider.vue'

export { Color } from './color'
export type {
  ColorPickerProps,
  ColorGenInput,
  ColorValueType,
  ColorFormatType,
  HsbaColorType,
  HSB,
  HSBA,
  RGB,
  RGBA,
  TransformOffset,
} from './interface'

type ColorPickerType = typeof ColorPicker & {
  Picker: typeof Picker
  Slider: typeof Slider
  ColorBlock: typeof ColorBlock
}

const Export = ColorPicker as ColorPickerType
Export.Picker = Picker
Export.Slider = Slider
Export.ColorBlock = ColorBlock

export default Export
