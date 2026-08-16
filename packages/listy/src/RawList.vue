<script setup vapor lang="ts">
  import type { Key } from '@v-c/util/dist/type'

  import type { ListComponentProps } from './interface'
  import type { KeyType } from './util'

  import { clsx } from '@v-c/util'
  import { computed, shallowRef } from 'vue'

  import GroupHeader from './GroupHeader.vue'
  import useGroupSegments from './hooks/useGroupSegments'
  import useItemKey from './hooks/useItemKey'
  import useRawListScroll from './hooks/useRawListScroll'
  import { toTaggedKey } from './util'

  defineOptions({ name: 'ListyRawList', inheritAttrs: false })

  const props = defineProps<ListComponentProps>()
  const emit = defineEmits<{
    scroll: [e: Event]
  }>()

  const holderRef = shallowRef<HTMLDivElement>()
  const getItemKey = useItemKey(props.rowKey)
  const groupData = useGroupSegments(props.data, props.group)
  const scrollTo = useRawListScroll(
    holderRef,
    props.prefixCls,
    !!(props.sticky && props.group),
  )

  const getScrollTargetProps = (key: Key, type: KeyType) => ({
    'data-key': toTaggedKey(key, type),
  })

  const extractItems = (items: { item: any }[]) => items.map(gi => gi.item)

  const rootStyle = computed(() => ({
    maxHeight: props.height === undefined ? undefined : `${props.height}px`,
    overflowY: props.height === undefined ? undefined : 'auto',
    overflowAnchor: 'none',
    ...props.styles?.root,
  }))

  defineExpose({ scrollTo })
</script>

<template>
  <component
    :is="'div'"
    ref="holderRef"
    :class="
      clsx(
        prefixCls,
        { [`${prefixCls}-rtl`]: direction === 'rtl' },
        classNames?.root,
      )
    "
    :dir="direction"
    :style="rootStyle"
    @scroll="(e: Event) => emit('scroll', e)"
  >
    <template v-if="group">
      <template v-for="[groupKey, groupItems] in groupData" :key="groupKey">
        <div
          :class="`${prefixCls}-group-section`"
          v-bind="getScrollTargetProps(groupKey, 'group')"
        >
          <GroupHeader
            :group="group"
            :group-key="groupKey"
            :group-items="extractItems(groupItems)"
            :prefix-cls="prefixCls"
            :sticky="sticky"
            :class-name="classNames?.groupHeader"
            :style="styles?.groupHeader"
          />
          <template v-for="{ item, index } in groupItems">
            <div
              :key="getItemKey(item)"
              :class="clsx(`${prefixCls}-item`, classNames?.item)"
              :style="styles?.item"
              v-bind="getScrollTargetProps(getItemKey(item), 'item')"
            >
              <slot :item="item" :index="index" />
            </div>
          </template>
        </div>
      </template>
    </template>
    <template v-else>
      <template v-for="(item, index) in data">
        <div
          :key="getItemKey(item)"
          :class="clsx(`${prefixCls}-item`, classNames?.item)"
          :style="styles?.item"
          v-bind="getScrollTargetProps(getItemKey(item), 'item')"
        >
          <slot :item="item" :index="index" />
        </div>
      </template>
    </template>
  </component>
</template>
