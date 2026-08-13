<script setup vapor lang="ts">
import type { Key } from '@v-c/util/dist/type'
import type { KeyType } from './util'
import { clsx } from '@v-c/util'
import { computed, shallowRef } from 'vue'
import GroupHeader from './GroupHeader.vue'
import useGroupSegments from './hooks/useGroupSegments'
import useItemKey from './hooks/useItemKey'
import useRawListScroll from './hooks/useRawListScroll'
import { toTaggedKey } from './util'
import type { ListComponentProps } from './interface'

defineOptions({ name: 'ListyRawList', inheritAttrs: false })

const props = defineProps<ListComponentProps>()

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

const extractItems = (items: { item: any }[]) => items.map((gi) => gi.item)

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
    :class="clsx(
      props.prefixCls,
      { [`${props.prefixCls}-rtl`]: props.direction === 'rtl' },
      props.classNames?.root,
    )"
    :dir="props.direction"
    :style="rootStyle"
    @scroll="props.onScroll"
  >
    <template v-if="props.group">
      <template v-for="([groupKey, groupItems]) in groupData" :key="groupKey">
        <div
          :class="`${props.prefixCls}-group-section`"
          v-bind="getScrollTargetProps(groupKey, 'group')"
        >
          <GroupHeader
            :group="props.group"
            :group-key="groupKey"
            :group-items="extractItems(groupItems)"
            :prefix-cls="props.prefixCls"
            :sticky="props.sticky"
            :class-name="props.classNames?.groupHeader"
            :style="props.styles?.groupHeader"
          />
          <template v-for="({ item, index }) in groupItems">
            <div
              :key="getItemKey(item)"
              :class="clsx(`${props.prefixCls}-item`, props.classNames?.item)"
              :style="props.styles?.item"
              v-bind="getScrollTargetProps(getItemKey(item), 'item')"
            >
              <slot :item="item" :index="index" />
            </div>
          </template>
        </div>
      </template>
    </template>
    <template v-else>
      <template v-for="(item, index) in props.data">
        <div
          :key="getItemKey(item)"
          :class="clsx(`${props.prefixCls}-item`, props.classNames?.item)"
          :style="props.styles?.item"
          v-bind="getScrollTargetProps(getItemKey(item), 'item')"
        >
          <slot :item="item" :index="index" />
        </div>
      </template>
    </template>
  </component>
</template>