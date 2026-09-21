# Switch

## Props

| 名称              | 类型                          | 默认值        | 说明                                                   |
| ----------------- | ----------------------------- | ------------- | ------------------------------------------------------ |
| checked           | `boolean`                     | `false`       | 是否选中                                               |
| defaultChecked    | `boolean`                     | `false`       | 初始是否选中                                           |
| disabled          | `boolean`                     | —             | 是否禁用                                               |
| prefixCls         | `string`                      | `'vc-switch'` | 样式类前缀                                             |
| checkedChildren   | `string`                      | —             | 选中时文本内容（可用 `#checkedChildren` 插槽替代）     |
| unCheckedChildren | `string`                      | —             | 未选中时文本内容（可用 `#unCheckedChildren` 插槽替代） |
| className         | `string`                      | —             | 自定义类名                                             |
| styles            | `{ content?: CSSProperties }` | —             | 语义化样式                                             |
| classNames        | `{ content?: string }`        | —             | 语义化类名                                             |
| tabIndex          | `number`                      | —             | 键盘导航序号                                           |
| title             | `string`                      | —             | 提示文本                                               |

## Events

| 名称           | 参数                           | 说明         |
| -------------- | ------------------------------ | ------------ |
| change         | `(checked: boolean, e: Event)` | 状态改变     |
| update:checked | `(checked: boolean)`           | v-model 更新 |
| click          | `(checked: boolean, e: Event)` | 点击         |
| keydown        | `(e: Event)`                   | 键盘按下     |

## Slots

| 名称              | 作用域 | 说明                                                       |
| ----------------- | ------ | ---------------------------------------------------------- |
| loadingIcon       | —      | 加载图标                                                   |
| checkedChildren   | —      | 选中时内容；不传时使用 `checkedChildren` prop 作为回退     |
| unCheckedChildren | —      | 未选中时内容；不传时使用 `unCheckedChildren` prop 作为回退 |

## Expose

| 名称   | 类型                     | 说明          |
| ------ | ------------------------ | ------------- |
| btnRef | `Ref<HTMLButtonElement>` | 按钮 DOM 引用 |

## 与 @v-c 差异

| @v-c (vdom)                                                   | vapor SFC                                             |
| ------------------------------------------------------------- | ----------------------------------------------------- |
| `onChange` prop                                               | `@change` 事件                                        |
| `onClick` prop                                                | `@click` 事件                                         |
| `onKeyDown` prop                                              | `@keydown` 事件                                       |
| `onUpdate:checked` prop                                       | `@update:checked` 事件                                |
| `useMergedState` 内部受控状态                                 | 无内部状态，直接用 `checked \|\| defaultChecked` 读取 |
| `checked` / `defaultChecked` 默认 `undefined`                 | 默认 `false`（vapor 布尔 prop 强制转 false）          |
| `loadingIcon` prop (`VNodeChild \| (() => VNodeChild)`)       | 移除该 prop，改用 `#loadingIcon` 插槽                 |
| `checkedChildren` prop (`VNodeChild \| (() => VNodeChild)`)   | `string` prop，可用 `#checkedChildren` 插槽替代       |
| `unCheckedChildren` prop (`VNodeChild \| (() => VNodeChild)`) | `string` prop，可用 `#unCheckedChildren` 插槽替代     |

> 注：`checked`、`disabled`、`prefixCls`、`checkedChildren`、`unCheckedChildren` 等非 VueNode 类型的值仍通过 props 传递。
> `checkedChildren` / `unCheckedChildren` 优先渲染对应插槽，插槽未提供时回退渲染 prop 文本。
> `checked` / `defaultChecked` 默认值差异带来行为变化：非受控模式下（仅传 `defaultChecked`），`@v-c` 由 `useMergedState` 记忆点击后的状态，vapor 版不记忆内部状态，切换后实际值回落到 `checked \|\| defaultChecked`，因此非受控用法需改为受控（绑定 `checked` + `@update:checked`）。
