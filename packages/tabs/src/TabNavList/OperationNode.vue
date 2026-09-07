<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import type { MoreProps, OperationNodeProps } from '../interface'

  import { clsx } from '@v-c/util'
  import KeyCode from '@v-c/util/dist/KeyCode'
  import Dropdown from '@vapor-component/dropdown'
  import Menu from '@vapor-component/menu'
  import { computed, ref, useTemplateRef, watch } from 'vue'

  import { getRemovable } from '../utils'
  import AddButton from './AddButton.vue'

  const props = withDefaults(defineProps<OperationNodeProps>(), {
    more: () => ({}) as MoreProps,
  })

  const emit = defineEmits<{
    'tab-click': [key: string, e: MouseEvent | KeyboardEvent]
  }>()

  const open = ref(false)
  const selectedKey = ref<string | null>(null)
  const _operationNodeRef = useTemplateRef<HTMLDivElement>('operationNodeRef')

  const popupId = computed(() => `${props.id}-more-popup`)
  const dropdownPrefix = computed(() => `${props.prefixCls}-dropdown`)

  function onRemoveTab(event: MouseEvent | KeyboardEvent, key: string) {
    event.preventDefault()
    event.stopPropagation()

    if (props.editable) {
      props.editable.onEdit('remove', { key, event })
    }
  }

  function onMenuClick(info: any) {
    emit('tab-click', info.key, info.domEvent)
    open.value = false
  }

  const overlayClassName = computed(() => {
    return clsx({
      [props.popupClassName!]: props.popupClassName,
      [`${dropdownPrefix.value}-rtl`]: props.rtl,
    })
  })

  const moreIconNode = computed(() => props.more?.icon || 'More')

  const moreStyle = computed(() => {
    const style: CSSProperties = {
      marginInlineStart: props.tabBarGutter ? `${props.tabBarGutter}px` : '0px',
    }
    if (!props.tabs.length) {
      style.visibility = 'hidden'
      style.order = 1
    }

    return style
  })

  function selectOffset(offset: -1 | 1) {
    const enabledTabs = props.tabs.filter(tab => !tab.disabled)
    let selectedIndex =
      enabledTabs.findIndex(tab => tab.key === selectedKey.value) || 0
    const len = enabledTabs.length

    for (let i = 0; i < len; i += 1) {
      selectedIndex = (selectedIndex + offset + len) % len
      const tab = enabledTabs[selectedIndex]
      if (!tab.disabled) {
        selectedKey.value = tab.key
        return
      }
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    const { which } = e

    if (!open.value) {
      if ([KeyCode.DOWN, KeyCode.SPACE, KeyCode.ENTER].includes(which)) {
        open.value = true
        e.preventDefault()
      }
      return
    }

    switch (which) {
      case KeyCode.UP:
        selectOffset(-1)
        e.preventDefault()
        break
      case KeyCode.DOWN:
        selectOffset(1)
        e.preventDefault()
        break
      case KeyCode.ESC:
        open.value = false
        break
      case KeyCode.SPACE:
      case KeyCode.ENTER:
        if (selectedKey.value !== null) {
          emit('tab-click', selectedKey.value, e)
        }
        break
    }
  }

  watch(
    () => open.value,
    visible => {
      if (!visible) {
        selectedKey.value = null
      }
    },
  )
</script>

<template>
  <div
    ref="operationNodeRef"
    :class="[`${prefixCls}-nav-operations`, className]"
    :style="style"
  >
    <Dropdown
      v-if="!mobile"
      :prefix-cls="dropdownPrefix"
      :visible="tabs.length ? open : false"
      :overlay-class-name="overlayClassName"
      :overlay-style="popupStyle"
      :mouse-enter-delay="0.1"
      :mouse-leave-delay="0.1"
      :get-popup-container="getPopupContainer"
      @visible-change="open = $event"
    >
      <button
        :id="`${id}-more`"
        type="button"
        :class="`${prefixCls}-nav-more`"
        :style="moreStyle"
        aria-haspopup="listbox"
        :aria-controls="popupId"
        :aria-expanded="open"
        @keydown="onKeyDown"
      >
        <span v-if="moreIconNode">{{ moreIconNode }}</span>
      </button>

      <template #overlay>
        <Menu
          :prefix-cls="`${dropdownPrefix}-menu`"
          :selected-keys="selectedKey ? [selectedKey] : undefined"
          @click="onMenuClick"
        >
          <template v-for="tab in tabs">
            <Menu.Item
              :key="tab.key"
              :event-key="tab.key"
              :disabled="tab.disabled"
              role="option"
            >
              <span>{{ tab.label }}</span>
              <button
                v-if="
                  getRemovable(
                    tab.closable,
                    tab.closeIcon,
                    editable,
                    tab.disabled,
                  )
                "
                type="button"
                :aria-label="removeAriaLabel || 'remove'"
                :tabindex="0"
                :class="
                  clsx(`${dropdownPrefix}-menu-item-remove`, classNames?.remove)
                "
                :style="styles?.remove"
                @click.stop="e => onRemoveTab(e, tab.key)"
              >
                <template v-if="tab.closeIcon">{{ tab.closeIcon }}</template>
                <template v-else-if="editable?.removeIcon">{{
                  editable.removeIcon
                }}</template>
                <template v-else>×</template>
              </button>
            </Menu.Item>
          </template>
        </Menu>
      </template>
    </Dropdown>
    <AddButton :prefix-cls="prefixCls" :locale="locale" :editable="editable" />
  </div>
</template>
