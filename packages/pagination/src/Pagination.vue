<script setup vapor lang="ts">
  import type { VueNode } from '@v-c/util/dist/type'
  import type { Ref } from 'vue'

  import type { ItemRender, PaginationProps } from './interface'

  import { clsx } from '@v-c/util'
  import useMergedState from '@v-c/util/dist/hooks/useMergedState'
  import KeyCode from '@v-c/util/dist/KeyCode'
  import pickAttrs from '@v-c/util/dist/pickAttrs'
  import { computed, h, ref, toRef, useAttrs, watchEffect } from 'vue'

  import zhCN from './locale/zh_CN'
  import Options from './Options.vue'

  defineOptions({ name: 'Pagination', inheritAttrs: false })

  const props = withDefaults(defineProps<PaginationProps>(), {
    prefixCls: 'vc-pagination',
    selectPrefixCls: 'vc-select',
    defaultCurrent: 1,
    total: 0,
    defaultPageSize: 10,
    showPrevNextJumpers: true,
    showTitle: true,
    totalBoundaryShowSizeChanger: 50,
  })

  const attrs = useAttrs()
  const emit = defineEmits<{
    change: [page: number, pageSize: number]
    'show-size-change': [current: number, size: number]
  }>()

  // ==================== Merged values ====================
  const mergedPrefixCls = computed(() => props.prefixCls)
  const mergedSelectPrefixCls = computed(() => props.selectPrefixCls)
  const mergedLocale = computed(() => props.locale ?? zhCN)
  const mergedTotal = computed(() => props.total)
  const mergedShowPrevNextJumpers = computed(() => props.showPrevNextJumpers)
  const mergedShowTitle = computed(() => props.showTitle)
  const mergedTotalBoundaryShowSizeChanger = computed(
    () => props.totalBoundaryShowSizeChanger,
  )

  // ==================== State ====================
  const pageSizeProp = toRef(props, 'pageSize')
  const [pageSize, setPageSize] = useMergedState(10, {
    value: pageSizeProp as Ref<number>,
    defaultValue: props.defaultPageSize,
  })

  const currentProp = toRef(props, 'current')
  const allPages = computed(() =>
    calculatePage(undefined, pageSize.value!, mergedTotal.value),
  )
  const [current, setCurrent] = useMergedState(1, {
    value: currentProp as Ref<number>,
    defaultValue: props.defaultCurrent,
    postState: (c: number | undefined) =>
      Math.max(
        1,
        Math.min(
          c ?? 1,
          calculatePage(undefined, pageSize.value!, mergedTotal.value),
        ),
      ),
  })

  const internalInputVal = ref(current.value)
  watchEffect(() => {
    internalInputVal.value = current.value
  })

  // ==================== Helpers ====================
  function isInteger(v: number) {
    const value = Number(v)
    return (
      typeof value === 'number' &&
      !Number.isNaN(value) &&
      isFinite(value) &&
      Math.floor(value) === value
    )
  }

  function calculatePage(
    p: number | undefined,
    pageSize: number,
    total: number,
  ) {
    const _pageSize = typeof p === 'undefined' ? pageSize : p
    return Math.floor((total - 1) / _pageSize) + 1
  }

  function getValidValue(e: any): number {
    const inputValue = (e.target as HTMLInputElement).value
    const pages = calculatePage(undefined, pageSize.value, mergedTotal.value)
    if (inputValue === '') return 0
    if (Number.isNaN(Number(inputValue))) return internalInputVal.value
    if (Number(inputValue) >= pages) return pages
    return Number(inputValue)
  }

  function isValid(page: number) {
    return (
      isInteger(page) &&
      page !== current.value &&
      isInteger(mergedTotal.value) &&
      mergedTotal.value > 0
    )
  }

  // ==================== Navigation ====================
  const prevPage = computed(() =>
    current.value - 1 > 0 ? current.value - 1 : 0,
  )
  const nextPage = computed(() =>
    current.value + 1 < allPages.value ? current.value + 1 : allPages.value,
  )
  const jumpPrevPage = computed(() =>
    Math.max(1, current.value - (props.showLessItems ? 3 : 5)),
  )
  const jumpNextPage = computed(() =>
    Math.min(
      calculatePage(undefined, pageSize.value, mergedTotal.value),
      current.value + (props.showLessItems ? 3 : 5),
    ),
  )
  const hasPrev = computed(() => current.value > 1)
  const hasNext = computed(
    () =>
      current.value <
      calculatePage(undefined, pageSize.value, mergedTotal.value),
  )

  let lastHandleTime = 0
  const HANDLE_COOLDOWN = 50

  function handleChange(page: number | undefined) {
    if (typeof page === 'undefined' || props.disabled) {
      return current.value
    }
    if (
      !isInteger(page) ||
      !isInteger(mergedTotal.value) ||
      mergedTotal.value <= 0
    ) {
      return current.value
    }
    if (page === current.value) return current.value

    const now = Date.now()
    if (now - lastHandleTime < HANDLE_COOLDOWN) {
      return current.value
    }
    lastHandleTime = now

    const currentPage = calculatePage(
      undefined,
      pageSize.value,
      mergedTotal.value,
    )
    let newPage = page
    if (page > currentPage) newPage = currentPage
    else if (page < 1) newPage = 1

    if (newPage !== internalInputVal.value) {
      internalInputVal.value = newPage
    }
    setCurrent(newPage)
    emit('change', newPage, pageSize.value)
    return newPage
  }

  function prevHandle() {
    if (hasPrev.value) handleChange(current.value - 1)
  }
  function nextHandle() {
    if (hasNext.value) handleChange(current.value + 1)
  }
  function jumpPrevHandle() {
    handleChange(jumpPrevPage.value)
  }
  function jumpNextHandle() {
    handleChange(jumpNextPage.value)
  }

  // ==================== Keyboard handlers ====================
  function runIfEnter(
    event: KeyboardEvent,
    callback: (...args: any[]) => void,
  ) {
    if (
      event.key === 'Enter' ||
      event.charCode === KeyCode.ENTER ||
      event.keyCode === KeyCode.ENTER
    ) {
      callback()
    }
  }

  function runIfEnterPrev(event: KeyboardEvent) {
    runIfEnter(event, prevHandle)
  }
  function runIfEnterNext(event: KeyboardEvent) {
    runIfEnter(event, nextHandle)
  }
  function runIfEnterJumpPrev(event: KeyboardEvent) {
    runIfEnter(event, jumpPrevHandle)
  }
  function runIfEnterJumpNext(event: KeyboardEvent) {
    runIfEnter(event, jumpNextHandle)
  }

  // ==================== itemRender ====================
  const defaultItemRender: ItemRender = (_page, _type, element) => element

  const mergedItemRender = computed<ItemRender>(
    () => props.itemRender || defaultItemRender,
  )

  function getItemIcon(
    icon: VueNode | (() => VueNode) | undefined,
    label: string,
  ) {
    const prefixCls = mergedPrefixCls.value
    if (!icon) {
      return h('button', {
        type: 'button',
        'aria-label': label,
        class: `${prefixCls}-item-link`,
      })
    }
    if (typeof icon === 'function') {
      return (icon as () => VueNode)()
    }
    return icon
  }

  // ==================== Simple mode ====================
  function handleGoTO(event: Event) {
    if (
      event.type === 'click' ||
      (event as KeyboardEvent).keyCode === KeyCode.ENTER
    ) {
      handleChange(internalInputVal.value)
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.keyCode === KeyCode.UP || event.keyCode === KeyCode.DOWN) {
      event.preventDefault()
    }
  }

  function handleKeyUp(event: Event) {
    const value = getValidValue(event)
    if (value !== internalInputVal.value) {
      internalInputVal.value = value
    }

    const keyCode = (event as KeyboardEvent).keyCode
    switch (keyCode) {
      case KeyCode.ENTER:
        handleChange(value)
        break
      case KeyCode.UP:
        handleChange(value - 1)
        break
      case KeyCode.DOWN:
        handleChange(value + 1)
        break
    }
  }

  function handleBlur(event: FocusEvent) {
    handleChange(getValidValue(event))
  }

  const isReadOnly = computed(() =>
    typeof props.simple === 'object' ? props.simple.readOnly : !props.simple,
  )

  const goButton = computed(
    () => props.showQuickJumper && (props.showQuickJumper as any).goButton,
  )

  // ==================== Size change ====================
  function changePageSize(size: number) {
    const newCurrent = calculatePage(size, pageSize.value, mergedTotal.value)
    const nextCurrent =
      current.value > newCurrent && newCurrent !== 0
        ? newCurrent
        : current.value

    setPageSize(size)
    internalInputVal.value = nextCurrent
    emit('show-size-change', current.value, size)
    setCurrent(nextCurrent)
    emit('change', nextCurrent, size)
  }

  // ==================== Pager list ====================
  // Compute pager page numbers with metadata for template rendering
  const pagerPages = computed<number[]>(() => {
    if (!allPages.value) return []
    const pageBufferSize = props.showLessItems ? 1 : 2
    if (allPages.value <= 3 + pageBufferSize * 2) {
      return Array.from({ length: allPages.value }, (_, i) => i + 1)
    }
    return buildPagerRange(allPages.value)
  })

  function buildPagerRange(total: number): number[] {
    const showLessItems = props.showLessItems
    const pageBufferSize = showLessItems ? 1 : 2
    let list: number[] = []

    let left = Math.max(1, current.value - pageBufferSize)
    let right = Math.min(current.value + pageBufferSize, total)

    if (current.value - 1 <= pageBufferSize) {
      right = 1 + pageBufferSize * 2
    }
    if (total - current.value <= pageBufferSize) {
      left = total - pageBufferSize * 2
    }

    for (let i = left; i <= right; i += 1) {
      list.push(i)
    }

    if (left !== 1) list.unshift(1)
    if (right !== total) list.push(total)

    return list
  }

  const showJumpPrev = computed(() => {
    if (!mergedShowPrevNextJumpers.value) return false
    if (!allPages.value) return false
    const pageBufferSize = props.showLessItems ? 1 : 2
    return current.value - 1 >= pageBufferSize * 2 && current.value !== 3
  })
  const showJumpNext = computed(() => {
    if (!mergedShowPrevNextJumpers.value) return false
    if (!allPages.value) return false
    const pageBufferSize = props.showLessItems ? 1 : 2
    return (
      allPages.value - current.value >= pageBufferSize * 2 &&
      current.value !== allPages.value - 2
    )
  })
  const hasJumpPrev = computed(
    () =>
      showJumpPrev.value &&
      (!props.itemRender ||
        !!mergedItemRender.value(
          jumpPrevPage.value,
          'jump-prev',
          getItemIcon(props.jumpPrevIcon, 'prev page'),
        )),
  )
  const hasJumpNext = computed(
    () =>
      showJumpNext.value &&
      (!props.itemRender ||
        !!mergedItemRender.value(
          jumpNextPage.value,
          'jump-next',
          getItemIcon(props.jumpNextIcon, 'next page'),
        )),
  )

  const jumpPrevContent = computed<VueNode | undefined>(() => {
    if (!hasJumpPrev.value || !props.itemRender) return undefined
    return mergedItemRender.value(
      jumpPrevPage.value,
      'jump-prev',
      getItemIcon(props.jumpPrevIcon, 'prev page'),
    )
  })
  const jumpNextContent = computed<VueNode | undefined>(() => {
    if (!hasJumpNext.value || !props.itemRender) return undefined
    return mergedItemRender.value(
      jumpNextPage.value,
      'jump-next',
      getItemIcon(props.jumpNextIcon, 'next page'),
    )
  })

  // ==================== Render values ====================
  const shouldDisplayQuickJumper = computed(() =>
    mergedTotal.value > pageSize.value ? props.showQuickJumper : false,
  )

  const dataOrAriaAttributeProps = computed(() =>
    pickAttrs(attrs, { aria: true, data: true }),
  )

  const showSizeChanger = computed(() => {
    const boundary = mergedTotalBoundaryShowSizeChanger.value
    return props.showSizeChanger ?? mergedTotal.value > boundary
  })

  const itemClassName = computed(() => props.classNames?.item)
  const itemStyle = computed(() => props.styles?.item)

  const rootCls = computed(() =>
    clsx(mergedPrefixCls.value, attrs.class as any, {
      [`${mergedPrefixCls.value}-start`]: props.align === 'start',
      [`${mergedPrefixCls.value}-center`]: props.align === 'center',
      [`${mergedPrefixCls.value}-end`]: props.align === 'end',
      [`${mergedPrefixCls.value}-simple`]: !!props.simple,
      [`${mergedPrefixCls.value}-disabled`]: !!props.disabled,
    }),
  )

  const prevButtonContent = computed<VueNode | undefined>(() => {
    if (!props.itemRender) return undefined
    return mergedItemRender.value(
      prevPage.value,
      'prev',
      getItemIcon(props.prevIcon, 'prev page'),
    )
  })
  const nextButtonContent = computed<VueNode | undefined>(() => {
    if (!props.itemRender) return undefined
    return mergedItemRender.value(
      nextPage.value,
      'next',
      getItemIcon(props.nextIcon, 'next page'),
    )
  })
  const prevDisabled = computed(() => !hasPrev.value || allPages.value <= 0)
  const nextDisabled = computed(() => !hasNext.value || allPages.value <= 0)
  const prevTabIndex = computed(() => (!prevDisabled.value ? 0 : undefined))
  const nextTabIndex = computed(() =>
    props.simple
      ? hasPrev.value
        ? 0
        : undefined
      : nextDisabled.value
        ? undefined
        : 0,
  )

  const totalTextContent = computed<VueNode | undefined>(() => {
    if (!props.showTotal) return undefined
    const start =
      mergedTotal.value === 0 ? 0 : (current.value - 1) * pageSize.value! + 1
    const end =
      current.value * pageSize.value! > mergedTotal.value
        ? mergedTotal.value
        : current.value * pageSize.value!
    return props.showTotal(mergedTotal.value, [start, end])
  })

  function getPageCls(page: number, idx: number): string {
    const base = `${mergedPrefixCls.value}-item`
    const extra = []
    if (page === current.value) extra.push(`${base}-active`)
    if (page === 0) extra.push(`${base}-disabled`)
    if (
      hasJumpPrev.value &&
      idx === 0 &&
      pagerPages.value.length > 0 &&
      pagerPages.value[0] === page
    ) {
      extra.push(`${mergedPrefixCls.value}-item-after-jump-prev`)
    }
    if (
      hasJumpNext.value &&
      idx === pagerPages.value.length - 1 &&
      pagerPages.value.length > 0 &&
      pagerPages.value[page - 1] === page
    ) {
      extra.push(`${mergedPrefixCls.value}-item-before-jump-next`)
    }
    return clsx(base, extra, itemClassName.value)
  }

  function handlePagerClick(e: Event) {
    e.stopPropagation()
    const target = e.currentTarget as HTMLElement
    const page = Number(target.dataset.page)
    if (Number.isNaN(page)) return
    handleChange(page)
  }

  function handlePagerKeydown(e: KeyboardEvent) {
    if (e.key !== 'Enter' && e.keyCode !== KeyCode.ENTER) return
    const target = e.currentTarget as HTMLElement
    const page = Number(target.dataset.page)
    if (Number.isNaN(page)) return
    handleChange(page)
  }

  function getPagerContent(page: number): VueNode {
    const anchor = h('a', { rel: 'nofollow' }, String(page))
    return mergedItemRender.value(page, 'page', anchor)
  }
