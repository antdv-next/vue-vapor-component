<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import type { FlattenOptionData, RawValueType } from './interface'
  import type { BaseOptionType } from './Select'

  import { clsx } from '@v-c/util'
  import KeyCode from '@v-c/util/dist/KeyCode'
  import List from '@vapor-component/virtual-list'
  import { computed, shallowRef, watch } from 'vue'

  import useBaseProps from './hooks/useBaseProps'
  import { useSelectContext } from './SelectContextKey'
  import TransBtn from './TransBtn.vue'
  import { isPlatformMac } from './utils/platformUtil'
  import { isValidCount } from './utils/valueUtil'

  defineOptions({ name: 'OptionList', inheritAttrs: false })

  const baseProps = useBaseProps()
  const context = useSelectContext()

  const itemPrefixCls = computed(() => `${baseProps.value?.prefixCls}-item`)

  const memoFlattenOptions = computed<FlattenOptionData<BaseOptionType>[]>(
    () => {
      return context.value?.flattenOptions || []
    },
  )

  const listRef = shallowRef<any>(null)

  const overMaxCount = computed<boolean>(() => {
    const { maxCount, rawValues } = context.value || {}
    return !!(
      baseProps.value?.multiple &&
      isValidCount(maxCount!) &&
      rawValues &&
      rawValues.size >= maxCount!
    )
  })

  const onListMouseDown = (event: MouseEvent) => {
    event.preventDefault()
  }

  const isSelected = (value: RawValueType): boolean => {
    if (baseProps.value?.mode === 'combobox') return false
    return context.value?.rawValues?.has(value) || false
  }

  const getEnabledActiveIndex = (index: number, offset: number = 1): number => {
    const len = memoFlattenOptions.value.length
    for (let i = 0; i < len; i += 1) {
      const current = (index + i * offset + len) % len
      const { group, data } = memoFlattenOptions.value[current] || {}
      if (
        !group &&
        !data?.disabled &&
        (isSelected(data?.value!) || !overMaxCount.value)
      ) {
        return current
      }
    }
    return -1
  }

  const activeIndex = shallowRef(-1)

  const setActive = (index: number, fromKeyboard = false) => {
    activeIndex.value = index
    const info = {
      source: fromKeyboard ? ('keyboard' as const) : ('mouse' as const),
    }
    const flattenItem = memoFlattenOptions.value[index]
    if (!flattenItem) {
      context.value?.onActiveValue?.(null as any, -1, info)
      return
    }
    context.value?.onActiveValue?.(flattenItem.value!, index, info)
  }

  const getActiveIndexByRawValue = (): number => {
    const rawValues = context.value?.rawValues
    if (baseProps.value?.multiple || rawValues?.size !== 1) return -1
    const value: RawValueType = Array.from(rawValues!)[0]
    const searchValue = baseProps.value?.searchValue
    return memoFlattenOptions.value.findIndex(({ data }) =>
      searchValue
        ? String(data?.value).startsWith(searchValue)
        : data?.value === value,
    )
  }

  watch(
    [() => memoFlattenOptions.value.length, () => baseProps.value?.searchValue],
    () => {
      const defaultFirst = context.value?.defaultActiveFirstOption !== false
      const activeIndexByRawValue = getActiveIndexByRawValue()
      setActive(
        activeIndexByRawValue !== -1
          ? activeIndexByRawValue
          : defaultFirst
            ? getEnabledActiveIndex(0)
            : -1,
      )
    },
    { immediate: true },
  )

  const isAriaSelected = (value: RawValueType): boolean => {
    if (baseProps.value?.mode === 'combobox') {
      return (
        String(value).toLowerCase() ===
        (baseProps.value?.searchValue || '').toLowerCase()
      )
    }
    return context.value?.rawValues?.has(value) || false
  }

  watch(
    [
      () => baseProps.value?.triggerOpen,
      () => baseProps.value?.searchValue,
      () => memoFlattenOptions.value.length,
    ],
    (_, __, onCleanup) => {
      let timeoutId: ReturnType<typeof setTimeout> | undefined
      const rawValues = context.value?.rawValues
      if (
        !baseProps.value?.multiple &&
        baseProps.value?.triggerOpen &&
        rawValues?.size === 1
      ) {
        const index = getActiveIndexByRawValue()
        if (index !== -1) {
          setActive(index)
          timeoutId = setTimeout(() => {
            listRef.value?.scrollTo?.({ index })
          })
        }
      }
      if (baseProps.value?.triggerOpen) {
        listRef.value?.scrollTo?.(undefined as any)
      }
      onCleanup(() => {
        if (timeoutId) clearTimeout(timeoutId)
      })
    },
    { immediate: true, flush: 'post' },
  )

  const onSelectValue = (value?: RawValueType) => {
    if (value !== undefined) {
      context.value?.onSelect?.(value, {
        selected: !context.value?.rawValues?.has(value),
      })
    }
    if (!baseProps.value?.multiple) {
      baseProps.value?.toggleOpen?.(false)
    }
  }

  const onKeyDown = (event: KeyboardEvent) => {
    const { which, ctrlKey } = event
    switch (which) {
      case KeyCode.N:
      case KeyCode.P:
      case KeyCode.UP:
      case KeyCode.DOWN: {
        let offset = 0
        if (which === KeyCode.UP) offset = -1
        else if (which === KeyCode.DOWN) offset = 1
        else if (isPlatformMac() && ctrlKey) {
          if (which === KeyCode.N) offset = 1
          else if (which === KeyCode.P) offset = -1
        }
        if (offset !== 0) {
          const next = getEnabledActiveIndex(activeIndex.value + offset, offset)
          listRef.value?.scrollTo?.({ index: next })
          setActive(next, true)
        }
        break
      }
      case KeyCode.TAB:
      case KeyCode.ENTER: {
        const item = memoFlattenOptions.value[activeIndex.value]
        if (!item || item.data.disabled) {
          onSelectValue(undefined)
          return
        }
        if (!overMaxCount.value || context.value?.rawValues?.has(item.value!)) {
          onSelectValue(item.value)
        } else {
          onSelectValue(undefined)
        }
        if (baseProps.value?.triggerOpen) {
          event.preventDefault()
        }
        break
      }
      case KeyCode.ESC: {
        baseProps.value?.toggleOpen?.(false)
        if (baseProps.value?.triggerOpen) {
          event.stopPropagation()
        }
      }
    }
  }

  const onKeyUp = () => {}

  const listScrollTo = (arg: any) => {
    listRef.value?.scrollTo?.(typeof arg === 'number' ? { index: arg } : arg)
  }

  defineExpose({ onKeyDown, onKeyUp, scrollTo: listScrollTo })
