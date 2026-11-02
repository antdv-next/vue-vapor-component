# TextArea

多行文本框组件，支持自动高度、字符计数、清除、前后缀与前后标签等功能。

## Props

| 名称              | 类型                                                                                                                                                        | 默认值          | 说明                                                        |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ----------------------------------------------------------- |
| value             | `ValueType`                                                                                                                                                 | `undefined`     | 输入值                                                      |
| defaultValue      | `any`                                                                                                                                                       | `undefined`     | 非受控模式默认值                                            |
| disabled          | `boolean`                                                                                                                                                   | `undefined`     | 是否禁用                                                    |
| prefixCls         | `string`                                                                                                                                                    | `'vc-textarea'` | 样式类前缀                                                  |
| prefix            | `string \| number`                                                                                                                                          | `undefined`     | 前缀内容                                                    |
| suffix            | `string \| number`                                                                                                                                          | `undefined`     | 后缀内容                                                    |
| addonBefore       | `string \| number`                                                                                                                                          | `undefined`     | 前置标签                                                    |
| addonAfter        | `string \| number`                                                                                                                                          | `undefined`     | 后置标签                                                    |
| allowClear        | `boolean`                                                                                                                                                   | `undefined`     | 是否允许清除                                                |
| autoSize          | `boolean \| { minRows?: number; maxRows?: number }`                                                                                                         | `undefined`     | 是否自动调整高度，或配置最小/最大行数                       |
| showCount         | `boolean \| { formatter: (args: { value: string; count: number; maxLength?: number }) => any }`                                                             | `undefined`     | 是否显示字符计数，或自定义格式化函数                        |
| placeholder       | `string`                                                                                                                                                    | `undefined`     | 占位提示文本                                                |
| classes           | `{ affixWrapper?: string; group?: string; wrapper?: string }`                                                                                               | `undefined`     | 基础类名                                                    |
| classNames        | `{ affixWrapper?: string; prefix?: string; suffix?: string; groupWrapper?: string; wrapper?: string; variant?: string; textarea?: string; count?: string }` | `undefined`     | 语义化类名                                                  |
| styles            | `{ affixWrapper?: CSSProperties; prefix?: CSSProperties; suffix?: CSSProperties; textarea?: CSSProperties; count?: CSSProperties; clear?: CSSProperties }`  | `undefined`     | 语义化样式                                                  |
| count             | `CountConfig`                                                                                                                                               | `undefined`     | 计数配置（`max` / `strategy` / `show` / `exceedFormatter`） |
| maxLength         | `number`                                                                                                                                                    | `undefined`     | 最大输入长度                                                |
| readOnly          | `boolean`                                                                                                                                                   | `undefined`     | 是否只读                                                    |
| hidden            | `boolean`                                                                                                                                                   | `undefined`     | 是否隐藏                                                    |
| autoFocus         | `boolean`                                                                                                                                                   | `undefined`     | 是否自动聚焦                                                |
| changeOnComposing | `boolean`                                                                                                                                                   | `undefined`     | 是否在输入法组合过程中触发 change 事件                      |
| handleReset       | `(e: MouseEvent) => void`                                                                                                                                   | `undefined`     | 自定义清除重置处理                                          |
| components        | `{ affixWrapper?: 'span' \| 'div'; groupWrapper?: 'span' \| 'div'; wrapper?: 'span' \| 'div'; groupAddon?: 'span' \| 'div' }`                               | `undefined`     | 容器标签组件配置                                            |
| dataAttrs         | `{ affixWrapper?: Record<\`data-${string}\`, string> }`                                                                                                     | `undefined`     | 附加 data 属性                                              |

## Events

| 名称             | 参数                                        | 说明           |
| ---------------- | ------------------------------------------- | -------------- |
| change           | `(e: any)`                                  | 值变化         |
| clear            | `(e: MouseEvent)`                           | 点击清除       |
| focus            | `(e: any)`                                  | 聚焦           |
| blur             | `(e: any)`                                  | 失焦           |
| keydown          | `(e: KeyboardEvent)`                        | 键盘按下       |
| pressEnter       | `(e: KeyboardEvent)`                        | 按下回车       |
| compositionstart | `(e: any)`                                  | 输入法组合开始 |
| compositionend   | `(e: any)`                                  | 输入法组合结束 |
| resize           | `(size: { width: number; height: number })` | 尺寸变化       |

## Slots

| 名称        | 作用域 | 说明         |
| ----------- | ------ | ------------ |
| prefix      | —      | 前缀内容     |
| suffix      | —      | 后缀内容     |
| addonBefore | —      | 前置标签内容 |
| addonAfter  | —      | 后置标签内容 |
| clearIcon   | —      | 清除图标     |

## Expose

| 名称              | 类型                                             | 说明                        |
| ----------------- | ------------------------------------------------ | --------------------------- |
| resizableTextArea | `Ref<{ textArea: HTMLTextAreaElement \| null }>` | 底层 ResizableTextArea 引用 |
| focus             | `() => void`                                     | 聚焦                        |
| blur              | `() => void`                                     | 失焦                        |
| nativeElement     | `ComputedRef<HTMLElement \| null>`               | 原生 DOM 元素               |

## 与 @v-c 差异

| @v-c (vdom)                                    | vapor SFC                                    |
| ---------------------------------------------- | -------------------------------------------- |
| `onChange` prop                                | `@change` 事件                               |
| `onPressEnter` prop                            | `@pressEnter` 事件                           |
| `onKeydown` / `onFocus` / `onBlur` prop        | `@keydown` / `@focus` / `@blur` 事件         |
| `onClear` prop                                 | `@clear` 事件                                |
| `onResize` prop                                | `@resize` 事件                               |
| `onCompositionstart` / `onCompositionend` prop | `@compositionstart` / `@compositionend` 事件 |

> 注：`value`、`disabled`、`prefixCls`、`autoSize`、`maxLength` 等非 VueNode 类型的值仍通过 props 传递。
> 源项目通过 `useAllowClear` 内部管理清除状态，vapor 版本将 `handleReset` 暴露为 prop 供 `BaseInput` 使用。
> 事件如果是在 jsx/tsx 中使用，则仍以 `onXxx={xx}` 触发。
