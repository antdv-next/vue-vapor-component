# Checkbox

## Props

| 名称             | 类型                               | 默认值          | 说明                   |
| ---------------- | ---------------------------------- | --------------- | ---------------------- |
| checked          | `boolean`                          | —               | 是否选中（受控）       |
| defaultChecked   | `boolean`                          | —               | 初始是否选中（非受控） |
| disabled         | `boolean`                          | `false`         | 是否禁用               |
| type             | `string`                           | `'checkbox'`    | input 类型             |
| title            | `string`                           | —               | 提示文本               |
| value            | `any`                              | —               | 值                     |
| prefixCls        | `string`                           | `'vc-checkbox'` | 样式类前缀             |
| onChange         | `(e: CheckboxChangeEvent) => void` | —               | 状态改变回调           |
| onUpdate:checked | `(value: boolean) => void`         | —               | v-model 更新回调       |

## Events

| 名称           | 参数                       | 说明         |
| -------------- | -------------------------- | ------------ |
| change         | `(e: CheckboxChangeEvent)` | 状态改变     |
| update:checked | `(checked: boolean)`       | v-model 更新 |

## Expose

| 名称          | 类型                    | 说明               |
| ------------- | ----------------------- | ------------------ |
| focus         | `() => void`            | 聚焦 input         |
| blur          | `() => void`            | 失焦 input         |
| input         | `Ref<HTMLInputElement>` | input 元素引用     |
| nativeElement | `Ref<HTMLSpanElement>`  | 外层 span 元素引用 |

## 与 @v-c 差异

| @v-c (vdom)                          | vapor SFC                                          |
| ------------------------------------ | -------------------------------------------------- |
| `onChange` prop                      | `@change` 事件                                     |
| `onUpdate:checked` prop              | `@update:checked` 事件                             |
| `useMergedState` 支持受控/非受控模式 | 仅使用 `checked` prop，不直接读取 `defaultChecked` |

> 注：`checked`、`disabled`、`type`、`title`、`prefixCls` 等非 VueNode 类型的值仍通过 props 传递，不受此差异影响。  
> 事件如果是在 jsx/tsx 中使用，则仍以 `onXxx={xx}` 触发
