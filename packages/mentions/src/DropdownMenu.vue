<script setup vapor lang="ts">
  import type { DropdownMenuProps } from './interface'

  import type { MenuRef } from '@vapor-component/menu'
  import Menu from '@vapor-component/menu'
  import { getDOM } from '@v-c/util/dist/Dom/findDOMNode'
  import {
    computed,
    nextTick,
    onBeforeUnmount,
    useTemplateRef,
    watch,
  } from 'vue'

  import { useMentionsContext } from './MentionsContextKey'

  defineOptions({ name: 'MentionsDropdownMenu', inheritAttrs: false })

  const props = defineProps<DropdownMenuProps>()

  const mentionsContext = useMentionsContext()
  const menuRef = useTemplateRef<MenuRef>('menu')

  const activeIndex = computed(() => mentionsContext?.value?.activeIndex ?? -1)
  const activeOptionKey = computed(
    () => props.options[activeIndex.value]?.key,
  )

  // ===================== List Event Binding =====================
  let removeListListeners: VoidFunction | undefined

  const bindListEvents = (list?: HTMLUListElement | null) => {
    if (removeListListeners) {
      removeListListeners()
      removeListListeners = undefined
    }
    if (!list) {
      return
    }
    const domList = getDOM(list) as HTMLUListElement | null
    if (!domList) return

    const handleFocus = (event: FocusEvent) => {
      mentionsContext?.value?.onFocus?.(event)
    }
    const handleBlur = (event: FocusEvent) => {
      mentionsContext?.value?.onBlur?.(event)
    }
    const handleScroll = (event: Event) => {
      mentionsContext?.value?.onScroll?.(event as UIEvent)
    }

    domList.addEventListener('focusin', handleFocus)
    domList.addEventListener('focusout', handleBlur)
    domList.addEventListener('scroll', handleScroll)

    removeListListeners = () => {
      domList.removeEventListener('focusin', handleFocus)
      domList.removeEventListener('focusout', handleBlur)
      domList.removeEventListener('scroll', handleScroll)
    }
  }

  watch(
    () => menuRef.value?.list,
    (list, _, onCleanup) => {
      if (list) {
        list = getDOM(list) as any
      }
      bindListEvents(list || null)
      onCleanup(() => {
        removeListListeners?.()
        removeListListeners = undefined
      })
    },
    { immediate: true, flush: 'post' },
  )

  // ===================== Scroll Active Into View =====================
  watch(
    [activeIndex, activeOptionKey, () => props.opened],
    () => {
      if (!props.opened || activeIndex.value === -1) {
        return
      }
      nextTick(() => {
        const key = activeOptionKey.value
        if (!key) {
          return
        }
        const activeItem = menuRef.value?.findItem?.({ key })
        activeItem?.scrollIntoView({
          block: 'nearest',
          inline: 'nearest',
        })
      })
    },
  )

  onBeforeUnmount(() => {
    removeListListeners?.()
    removeListListeners = undefined
  })

  // ===================== Option Click =====================
  const onInternalSelect = ({ key }: { key: string }) => {
    const option = props.options.find(opt => opt.key === key)
    if (option) {
      mentionsContext?.value?.selectOption?.(option)
    }
  }

  const onInternalMouseEnter = (index: number) => {
    const option = props.options[index]
    if (!option?.disabled) {
      mentionsContext?.value?.setActiveIndex?.(index)
    }
  }

  const dropdownCls = computed(() => `${props.prefixCls}-menu`)
</script>

<template>
  <Menu
    ref="menu"
    :prefix-cls="dropdownCls"
    :active-key="activeOptionKey"
    @select="onInternalSelect"
  >
    <Menu.Item
      v-for="(option, index) in options"
      :key="option.key"
      :event-key="option.key"
      :disabled="option.disabled"
      :class="option.class"
      :style="option.style"
      @mouse-enter="onInternalMouseEnter(index)"
    >
      <slot name="option-label" :option="option" :index="index">
        {{ option.label }}
      </slot>
    </Menu.Item>

    <Menu.Item
      v-if="!options.length"
      key="not-found"
      disabled
    >
      <slot name="not-found">
        {{ mentionsContext?.notFoundContent }}
      </slot>
    </Menu.Item>
  </Menu>
</template>
