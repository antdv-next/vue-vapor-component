<script setup lang="ts" vapor>
  import type { ChangeEvent } from '@v-c/util/dist/EventInterface'

  import type {
    SegmentedLabeledOption,
    SegmentedOptions,
    SegmentedProps,
    SegmentedRawOption,
  } from './interface'

  import omit from '@v-c/util/dist/omit'
  import { computed, useAttrs, ref, shallowRef, watch, nextTick } from 'vue'

  import InternalSegmentedOption from './InternalSegmentedOption.vue'
  import MotionThumb from './MotionThumb.vue'
  defineOptions({ name: 'Segmented', inheritAttrs: false })
  const props = withDefaults(defineProps<SegmentedProps>(), {
    prefixCls: 'vc-segmented',
    options: [],
    motionName: 'thumb-motion',
  })
  const emit = defineEmits<{
    change: [val: SegmentedRawOption]
  }>()
  const attrs = useAttrs()
  function getValidTitle(option: SegmentedLabeledOption) {
    if (typeof option.title !== 'undefined') {
      return option.title
    }

    // read `label` when title is `undefined`
    if (typeof option.label !== 'object') {
      return option.label?.toString()
    }
  }

  function normalizeOptions(
    options: SegmentedOptions,
  ): SegmentedLabeledOption[] {
    return options.map(option => {
      if (typeof option === 'object' && option !== null) {
        const validTitle = getValidTitle(option)
        return {
          ...option,
          title: validTitle,
        }
      }
      return {
        label: option?.toString(),
        title: option?.toString(),
        value: option,
      }
    })
  }
  const containerRef = ref<HTMLDivElement>()
  const segmentedOptions = computed(() => {
    return normalizeOptions(props?.options ?? [])
  })

  const internalValue = shallowRef<SegmentedRawOption | undefined>(
    props?.defaultValue ?? segmentedOptions.value[0]?.value,
  )
  const mergedValue = computed(() => props?.value ?? internalValue.value)
  const controlRerender = shallowRef(0)
  watch(
    () => props.value,
    value => {
      if (value === undefined) {
        return (internalValue.value = value)
      }
    },
  )
  // ======================= Change ========================
  const thumbShow = shallowRef(false)
  const handleChange = (_event: ChangeEvent, val: SegmentedRawOption) => {
    const prevControlledValue = props.value
    if (prevControlledValue === undefined) {
      internalValue.value = val
    }
    emit('change', val)
    if (prevControlledValue !== undefined) {
      nextTick(() => {
        if (props.value === prevControlledValue && props.value !== val) {
          controlRerender.value += 1
        }
      })
    }
  }

  // ======================= Focus ========================

  const isKeyboard = shallowRef(false)
  const isFocused = shallowRef(true)
  const handleFocus = () => {
    isFocused.value = true
  }
  const handleBlur = () => {
    isFocused.value = false
  }
  const handleMouseDown = () => {
    isKeyboard.value = false
  }
  // capture keyboard tab interaction for correct focus style
  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      isKeyboard.value = true
    }
  }
  // ======================= Keyboard ========================
  const onOffset = (offset: number) => {
    const validOptions = segmentedOptions.value.filter(
      option => option.value === mergedValue.value || !option.disabled,
    )

    const currentIndex = validOptions.findIndex(
      option => option?.value === mergedValue.value,
    )

    const total = segmentedOptions.value.length
    const nextIndex = (currentIndex + offset + total) % total
    const nextOption = segmentedOptions.value[nextIndex]
    if (nextOption && nextOption.value !== mergedValue.value) {
      handleChange(null as any, nextOption.value)
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        onOffset(-1)
        break
      case 'ArrowRight':
      case 'ArrowDown':
        onOffset(1)
        break
    }
  }
  const divProps = omit(attrs, ['class', 'style'])
  const divClass = computed(() => {
    const { prefixCls, direction, disabled, vertical } = props
    return {
      [`${prefixCls}-rtl`]: direction === 'rtl',
      [`${prefixCls}-disabled`]: disabled,
      [`${prefixCls}-vertical`]: vertical,
    }
  })
</script>

<template>
  <div
    role="radiogroup"
    aria-label="segmented control"
    :tabindex="disabled ? undefined : 0"
    :aria-orientation="vertical ? 'vertical' : 'horizontal'"
    v-bind="divProps"
    :class="[prefixCls, divClass, attrs.class]"
    :style="attrs.style"
    ref="containerRef"
  >
    <div :class="`${prefixCls}-group`">
      <MotionThumb
        :vertical="vertical"
        :prefixCls="prefixCls"
        :value="mergedValue"
        :containerRef="containerRef!"
        :motionName="`${prefixCls}-${motionName}`"
        :direction="direction"
        :getValueIndex="val => segmentedOptions.findIndex(n => n.value === val)"
        @motion-start="
          () => {
            thumbShow = true
          }
        "
        @motion-end="
          () => {
            thumbShow = false
          }
        "
      />
      <template
        v-for="item in segmentedOptions"
        :key="`${item.value}-${controlRerender}`"
      >
        <InternalSegmentedOption
          v-bind="item"
          :name="name"
          :data="item"
          :prefixCls="prefixCls!"
          :class="[
            item.class,
            `${prefixCls}-item`,
            classNames?.item,
            {
              [`${prefixCls}-item-selected`]:
                item.value === mergedValue && !thumbShow,
              [`${prefixCls}-item-selected-text`]: item.value === mergedValue,
              [`${prefixCls}-item-focused`]:
                isFocused && isKeyboard && item.value === mergedValue,
            },
          ]"
          :style="styles?.item"
          :classNames="classNames"
          :styles="styles"
          :checked="item.value === mergedValue"
          @change="handleChange"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown="handleKeyDown"
          @keyup="handleKeyUp"
          @mousedown="handleMouseDown"
          :disabled="!!disabled || !!item.disabled"
        >
          <template #itemRender="ctx">
            <slot name="itemRender" v-bind="ctx"></slot>
          </template>
          <template #label>
            <slot name="label">{{ item.label }}</slot>
          </template>
        </InternalSegmentedOption>
      </template>
    </div>
  </div>
</template>
