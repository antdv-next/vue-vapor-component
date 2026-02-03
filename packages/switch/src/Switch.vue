<script setup vapor lang="ts">
/* eslint-disable vue/no-reserved-component-names */
import type { SwitchProps } from './interface'
import KeyCode from '@v-c/util/dist/KeyCode'
import { computed, useTemplateRef } from 'vue'

defineOptions({ name: 'Switch' })
const { prefixCls = 'vc-switch', defaultChecked = false, checked = false, className, classNames, disabled, styles, checkedChildren, unCheckedChildren, loadingIcon = undefined } = defineProps<SwitchProps>()
const emit = defineEmits<{
  'change': [checked: boolean, e: Event]
  'update:checked': [checked: boolean]
  'keydown': [e: Event]
  'click': [checked: boolean, e: Event]
}>()
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
  }
  else if (e.which === KeyCode.RIGHT) {
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
  <button ref="btn" type="button" role="switch" :class="switchClassName" :aria-checked="checked || defaultChecked" :disabled="disabled" @keydown="onInternalKeydown" @click="onInternalClick">
    <template v-if="loadingIcon && typeof loadingIcon === 'function'">
      <component :is="loadingIcon" />
    </template>
    <template v-else>
      {{ loadingIcon }}
    </template>
    <span :class="`${prefixCls}-inner`">
      <span :class="[`${prefixCls}-inner-checked`, cls]" :style="sty">
        {{ checkedChildren }}
      </span>
      <span :class="[`${prefixCls}-inner-unchecked`, cls]" :style="sty">
        {{ unCheckedChildren }}
      </span>
    </span>
  </button>
</template>
