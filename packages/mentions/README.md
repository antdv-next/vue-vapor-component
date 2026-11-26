# Mentions

@ 提及组件，基于 TextArea 实现。输入触发前缀（如 `@`）时弹出候选下拉，支持键盘选择、过滤与数据驱动选项。

## Props

| 名称              | 类型                                                                                                                                                                           | 默认值                  | 说明                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- | ------------------------------------------------------ |
| value             | `string`                                                                                                                                                                       | `undefined`             | 输入值（受控）                                         |
| defaultValue      | `string`                                                                                                                                                                       | `undefined`             | 默认值（非受控）                                       |
| id                | `string`                                                                                                                                                                       | `undefined`             | 原生 id                                                |
| autoFocus         | `boolean`                                                                                                                                                                      | `undefined`             | 是否自动聚焦                                           |
| disabled          | `boolean`                                                                                                                                                                      | `undefined`             | 是否禁用                                               |
| readOnly          | `boolean`                                                                                                                                                                      | `undefined`             | 是否只读                                               |
| placeholder       | `string`                                                                                                                                                                       | `undefined`             | 占位提示文本                                           |
| maxLength         | `number`                                                                                                                                                                       | `undefined`             | 最大输入长度                                           |
| rows              | `number`                                                                                                                                                                       | `1`                     | 行数                                                   |
| autoSize          | `boolean \| { minRows?: number; maxRows?: number }`                                                                                                                            | `undefined`             | 是否自动调整高度，或配置最小/最大行数                  |
| allowClear        | `boolean`                                                                                                                                                                      | `undefined`             | 是否允许清除                                           |
| suffix            | `string \| number`                                                                                                                                                             | `undefined`             | 后缀内容                                               |
| addonBefore       | `string \| number`                                                                                                                                                             | `undefined`             | 前置标签                                               |
| addonAfter        | `string \| number`                                                                                                                                                             | `undefined`             | 后置标签                                               |
| prefix            | `string \| string[]`                                                                                                                                                           | `'@'`                   | 触发前缀（可多个）                                     |
| prefixCls         | `string`                                                                                                                                                                       | `'vc-mentions'`         | 样式类前缀                                             |
| split             | `string`                                                                                                                                                                       | `' '`                   | 触发前缀后的分隔符，用于结束搜索                       |
| notFoundContent   | `VueNode`（可接受 string \| number \| VNode \| () => VNode）                                                                                                                   | `'Not Found'`           | 无匹配项时下拉内容                                     |
| silent            | `boolean`                                                                                                                                                                      | `undefined`             | 回车时是否静默（不触发选择）                           |
| filterOption      | `false \| ((input: string, option: OptionProps) => boolean)`                                                                                                                   | `defaultFilterOption`   | 选项过滤函数，`false` 表示不过滤                       |
| validateSearch    | `(text: string, split: string) => boolean`                                                                                                                                     | `defaultValidateSearch` | 校验搜索文本是否有效                                   |
| transitionName    | `string`                                                                                                                                                                       | `undefined`             | 下拉动画类名                                           |
| placement         | `'top' \| 'bottom'`                                                                                                                                                            | `undefined`             | 下拉位置                                               |
| direction         | `'ltr' \| 'rtl'`                                                                                                                                                               | `undefined`             | 布局方向                                               |
| getPopupContainer | `() => HTMLElement`                                                                                                                                                            | `undefined`             | 下拉挂载容器                                           |
| popupClassName    | `string`                                                                                                                                                                       | `undefined`             | 下拉类名                                               |
| options           | `DataDrivenOptionProps[]`                                                                                                                                                      | `undefined`             | 数据驱动选项（`value` / `key` / `disabled` / `label`） |
| classNames        | `{ affixWrapper?: string; prefix?: string; suffix?: string; groupWrapper?: string; wrapper?: string; variant?: string; mentions?: string; textarea?: string; popup?: string }` | `undefined`             | 语义化类名                                             |
| styles            | `{ suffix?: CSSProperties; textarea?: CSSProperties; popup?: CSSProperties }`                                                                                                  | `undefined`             | 语义化样式                                             |

> 其余继承自 `TextAreaProps` 的属性（`count`、`hidden`、`components`、`dataAttrs`、`changeOnComposing`、`handleReset`、`onResize`、`classes`）仍可通过 props 传入底层 TextArea。

## Events

| 名称         | 参数                             | 说明                         |
| ------------ | -------------------------------- | ---------------------------- |
| change       | `(value: string)`                | 输入值变化                   |
| select       | `(option: any, prefix: string)`  | 选中某个选项（含触发前缀）   |
| search       | `(text: string, prefix: string)` | 触发搜索（输入触发前缀文本） |
| focus        | `(e: FocusEvent)`                | 聚焦                         |
| blur         | `(e: FocusEvent)`                | 失焦                         |
| keydown      | `(e: KeyboardEvent)`             | 键盘按下                     |
| keyup        | `(e: KeyboardEvent)`             | 键盘抬起                     |
| press-enter  | `(e: KeyboardEvent)`             | 按下回车（非测量状态）       |
| popup-scroll | `(e: UIEvent)`                   | 下拉滚动                     |
| clear        | `(e: MouseEvent)`                | 点击清除                     |

## Slots

| 名称        | 作用域             | 说明                                |
| ----------- | ------------------ | ----------------------------------- |
| clearIcon   | —                  | 清除图标                            |
| popupRender | `PopupRenderScope` | 自定义下拉菜单渲染（替换默认 Menu） |

## Expose

| 名称          | 类型                                       | 说明                   |
| ------------- | ------------------------------------------ | ---------------------- |
| focus         | `() => void`                               | 聚焦                   |
| blur          | `() => void`                               | 失焦                   |
| textarea      | `ComputedRef<HTMLTextAreaElement \| null>` | 底层 textarea DOM 引用 |
| nativeElement | `ComputedRef<HTMLElement>`                 | 原生 DOM 元素          |

## 与 @v-c 差异

| @v-c (vdom)                                                                                                                               | vapor SFC                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `onChange` / `onSelect` / `onSearch` / `onFocus` / `onBlur` / `onKeydown` / `onKeyup` / `onPressEnter` / `onPopupScroll` / `onClear` prop | `@change` / `@select` / `@search` / `@focus` / `@blur` / `@keydown` / `@keyup` / `@press-enter` / `@popup-scroll` / `@clear` 事件 |
| `children` 收集 `<Option>` 子组件生成选项                                                                                                 | 仅 `options` prop 数据驱动；`Option` 组件保留导出但不再被自动收集                                                                 |
| `popupRender` prop（`(menu: VueNode) => VueNode`，接收默认菜单并返回自定义）                                                              | `#popupRender` 插槽（作用域 `PopupRenderScope`，整体替换默认 Menu）                                                               |
| `className` prop                                                                                                                          | `class` 属性 + `classNames.mentions`                                                                                              |

> 注：`value`、`disabled`、`prefixCls`、`split`、`prefix`、`options` 等非 VueNode 类型的值仍通过 props 传递。
> `notFoundContent` 为 VueNode 类型但仍通过 props 传入，在下拉内直接渲染。
> 事件如果是在 jsx/tsx 中使用，则仍以 `onXxx={xx}` 触发。
