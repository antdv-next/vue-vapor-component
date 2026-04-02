<script setup vapor lang="ts">
  import findDOMNode from '@v-c/util/dist/Dom/findDOMNode'
  import { onMounted, ref, shallowRef, toRef } from 'vue'

  import useMutateObserver from './useMutateObserver'
  import DomWrapper from './Wrapper.vue'

  type OnMutateFn = (
    mutations: MutationRecord[],
    observer: MutationObserver,
  ) => void

  defineOptions({ name: 'MutateObserver' })
  const props = defineProps<{
    onMutate: OnMutateFn
    options?: MutationObserverInit
  }>()

  const internalOptions = toRef(props, 'options')

  const elementRef = ref()

  const wrapperRef = ref()

  const target = shallowRef<Element | Text | null>(null)

  const callback: OnMutateFn = (...args) => props.onMutate?.(...args)

  const getDom = (el: any) => {
    const dom =
      findDOMNode(el as any) ||
      (el && typeof el === 'object'
        ? findDOMNode((el as any).nativeElement)
        : null) ||
      (wrapperRef.value && findDOMNode(wrapperRef.value))
    if (dom && dom.nodeType === 3 && dom.nextElementSibling) {
      return dom.nextElementSibling as HTMLElement
    }

    return dom
  }

  function setElementRef(el: any) {
    let _wrapper = el
    if (el?.elementEl && typeof el.elementEl === 'object') {
      _wrapper = el.elementEl
    } else if (el?.__$el && typeof el.__$el === 'object') {
      _wrapper = el.__$el
    }
    elementRef.value = getDom(_wrapper)
  }

  useMutateObserver(target, callback, internalOptions)
  onMounted(() => {
    // 兼容 virtual DOM 与 vapor DOM
    setElementRef(
      elementRef.value?.nodes
        ? elementRef.value.nodes.nextElementSibling
        : elementRef.value,
    )
    target.value = elementRef.value
  })
</script>

<template>
  <DomWrapper>
    <slot ref="elementRef" />
  </DomWrapper>
</template>
