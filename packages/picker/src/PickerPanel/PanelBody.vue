<script setup vapor lang="ts">
  import type { CSSProperties } from 'vue'

  import type { GenerateConfig } from '../generate'
  import type { CellRenderInfo, DisabledDate } from '../interface'

  import { clsx } from '@v-c/util'
  import { computed } from 'vue'

  import { formatValue, isInRange, isSame } from '../utils/dateUtil'
  import CellItem from './CellItem.vue'
  import { usePanelContext, usePickerHackContext } from './context'

  defineOptions({ name: 'PanelBody', inheritAttrs: false })

  const props = withDefaults(
    defineProps<{
      rowNum: number
      colNum: number
      baseDate: any
      titleFormat?: string
      getCellDate: (date: any, offset: number) => any
      getCellText: (date: any) => any
      getCellClassName: (date: any) => Record<string, any>
      disabledDate?: DisabledDate<any>
      /** Vapor deviation: plain label strings instead of vdom `VNode[]` */
      headerCells?: string[]
      /** Visually-hidden label for the empty header cell of the week column */
      headerHiddenLabel?: string
      /** Vapor deviation: replaces `prefixColumn(date) => VNode` */
      prefixColumnText?: (date: any) => any
      prefixColumnDisabled?: (date: any) => boolean
      rowClassName?: (date: any) => string
      cellSelection?: boolean
    }>(),
    { cellSelection: true },
  )

  const context = usePanelContext()!
  const pickerHackContext = usePickerHackContext()

  // `clsx` returns a plain `string`; the source passed objects through too, so
  // both are accepted by `CellItem`.
  type ClassValue = string | Record<string, any>

  interface CellData {
    date: any
    col: number
    disabled: boolean
    title?: string
    label: any
    cls: ClassValue
    style?: CSSProperties
    info: CellRenderInfo<any>
  }

  interface RowData {
    rowStart: any
    cells: CellData[]
    cls?: string
    prefixCls?: ClassValue
    prefixLabel?: any
  }

  // Rule 7.2 / 5: imperative `rows: VNode[]` push loop → computed data + `v-for`
  const rows = computed<RowData[]>(() => {
    const ctx = context.value
    const cellPrefixCls = `${ctx.prefixCls}-cell`
    const mergedDisabledDate: DisabledDate<any> | undefined =
      props.disabledDate || ctx.disabledDate

    const generateConfig = (ctx.generateConfig ||
      ({} as GenerateConfig<any>)) as GenerateConfig<any>
    const values = ctx.values
    const locale = (ctx.locale || {}) as any
    const panelType = ctx.panelType

    const matchValues = (date: any) =>
      (values || []).some(
        singleValue =>
          singleValue &&
          isSame(generateConfig, locale, date, singleValue, panelType),
      )

    const result: RowData[] = []

    for (let row = 0; row < props.rowNum; row += 1) {
      const cells: CellData[] = []
      let rowStartDate: any

      for (let col = 0; col < props.colNum; col += 1) {
        const offset = row * props.colNum + col
        const currentDate = props.getCellDate(props.baseDate, offset)
        const disabled = !!mergedDisabledDate?.(currentDate, {
          type: panelType,
        })

        if (col === 0) rowStartDate = currentDate

        let inRange = false
        let rangeStart = false
        let rangeEnd = false

        if (props.cellSelection && ctx.hoverRangeValue) {
          const [hoverStart, hoverEnd] = ctx.hoverRangeValue
          inRange = isInRange(generateConfig, hoverStart, hoverEnd, currentDate)
          rangeStart = isSame(
            generateConfig,
            locale,
            currentDate,
            hoverStart,
            panelType,
          )
          rangeEnd = isSame(
            generateConfig,
            locale,
            currentDate,
            hoverEnd,
            panelType,
          )
        }

        const label = props.getCellText(currentDate)

        cells.push({
          date: currentDate,
          col,
          disabled,
          title: props.titleFormat
            ? (formatValue(currentDate, {
                locale,
                format: props.titleFormat,
                generateConfig,
              }) ?? undefined)
            : undefined,
          label,
          cls: clsx(cellPrefixCls, ctx.classNames?.item, {
            [`${cellPrefixCls}-disabled`]: disabled,
            [`${cellPrefixCls}-hover`]: (ctx.hoverValue || []).some(date =>
              isSame(generateConfig, locale, currentDate, date, panelType),
            ),
            [`${cellPrefixCls}-in-range`]: inRange && !rangeStart && !rangeEnd,
            [`${cellPrefixCls}-range-start`]: rangeStart,
            [`${cellPrefixCls}-range-end`]: rangeEnd,
            [`${ctx.prefixCls}-cell-selected`]:
              !ctx.hoverRangeValue &&
              // WeekPicker use row instead
              panelType !== 'week' &&
              matchValues(currentDate),
            ...props.getCellClassName(currentDate),
          }),
          style: ctx.styles?.item,
          info: {
            prefixCls: ctx.prefixCls as string,
            originLabel: String(label ?? ''),
            today: ctx.now,
            type: panelType,
            locale,
          },
        })
      }

      result.push({
        rowStart: rowStartDate,
        cells,
        cls: props.rowClassName?.(rowStartDate),
        prefixCls: props.prefixColumnText
          ? clsx(cellPrefixCls, `${cellPrefixCls}-week`, {
              [`${cellPrefixCls}-disabled`]:
                !!props.prefixColumnDisabled?.(rowStartDate),
            })
          : undefined,
        prefixLabel: props.prefixColumnText
          ? props.prefixColumnText(rowStartDate)
          : undefined,
      })
    }

    return result
  })

  // ======================== Render ========================
  const prefixCls = computed(() => context.value.prefixCls)
  const panelClassNames = computed(() => context.value.classNames)
  const styles = computed(() => context.value.styles)
  const cellRender = computed(() => context.value.cellRender)

  const bodyCls = computed(() =>
    clsx(`${prefixCls.value}-body`, panelClassNames.value?.body),
  )
  const contentCls = computed(() =>
    clsx(`${prefixCls.value}-content`, panelClassNames.value?.content),
  )
  const innerCls = computed(() => `${prefixCls.value}-cell-inner`)

  // ======================== Events ========================
  const onCellClick = (cell: CellData) => {
    if (cell.disabled) return
    context.value.onSelect(cell.date)
  }

  const onCellDblClick = (cell: CellData) => {
    if (cell.disabled) return
    pickerHackContext?.value?.onCellDblClick?.()
  }

  const onCellEnter = (cell: CellData) => {
    if (cell.disabled) return
    context.value.onHover?.(cell.date)
  }

  const onCellLeave = (cell: CellData) => {
    if (cell.disabled) return
    context.value.onHover?.(null)
  }

  const onPrefixClick = (row: RowData) => {
    if (props.prefixColumnDisabled?.(row.rowStart)) return
    context.value.onSelect(row.rowStart)
  }

  const onPrefixEnter = (row: RowData) => {
    if (props.prefixColumnDisabled?.(row.rowStart)) return
    context.value.onHover?.(row.rowStart)
  }

  const onPrefixLeave = (row: RowData) => {
    if (props.prefixColumnDisabled?.(row.rowStart)) return
    context.value.onHover?.(null)
  }
