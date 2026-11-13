# Slider

## Props

| 名称                            | 类型                                                     | 默认值        | 说明                                                                                           |
| ------------------------------- | -------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------- |
| prefixCls                       | `string`                                                 | `'vc-slider'` | 样式类前缀                                                                                     |
| classNames                      | `Partial<Record<SemanticName, string>>`                  | `undefined`   | 语义化类名（`SemanticName`：`'tracks' \| 'track' \| 'rail' \| 'handle'`）                      |
| styles                          | `Partial<Record<SemanticName, CSSProperties>>`           | `undefined`   | 语义化样式（`SemanticName`：`'tracks' \| 'track' \| 'rail' \| 'handle'`）                      |
| id                              | `string`                                                 | `undefined`   | 根元素 id                                                                                      |
| disabled                        | `boolean \| boolean[]`                                   | `false`       | `boolean` 禁用整个滑块；`boolean[]` 按索引禁用指定手柄（缺失项视为 `false`，禁用手柄作为锚点） |
| keyboard                        | `boolean`                                                | `true`        | 是否启用键盘操作                                                                               |
| autoFocus                       | `boolean`                                                | `undefined`   | 挂载时自动聚焦                                                                                 |
| range                           | `boolean \| RangeConfig`                                 | `undefined`   | 范围模式；`RangeConfig` 含 `editable` / `draggableTrack` / `minCount` / `maxCount`             |
| count                           | `number`                                                 | `undefined`   | 手柄数量（已废弃，建议用 `range.minCount` / `range.maxCount`）                                 |
| min                             | `number`                                                 | `0`           | 最小值                                                                                         |
| max                             | `number`                                                 | `100`         | 最大值                                                                                         |
| step                            | `number \| null`                                         | `1`           | 步长；`null` 表示连续取值                                                                      |
| value                           | `Value \| null`                                          | `undefined`   | 当前值（`Value`：`number \| number[]`）                                                        |
| defaultValue                    | `Value \| null`                                          | `undefined`   | 默认值（`Value`：`number \| number[]`）                                                        |
| allowCross                      | `boolean`                                                | `true`        | 手柄是否允许交叉                                                                               |
| pushable                        | `boolean \| number`                                      | `false`       | 手柄是否可互相推动（`number` 为最小间距）                                                      |
| reverse                         | `boolean`                                                | `undefined`   | 反向布局                                                                                       |
| vertical                        | `boolean`                                                | `undefined`   | 垂直模式                                                                                       |
| included                        | `boolean`                                                | `true`        | 是否显示包含区间                                                                               |
| startPoint                      | `number`                                                 | `undefined`   | 轨道起始点                                                                                     |
| trackStyle                      | `CSSProperties \| CSSProperties[]`                       | `undefined`   | 轨道样式（已废弃，建议用 `styles.track`）                                                      |
| handleStyle                     | `CSSProperties \| CSSProperties[]`                       | `undefined`   | 手柄样式（已废弃，建议用 `styles.handle`）                                                     |
| railStyle                       | `CSSProperties`                                          | `undefined`   | 导轨样式（已废弃，建议用 `styles.rail`）                                                       |
| dotStyle                        | `CSSProperties \| ((dotValue: number) => CSSProperties)` | `undefined`   | 圆点样式                                                                                       |
| activeDotStyle                  | `CSSProperties \| ((dotValue: number) => CSSProperties)` | `undefined`   | 激活圆点样式                                                                                   |
| marks                           | `Record<string \| number, any>`                          | `undefined`   | 刻度标记；值可为任意可渲染内容或 `MarkObj`（含 `style` / `label`）                             |
| dots                            | `boolean`                                                | `undefined`   | 是否显示圆点                                                                                   |
| track                           | `boolean`                                                | `true`        | 是否显示轨道                                                                                   |
| tabIndex                        | `number \| number[]`                                     | `0`           | 键盘导航序号                                                                                   |
| ariaLabelForHandle              | `string \| string[]`                                     | `undefined`   | 手柄无障碍标签                                                                                 |
| ariaLabelledByForHandle         | `string \| string[]`                                     | `undefined`   | 手柄无障碍关联元素 id                                                                          |
| ariaDescribedByForHandle        | `string \| string[]`                                     | `undefined`   | 手柄无障碍描述元素 id                                                                          |
| ariaRequired                    | `boolean`                                                | `undefined`   | 无障碍必填                                                                                     |
| ariaValueTextFormatterForHandle | `AriaValueFormat \| AriaValueFormat[]`                   | `undefined`   | 无障碍值文本格式化（`(value: number) => string`）                                              |

## Events

| 名称            | 参数                 | 说明                                           |
| --------------- | -------------------- | ---------------------------------------------- |
| change          | `(value: ValueType)` | 值变化（`ValueType`：`number \| number[]`）    |
| before-change   | `(value: ValueType)` | 值即将变化（开始拖拽 / 点击 / 删除前）         |
| after-change    | `(value: ValueType)` | 值变化结束（已废弃，建议用 `change-complete`） |
| change-complete | `(value: ValueType)` | 值变化完成                                     |
| focus           | `(e: FocusEvent)`    | 聚焦                                           |
| blur            | `(e: FocusEvent)`    | 失焦                                           |

## Slots

| 名称               | 作用域                                                                                                                                           | 说明                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| handleRender       | `SliderHandleSlotData`（含 `prefixCls` / `value` / `valueIndex` / `dragging` / `draggingDelete` / `node` / `className` / `style` / `isPhantom`） | 自定义手柄渲染                  |
| activeHandleRender | `SliderHandleSlotData`（含 `prefixCls` / `value` / `valueIndex` / `dragging` / `draggingDelete` / `node` / `className` / `style` / `isPhantom`） | 激活手柄渲染（用于 tooltip 等） |

## Expose

| 名称  | 类型         | 说明           |
| ----- | ------------ | -------------- |
| focus | `() => void` | 聚焦第一个手柄 |
| blur  | `() => void` | 失焦           |

## 与 @v-c 差异

| @v-c (vdom)                       | vapor SFC                  |
| --------------------------------- | -------------------------- |
| `onChange` prop                   | `@change` 事件             |
| `onBeforeChange` prop             | `@before-change` 事件      |
| `onAfterChange` prop              | `@after-change` 事件       |
| `onChangeComplete` prop           | `@change-complete` 事件    |
| `onFocus` prop                    | `@focus` 事件              |
| `onBlur` prop                     | `@blur` 事件               |
| `handleRender` prop（函数）       | `#handleRender` slot       |
| `activeHandleRender` prop（函数） | `#activeHandleRender` slot |

> 注：`prefixCls`、`disabled`、`min`、`max`、`step`、`value`、`defaultValue`、`range`、`count`、`allowCross`、`pushable`、`reverse`、`vertical`、`included`、`dots`、`track`、`tabIndex` 等非 VueNode 类型的值仍通过 props 传递，不受此差异影响。
> `className` / `style` 已从 props 移除，通过 `attrs` 透传（组件内以 `attrs.class` / `attrs.style` 合并到根元素），非 props 接收。
> `marks`、`trackStyle`、`handleStyle`、`railStyle`、`dotStyle`、`activeDotStyle` 为非 node 值（对象 / 函数 / 数组），仍通过 props 传递。
> 事件如果是在 jsx/tsx 中使用，则仍以 `onXxx={xx}` 触发。
> 插槽如果是在 jsx/tsx 中使用，则以 `v-slots={{ handleRender: (props) => <Comp /> }}` 形式使用。