</script>

<template>
  <template v-if="hideOnSinglePage && mergedTotal <= pageSize">
    <!-- hidden -->
  </template>
  <ul
    v-else
    :class="rootCls"
    :style="attrs.style"
    v-bind="dataOrAriaAttributeProps"
  >
    <!-- total text -->
    <li v-if="totalTextContent" :class="`${mergedPrefixCls}-total-text`">
      <component :is="totalTextContent" />
    </li>

    <!-- prev button -->
    <li
      :title="mergedShowTitle ? mergedLocale.prev_page : undefined"
      @click="prevHandle"
      :tabindex="prevTabIndex"
      @keydown="runIfEnterPrev"
      :class="
        clsx(`${mergedPrefixCls}-prev`, itemClassName, {
          [`${mergedPrefixCls}-disabled`]: prevDisabled,
        })
      "
      :style="itemStyle"
      :aria-disabled="prevDisabled"
    >
      <template v-if="itemRender">
        <component :is="prevButtonContent" />
      </template>
      <button
        v-else
        type="button"
        :class="`${mergedPrefixCls}-item-link`"
        aria-label="prev page"
      ></button>
    </li>

    <!-- simple mode pager -->
    <template v-if="simple">
      <li
        :title="mergedShowTitle ? `${current}/${allPages}` : undefined"
        :class="clsx(`${mergedPrefixCls}-simple-pager`, itemClassName)"
        :style="itemStyle"
      >
        <template v-if="isReadOnly"
          >{{ internalInputVal
          }}<span :class="`${mergedPrefixCls}-slash`">/</span
          >{{ allPages }}</template
        >
        <template v-else>
          <input
            type="text"
            :aria-label="mergedLocale.jump_to"
            :value="internalInputVal"
            :disabled="disabled"
            @keydown="handleKeyDown"
            @keyup="handleKeyUp"
            @change="handleKeyUp"
            @blur="handleBlur"
            size="3"
          />
          <span :class="`${mergedPrefixCls}-slash`">/</span>
          {{ allPages }}
        </template>
      </li>
      <li
        v-if="goButton"
        :title="
          mergedShowTitle
            ? `${mergedLocale.jump_to}${current}/${allPages}`
            : undefined
        "
        :class="`${mergedPrefixCls}-simple-pager`"
      >
        <button
          v-if="typeof goButton === 'boolean'"
          type="button"
          @click="handleGoTO"
          @keyup="handleGoTO"
        >
          {{ mergedLocale.jump_to_confirm }}
        </button>
        <span v-else @click="handleGoTO" @keyup="handleGoTO">{{
          goButton
        }}</span>
      </li>
    </template>

    <!-- pager list -->
    <template v-else>
      <!-- jump-prev -->
      <li
        v-if="showJumpPrev"
        :title="
          mergedShowTitle
            ? showLessItems
              ? mergedLocale.prev_3
              : mergedLocale.prev_5
            : undefined
        "
        @click="jumpPrevHandle"
        @keydown="runIfEnterJumpPrev"
        tabindex="0"
        :class="
          clsx(`${mergedPrefixCls}-jump-prev`, {
            [`${mergedPrefixCls}-jump-prev-custom-icon`]: !!jumpPrevIcon,
          })
        "
      >
        <template v-if="itemRender">
          <component :is="jumpPrevContent" />
        </template>
        <button v-else type="button"></button>
      </li>

      <!-- page numbers -->
      <template v-for="(page, idx) in pagerPages">
        <li
          :key="page"
          :data-page="String(page)"
          :title="mergedShowTitle ? String(page) : undefined"
          :class="clsx(getPageCls(page, idx), itemClassName)"
          :style="itemStyle"
          @click.stop="handlePagerClick"
          @keydown.stop="handlePagerKeydown"
          tabindex="0"
        >
          <template v-if="itemRender">
            <component :is="getPagerContent(page)" />
          </template>
          <a v-else rel="nofollow">{{ page }}</a>
        </li>
      </template>

      <!-- jump-next -->
      <li
        v-if="showJumpNext"
        :title="
          mergedShowTitle
            ? showLessItems
              ? mergedLocale.next_3
              : mergedLocale.next_5
            : undefined
        "
        @click="jumpNextHandle"
        @keydown="runIfEnterJumpNext"
        tabindex="0"
        :class="
          clsx(`${mergedPrefixCls}-jump-next`, {
            [`${mergedPrefixCls}-jump-next-custom-icon`]: !!jumpNextIcon,
          })
        "
      >
        <template v-if="itemRender">
          <component :is="jumpNextContent" />
        </template>
        <button v-else type="button"></button>
      </li>
    </template>

    <!-- next button -->
    <li
      :title="mergedShowTitle ? mergedLocale.next_page : undefined"
      @click="nextHandle"
      :tabindex="nextTabIndex"
      @keydown="runIfEnterNext"
      :class="
        clsx(`${mergedPrefixCls}-next`, itemClassName, {
          [`${mergedPrefixCls}-disabled`]: nextDisabled,
        })
      "
      :style="itemStyle"
      :aria-disabled="nextDisabled"
    >
      <template v-if="itemRender">
        <component :is="nextButtonContent" />
      </template>
      <button
        v-else
        type="button"
        :class="`${mergedPrefixCls}-item-link`"
        aria-label="next page"
      ></button>
    </li>

    <!-- options -->
    <Options
      :locale="mergedLocale"
      :root-prefix-cls="mergedPrefixCls"
      :disabled="disabled"
      :select-prefix-cls="mergedSelectPrefixCls"
      :change-size="changePageSize"
      :page-size-options="pageSizeOptions"
      :page-size="pageSize!"
      :quick-go="shouldDisplayQuickJumper ? handleChange : undefined"
      :go-button="goButton"
      :show-size-changer="showSizeChanger"
      :size-changer-render="sizeChangerRender"
    />
  </ul>
</template>
