<script setup vapor lang="ts">
  import type { ResizeObserverProps } from '../interface'

  import findDOMNode from '@v-c/util/dist/Dom/findDOMNode'
  import { computed, inject, shallowRef, onMounted, useSlots } from 'vue'

  import { CollectionContext } from '../context'
  import useResizeObserver from '../useResizeObserver'
  import DomWrapper from './DomWrapper.vue'

  defineOptions({ name: 'SingleObserver' })
  const props = defineProps<ResizeObserverProps>()
  const emit = defineEmits(['resize'])
  const wrapperRef = shallowRef()


  function getDom(el: any): any {
    const dom = findDOMNode(el)
    // 判断当前的dom是不是一个text元素
    if (
      dom &&
      (dom.nodeType === 3 || dom.nodeType === 8) &&
      (dom as any).nextElementSibling
    ) {
      return (dom as any).nextElementSibling as HTMLElement
    }
    return dom
  }
  function setWrapperRef(el: any) {
    let _wrapper = el
    if (el?.elementEl && typeof el.elementEl === 'object') {
      _wrapper = el.elementEl
    } else if (el?.__$el && typeof el.__$el === 'object') {
      _wrapper = el.__$el
    }
    wrapperRef.value = getDom(_wrapper)
  }
  const onCollectionResize = inject(CollectionContext, () => {})


  const enabled = computed(() => !props.disabled)
  useResizeObserver(
    enabled,
    wrapperRef,
    (...args) => props.onResize?.(...args),
    (size, element) => {
      onCollectionResize?.(size, element, props.data)
    },
  )
  onMounted(() => {
    // 需兼容 virtual DOM 与 vapor DOM
    setWrapperRef(
      wrapperRef.value?.nodes
        ? wrapperRef.value.nodes.nextElementSibling
        : wrapperRef.value,
    )
  })
  defineExpose({
    getDom,
  })
</script>

<template>
  <DomWrapper>
    <slot ref="wrapperRef" />
  </DomWrapper>
</template>
