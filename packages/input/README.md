# Input

## Props

### Input

| 名称              | 类型                                                                                                                                                                                                                                                                              | 默认值       | 说明                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------- |
| prefix            | `string \| number`                                                                                                                                                                                                                                                                | —            | 前缀；需要渲染 VNode 时用 `#prefix` 插槽                                               |
| suffix            | `string \| number`                                                                                                                                                                                                                                                                | —            | 后缀；需要渲染 VNode 时用 `#suffix` 插槽                                               |
| addonBefore       | `string \| number`                                                                                                                                                                                                                                                                | —            | 前置标签；需要渲染 VNode 时用 `#addonBefore` 插槽                                      |
| addonAfter        | `string \| number`                                                                                                                                                                                                                                                                | —            | 后置标签；需要渲染 VNode 时用 `#addonAfter` 插槽                                       |
| classes           | `{ affixWrapper?: string, group?: string, wrapper?: string }`                                                                                                                                                                                                                     | —            | @deprecated 改用 `classNames`；两侧 `BaseInput` 均未读取此字段                         |
| allowClear        | `boolean`                                                                                                                                                                                                                                                                         | —            | 是否允许清空；自定义清空图标用 `#clearIcon` 插槽（默认 `✖`）                           |
| value             | `ValueType`                                                                                                                                                                                                                                                                       | —            | 输入值（受控），`ValueType = InputHTMLAttributes['value'] \| bigint`                   |
| defaultValue      | `any`                                                                                                                                                                                                                                                                             | —            | 初始输入值（非受控）                                                                   |
| disabled          | `boolean`                                                                                                                                                                                                                                                                         | —            | 是否禁用                                                                               |
| prefixCls         | `string`                                                                                                                                                                                                                                                                          | `'vc-input'` | 样式类前缀                                                                             |
| type              | `LiteralUnion<'button' \| 'checkbox' \| 'color' \| 'date' \| 'datetime-local' \| 'email' \| 'file' \| 'hidden' \| 'image' \| 'month' \| 'number' \| 'password' \| 'radio' \| 'range' \| 'reset' \| 'search' \| 'submit' \| 'tel' \| 'text' \| 'time' \| 'url' \| 'week', string>` | `'text'`     | 原生 `<input>` 的 `type`                                                               |
| showCount         | `boolean \| { formatter: ShowCountFormatter }`                                                                                                                                                                                                                                    | —            | @deprecated 改用 `count.show`                                                          |
| autoComplete      | `string`                                                                                                                                                                                                                                                                          | —            | 原生 `autocomplete`                                                                    |
| htmlSize          | `number`                                                                                                                                                                                                                                                                          | —            | 原生 `size`                                                                            |
| placeholder       | `string`                                                                                                                                                                                                                                                                          | —            | 占位文本                                                                               |
| classNames        | `CommonInputProps['classNames'] & { input?: string, count?: string }`                                                                                                                                                                                                             | —            | 语义化类名                                                                             |
| styles            | `CommonInputProps['styles'] & { input?: CSSProperties, count?: CSSProperties }`                                                                                                                                                                                                   | —            | 语义化样式                                                                             |
| count             | `CountConfig`                                                                                                                                                                                                                                                                     | —            | 计数配置                                                                               |
| maxLength         | `number`                                                                                                                                                                                                                                                                          | —            | 最大字符数                                                                             |
| readOnly          | `boolean`                                                                                                                                                                                                                                                                         | —            | 只读                                                                                   |
| hidden            | `boolean`                                                                                                                                                                                                                                                                         | —            | 隐藏                                                                                   |
| changeOnComposing | `boolean`                                                                                                                                                                                                                                                                         | —            | IME 组合输入期间是否触发 `change`；`false`（默认）时仅在 `compositionend` 后触发最终值 |
| components        | `BaseInputProps['components']`                                                                                                                                                                                                                                                    | —            | 自定义各包装层标签                                                                     |
| dataAttrs         | `{ affixWrapper?: DataAttr }`                                                                                                                                                                                                                                                     | —            | affixWrapper 的 `data-*` 属性，`DataAttr = Record<\`data-${string}\`, string>`         |

### CommonInputProps

| 名称        | 类型                                                                                                                     | 说明                          |
| ----------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| prefix      | `string \| number`                                                                                                       | 前缀                          |
| suffix      | `string \| number`                                                                                                       | 后缀                          |
| addonBefore | `string \| number`                                                                                                       | 前置标签                      |
| addonAfter  | `string \| number`                                                                                                       | 后置标签                      |
| classes     | `{ affixWrapper?: string, group?: string, wrapper?: string }`                                                            | @deprecated 改用 `classNames` |
| classNames  | `{ affixWrapper?: string, prefix?: string, suffix?: string, groupWrapper?: string, wrapper?: string, variant?: string }` | 语义化类名                    |
| styles      | `{ affixWrapper?: CSSProperties, prefix?: CSSProperties, suffix?: CSSProperties }`                                       | 语义化样式                    |
| allowClear  | `boolean`                                                                                                                | 是否允许清空                  |

