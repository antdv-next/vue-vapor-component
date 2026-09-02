<script lang="ts">
  export const FIX_LABEL = '__cascader_fix_label__'
</script>

<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'
  import type { DefaultOptionType, LegacyKey, SingleValueType } from '../interface'
  import { clsx } from '@v-c/util'
  import pickAttrs from '@v-c/util/dist/pickAttrs'
  import { computed, nextTick, ref, watch } from 'vue'
  import { useCascaderContext } from '../CascaderContextKey'
  import { SEARCH_MARK } from '../hooks/useSearchOptions'
  import { isLeaf, scrollIntoParentView, toPathKey } from '../utils/commonUtil'
  import Checkbox from './Checkbox.vue'

  const props = defineProps<{
    prefixCls: string
    multiple?: boolean
    options: DefaultOptionType[]
    activeValue?: LegacyKey
    prevValuePath: LegacyKey[]
    checkedSet: Set<LegacyKey>
    halfCheckedSet: Set<LegacyKey>
    loadingKeys: LegacyKey[]
    disabled?: boolean
  }>()

  const emit = defineEmits<{
    toggleOpen: [open: boolean]
    select: [valuePath: SingleValueType, leaf: boolean]
    active: [valuePath: SingleValueType]
  }>()

  const menuRef = ref<HTMLUListElement | null>(null)
  const context = useCascaderContext()

  const menuPrefixCls = computed(() => `${props.prefixCls}-menu`)
  const menuItemPrefixCls = computed(() => `${props.prefixCls}-menu-item`)
  const hoverOpen = computed(() => context.value?.expandTrigger === 'hover')

  const isOptionDisabled = (disabled?: boolean) => props.disabled || disabled

  const optionInfoList = computed(() => {
    const fieldNames = context.value?.fieldNames
    if (!fieldNames) {
      return []
    }

    return props.options.map((option) => {
      const { disabled, disableCheckbox } = option
      const searchOptions: Record<string, any>[] = (option as any)[SEARCH_MARK]
      const label = (option as any)[FIX_LABEL] ?? option[fieldNames.label]
      const value = (option as any)[fieldNames.value]

      const isMergedLeaf = isLeaf(option, fieldNames)

      const fullPath = searchOptions
        ? searchOptions.map((opt) => opt[fieldNames.value])
        : [...props.prevValuePath, value]
      const fullPathKey = toPathKey(fullPath as SingleValueType)

      const isLoading = props.loadingKeys.includes(fullPathKey)
      const checked = props.checkedSet.has(fullPathKey)
      const halfChecked = props.halfCheckedSet.has(fullPathKey)

      return {
        disabled,
        label,
        value,
        isLeaf: isMergedLeaf,
        isLoading,
        checked,
        halfChecked,
        option,
        disableCheckbox,
        fullPath,
        fullPathKey,
      }
    })
  })

  const isSelectable = (option: DefaultOptionType) => {
    const fieldNames = context.value?.fieldNames
    if (!fieldNames) {
      return false
    }
    const isMergedLeaf = isLeaf(option, fieldNames)
    return (
      !option.disabled &&
      (isMergedLeaf || context.value?.changeOnSelect || props.multiple)
    )
  }

  watch(
    () => props.activeValue,
    () => {
      if (!menuRef.value) return
      nextTick(() => {
        const selector = `.${menuItemPrefixCls.value}-active`
        const activeElement = menuRef.value?.querySelector<HTMLElement>(selector)
        if (activeElement) {
          scrollIntoParentView(activeElement)
        }
      })
    },
    { immediate: true },
  )
</script>

<template>
  <ul
    :class="clsx(menuPrefixCls, context?.classNames?.popup?.list)"
    :style="context?.styles?.popup?.list as CSSProperties"
    ref="menuRef"
    role="menu"
  >
    <template v-for="info in optionInfoList" :key="info.fullPathKey">
      <li
        v-bind="pickAttrs(info.option as any, { aria: true, data: true }) as any"
        :class="
          clsx(menuItemPrefixCls, context?.classNames?.popup?.listItem, {
            [menuItemPrefixCls + '-expand']: !info.isLeaf,
            [menuItemPrefixCls + '-active']:
              activeValue === info.value || activeValue === info.fullPathKey,
            [menuItemPrefixCls + '-disabled']: isOptionDisabled(info.disabled),
            [menuItemPrefixCls + '-loading']: info.isLoading,
          })
        "
        :style="{
          ...(context?.popupMenuColumnStyle as CSSProperties || {}),
          ...(context?.styles?.popup?.listItem as CSSProperties || {}),
        }"
        role="menuitemcheckbox"
        :title="
          typeof info.option?.title === 'string'
            ? info.option.title
            : typeof info.label === 'string'
              ? info.label
              : undefined
        "
        :aria-checked="info.checked"
        :data-path-key="info.fullPathKey"
        @click="
          () => {
            if (isOptionDisabled(info.disabled)) return
            const nextValueCells = [...info.fullPath] as SingleValueType
            if (hoverOpen && info.isLeaf) {
              nextValueCells.pop()
            }
            emit('active', nextValueCells)
            if (info.disableCheckbox) return
            if (!multiple || info.isLeaf) {
              if (isSelectable(info.option)) {
                emit('select', info.fullPath as SingleValueType, info.isLeaf)
              }
            }
          }
        "
        @dblclick="
          () => {
            if (context?.changeOnSelect) {
              emit('toggleOpen', false)
            }
          }
        "
        @mouseenter="
          () => {
            if (hoverOpen) {
              if (!isOptionDisabled(info.disabled)) {
                const nextValueCells = [...info.fullPath] as SingleValueType
                if (hoverOpen && info.isLeaf) {
                  nextValueCells.pop()
                }
                emit('active', nextValueCells)
              }
            }
          }
        "
        @mousedown="(e) => e.preventDefault()"
      >
        <template v-if="multiple">
          <Checkbox
            :prefix-cls="prefixCls + '-checkbox'"
            :checked="info.checked"
            :half-checked="info.halfChecked"
            :disabled="isOptionDisabled(info.disabled) || info.disableCheckbox"
            :disable-checkbox="info.disableCheckbox"
          />
        </template>
        <div :class="menuItemPrefixCls + '-content'">
          <template v-if="context?.optionRender && info.value !== '__EMPTY__'">
            {{ context.optionRender(info.option) }}
          </template>
          <template v-else>{{ info.label }}</template>
        </div>
        <div
          v-if="!info.isLoading && context?.expandIcon && !info.isLeaf"
          :class="menuItemPrefixCls + '-expand-icon'"
        >
          {{ context.expandIcon }}
        </div>
        <div
          v-if="info.isLoading && context?.loadingIcon"
          :class="menuItemPrefixCls + '-loading-icon'"
        >
          {{ context.loadingIcon }}
        </div>
      </li>
    </template>
  </ul>
</template>
