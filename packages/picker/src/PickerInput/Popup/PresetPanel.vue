<script setup vapor lang="ts">
import type { ValueDate } from '../../interface'
import { computed } from 'vue'

defineOptions({ name: 'PresetPanel', inheritAttrs: false })

const props = defineProps<{
  prefixCls?: string
  presets: ValueDate<any>[]
  onClick: (value: any) => void
  onHover: (value: any | null) => void
}>()

function executeValue<ValueType>(value: ValueDate<ValueType>['value']): ValueType {
  // `typeof x === 'function'` narrows against the `Function` interface, so the
  // callable branch is narrowed to `() => ValueType` and the other to
  // `Exclude<ValueType, Function>` (which is assignable to `ValueType`).
  // `typeof x === 'function'` 按 `Function` 接口收窄，可调用分支被收窄为
  // `() => ValueType`，另一分支为 `Exclude<ValueType, Function>`。
  return typeof value === 'function'
    ? (value as unknown as () => ValueType)()
    : value
}

const prefixCls = computed(() => props.prefixCls || 'vc-picker')
const panelPrefixCls = computed(() => `${prefixCls.value}-presets`)
const hasPresets = computed(() => (props.presets || []).length > 0)

const onItemClick = (value: any) => {
  props.onClick(executeValue(value))
}

const onItemEnter = (value: any) => {
  props.onHover(executeValue(value))
}

const onItemLeave = () => {
  props.onHover(null)
}
</script>

<template>
  <div v-if="hasPresets" :class="panelPrefixCls">
    <ul>
      <li
        v-for="(preset, index) in presets"
        :key="index"
        @click="onItemClick(preset.value)"
        @mouseenter="onItemEnter(preset.value)"
        @mouseleave="onItemLeave"
      >
        <!-- `label` is display text: `{{ }}` interpolation, which vapor
             compiles to `_toDisplayString`. A component label would stringify
             to `[object Object]`, so preset labels are text-only here.
             `label` 是展示文本：用 `{{ }}` 插值（vapor 编译为
             `_toDisplayString`）。组件类型的 label 会变成 `[object Object]`，
             因此这里的预设标签只支持文本。 -->
        <slot name="label">{{ preset.label }}</slot>
      </li>
    </ul>
  </div>
</template>
