<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import type { PanelProps } from './interface'

  import { getTransitionProps } from '@v-c/util/dist/utils/transition'
  import { computed, nextTick, shallowRef } from 'vue'

  import { offset } from '../../util'
  import { panelSlots } from '../../util'
  import Panel from './Panel.vue'

  type ContentProps = {
    motionName?: string
    ariaId: string
  } & PanelProps
  defineOptions({ name: 'Index' })
  const props = defineProps<ContentProps>()
  const emit = defineEmits<{
    close: [e?: any]
    'visible-changed': [visible: boolean]
    'mouse-down': [e: MouseEvent]
    'mouse-up': [e: MouseEvent]
  }>()
  const dialogRef = shallowRef<HTMLDivElement>()

  const transformOrigin = shallowRef('')
  const contentStyle = computed<CSSProperties>(() => {
    if (transformOrigin.value) {
      return { transformOrigin: transformOrigin.value }
    }
    return {}
  })
  const transitionProps = computed(() => getTransitionProps(props.motionName))

  function onPrepare() {
    const { mousePosition } = props
    nextTick(() => {
      if (dialogRef.value) {
        const elementOffset = offset(dialogRef.value)
        transformOrigin.value =
          mousePosition && (mousePosition.x || mousePosition.y)
            ? `${mousePosition.x - elementOffset.left}px ${mousePosition.y - elementOffset.top}px`
            : ''
      }
    })
  }
</script>

<template>
  <Transition
    v-bind="transitionProps"
    @beforeEnter="onPrepare"
    @afterEnter="
      () => {
        emit('visible-changed', true)
      }
    "
    @afterLeave="
      () => {
        emit('visible-changed', false)
      }
    "
  >
    <template v-if="visible || !destroyOnHidden || forceRender">
      <Panel
        v-show="visible"
        v-bind="{
          ...props,
          onClose: undefined,
          onMouseDown: undefined,
          onMouseUp: undefined,
          holderRef: undefined,
        }"
        :title="title"
        :ariaId="ariaId"
        :prefixCls="prefixCls"
        :style="{ ...style, ...contentStyle }"
        :class="[className]"
        @holderRef="
          el => {
            dialogRef.value = el
          }
        "
        @close="e => emit('close', e)"
        @mouse-down="(e: MouseEvent) => emit('mouse-down', e)"
        @mouse-up="(e: MouseEvent) => emit('mouse-up', e)"
      >
        <template v-for="slotName in panelSlots" #[slotName]>
          <slot :name="slotName" />
        </template>
      </Panel>
    </template>
  </Transition>
</template>
