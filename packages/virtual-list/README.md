# VirtualList

基于 vapor 编译模式的虚拟列表组件，用于渲染大量数据时仅渲染可视区域内的元素，显著提升长列表性能。同时支持横向滚动（`scrollWidth`）、RTL 方向、自定义滚动条样式及 `scrollTo` 编程式滚动。

## Props

| 名称          | 类型                                                                                                                                                           | 默认值              | 说明                                                             |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ---------------------------------------------------------------- |
| prefixCls     | `string`                                                                                                                                                       | `'vc-virtual-list'` | 样式类前缀                                                       |
| data          | `any[]`                                                                                                                                                        | `undefined`         | 列表数据                                                         |
| height        | `number`                                                                                                                                                       | `undefined`         | 列表高度（设置后启用虚拟滚动）                                   |
| itemHeight    | `number`                                                                                                                                                       | `undefined`         | 每项默认高度（未测量前使用）                                     |
| fullHeight    | `boolean`                                                                                                                                                      | `true`              | `height` 是否作为实际高度（否则作为 `maxHeight`）                |
| itemKey       | `Key \| ((item: any) => Key)`                                                                                                                                  | —（必填）           | 每项唯一标识，可为字段名或函数                                   |
| component     | `string`                                                                                                                                                       | `'div'`             | 滚动容器渲染的标签名                                             |
| virtual       | `boolean`                                                                                                                                                      | `true`              | 是否启用虚拟渲染                                                 |
| direction     | `'ltr' \| 'rtl'`                                                                                                                                               | `undefined`         | 滚动方向                                                         |
| scrollWidth   | `number`                                                                                                                                                       | `undefined`         | 内容宽度。设置后始终启用虚拟模式并显示横向滚动条                 |
| styles        | `{ horizontalScrollBar?: CSSProperties; horizontalScrollBarThumb?: CSSProperties; verticalScrollBar?: CSSProperties; verticalScrollBarThumb?: CSSProperties }` | `undefined`         | 滚动条语义化样式                                                 |
| showScrollBar | `boolean \| 'optional'`                                                                                                                                        | `'optional'`        | 滚动条显示策略：`true` 常显，`false` 隐藏，`'optional'` 自动隐藏 |
| innerProps    | `{ role?: string; id?: string }`                                                                                                                               | `undefined`         | 内部填充容器属性                                                 |

> `itemKey` 为必填，且当传入字段名时，取值逻辑为 `item[itemKey]`。

## Events

| 名称           | 参数                               | 说明                                                       |
| -------------- | ---------------------------------- | ---------------------------------------------------------- |
| scroll         | `(e: Event)`                       | 原生滚动事件（滚动容器 `scroll`）                          |
| virtual-scroll | `(info: { x: number; y: number })` | 虚拟滚动信息，`x` 为横向偏移（RTL 下为负），`y` 为纵向偏移 |
| visible-change | `(renderList: any[], data: any[])` | 可视区域变化，参数为当前渲染列表与完整数据                 |

## Slots

| 名称        | 作用域                                                                                                                                  | 说明                            |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| default     | `{ item: T; index: number; itemStyle: CSSProperties; offsetX: number; setRef: (element: HTMLElement \| null) => void }`                 | 渲染单个列表项                  |
| extraRender | `{ start: number; end: number; virtual: boolean; offsetX: number; scrollTop: number; offsetY: number; rtl: boolean; getSize: GetSize }` | 额外渲染内容（如吸顶/吸底元素） |

> `extraRender` 插槽渲染在 `Filler` 内部、列表项之后，可用于在虚拟列表中渲染非虚拟的固定内容。

## Expose

| 名称          | 类型                                             | 说明                                                                                        |
| ------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| nativeElement | `HTMLDivElement`                                 | 外层容器 DOM 引用                                                                           |
| getScrollInfo | `() => { x: number; y: number }`                 | 获取当前虚拟滚动信息                                                                        |
| scrollTo      | `(arg?: number \| ScrollConfig \| null) => void` | 滚动到指定位置/元素，`ScrollConfig` 为 `{ top?/left? }` 或 `{ index/key, align?, offset? }` |

## 与 @v-c 差异

| @v-c (vdom)                                            | vapor SFC                                                          |
| ------------------------------------------------------ | ------------------------------------------------------------------ |
| `onScroll` prop                                        | `@scroll` 事件                                                     |
| `onVirtualScroll` prop                                 | `@virtual-scroll` 事件                                             |
| `onVisibleChange` prop                                 | `@visible-change` 事件                                             |
| `extraRender` prop（函数 `(info) => VNode`）           | `#extraRender` 插槽                                                |
| `useChildren` 通过 `Item` 包装并 `cloneVNode` 注入 ref | 列表项由 `<div>` 包装，通过 `:ref` + slot 作用域 `setRef` 注入引用 |

> 注：`data`、`height`、`itemHeight`、`itemKey`、`component`、`virtual`、`direction`、`scrollWidth`、`showScrollBar`、`innerProps` 等非 VueNode 类型的值仍通过 props 传递。
> 默认插槽作用域在 vapor 中额外暴露 `itemStyle`、`offsetX`、`setRef`（用于手动注册项 DOM 引用，配合自动测量高度）。
