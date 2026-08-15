<script setup vapor lang="ts">
import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import type { FlattenNode, TreeNodeProps } from './interface'
import type { TreeNodeRequiredProps } from './utils/treeUtil'
import { clsx } from '@v-c/util'
import omit from '@v-c/util/dist/omit'
import { getTransitionProps } from '@v-c/util/dist/utils/transition'
import { computed, ref, Transition, watch } from 'vue'
import { onBeforeUnmount } from 'vue'
import { useTreeContext } from './TreeContextKey'
import TreeNode from './TreeNode.vue'
import { getTreeNodeProps } from './utils/treeUtil'

const props = defineProps<{
  active?: boolean
  motion?: CSSMotionProps
  motionNodes?: FlattenNode[] | null
  motionType?: 'show' | 'hide' | null
  onMotionStart?: () => void
  onMotionEnd?: () => void
  treeNodeRequiredProps: TreeNodeRequiredProps
  treeId?: string
} & Omit<TreeNodeProps, 'domRef'>>()

const context = useTreeContext()
const prefixCls = computed(() => context.value?.prefixCls || 'vc-tree')

let hideTimer: ReturnType<typeof setTimeout> | null = null

const triggerMotionEndRef = ref(false)
const visible = ref(true)

const motionName = computed(() => props.motion?.name)
const targetVisible = computed(() => !!props.motionNodes && props.motionType !== 'hide')

const triggerMotionEnd = () => {
  if (props.motionNodes && !triggerMotionEndRef.value) {
    triggerMotionEndRef.value = true
    props.onMotionEnd?.()
  }
}

const triggerMotionStart = () => {
  if (props.motionNodes) {
    props.onMotionStart?.()
  }
}

onBeforeUnmount(() => {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
  triggerMotionEnd()
})

watch(
  () => props.motionNodes,
  (newMotionNodes, prevMotionNodes) => {
    if (newMotionNodes) {
      if (!prevMotionNodes) {
        triggerMotionEndRef.value = false
        triggerMotionStart()
      }

      if (targetVisible.value !== visible.value) {
        if (targetVisible.value) {
          if (hideTimer) {
            clearTimeout(hideTimer)
            hideTimer = null
          }
          visible.value = true
        }
        else {
          visible.value = true
          if (hideTimer) {
            clearTimeout(hideTimer)
          }
          hideTimer = setTimeout(() => {
            visible.value = false
            hideTimer = null
          })
        }
      }
    }
    else if (newMotionNodes === null) {
      if (hideTimer) {
        clearTimeout(hideTimer)
        hideTimer = null
      }
      visible.value = true
    }
  },
  {
    immediate: true,
    flush: 'post',
  },
)

const onVisibleChanged = (newVisible: boolean) => {
  if (targetVisible.value === newVisible) {
    triggerMotionEnd()
  }
}
</script>

<template>
  <template v-if="props.motionNodes">
    <Transition
      v-bind="getTransitionProps(motionName, {
        ...props.motion,
        appear: props.motionType === 'show',
      } as CSSMotionProps)"
      @after-enter="onVisibleChanged(true)"
      @after-leave="onVisibleChanged(false)"
    >
      <div v-show="visible" :class="clsx(`${prefixCls}-treenode-motion`)">
        <template
          v-for="treeNode in props.motionNodes"
          :key="treeNode.key"
        >
          <TreeNode
            v-bind="{
              ...omit({ ...(treeNode.data || {}) }, ['children', 'key']),
              ...getTreeNodeProps(treeNode.key, props.treeNodeRequiredProps),
            }"
            :title="treeNode.title"
            :active="props.active"
            :data="treeNode.data"
            :is-start="treeNode.isStart"
            :is-end="treeNode.isEnd"
            :tree-id="props.treeId"
          />
        </template>
      </div>
    </Transition>
  </template>
  <template v-else>
    <TreeNode
      v-bind="omit(props, ['motion', 'motionNodes', 'motionType', 'onMotionStart', 'onMotionEnd', 'treeNodeRequiredProps'])"
      :active="props.active"
    />
  </template>
</template>