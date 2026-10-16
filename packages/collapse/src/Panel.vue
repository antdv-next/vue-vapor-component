<script setup vapor lang="ts">
  import type { TransitionProps } from 'vue'

  import type { CollapsePanelProps, CollapsePanelSlots, Key } from './interface'

  import { clsx } from '@v-c/util'
  import KeyCode from '@v-c/util/dist/KeyCode'
  import omit from '@v-c/util/dist/omit'
  import { computed, Transition, useAttrs, useSlots } from 'vue'

  import { useCollapseContext } from './context'
  import PanelContent from './PanelContent.vue'
  import { mergeSemanticClassNames, mergeSemanticStyles } from './utils'

  defineOptions({ name: 'VcCollapsePanel', inheritAttrs: false })

  defineSlots<CollapsePanelSlots>()

  const props = withDefaults(defineProps<CollapsePanelProps>(), {
    showArrow: true,
  })
  const emit = defineEmits<{
    'item-click': [key: Key]
  }>()

  const ctx = useCollapseContext()
  const attrs = useAttrs()
  const slots = useSlots()

  // ===== Merge own props with the parent Collapse context =====
  const prefixCls = computed(
    () => props.prefixCls ?? ctx?.prefixCls ?? 'vc-collapse',
  )
  // NOTE: absent Boolean props are cast to `false` by Vue (not `undefined`),
  // so collapse-level booleans must read the context first.
  const accordion = computed(() => ctx?.accordion ?? props.accordion)
  const mergedCollapsible = computed(
    () => props.collapsible ?? ctx?.collapsible,
  )
  const mergedOpenMotion = computed(() => props.openMotion ?? ctx?.openMotion)
  const mergedDestroyOnHidden = computed(
    () => props.destroyOnHidden || ctx?.destroyOnHidden,
  )
  const mergedClassNames = computed(() =>
    mergeSemanticClassNames(ctx?.classNames, props.classNames),
  )
  const mergedStyles = computed(() =>
    mergeSemanticStyles(ctx?.styles, props.styles),
  )

  const disabled = computed(() => mergedCollapsible.value === 'disabled')

  // Active state is owned by the parent Collapse (via context). `isActive` as a
  // bare Boolean prop can't be distinguished from `false`, so we don't use it.
  const isActive = computed(() => {
    const key = String(props.panelKey)
    const keys = ctx?.activeKeys ?? []
    return accordion.value ? keys[0] === key : keys.includes(key as Key)
  })

  // The `-extra` div carries `margin: 0 16px 0 auto`, so it must stay out of
  // the DOM when both the `#extra` slot and the `extra` prop are absent.
  const ifExtraExist = computed(() => !!slots.extra || props.extra != null)

  function handleItemClick() {
    if (mergedCollapsible.value === 'disabled') return
    const key = props.panelKey as Key
    ctx?.onItemClick(key)
    emit('item-click', key)
  }

  // Interaction props shared by whichever element is the trigger.
  const collapsibleProps = computed(() => ({
    onClick: () => handleItemClick(),
    onKeydown: (e: KeyboardEvent) => {
      if (
        e.key === 'Enter' ||
        e.keyCode === KeyCode.ENTER ||
        e.which === KeyCode.ENTER
      ) {
        handleItemClick()
      }
    },
    role: accordion.value ? 'tab' : 'button',
    'aria-expanded': isActive.value,
    'aria-disabled': disabled.value,
    tabindex: disabled.value ? -1 : 0,
  }))

  const isHeaderOrIcon = computed(
    () =>
      mergedCollapsible.value === 'header' ||
      mergedCollapsible.value === 'icon',
  )
  // header div is the trigger unless collapsible targets the title/icon instead
  const headerBindings = computed(() =>
    isHeaderOrIcon.value ? {} : collapsibleProps.value,
  )
  const titleBindings = computed(() =>
    mergedCollapsible.value === 'header' ? collapsibleProps.value : {},
  )
  const iconBindings = computed(() =>
    isHeaderOrIcon.value ? collapsibleProps.value : {},
  )

  const collapsePanelClassNames = computed(() =>
    clsx(
      `${prefixCls.value}-item`,
      {
        [`${prefixCls.value}-item-active`]: isActive.value,
        [`${prefixCls.value}-item-disabled`]: disabled.value,
      },
      // `class`/`style` are always attrs in <script setup>, never props
      attrs.class as any,
    ),
  )
  const headerCls = computed(() =>
    clsx(
      props.headerClass,
      `${prefixCls.value}-header`,
      {
        [`${prefixCls.value}-collapsible-${mergedCollapsible.value}`]:
          !!mergedCollapsible.value,
      },
      mergedClassNames.value?.header,
    ),
  )
  const titleCls = computed(() =>
    clsx(`${prefixCls.value}-title`, mergedClassNames.value?.title),
  )
  const expandIconCls = computed(() =>
    clsx(`${prefixCls.value}-expand-icon`, mergedClassNames.value?.icon),
  )

  const iconProps = computed(() => ({ ...props, isActive: isActive.value }))

  const transitionProps = computed<TransitionProps>(() => ({
    appear: false,
    ...mergedOpenMotion.value,
  }))

  const restAttrs = computed(() => omit(attrs, ['class', 'style']))
</script>

<template>
  <div
    v-bind="restAttrs"
    :id="id"
    :class="collapsePanelClassNames"
    :role="role"
  >
    <div
      :class="headerCls"
      :style="mergedStyles?.header"
      v-bind="headerBindings"
    >
      <!-- Expand icon -->
      <div
        v-if="showArrow"
        :class="expandIconCls"
        :style="mergedStyles?.icon"
        v-bind="iconBindings"
      >
        <slot name="expandIcon" v-bind="iconProps">
          <i class="arrow" />
        </slot>
      </div>

      <!-- Title -->
      <span
        :class="titleCls"
        :style="mergedStyles?.title"
        v-bind="titleBindings"
      >
        <slot name="header">{{ header }}</slot>
      </span>

      <!-- Extra -->
      <div v-if="ifExtraExist" :class="`${prefixCls}-extra`">
        <slot name="extra">{{ extra }}</slot>
      </div>
    </div>

    <Transition v-bind="transitionProps">
      <PanelContent
        v-if="!mergedDestroyOnHidden || isActive"
        v-show="isActive"
        :prefixCls="prefixCls"
        :classNames="mergedClassNames"
        :styles="mergedStyles"
        :isActive="isActive"
        :forceRender="forceRender"
        :role="accordion ? 'tabpanel' : undefined"
      >
        <slot name="content">
          <slot>{{ children || content }}</slot>
        </slot>
      </PanelContent>
    </Transition>
  </div>
</template>
