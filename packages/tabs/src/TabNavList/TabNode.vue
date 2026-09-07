<script setup vapor lang="ts">
  import type { TabNodeProps } from '../interface'

  import { computed, useTemplateRef, watch } from 'vue'

  import { genDataNodeKey, getRemovable } from '../utils'

  defineOptions({ name: 'VcTabsTabNode', inheritAttrs: false })

  const props = defineProps<TabNodeProps>()

  const emit = defineEmits<{
    click: [e: MouseEvent | KeyboardEvent]
    'remove-tab': [key: string, e: MouseEvent | KeyboardEvent]
    resize: [width: number, height: number, left: number, top: number]
    keydown: [e: KeyboardEvent]
    mousedown: [e: MouseEvent]
    mouseup: [e: MouseEvent]
    focus: [e: FocusEvent]
    blur: [e: FocusEvent]
  }>()

  const nodeRef = useTemplateRef<HTMLDivElement>('nodeRef')
  const btnRef = useTemplateRef<HTMLElement>('btnRef')

  const removable = computed(() =>
    getRemovable(
      props.closable,
      props.tab.closeIcon,
      props.editable,
      props.tab.disabled,
    ),
  )

  const tabPrefix = computed(() => `${props.prefixCls}-tab`)

  const nodeCls = computed(() => [
    tabPrefix.value,
    props.className,
    props.classNames?.item,
    {
      [`${tabPrefix.value}-with-remove`]: removable.value,
      [`${tabPrefix.value}-active`]: props.active,
      [`${tabPrefix.value}-disabled`]: props.tab.disabled,
      [`${tabPrefix.value}-focus`]: props.focus,
    },
  ])

  const mergedStyle = computed(() => ({
    ...props.styles?.item,
    ...props.style,
  }))

  function onInternalClick(e: MouseEvent | KeyboardEvent) {
    if (props.tab.disabled) {
      return
    }
    emit('click', e)
  }

  function onRemove(event: MouseEvent | KeyboardEvent) {
    event.preventDefault()
    event.stopPropagation()
    emit('remove-tab', props.tab.key, event)
  }

  watch(
    () => props.focus,
    () => {
      if (props.focus && btnRef.value) {
        btnRef.value.focus()
      }
    },
    { immediate: true },
  )

  watch(
    [
      () => props.active,
      () => props.tab.disabled,
      () => props.focus,
      () => removable.value,
    ],
    () => {
      const el = nodeRef.value
      if (!el) return
      el.classList.toggle(`${tabPrefix.value}-active`, props.active)
      el.classList.toggle(`${tabPrefix.value}-disabled`, props.tab.disabled)
      el.classList.toggle(`${tabPrefix.value}-focus`, props.focus)
      el.classList.toggle(`${tabPrefix.value}-with-remove`, removable.value)
    },
    { immediate: true },
  )
</script>

<template>
  <div
    ref="nodeRef"
    :data-node-key="genDataNodeKey(tab.key)"
    :class="nodeCls"
    :style="mergedStyle"
    @click="onInternalClick"
  >
    <div
      ref="btnRef"
      :id="id != null ? `${id}-tab-${tab.key}` : undefined"
      role="tab"
      :aria-selected="active"
      :class="`${tabPrefix}-btn`"
      :aria-controls="id != null ? `${id}-panel-${tab.key}` : undefined"
      :aria-disabled="tab.disabled"
      :tabindex="tab.disabled ? undefined : active ? 0 : -1"
      @click.stop="onInternalClick"
      @keydown="e => emit('keydown', e)"
      @mousedown="e => emit('mousedown', e)"
      @mouseup="e => emit('mouseup', e)"
      @focus="e => emit('focus', e)"
      @blur="e => emit('blur', e)"
    >
      <div
        v-if="focus"
        aria-live="polite"
        style="
          width: 0;
          height: 0;
          position: absolute;
          overflow: hidden;
          opacity: 0;
        "
      >
        Tab {{ currentPosition }} of {{ tabCount }}
      </div>
      <span v-if="tab.icon" :class="`${tabPrefix}-icon`">
        <template v-if="tab.icon">{{ tab.icon }}</template>
      </span>
      <template v-if="tab.label">{{ tab.label }}</template>
    </div>
    <button
      v-if="removable"
      type="button"
      :aria-label="removeAriaLabel || 'remove'"
      :tabindex="active ? 0 : -1"
      :class="[`${tabPrefix}-remove`, classNames?.remove]"
      :style="styles?.remove"
      @click.stop="onRemove"
    >
      <template v-if="tab.closeIcon">{{ tab.closeIcon }}</template>
      <template v-else-if="editable?.removeIcon">{{
        editable.removeIcon
      }}</template>
      <template v-else>×</template>
    </button>
  </div>
</template>
