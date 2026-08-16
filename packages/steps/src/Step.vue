<script setup vapor lang="ts">
  import type { Status, StepItem } from './interface'

  import { clsx } from '@v-c/util'
  import KeyCode from '@v-c/util/dist/KeyCode'
  import { computed, provide } from 'vue'

  import Rail from './Rail.vue'
  import StepIcon from './StepIcon.vue'
  import { StepIconSemanticKey } from './StepIconSemanticKey'
  import { useStepsContext } from './StepsContextKey'
  import { useUnstableContext } from './UnstableContextKey'

  defineOptions({ name: 'VcStep', inheritAttrs: false })

  const props = withDefaults(
    defineProps<{
      // style
      prefixCls: string
      classNames?: any
      styles?: any

      // data
      data: StepItem
      nextStatus?: Status
      active?: boolean
      index: number
      last: boolean
    }>(),
    {},
  )

  const { railFollowPrevStatus } = useUnstableContext()
  const stepsContext = useStepsContext()
  const emit = defineEmits<{
    click: [index: number]
  }>()

  const {
    prefixCls,
    ItemComponent = 'div',
    classNames: ctxClassNames = {},
    styles: ctxStyles = {},
  } = stepsContext.value ?? {}

  // ========================== Data ==========================
  // title is a native HTML attribute, must NOT be in restItemProps (would apply to outer element)
  const dataItem = computed(() => {
    const {
      onClick: onItemClick,
      title,
      subTitle,
      content,
      description,
      disabled,
      icon,
      status: itemStatus,
      class: itemClassName,
      style: itemStyle,
      classNames: itemClassNames = {},
      styles: itemStyles = {},
      ...restItemProps
    } = props.data
    return {
      onItemClick,
      title,
      subTitle,
      content,
      description,
      disabled,
      icon,
      itemStatus,
      itemClassName,
      itemStyle,
      itemClassNames,
      itemStyles,
      restItemProps: restItemProps as Record<string, unknown>,
    }
  })

  const mergedContent = computed(
    () => dataItem.value.content ?? dataItem.value.description,
  )

  function hasContent(value: unknown): boolean {
    return value !== undefined && value !== null
  }

  const renderInfo = computed(() => ({
    item: { ...props.data, content: mergedContent.value },
    index: props.index,
    active: props.active,
    icon: StepIcon,
  }))

  // ========================= Click =========================
  const clickable = computed(
    () => !!dataItem.value.onItemClick && !dataItem.value.disabled,
  )

  function handleKeydown(e: KeyboardEvent) {
    const { keyCode } = e
    if (keyCode === KeyCode.ENTER || keyCode === KeyCode.SPACE) {
      emit('click', props.index)
    }
  }

  function handleClick(e: MouseEvent) {
    dataItem.value.onItemClick?.(e)
    emit('click', props.index)
  }

  // ========================= Render =========================
  const mergedStatus = computed(() => dataItem.value.itemStatus || 'wait')
  const hasTitle = computed(() => hasContent(dataItem.value.title))
  const hasSubTitle = computed(() => hasContent(dataItem.value.subTitle))

  const mergedRailStatus = computed(() =>
    railFollowPrevStatus?.value
      ? (dataItem.value.itemStatus as Status)
      : (props.nextStatus ?? 'wait'),
  )

  const itemCls = `${prefixCls}-item`

  const classString = computed(() =>
    clsx(
      itemCls,
      `${itemCls}-${mergedStatus.value}`,
      {
        [`${itemCls}-custom`]: !!dataItem.value.icon,
        [`${itemCls}-active`]: props.active,
        [`${itemCls}-disabled`]: dataItem.value.disabled === true,
        [`${itemCls}-empty-header`]: !hasTitle.value && !hasSubTitle.value,
      },
      dataItem.value.itemClassName,
      (props.classNames ?? {}).item,
      dataItem.value.itemClassNames.root,
    ),
  )

  const itemStyleMerged = computed(() => ({
    ...(ctxStyles as any).item,
    ...dataItem.value.itemStyles.root,
    ...dataItem.value.itemStyle,
  }))

  const itemWrapperStyle = computed(() => ({
    ...(ctxStyles as any).itemWrapper,
    ...dataItem.value.itemStyles.wrapper,
  }))

  const sectionStyle = computed(() => ({
    ...(ctxStyles as any).itemSection,
    ...dataItem.value.itemStyles.section,
  }))

  const headerStyle = computed(() => ({
    ...(ctxStyles as any).itemHeader,
    ...dataItem.value.itemStyles.header,
  }))

  const titleStyle = computed(() => ({
    ...(ctxStyles as any).itemTitle,
    ...dataItem.value.itemStyles.title,
  }))

  const subTitleStyle = computed(() => ({
    ...(ctxStyles as any).itemSubtitle,
    ...dataItem.value.itemStyles.subtitle,
  }))

  const railStyle = computed(() => ({
    ...(ctxStyles as any).itemRail,
    ...dataItem.value.itemStyles.rail,
  }))

  const contentStyle = computed(() => ({
    ...(ctxStyles as any).itemContent,
    ...dataItem.value.itemStyles.content,
  }))

  // Provide StepIconSemanticContext for StepIcon (replaces StepIconSemanticContextProvider)
  provide(
    StepIconSemanticKey,
    computed(() => ({
      className: dataItem.value.itemClassNames.icon,
      style: dataItem.value.itemStyles.icon,
    })) as any,
  )
