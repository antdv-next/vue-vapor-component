<script setup vapor lang="ts">
  import type { StepHandlerProps } from './interface'

  import { classNames as clsx } from '@v-c/util'
  import raf from '@v-c/util/dist/raf'
  import { computed, useAttrs, onUnmounted, ref } from 'vue'

  defineOptions({ name: 'StepHandler' })
  const props = defineProps<StepHandlerProps>()
  const emit = defineEmits(['step'])
  const attrs = useAttrs()

  /**
   * When click and hold on a button - the speed of auto changing the value.
   */
  const STEP_INTERVAL = 200

  /**
   * When click and hold on a button - the delay before auto changing the value.
   */
  const STEP_DELAY = 600
  // ======================== Step ========================
  const stepTimeoutRef = ref<any>(null)
  const frameIds = ref<number[]>([])

  const onStopStep = () => {
    clearTimeout(stepTimeoutRef.value)
  }

  // We will interval update step when hold mouse down
  const onStepMouseDown = (e: MouseEvent, up: boolean) => {
    e.preventDefault()
    onStopStep()

    emit('step', up, 'handler')

    // Loop step for interval
    function loopStep() {
      emit('step', up, 'handler')
      stepTimeoutRef.value = setTimeout(loopStep, STEP_INTERVAL)
    }

    // First time press will wait some time to trigger loop step update
    stepTimeoutRef.value = setTimeout(loopStep, STEP_DELAY)
  }

  const isUpAction = computed(() => props.action === 'up')
  const actionClassName = computed(() => `${props.prefixCls}-action`)
  const mergedClassName = computed(() => {
    const { action, disabled, className } = props
    return clsx(
      actionClassName.value,
      `${actionClassName.value}-${action}`,
      {
        [`${actionClassName.value}-${action}-disabled`]: disabled,
      },
      className,
    )
  })

  // fix: https://github.com/ant-design/ant-design/issues/43088
  // In Safari, When we fire onmousedown and onmouseup events in quick succession,
  // there may be a problem that the onmouseup events are executed first,
  // resulting in a disordered program execution.
  // So, we need to use requestAnimationFrame to ensure that the onmouseup event is executed after the onmousedown event.
  const safeOnStopStep = () => frameIds.value.push(raf(onStopStep))

  onUnmounted(() => {
    onStopStep()
    frameIds.value.forEach(id => raf.cancel(id))
  })
</script>

<template>
  <span
    unselectable="on"
    role="button"
    @mouseup="safeOnStopStep"
    @mouseleave="safeOnStopStep"
    @mousedown="(e: MouseEvent) => onStepMouseDown(e, isUpAction)"
    :aria-label="isUpAction ? 'Increase Value' : 'Decrease Value'"
    :aria-disabled="disabled"
    :class="mergedClassName"
    :style="attrs.style"
  >
    <slot>
      <span unselectable="on" :class="`${prefixCls}-action-${action}-inner`" />
    </slot>
  </span>
</template>
