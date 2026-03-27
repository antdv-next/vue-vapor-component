<script setup vapor lang="ts">
  import type {
    KeyboardEventHandler,
  } from '@v-c/util/dist/EventInterface'

  import type { RateProps } from './interface'

  import { clsx } from '@v-c/util'
  import useMergedState from '@v-c/util/dist/hooks/useMergedState'
  import KeyCode from '@v-c/util/dist/KeyCode'
  import pickAttrs from '@v-c/util/dist/pickAttrs'
  import { getAttrStyleAndClass } from '@v-c/util/dist/props-util'
  import { computed, onMounted, ref, useAttrs } from 'vue'

  import Star from './Star.vue'
  import useRefs from './useRefs'
  import { getOffsetLeft } from './util'
  defineOptions({ name: 'Rate' })
  const props = withDefaults(defineProps<RateProps>(), {
    prefixCls: 'vc-rate',
    count: 5,
    allowHalf: false,
    allowClear: true,
    keyboard: true,
    character: '★',
    direction: 'ltr',
    tabIndex: 0,
  })
  const attrs = useAttrs()


  const [setStarRef, starRefs] = useRefs()
  const rateRef = ref<HTMLUListElement | null>(null)


  const triggerFocus = () => {
    if (!props.disabled) {
      rateRef.value?.focus()
    }
  }


  const triggerBlur = () => {
    if (!props.disabled) {
      rateRef.value?.blur()
    }
  }


  defineExpose({
    focus: triggerFocus,
    blur: triggerBlur,
  })


  const [state, setStateValue] = useMergedState(props.defaultValue || 0, {
    value: computed(() => props.value),
  })


  const [cleanedValue, setCleanedValue] = useMergedState<number | null>(null)


  const getStarValue = (index: number, x: number) => {
    const { direction, allowHalf } = props
    const reverse = direction === 'rtl'
    let starValue = index + 1
    if (allowHalf) {
      const starEle = starRefs.value.get(index) as HTMLElement
      const leftDis = getOffsetLeft(starEle)
      const width = starEle.clientWidth
      if (reverse && x - leftDis > width / 2) {
        starValue -= 0.5
      } else if (!reverse && x - leftDis < width / 2) {
        starValue -= 0.5
      }
    }
    return starValue
  }


  const changeValue = (nextValue: number) => {
    setStateValue(nextValue)
    props?.onChange?.(nextValue)
  }


  const focused = ref(false)


  const onInternalFocus = () => {
    focused.value = true
    props?.onFocus?.()
  }


  const onInternalBlur = () => {
    focused.value = false
    props?.onBlur?.()
  }


  // =========================== Hover ============================
  const hoverValue = ref<number | null>(null)


  const onHover = (event: MouseEvent, index: number) => {
    const nextHoverValue = getStarValue(index, event.pageX)
    if (nextHoverValue !== cleanedValue.value) {
      hoverValue.value = nextHoverValue
      setCleanedValue(null)
    }
    props?.onHoverChange?.(nextHoverValue)
  }


  const onMouseLeaveCallback = (event?: MouseEvent) => {
    const { disabled } = props
    if (!disabled) {
      hoverValue.value = null
      setCleanedValue(null)
      props?.onHoverChange?.(undefined)
    }
    if (event) {
      props?.onMouseLeave?.(event)
    }
  }


  const onClick = (event: MouseEvent | KeyboardEvent, index: number) => {
    const { allowClear } = props
    const newValue = getStarValue(index, (event as MouseEvent).pageX)
    let isReset = false
    if (allowClear) {
      isReset = newValue === state.value
    }
    onMouseLeaveCallback()
    changeValue(isReset ? 0 : newValue)
    setCleanedValue(isReset ? newValue : null)
  }


  const onInternalKeyDown: KeyboardEventHandler = event => {
    const { keyCode } = event
    const {value} = state
    const { keyboard, count, direction, allowHalf } = props
    const reverse = direction === 'rtl'
    const step = allowHalf ? 0.5 : 1


    if (keyboard) {
      if (keyCode === KeyCode.RIGHT && value < count && !reverse) {
        changeValue(value + step)
        event.preventDefault()
      } else if (keyCode === KeyCode.LEFT && value > 0 && !reverse) {
        changeValue(value - step)
        event.preventDefault()
      } else if (keyCode === KeyCode.RIGHT && value > 0 && reverse) {
        changeValue(value - step)
        event.preventDefault()
      } else if (keyCode === KeyCode.LEFT && value < count && reverse) {
        changeValue(value + step)
        event.preventDefault()
      }
    }


    props?.onKeyDown?.(event)
  }


  onMounted(() => {
    const { autoFocus, disabled } = props
    if (autoFocus && !disabled) {
      triggerFocus()
    }
  })
  const { className, style, restAttrs } = getAttrStyleAndClass(attrs)
  const classString = clsx(props.prefixCls, className, {
    [`${props.prefixCls}-disabled`]: props.disabled,
    [`${props.prefixCls}-rtl`]: props.direction === 'rtl',
  })
  const cls = (index: number) => {
    const { prefixCls: prefix, allowHalf, disabled } = props
    const prefixCls = `${prefix}-star`
    const value = hoverValue.value === null ? state.value : hoverValue.value
    const focused = disabled ? null : onInternalFocus()
    const starValue = index + 1
    let className = prefixCls
    if (value === 0 && index === 0 && focused) {
      className += ` ${prefixCls}-focused`
    } else if (allowHalf && value + 0.5 >= starValue && value < starValue) {
      className += ` ${prefixCls}-star-half ${prefixCls}-active`
      if (focused) {
        className += ` ${prefixCls}-focused`
      }
    } else {
      if (starValue <= value) {
        className += ` ${prefixCls}-full`
      } else {
        className += ` ${prefixCls}-zero`
      }
      if (starValue === value && focused) {
        className += ` ${prefixCls}-focused`
      }
    }
    return className
  }