</script>

<template>
  <template v-if="memoFlattenOptions.length === 0">
    <div
      role="listbox"
      :id="`${baseProps?.id}_list`"
      :class="`${itemPrefixCls}-empty`"
      @mousedown="onListMouseDown"
    >
      {{ baseProps?.notFoundContent ?? 'Not Found' }}
    </div>
  </template>
  <template v-else>
    <div
      v-if="context?.virtual"
      role="listbox"
      :id="`${baseProps?.id}_list`"
      :style="{ height: 0, width: 0, overflow: 'hidden' }"
    >
      <template v-for="offset in [-1, 0, 1]" :key="offset">
        <template
          v-if="
            activeIndex + offset >= 0 &&
            activeIndex + offset < memoFlattenOptions.length
          "
        >
          <div
            v-if="!memoFlattenOptions[activeIndex + offset]?.group"
            role="option"
            :id="`${baseProps?.id}_list_${activeIndex + offset}`"
            :aria-selected="
              isAriaSelected(memoFlattenOptions[activeIndex + offset]?.value!)
            "
            :aria-disabled="
              !!memoFlattenOptions[activeIndex + offset]?.data?.disabled
            "
          >
            {{
              memoFlattenOptions[activeIndex + offset]?.label ??
              memoFlattenOptions[activeIndex + offset]?.data?.label
            }}
          </div>
        </template>
      </template>
    </div>
    <List
      ref="listRef"
      :prefix-cls="`${baseProps?.prefixCls}-dropdown-list`"
      :item-key="'key'"
      :data="memoFlattenOptions"
      :height="context?.listHeight"
      :item-height="context?.listItemHeight"
      :full-height="false"
      :virtual="context?.virtual ?? true"
      :direction="context?.direction"
      :show-scroll-bar="baseProps?.showScrollBar ?? 'optional'"
      :class="context?.classNames?.popup?.list"
      :style="context?.styles?.popup?.list"
      @scroll="baseProps?.onPopupScroll"
      @mousedown="onListMouseDown"
    >
      <template #default="{ item, index: itemIndex, setRef }">
        <div v-if="item.group" :ref="setRef">
          <div
            :class="
              clsx(
                itemPrefixCls,
                `${itemPrefixCls}-group`,
                item.data?.className,
              )
            "
            :title="
              typeof item.label === 'string' || typeof item.label === 'number'
                ? String(item.label)
                : undefined
            "
          >
            {{ item.label ?? item.data?.key }}
          </div>
        </div>
        <div
          v-else
          :ref="setRef"
          role="option"
          :id="`${baseProps?.id}_list_${itemIndex}`"
          :aria-selected="
            !context?.virtual ? isAriaSelected(item.value!) : undefined
          "
          :aria-disabled="
            !!(
              item.data?.disabled ||
              (!isSelected(item.value!) && overMaxCount)
            )
          "
          :title="
            item.data?.title ??
            (typeof item.label === 'string' || typeof item.label === 'number'
              ? String(item.label)
              : undefined)
          "
          :class="
            clsx(
              itemPrefixCls,
              `${itemPrefixCls}-option`,
              item.data?.className,
              context?.classNames?.popup?.listItem,
              {
                [`${itemPrefixCls}-option-grouped`]: !!item.groupOption,
                [`${itemPrefixCls}-option-active`]:
                  activeIndex === itemIndex &&
                  !(
                    item.data?.disabled ||
                    (!isSelected(item.value!) && overMaxCount)
                  ),
                [`${itemPrefixCls}-option-disabled`]: !!(
                  item.data?.disabled ||
                  (!isSelected(item.value!) && overMaxCount)
                ),
                [`${itemPrefixCls}-option-selected`]: !!isSelected(item.value!),
              },
            )
          "
          :style="
            {
              ...context?.styles?.popup?.listItem,
              ...item.data?.style,
            } as CSSProperties
          "
          @mousemove="
            () => {
              if (
                activeIndex !== itemIndex &&
                !(
                  item.data?.disabled ||
                  (!isSelected(item.value!) && overMaxCount)
                )
              )
                setActive(itemIndex)
            }
          "
          @mousedown="
            (event: MouseEvent) => {
              event.preventDefault()
              if (!(
                item.data?.disabled ||
                (!isSelected(item.value!) && overMaxCount)
              ))
                onSelectValue(item.value)
            }
          "
        >
          <div :class="`${itemPrefixCls}-option-content`">
            <template v-if="typeof context?.optionRender === 'function'">
              {{ context?.optionRender(item, { index: itemIndex }) }}
            </template>
            <template v-else>
              {{
                typeof item.label === 'number'
                  ? item.label
                  : (item.label ?? item.value)
              }}
            </template>
          </div>
          <TransBtn
            v-if="
              !context?.menuItemSelectedIcon ||
              typeof context?.menuItemSelectedIcon === 'function' ||
              isSelected(item.value!)
            "
            :class="`${itemPrefixCls}-option-state`"
          >
            {{ isSelected(item.value!) ? '✓' : null }}
          </TransBtn>
        </div>
      </template>
    </List>
  </template>
</template>
