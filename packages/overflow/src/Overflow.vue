<script setup vapor lang="ts">
  import type { Key, VueNode } from '@v-c/util/dist/type'
  import type { CSSProperties } from 'vue'

  import type { OverflowProps, OverflowContextType } from './interface'

  import { clsx } from '@v-c/util'
  import omit from '@v-c/util/dist/omit'
  import ResizeObserver from '@vapor-component/resize-observer'
  import { computed, nextTick, ref, useAttrs, watchEffect } from 'vue'

  import useEffectState, { useBatcher } from './hooks/useEffectState'
  import { RESPONSIVE, INVALIDATE } from './interface'
  import Item from './Item.vue'
  import OverflowContextProvider from './OverflowContextProvider.vue'

  defineOptions({ name: 'Overflow', inheritAttrs: false })

  const props = withDefaults(defineProps<OverflowProps>(), {
    prefixCls: 'vc-overflow',
    itemWidth: 10,
  })

  const attrs = useAttrs()
  const emit = defineEmits<{
    'visible-change': [count: number]
  }>()
  const notifyEffectUpdate = useBatcher()

  const [containerWidth, setContainerWidth] = useEffectState<number | null>(
    notifyEffectUpdate,
    null,
  )
  const mergedContainerWidth = computed(() => containerWidth.value || 0)

  const [itemWidths, setItemWidths] = useEffectState<Map<Key, number>>(
    notifyEffectUpdate,
    new Map<Key, number>(),
  )

  const [prevRestWidth, setPrevRestWidth] = useEffectState<number>(
    notifyEffectUpdate,
    0,
  )
  const [restWidth, setRestWidth] = useEffectState<number>(
    notifyEffectUpdate,
    0,
  )

  const [prefixWidth, setPrefixWidth] = useEffectState<number>(
    notifyEffectUpdate,
    0,
  )
  const [suffixWidth, setSuffixWidth] = useEffectState<number>(
    notifyEffectUpdate,
    0,
  )

  const suffixFixedStart = ref<number | null>(null)

  const displayCount = ref<number | null>(null)
  const mergedDisplayCount = computed(() => {
    if (displayCount.value === null && props.ssr === 'full') {
      return Number.MAX_SAFE_INTEGER
    }
    return displayCount.value || 0
  })

  const restReady = ref(false)

  const itemPrefixCls = computed(() => `${props.prefixCls}-item`)

  const mergedRestWidth = computed(() =>
    Math.max(prevRestWidth.value!, restWidth.value!),
  )

  // ================================= Data =================================
  const data = computed(() => props.data ?? [])
  const isResponsive = computed(() => props.maxCount === RESPONSIVE)
  const shouldResponsive = computed<boolean>(
    () => data.value.length > 0 && isResponsive.value,
  )
  const invalidate = computed(() => props.maxCount === INVALIDATE)

  const showRest = computed(
    () =>
      shouldResponsive.value ||
      (typeof props.maxCount === 'number' &&
        data.value.length > props.maxCount),
  )

  const mergedData = computed(() => {
    let items = data.value

    if (shouldResponsive.value) {
      if (containerWidth.value === null && props.ssr === 'full') {
        items = data.value
      } else {
        const mergedItemWidth = props.itemWidth ?? 10
        const maxLen = Math.min(
          data.value.length,
          mergedContainerWidth.value / mergedItemWidth,
        )
        items = data.value.slice(0, Math.floor(maxLen))
      }
    } else if (typeof props.maxCount === 'number') {
      items = data.value.slice(0, props.maxCount)
    }

    return items
  })

  const omittedItems = computed(() => {
    if (shouldResponsive.value) {
      return data.value.slice(mergedDisplayCount.value + 1)
    }
    return data.value.slice(mergedData.value.length)
  })

  // ================================= Item =================================
  function getKey(item: any, index: number): Key {
    const { itemKey } = props
    if (typeof itemKey === 'function') {
      return itemKey(item)
    }
    if (itemKey != null) {
      return (item as any)?.[itemKey] ?? index
    }
    return index
  }

  function updateDisplayCount(
    count: number,
    suffixFixedStartVal?: number | null,
    notReady?: boolean,
  ) {
    if (
      displayCount.value === count &&
      (suffixFixedStartVal === undefined ||
        suffixFixedStartVal === suffixFixedStart.value)
    ) {
      return
    }

    displayCount.value = count
    if (notReady !== true) {
      restReady.value = count < data.value.length - 1
      emit('visible-change', count)
    }

    if (suffixFixedStartVal !== undefined) {
      suffixFixedStart.value = suffixFixedStartVal
    }
  }

  // ================================= Size =================================
  function onOverflowResize(_size: object, element: HTMLElement) {
    setContainerWidth(element.clientWidth)
  }

  function registerSize(key: Key, width: number | null) {
    setItemWidths(origin => {
      const clone = new Map(origin || [])
      if (width === null) {
        clone.delete(key)
      } else {
        clone.set(key, width)
      }
      return clone
    })
  }

  function registerOverflowSize(_key: Key, width: number | null) {
    setRestWidth(width ?? 0)
    setPrevRestWidth(restWidth.value!)
  }

  function registerPrefixSize(_key: Key, width: number | null) {
    setPrefixWidth(width ?? 0)
  }

  function registerSuffixSize(_key: Key, width: number | null) {
    setSuffixWidth(width ?? 0)
  }

  // ================================ Effect ================================
  function getItemWidth(index: number) {
    const key = getKey(mergedData.value[index], index)
    return itemWidths.value?.get(key)
  }

  watchEffect(
    () => {
      const container = mergedContainerWidth.value
      const rest = mergedRestWidth.value
      const list = mergedData.value

      if (container && typeof rest === 'number' && list) {
        let totalWidth = prefixWidth.value! + suffixWidth.value!

        const len = list.length
        const lastIndex = len - 1

        if (!len) {
          updateDisplayCount(0, null)
          return
        }

        for (let i = 0; i < len; i += 1) {
          let currentItemWidth = getItemWidth(i)

          if (props.ssr === 'full') {
            currentItemWidth = currentItemWidth || 0
          }

          if (currentItemWidth === undefined) {
            updateDisplayCount(i - 1, undefined, true)
            break
          }

          totalWidth += currentItemWidth

          if (
            (lastIndex === 0 && totalWidth <= container) ||
            (i === lastIndex - 1 &&
              totalWidth + (getItemWidth(lastIndex) ?? 0) <= container)
          ) {
            updateDisplayCount(lastIndex, null)
            break
          } else if (totalWidth + rest > container) {
            updateDisplayCount(
              i - 1,
              totalWidth -
                currentItemWidth -
                suffixWidth.value! +
                restWidth.value!,
            )
            break
          }
        }

        const suffixContent = resolveContent(props.suffix)
        if (
          suffixContent &&
          getItemWidth(0) != null &&
          suffixWidth.value! + getItemWidth(0)! > container
        ) {
          suffixFixedStart.value = null
        }
      }
    },
    { flush: 'post' },
  )

  // ================================= Render helpers =================================
  function resolveContent(
    value: VueNode | (() => VueNode) | undefined,
  ): VueNode | undefined {
    if (typeof value === 'function') return (value as () => VueNode)()
    return value
  }

  const prefixContent = computed(() => resolveContent(props.prefix))
  const suffixContent = computed(() => resolveContent(props.suffix))

  const restContent = computed<VueNode>(() => {
    const renderRest = props.renderRest
    if (typeof renderRest === 'function') {
      return (renderRest as (items: any[]) => VueNode)(omittedItems.value)
    }
    return renderRest ?? `+ ${omittedItems.value.length} ...`
  })

  const displayRest = computed(
    () => restReady.value && !!omittedItems.value.length,
  )

  const suffixStyle = computed<CSSProperties>(() => {
    if (suffixFixedStart.value !== null && shouldResponsive.value) {
      return {
        position: 'absolute',
        top: 0,
        insetInlineStart: `${suffixFixedStart.value}px`,
      }
    }
    return {}
  })

  const rootCls = computed(() =>
    clsx(!invalidate.value && props.prefixCls, attrs.class as any),
  )

  const rootStyle = computed<CSSProperties>(() => {
    const result: CSSProperties = {}
    const parentStyle = attrs.style
    if (
      parentStyle &&
      typeof parentStyle === 'object' &&
      !Array.isArray(parentStyle)
    ) {
      for (const key in parentStyle) {
        result[key] = parentStyle[key]
      }
    }
    return result
  })

  const restAttrs = computed(() =>
    omit(attrs as Record<string, any>, ['class', 'style', 'default']),
  )

  // SSR full mode: ensure initial measurement triggers
  const ssrFullInitialized = ref(false)
  watchEffect(() => {
    if (
      props.ssr === 'full' &&
      !ssrFullInitialized.value &&
      containerWidth.value === null
    ) {
      nextTick(() => {
        ssrFullInitialized.value = true
        notifyEffectUpdate(() => {})
      })
    }
  })