</script>

<template>
  <div :class="bodyCls" :style="styles.body">
    <table :class="contentCls" :style="styles.content">
      <thead v-if="headerCells">
        <tr>
          <th v-if="prefixColumnText">
            <span
              style="
                position: absolute;
                overflow: hidden;
                width: 0;
                height: 0;
                opacity: 0;
              "
            >
              {{ headerHiddenLabel }}
            </span>
          </th>
          <th v-for="(cell, idx) in headerCells" :key="idx">{{ cell }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rIdx) in rows" :key="rIdx" :class="row.cls">
          <td
            v-if="prefixColumnText"
            :class="row.prefixCls"
            @click="onPrefixClick(row)"
            @mouseenter="onPrefixEnter(row)"
            @mouseleave="onPrefixLeave(row)"
          >
            <div :class="innerCls">{{ row.prefixLabel }}</div>
          </td>
          <CellItem
            v-for="cell in row.cells"
            :key="cell.col"
            :date="cell.date"
            :label="cell.label"
            :title="cell.title"
            :cls="cell.cls"
            :style="cell.style"
            :inner-cls="innerCls"
            :cell-render="cellRender"
            :info="cell.info"
            @click="onCellClick(cell)"
            @dblclick="onCellDblClick(cell)"
            @mouseenter="onCellEnter(cell)"
            @mouseleave="onCellLeave(cell)"
          />
        </tr>
      </tbody>
    </table>
  </div>
</template>
