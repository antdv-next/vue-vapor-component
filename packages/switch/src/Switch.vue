<script setup vapor lang="ts">
  import type { SwitchProps, SwitchSlots, SwitchEmits } from './interface'

  import KeyCode from '@v-c/util/dist/KeyCode'
  import { computed, useTemplateRef } from 'vue'

  defineOptions({ name: 'Switch' })
  const {
    prefixCls = 'vc-switch',
    defaultChecked = false,
    checked = false,
    className,
    classNames,
    disabled,
    styles,
    checkedChildren,
    unCheckedChildren,
  } = defineProps<SwitchProps>()
  const emit = defineEmits<SwitchEmits>()
  defineSlots<SwitchSlots>()
  const btnRef = useTemplateRef('btn')

  const switchClassName = computed(() => [
    prefixCls,
    className,
    {
      [`${prefixCls}-checked`]: checked,
      [`${prefixCls}-disabled`]: disabled,
    },
  ])
  const cls = computed(() => classNames?.content)
  const sty = computed(() => styles?.content)
  function triggerChange(
    newChecked: boolean,
    event: MouseEvent | KeyboardEvent,
  ) {
    let mergedChecked = checked || defaultChecked

    if (!disabled) {
      mergedChecked = newChecked
      emit('change', mergedChecked, event)
    }
    emit('update:checked', mergedChecked!)

    return mergedChecked
  }
  function onInternalKeydown(e: KeyboardEvent) {
    if (e.which === KeyCode.LEFT) {
      triggerChange(false, e)
    } else if (e.which === KeyCode.RIGHT) {
      triggerChange(true, e)
    }
    emit('keydown', e)
  }
  function onInternalClick(e: MouseEvent) {
    const ret = triggerChange(!(checked || defaultChecked), e)
    emit('click', ret, e)
  }
  defineExpose({
    btnRef,
  })
</script>

<template>
  <button
    type="button"
    role="switch"
    ref="btn"
    :class="switchClassName"
    :aria-checked="checked || defaultChecked"
    :disabled="disabled"
    @keydown="onInternalKeydown"
    @click="onInternalClick"
  >
    <slot name="loadingIcon"></slot>
    <span :class="`${prefixCls}-inner`">
      <span :class="[`${prefixCls}-inner-checked`, cls]" :style="sty">
        <slot name="checkedChildren">{{ checkedChildren }}</slot>
      </span>
      <span :class="[`${prefixCls}-inner-unchecked`, cls]" :style="sty">
        <slot name="unCheckedChildren">{{ unCheckedChildren }}</slot>
      </span>
    </span>
  </button>
</template>
