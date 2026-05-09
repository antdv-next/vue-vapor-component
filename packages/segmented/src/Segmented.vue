<script setup lang="ts" vapor>
  import type { ChangeEvent } from '@v-c/util/dist/EventInterface'

  import type {
    SegmentedLabeledOption,
    SegmentedOptions,
    SegmentedProps,
    SegmentedRawOption,
  } from './interface'

  import omit from '@v-c/util/dist/omit'
  import { computed, useAttrs, ref, shallowRef, watch } from 'vue'

  import InternalSegmentedOption from './InternalSegmentedOption.vue'
  import MotionThumb from './MotionThumb.vue'
  defineOptions({ name: 'Segmented' })
  const props = withDefaults(defineProps<SegmentedProps>(), {
    prefixCls: 'vc-segmented',
    options: [],
    motionName: 'thumb-motion',
  })
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

  // Note: We should not auto switch value when value not exist in options
  // which may break single source of truth.
  const rawValue = shallowRef(
    props?.value ?? props?.defaultValue ?? (props?.options?.[0] as any)?.value,
  )
  watch(
    () => props.value,
    () => {
      rawValue.value = props.value as any
    },
  )
  // ======================= Change ========================
  const thumbShow = shallowRef(false)
  const handleChange = (_event: ChangeEvent, val: SegmentedRawOption) => {
    rawValue.value = val
    props?.onChange?.(val)
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
    const currentIndex = segmentedOptions.value.findIndex(
      option => option?.value === rawValue.value,
    )

    const total = segmentedOptions.value.length
    const nextIndex = (currentIndex + offset + total) % total
    const nextOption = segmentedOptions.value[nextIndex]
    if (nextOption) {
      rawValue.value = nextOption.value
      props?.onChange?.(nextOption.value)
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
  const divProps = omit(useAttrs(), ['class', 'style'])
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
    :class="[prefixCls, divClass]"
    ref="containerRef"
  >
    <div :class="`${prefixCls}-group`">
      <MotionThumb
        :vertical="vertical"
        :prefixCls="prefixCls!"
        :value="rawValue"
        :containerRef="containerRef!"
        :motionName="`${prefixCls}-${motionName}`"
        :direction="direction"
        :getValueIndex="val => segmentedOptions.findIndex(n => n.value === val)"
        @motionStart="
          () => {
            thumbShow = true
          }
        "
        @motionEnd="
          () => {
            thumbShow = false
          }
        "
      />
      <template v-for="item in segmentedOptions" :key="item.value">
        <InternalSegmentedOption
          v-bind="item"
          :name="name"
          :data="item"
          :itemRender="itemRender"
          :prefixCls="prefixCls!"
          :class="[
            item.class,
            `${prefixCls}-item`,
            classNames?.item,
            {
              [`${prefixCls}-item-selected`]:
                item.value === rawValue && !thumbShow,
              [`${prefixCls}-item-focused`]:
                isFocused && isKeyboard && item.value === rawValue,
            },
          ]"
          :style="styles?.item"
          :classNames="classNames"
          :styles="styles"
          :checked="itemRender === rawValue"
          :onChange="handleChange"
          :onFocus="handleFocus"
          :onBlur="handleBlur"
          @keyDown="{ handleKeyDown }"
          @keyUp="{ handleKeyUp }"
          @mouseDown="{ handleMouseDown }"
          :disabled="!!disabled || !!item.disabled"
        >
          <template #itemRender>
            <slot name="itemRender"></slot>
          </template>
        </InternalSegmentedOption>
      </template>
    </div>
  </div>
</template>