### CountConfig

| 名称            | 类型                            | 说明                                                                              |
| --------------- | ------------------------------- | --------------------------------------------------------------------------------- |
| max             | `number`                        | 最大字符数，超出时触发 `exceedFormatter`                                          |
| strategy        | `(value: string) => number`     | 计数策略，默认 `value => value.length`                                            |
| show            | `boolean \| ShowCountFormatter` | 是否展示计数；传函数则作为格式化器                                                |
| exceedFormatter | `ExceedFormatter`               | 内容超出 `max` 时的裁剪函数，`(value: string, config: { max: number }) => string` |

### ShowCountFormatter

`(args: { value: string, count: number, maxLength?: number }) => any`

### BaseInputProps

`extends CommonInputProps`

| 名称         | 类型                                                                                                                          | 说明                                         |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| value        | `ValueType`                                                                                                                   | 输入值                                       |
| prefixCls    | `string`                                                                                                                      | 样式类前缀                                   |
| disabled     | `boolean`                                                                                                                     | 是否禁用                                     |
| focused      | `boolean`                                                                                                                     | 是否聚焦                                     |
| triggerFocus | `() => void`                                                                                                                  | 点击 affixWrapper 时回调，用于聚焦内部 input |
| readOnly     | `boolean`                                                                                                                     | 只读                                         |
| handleReset  | `MouseEventHandler`                                                                                                           | 点击清空按钮时回调                           |
| hidden       | `boolean`                                                                                                                     | 隐藏                                         |
| dataAttrs    | `{ affixWrapper?: DataAttr }`                                                                                                 | affixWrapper 的 `data-*` 属性                |
| components   | `{ affixWrapper?: 'span' \| 'div', groupWrapper?: 'span' \| 'div', wrapper?: 'span' \| 'div', groupAddon?: 'span' \| 'div' }` | 自定义各包装层标签                           |

## Events

### Input

| 名称             | 参数                    | 说明                                      |
| ---------------- | ----------------------- | ----------------------------------------- |
| change           | `(e: any)`              | 输入值变化                                |
| clear            | `(e: MouseEvent)`       | 点击清空按钮（在 `handleReset` 之后触发） |
| press-enter      | `(e: KeyboardEvent)`    | 按下回车（组合输入期间不触发）            |
| keydown          | `(e: KeyboardEvent)`    | 键盘按下                                  |
| keyup            | `(e: KeyboardEvent)`    | 键盘抬起                                  |
| focus            | `(e: FocusEvent)`       | 聚焦                                      |
| blur             | `(e: FocusEvent)`       | 失焦                                      |
| compositionstart | `(e: CompositionEvent)` | IME 组合开始                              |
| compositionend   | `(e: CompositionEvent)` | IME 组合结束                              |

### BaseInput

| 名称  | 参数              | 说明                                      |
| ----- | ----------------- | ----------------------------------------- |
| clear | `(e: MouseEvent)` | 点击清空按钮（在 `handleReset` 之后触发） |

## Slots

对应 `interface.ts` 中的 `InputSlots`，两侧 SFC 均用 `defineSlots` 声明（`Input` 为 `Omit<InputSlots, 'default'>`）。

### Input

| 名称        | 作用域 | 说明                                       |
| ----------- | ------ | ------------------------------------------ |
| prefix      | —      | 替换前缀内容                               |
| suffix      | —      | 替换后缀内容；计数 `span` 始终渲染在其之前 |
| addonBefore | —      | 替换前置标签                               |
| addonAfter  | —      | 替换后置标签                               |
| clearIcon   | —      | 替换清空图标，默认 `✖`                     |

### BaseInput

| 名称        | 作用域 | 说明                   |
| ----------- | ------ | ---------------------- |
| default     | —      | 内部 `<input>`         |
| prefix      | —      | 替换前缀内容           |
| suffix      | —      | 替换后缀内容           |
| addonBefore | —      | 替换前置标签           |
| addonAfter  | —      | 替换后置标签           |
| clearIcon   | —      | 替换清空图标，默认 `✖` |

## Expose

### Input (`InputRef`)

| 名称              | 类型                                                                                  | 说明                             |
| ----------------- | ------------------------------------------------------------------------------------- | -------------------------------- |
| focus             | `(options?: InputFocusOptions) => void`                                               | 聚焦内部 input                   |
| blur              | `() => void`                                                                          | 失焦                             |
| setSelectionRange | `(start: number, end: number, direction?: 'forward' \| 'backward' \| 'none') => void` | 设置选区                         |
| select            | `() => void`                                                                          | 全选                             |
| input             | `HTMLInputElement \| null`                                                            | 内部 `<input>` 引用              |
| nativeElement     | `HTMLElement \| null`                                                                 | 外层容器元素（wrapper 或 input） |

### BaseInput

| 名称          | 类型                  | 说明                                  |
| ------------- | --------------------- | ------------------------------------- |
| nativeElement | `HTMLElement \| null` | 外层容器元素（group 或 affixWrapper） |

