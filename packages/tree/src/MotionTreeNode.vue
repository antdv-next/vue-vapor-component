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

  const props = defineProps<
    {
      active?: boolean
      motion?: CSSMotionProps
      motionNodes?: FlattenNode[] | null
      motionType?: 'show' | 'hide' | null
      treeNodeRequiredProps: TreeNodeRequiredProps
      treeId?: string
    } & Omit<TreeNodeProps, 'domRef'>
  >()

  const emit = defineEmits<{
    'motion-start': []
    'motion-end': []
  }>()

  const context = useTreeContext()
  const prefixCls = computed(() => context.value?.prefixCls || 'vc-tree')

  let hideTimer: ReturnType<typeof setTimeout> | null = null

  const triggerMotionEndRef = ref(false)
  const visible = ref(true)

  const motionName = computed(() => props.motion?.name)
  const targetVisible = computed(
    () => !!props.motionNodes && props.motionType !== 'hide',
  )

  const triggerMotionEnd = () => {
    if (props.motionNodes && !triggerMotionEndRef.value) {
      triggerMotionEndRef.value = true
      emit('motion-end')
    }
  }

  const triggerMotionStart = () => {
    if (props.motionNodes) {
      emit('motion-start')
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
          } else {
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
      } else if (newMotionNodes === null) {
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
  <template v-if="motionNodes">
    <Transition
      v-bind="
        getTransitionProps(motionName, {
          ...motion,
          appear: motionType === 'show',
        } as CSSMotionProps)
      "
      @after-enter="onVisibleChanged(true)"
      @after-leave="onVisibleChanged(false)"
    >
      <div v-show="visible" :class="clsx(`${prefixCls}-treenode-motion`)">
        <template v-for="treeNode in motionNodes" :key="treeNode.key">
          <TreeNode
            v-bind="{
              ...omit({ ...(treeNode.data || {}) }, ['children', 'key']),
              ...getTreeNodeProps(treeNode.key, treeNodeRequiredProps),
            }"
            :title="treeNode.title"
            :active="active"
            :data="treeNode.data"
            :is-start="treeNode.isStart"
            :is-end="treeNode.isEnd"
            :tree-id="treeId"
          />
        </template>
      </div>
    </Transition>
  </template>
  <template v-else>
    <TreeNode
      v-bind="
        omit(props, [
          'motion',
          'motionNodes',
          'motionType',
          'treeNodeRequiredProps',
        ])
      "
      :active="active"
    />
  </template>
</template>