</script>

<template>
  <slot name="itemRender" :info="renderInfo">
    <component
      :is="ItemComponent"
      v-bind="dataItem.restItemProps"
      :class="classString"
      :style="itemStyleMerged"
      :role="clickable ? 'button' : undefined"
      :tabindex="clickable ? 0 : undefined"
      @click="clickable ? handleClick : undefined"
      @keydown="clickable ? handleKeydown : undefined"
    >
      <slot name="itemWrapperRender" :info="renderInfo">
        <div
          :class="
            clsx(
              `${itemCls}-wrapper`,
              (classNames ?? {}).itemWrapper,
              dataItem.itemClassNames.wrapper,
            )
          "
          :style="itemWrapperStyle"
        >
          <slot name="iconRender" v-bind="renderInfo">
            <StepIcon />
          </slot>
          <div
            :class="
              clsx(
                `${itemCls}-section`,
                (ctxClassNames as any).itemSection,
                dataItem.itemClassNames.section,
              )
            "
            :style="sectionStyle"
          >
            <div
              :class="
                clsx(
                  `${itemCls}-header`,
                  (ctxClassNames as any).itemHeader,
                  dataItem.itemClassNames.header,
                )
              "
              :style="headerStyle"
            >
              <div
                v-if="hasTitle"
                :class="
                  clsx(
                    `${itemCls}-title`,
                    (ctxClassNames as any).itemTitle,
                    dataItem.itemClassNames.title,
                  )
                "
                :style="titleStyle"
              >
                <slot name="title" :title="dataItem.title">
                  {{ typeof dataItem.title === 'string' ? dataItem.title : '' }}
                </slot>
              </div>
              <div
                v-if="hasSubTitle"
                :title="
                  typeof dataItem.subTitle === 'string'
                    ? dataItem.subTitle
                    : undefined
                "
                :class="
                  clsx(
                    `${itemCls}-subtitle`,
                    (ctxClassNames as any).itemSubtitle,
                    dataItem.itemClassNames.subtitle,
                  )
                "
                :style="subTitleStyle"
              >
                {{
                  typeof dataItem.subTitle === 'string' ? dataItem.subTitle : ''
                }}
              </div>

              <Rail
                v-if="!last"
                :prefix-cls="itemCls"
                :class-name="
                  clsx(
                    (classNames ?? {}).itemRail,
                    dataItem.itemClassNames.rail,
                  )
                "
                :style="railStyle"
                :status="mergedRailStatus"
              />
            </div>
            <div
              v-if="hasContent(mergedContent)"
              :class="
                clsx(
                  `${itemCls}-content`,
                  (ctxClassNames as any).itemContent,
                  dataItem.itemClassNames.content,
                )
              "
              :style="contentStyle"
            >
              {{ typeof mergedContent === 'string' ? mergedContent : '' }}
            </div>
          </div>
        </div>
      </slot>
    </component>
  </slot>
</template>