> 上表按 `interface.ts` 中声明的 `InputRef` 逐字列出（与 @v-c 一致）。两个 SFC 的 `defineExpose` 实际暴露的是响应式对象，`dist/index.d.ts` 中推导出的类型是 `input: Readonly<ShallowRef<HTMLInputElement | null>>`、`nativeElement: ComputedRef<HTMLElement | null>`（BaseInput 的 `nativeElement` 同为 `ComputedRef`）；声明类型与实际暴露的 ref 形状不一致在 @v-c 侧同样存在。

## 与 @v-c 差异

| @v-c (vdom)                                                                                                            | vapor SFC                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `onChange`、`onPressEnter`、`onKeyDown`、`onKeyUp`、`onFocus`、`onBlur`、`onCompositionStart`、`onCompositionEnd` prop | 8 个事件：`@change`、`@press-enter`、`@keydown`、`@keyup`、`@focus`、`@blur`、`@compositionstart`、`@compositionend` |
| `onClear` prop（`InputProps` 与 `BaseInputProps` 均有，签名 `() => void`）                                             | `Input` 与 `BaseInput` 均为 `@clear` 事件，签名 `(e: MouseEvent)`（比 `() => void` 多带事件对象）                    |
| `prefix` / `suffix` / `addonBefore` / `addonAfter`: `VueNode`                                                          | `string \| number`；VNode / `() => VNode` 改由同名插槽提供                                                           |
| `allowClear: boolean \| { clearIcon?: VueNode, disabled?: boolean }`                                                   | `allowClear: boolean`；`clearIcon` 改由 `#clearIcon` 插槽提供，`disabled` 移除                                       |
| `classNames.clear`、`styles.clear`                                                                                     | 从类型中移除，清空按钮不可再通过语义化 API 定制                                                                      |
| `toPropsRefs(props, 'count', 'showCount')`                                                                             | `toRef(props, 'count')` + `toRef(props, 'showCount')`                                                                |
| `input.tsx` 内 `slots.x?.() ?? props.x` 一次性解析后只传 props                                                         | 新增 `InputSlots` 类型 + `defineSlots`；props 传字符串，节点内容走插槽转发                                           |
| 单文件 `BaseInput.tsx` 导出 `HolderRef` 接口                                                                           | 不导出，`useTemplateRef<{ nativeElement: HTMLElement \| null }>` 内联声明                                            |

> 注：`string`、`number`、`boolean` 等非 VueNode 类型的值仍通过 props 传递。
> `<Input>` 上未声明为 props 的 HTML 属性（`id`、`aria-*`、`name`、`inputmode`、`required` …）经 `useAttrs()` + `getAttrStyleAndClass` 取出后 `v-bind` 到 `<input>`，与 @v-c 的 `restAttrs` + `otherProps` 等价；`Input` 声明了 `inheritAttrs: false`，用户传入的 `class` / `style` 再经 `BaseInput` 的 `v-bind="$attrs"` 落到外层 wrapper，与 @v-c 的 `mergedClassName` / `mergedStyle` 一致。vapor 下 `onFocus`、`onChange` 等不是 props、`class` / `style` 被提升到 attrs，故 `omit(props, [...])` 列表只列真实声明的组件 props，比 @v-c 的 32 项短。
> `BaseInput` 里 `hasAffix` / `hasGroup` / `hasPrefix` / `hasSuffix` / `hasAddonBefore` / `hasAddonAfter` 读取 `!!slots.x` 决定 wrapper 结构，所以 `Input.vue` 对 `#prefix`、`#suffix`、`#addonBefore`、`#addonAfter` 用 `v-if` 条件转发（编译成 `hasXxxSlot ? { name, fn } : undefined`），否则裸 `<Input />` 也会渲染出完整的 group + affix 结构。`#clearIcon` 没有对应的结构守卫，仍无条件转发，`✖` 回退照常生效。
> @v-c `BaseInput.tsx:64`、`:192` 的 `class` / `style` / `hidden` 落在「根节点」上，而无 affix / addon 时根节点就是 `<input>` 本身。vapor 的 `<slot>` 只能传插槽作用域变量、无法把 attrs 落到插槽子组件的根元素，所以 `Input.vue` 自己判定 `hasAffix` / `hasGroup`（条件与 `BaseInput` 内部的守卫逐字一致），无 wrapper 时把用户 `class`（含 `-out-of-range`）、`style`、`hidden` 以及 `classNames.variant` 合并进 `<input>` 的 `class` / `style`，有 wrapper 时仍由 `BaseInput` 落到 wrapper 上。
> 清空按钮默认字形两侧均为 `✖`；@v-c 用 `isVueRenderable(clearIcon)` 判断，vapor 固定走 `<slot name="clearIcon">✖</slot>` 回退。
> `useCount` 的具名导出 `inCountRange`、`interface.ts` 的 `ValueType`、`ExceedFormatter`、`utils/types.ts` 的 `LiteralUnion` 两侧均未从 `index.ts` 导出。
> `classes`（@deprecated）两侧 `BaseInput` 均未读取。