</script>

<template>
  <ResizeObserver :disabled="!shouldResponsive" @resize="onOverflowResize">
    <component
      :is="component ?? 'div'"
      :class="rootCls"
      :style="rootStyle"
      v-bind="restAttrs"
    >
      <!-- Prefix -->
      <Item
        v-if="prefixContent"
        :prefixCls="itemPrefixCls + '-prefix'"
        :order="-1"
        :responsive="isResponsive"
        :responsiveDisabled="!shouldResponsive"
        :registerSize="registerPrefixSize"
        :component="itemComponent"
        :invalidate="invalidate"
      >
        {{ prefixContent }}
      </Item>

      <!-- Data items -->
      <template v-for="(item, idx) in mergedData">
        <OverflowContextProvider
          v-if="renderRawItem"
          :value="
            {
              prefixCls: itemPrefixCls,
              responsive: shouldResponsive,
              component: itemComponent,
              invalidate,
              order: idx,
              item,
              itemKey: getKey(item, idx),
              registerSize,
              display: idx <= mergedDisplayCount,
            } as OverflowContextType
          "
        >
          <component :is="renderRawItem(item, idx)" />
        </OverflowContextProvider>
        <Item
          v-else
          :key="getKey(item, idx)"
          :prefixCls="itemPrefixCls"
          :item="item"
          :order="idx"
          :itemKey="getKey(item, idx)"
          :registerSize="registerSize"
          :display="idx <= mergedDisplayCount"
          :renderItem="renderItem"
          :responsive="shouldResponsive"
          :component="itemComponent"
          :invalidate="invalidate"
        />
      </template>

      <!-- Rest -->
      <template v-if="showRest">
        <OverflowContextProvider
          v-if="renderRawRest"
          :value="
            {
              prefixCls: itemPrefixCls,
              responsive: shouldResponsive,
              component: itemComponent,
              invalidate,
              order: displayRest ? mergedDisplayCount : Number.MAX_SAFE_INTEGER,
              className: itemPrefixCls + '-rest',
              registerSize: registerOverflowSize,
              display: displayRest,
            } as OverflowContextType
          "
        >
          <component :is="renderRawRest(omittedItems)" />
        </OverflowContextProvider>
        <Item
          v-else
          :prefixCls="itemPrefixCls + '-rest'"
          :order="displayRest ? mergedDisplayCount : Number.MAX_SAFE_INTEGER"
          :registerSize="registerOverflowSize"
          :display="displayRest"
          :responsive="shouldResponsive"
          :component="itemComponent"
          :invalidate="invalidate"
        >
          {{ restContent }}
        </Item>
      </template>

      <!-- Suffix -->
      <Item
        v-if="suffixContent"
        :prefixCls="itemPrefixCls + '-suffix'"
        :order="mergedDisplayCount"
        :style="suffixStyle"
        :responsive="isResponsive"
        :responsiveDisabled="!shouldResponsive"
        :registerSize="registerSuffixSize"
        :component="itemComponent"
        :invalidate="invalidate"
      >
        {{ suffixContent }}
      </Item>

      <slot />
    </component>
  </ResizeObserver>
</template>