</script>

<template>
  <ul
    :id="id"
    :class="classString"
    :style="style"
    @mouseleave="onMouseLeaveCallback"
    :tabindex="disabled ? -1 : tabIndex"
    @focus="() => disabled ? null : onInternalFocus()"
    @blur="() => disabled ? null : onInternalBlur()"
    @keydown="e =>disabled ? null : onInternalKeyDown(e)"
    ref="rateRef"
    v-bind="{ ...pickAttrs(restAttrs, { aria: true, data: true, attr: true }) }"
  >
    <template v-for="(item, index) in count" :key="item">
      <!-- <Star
        :ref="el => setStarRef(el, index)"
        :index="index"
        :count="count"
        :disabled="disabled"
        :prefixCls="`${prefixCls}-star`"
        :allowHalf="allowHalf"
        :value="hoverValue === null ? state : hoverValue"
        @click="onClick"
        @hover="onHover"
        :character="character"
        :focused="focused"
      >
        <template #characterRender>
          <slot name="characterRender"></slot>
        </template>
        <template #firstCharacterNode="ctx">
          <slot name="firstCharacterNode" v-bind="ctx"></slot>
        </template>
        <template #secondCharacterNode="ctx">
          <slot name="secondCharacterNode" v-bind="ctx"></slot>
        </template>
      </Star> -->
      <li :class="cls(index)" :ref="setStarRef(index)">
        <div
          @click="e => disabled ? null : onClick(e, index)"
          @keydown="e => disabled ? null : onInternalKeyDown(e)"
          @mousemove="e => disabled ? null : onHover(e, index)"
          role="radio"
          :aria-checked="(hoverValue === null ? state : hoverValue) > index ? 'true' : 'false'"
          :aria-posinset="index + 1"
          :aria-setsize="count"
          :tabindex="disabled ? -1 : 0"
        >
          <div :class="`${prefixCls}-star-first`">
            <slot
              name="firstCharacterNode"
              :disabled="disabled"
              :prefixCls="prefixCls"
              :index="index"
              :count="count"
              :value="value"
            >
              {{ character }}
            </slot>
          </div>
          <div :class="`${prefixCls}-star-second`">
            <slot
              name="secondCharacterNode"
              :disabled="disabled"
              :prefixCls="prefixCls"
              :index="index"
              :count="count"
              :value="value"
            >
              {{ character }}
            </slot>
          </div>
        </div>
      </li>
    </template>
  </ul>
</template>
