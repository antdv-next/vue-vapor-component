<script setup vapor lang="ts">
  import type { CellRender, CellRenderInfo } from '../../../interface'

  import { clsx } from '@v-c/util'
  import {
    computed,
    isVNode,
    onBeforeUnmount,
    onMounted,
    ref,
    useTemplateRef,
    watch,
  } from 'vue'

  import { usePanelContext } from '../../context'
  import useScrollTo from './useScrollTo'

  export interface Unit<ValueType = number | string> {
    label: any
    value: ValueType
    disabled?: boolean
  }

  export interface TimeColumnProps {
    units: Unit[]
    value?: number | string
    optionalValue?: number | string
    type: 'hour' | 'minute' | 'second' | 'millisecond' | 'meridiem'
    onChange: (value: number | string) => void
    onHover: (value: number | string | null) => void
    onDblClick?: VoidFunction
    changeOnScroll?: boolean
  }

  const SCROLL_DELAY = 300

  defineOptions({ name: 'TimeColumn' })

  const props = defineProps<TimeColumnProps>()

  const context = usePanelContext()!
  const ulRef = useTemplateRef<HTMLUListElement>('ul')
  const checkDelayRef = ref<ReturnType<typeof setTimeout>>()

  function flattenUnits(units: Unit<string | number>[]) {
    return units
      .map(({ value, label, disabled }) => [value, label, disabled].join(','))
      .join(';')
  }

  const clearDelayCheck = () => {
    clearTimeout(checkDelayRef.value)
  }

  // Vapor note: DOM layout queries (`querySelectorAll('li')` / `offsetTop`) are kept
  // because vapor still emits real DOM; only the reactive patch layer changes.
  const [syncScroll, stopScroll, isScrolling] = useScrollTo(
    ulRef,
    computed(() => props.value ?? props.optionalValue),
  )

  watch(
    [
      () => props.value,
      () => props.optionalValue,
      () => flattenUnits(props.units),
    ],
    () => {
      syncScroll()
      clearDelayCheck()
    },
    { flush: 'post' },
  )

  onMounted(() => {
    syncScroll()
  })

  onBeforeUnmount(() => {
    stopScroll()
    clearDelayCheck()
  })

  const onInternalScroll = (event: Event) => {
    clearDelayCheck()
    const target = event.target as HTMLUListElement

    if (!isScrolling() && props.changeOnScroll) {
      checkDelayRef.value = setTimeout(() => {
        const ul = ulRef.value
        if (!ul) return
        const firstLi = ul.querySelector('li') as HTMLLIElement
        if (!firstLi) return
        const firstLiTop = firstLi.offsetTop
        const liList = Array.from(ul.querySelectorAll('li')) as HTMLLIElement[]
        const liTopList = liList.map(li => li.offsetTop - firstLiTop)
        const liDistList = liTopList.map((top, index) => {
          if (props.units[index].disabled) {
            return Number.MAX_SAFE_INTEGER
          }
          return Math.abs(top - target.scrollTop)
        })

        const minDist = Math.min(...liDistList)
        const minDistIndex = liDistList.findIndex(dist => dist === minDist)
        const targetUnit = props.units[minDistIndex]
        if (targetUnit && !targetUnit.disabled) {
          props.onChange(targetUnit.value)
        }
      }, SCROLL_DELAY)
    }
  }

  // ======================== Render ========================
  const ctx = computed(() => context.value)

  const panelPrefixCls = computed(() => `${ctx.value.prefixCls}-time-panel`)
  const cellPrefixCls = computed(() => `${ctx.value.prefixCls}-time-panel-cell`)
  const columnPrefixCls = computed(() => `${panelPrefixCls.value}-column`)
  const cellInnerCls = computed(() => `${cellPrefixCls.value}-inner`)

  const cellRender = computed<CellRender<any> | undefined>(
    () => ctx.value.cellRender,
  )

  const cellInfo = (unitValue: number | string): CellRenderInfo<any> => ({
    prefixCls: ctx.value.prefixCls as string,
    originLabel: String(
      props.units.find(u => u.value === unitValue)?.label ?? '',
    ),
    today: ctx.value.now,
    type: 'time',
    subType: props.type,
    locale: ctx.value.locale,
  })

  const cellCls = (unitValue: number | string, disabled?: boolean) =>
    clsx(cellPrefixCls.value, ctx.value.classNames?.item, {
      [`${cellPrefixCls.value}-selected`]: props.value === unitValue,
      [`${cellPrefixCls.value}-disabled`]: disabled,
    })

  const itemStyle = computed(() => ctx.value.styles?.item)

  // Rule 12: `cellRender` may be coerced to `false` by vapor, so guard with `typeof`.
  // Render data is precomputed per unit so the template only ever reads plain
  // values — never a call expression — and `:is` receives the node directly
  // (skill rule 7.5 / gotcha: `:is="() => node"` makes a functional vapor
  // component and renders nothing).
  interface TimeColumnCell {
    value: number | string
    disabled: boolean
    cls: string
    label: any
    node: any
    isComponent: boolean
    text: string
  }

  const cells = computed<TimeColumnCell[]>(() =>
    props.units.map(unit => {
      const node =
        typeof cellRender.value === 'function'
          ? cellRender.value(unit.value, cellInfo(unit.value))
          : null

      const isComponent =
        node != null && typeof node !== 'string' && !isVNode(node)

      let text: string
      if (typeof node === 'string') {
        text = node
      } else if (node && typeof node === 'object' && isVNode(node)) {
        const n = node as any
        if (typeof n.children === 'string') text = n.children
        else if (Array.isArray(n.children)) {
          text = n.children
            .map((child: any) =>
              typeof child === 'string' ? child : (child?.children ?? ''),
            )
            .join('')
        } else text = ''
      } else {
        text = String(unit.label ?? '')
      }

      return {
        value: unit.value,
        disabled: !!unit.disabled,
        cls: cellCls(unit.value, unit.disabled),
        label: unit.label,
        node,
        isComponent,
        text,
      }
    }),
  )

  const onItemClick = (cell: TimeColumnCell) => {
    if (!cell.disabled) props.onChange(cell.value)
  }

  const onCellDblClick = (cell: TimeColumnCell) => {
    if (!cell.disabled && props.onDblClick) props.onDblClick()
  }

  const onCellEnter = (cell: TimeColumnCell) => props.onHover(cell.value)
  const onCellLeave = () => props.onHover(null)
</script>

<template>
  <ul
    ref="ul"
    :class="columnPrefixCls"
    :data-type="type"
    @scroll="onInternalScroll"
  >
    <template v-for="cell in cells" :key="cell.value">
      <li
        :style="itemStyle"
        :class="cell.cls"
        :data-value="cell.value"
        @click="onItemClick(cell)"
        @dblclick="onCellDblClick(cell)"
        @mouseenter="onCellEnter(cell)"
        @mouseleave="onCellLeave"
      >
        <div :class="cellInnerCls">
          <component v-if="cell.isComponent" :is="cell.node" />
          <template v-else>{{ cell.text }}</template>
        </div>
      </li>
    </template>
  </ul>
</template>
