<script setup vapor lang="ts">
  import type { ColorPickerProps } from './interface'

  import { clsx } from '@v-c/util'
  import { computed, toRef, useAttrs } from 'vue'

  import { Color } from './color'
  import ColorBlock from './components/ColorBlock.vue'
  import Picker from './components/Picker.vue'
  import Slider from './components/Slider.vue'
  import useColorState from './hooks/useColorState'
  import {
    ColorPickerPrefixCls,
    defaultColor,
    formatColorValue,
    generateColor,
  } from './util'

  defineOptions({ name: 'VcColorPicker', inheritAttrs: false })

  const props = withDefaults(defineProps<ColorPickerProps>(), {
    prefixCls: ColorPickerPrefixCls,
    disabledAlpha: false,
    disabled: false,
  })

  const emit = defineEmits<{
    change: [
      value: Color | string,
      info?: { type?: 'hue' | 'alpha'; value?: number },
    ]
    'change-complete': [
      value: Color | string,
      info?: { type?: 'hue' | 'alpha'; value?: number },
    ]
    'update:value': [value: Color | string]
  }>()

  const attrs = useAttrs()

  const [colorValue, setColorValue] = useColorState(
    props.defaultValue || defaultColor,
    toRef(props, 'value'),
  )

  const alphaColor = computed(() => colorValue.value.setA(1).toRgbString())

  const formatOutput = (nextColor: Color) =>
    formatColorValue(nextColor, props.valueFormat)

  const handleChange = (
    data: Color,
    type?: { type?: 'hue' | 'alpha'; value?: number },
  ) => {
    if (!props.value) {
      setColorValue(data)
    }
    const formattedValue = formatOutput(data)
    emit('change', formattedValue, type)
    emit('update:value', formattedValue)
  }

  const onHueChange = (hue: number) => {
    const newColor = generateColor({ ...colorValue.value.toHsb(), h: hue })
    handleChange(newColor, { type: 'hue', value: hue })
  }

  const onAlphaChange = (alpha: number) => {
    const newColor = generateColor({
      ...colorValue.value.toHsb(),
      a: alpha / 100,
    })
    handleChange(newColor, { type: 'alpha', value: alpha })
  }

  const triggerChangeComplete = (
    nextColor: Color,
    info?: { type?: 'hue' | 'alpha'; value?: number },
  ) => {
    emit('change-complete', formatOutput(nextColor), info)
  }

  const onHueChangeComplete = (hue: number) => {
    triggerChangeComplete(
      generateColor({ ...colorValue.value.toHsb(), h: hue }),
      { type: 'hue', value: hue },
    )
  }

  const onAlphaChangeComplete = (alpha: number) => {
    triggerChangeComplete(
      generateColor({ ...colorValue.value.toHsb(), a: alpha / 100 }),
      { type: 'alpha', value: alpha },
    )
  }

  const onPickerChangeComplete = (nextColor: Color) => {
    triggerChangeComplete(nextColor)
  }

  const HUE_COLORS = [
    { color: 'rgb(255, 0, 0)', percent: 0 },
    { color: 'rgb(255, 255, 0)', percent: 17 },
    { color: 'rgb(0, 255, 0)', percent: 33 },
    { color: 'rgb(0, 255, 255)', percent: 50 },
    { color: 'rgb(0, 0, 255)', percent: 67 },
    { color: 'rgb(255, 0, 255)', percent: 83 },
    { color: 'rgb(255, 0, 0)', percent: 100 },
  ]

  const ALPHA_COLORS = computed(() => [
    { percent: 0, color: 'rgba(255, 0, 4, 0)' },
    { percent: 100, color: alphaColor.value },
  ])

  const panelCls = computed(() =>
    clsx(
      props.prefixCls,
      `${props.prefixCls}-panel`,
      attrs.class as string,
      props.disabled ? `${props.prefixCls}-panel-disabled` : '',
    ),
  )

  const nodeStyle = computed(() => {
    const result: Record<string, any> = {}
    const parentStyle = attrs.style
    if (
      parentStyle &&
      typeof parentStyle === 'object' &&
      !Array.isArray(parentStyle)
    ) {
      for (const key in parentStyle) {
        result[key] = (parentStyle as Record<string, any>)[key]
      }
    }
    return result
  })

  const sliderContainerCls = `${props.prefixCls}-slider-container`
  const sliderGroupCls = computed(() =>
    props.disabledAlpha
      ? `${props.prefixCls}-slider-group ${props.prefixCls}-slider-group-disabled-alpha`
      : `${props.prefixCls}-slider-group`,
  )
</script>

<template>
  <div :class="panelCls" :style="nodeStyle">
    <Picker
      :prefix-cls="prefixCls"
      :color="colorValue"
      :disabled="disabled"
      @change="handleChange"
      @change-complete="onPickerChangeComplete"
    />
    <div :class="sliderContainerCls">
      <div :class="sliderGroupCls">
        <Slider
          :prefix-cls="prefixCls"
          :color="colorValue"
          :disabled="disabled"
          type="hue"
          :colors="HUE_COLORS"
          :min="0"
          :max="359"
          :value="colorValue.getHue()"
          @change="onHueChange"
          @change-complete="onHueChangeComplete"
        />
        <template v-if="!disabledAlpha">
          <Slider
            :prefix-cls="prefixCls"
            :color="colorValue"
            :disabled="disabled"
            type="alpha"
            :colors="ALPHA_COLORS"
            :min="0"
            :max="100"
            :value="colorValue.a * 100"
            @change="onAlphaChange"
            @change-complete="onAlphaChangeComplete"
          />
        </template>
      </div>
      <ColorBlock :color="colorValue.toRgbString()" :prefix-cls="prefixCls" />
    </div>
  </div>
</template>
