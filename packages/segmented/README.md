# Segmented

## Props

| 名称         | 类型                                             | 默认值           | 说明                                                          |
| ------------ | ------------------------------------------------ | ---------------- | ------------------------------------------------------------- |
| options      | `(string \| number \| SegmentedLabeledOption)[]` | `[]`             | 选项数组                                                      |
| value        | `string \| number \| undefined`                  | —                | 当前选中值（受控）                                            |
| defaultValue | `string \| number \| undefined`                  | —                | 初始选中值（非受控）                                          |
| disabled     | `boolean`                                        | —                | 是否禁用整个组件                                              |
| prefixCls    | `string`                                         | `'vc-segmented'` | 样式类前缀                                                    |
| direction    | `'ltr' \| 'rtl' \| undefined`                    | —                | 文字方向；`rtl` 时滑块动画取 `right` 而非 `left`              |
| motionName   | `string`                                         | `'thumb-motion'` | 滑块过渡动画名，实际类名为 `` `${prefixCls}-${motionName}` `` |
| vertical     | `boolean`                                        | —                | 是否垂直排列                                                  |
| name         | `string \| undefined`                            | —                | 传给 `input[type=radio]` 的 `name`                            |
| classNames   | `Partial<Record<SemanticName, string>>`          | —                | 语义化类名，`SemanticName = 'item' \| 'label'`                |
| styles       | `Partial<Record<SemanticName, CSSProperties>>`   | —                | 语义化样式，`SemanticName = 'item' \| 'label'`                |

### SegmentedLabeledOption

| 名称     | 类型               | 说明                                                               |
| -------- | ------------------ | ------------------------------------------------------------------ |
| label    | `string`           | 选项内容；仅支持 `string \| number`，见下方「与 @v-c 差异」        |
| value    | `string \| number` | 选项值                                                             |
| disabled | `boolean`          | 是否禁用该选项                                                     |
| class    | `string`           | 该选项的自定义类名                                                 |
| title    | `string`           | label 的 `title`；未传且 `label` 非对象时回退到 `label.toString()` |

## Events

| 名称   | 参数                      | 说明       |
| ------ | ------------------------- | ---------- |
| change | `(val: string \| number)` | 选中项变化 |

## Slots

对应 `interface.ts` 中的 `SegmentedSlots`。

| 名称       | 作用域                             | 类型                                        | 说明                                       |
| ---------- | ---------------------------------- | ------------------------------------------- | ------------------------------------------ |
| itemRender | `{ item: SegmentedLabeledOption }` | `(item: SegmentedLabeledOption) => VueNode` | 替换单项默认的 `<label>` 结构              |
| label      | —                                  | `() => any`                                 | 替换 label 文本；未提供时渲染 `item.label` |

## 与 @v-c 差异

| @v-c (vdom)                                                                                | vapor SFC                                                                          |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `onChange` prop                                                                            | `@change` 事件                                                                     |
| `itemRender` prop（`(node, { item }) => VueNode`，可拿到默认节点）                         | 不再作为 prop，改为 `#itemRender="{ item }"` 插槽；只能整块替换，拿不到默认节点    |
| `SegmentedLabeledOption.label: VueNode`（支持 VNode、`() => VNode`）                       | `label: string`，类型收窄，VNode / 函数不再支持                                    |
| 单文件 `index.tsx` 内联 `InternalSegmentedOption`                                          | 拆为 `InternalSegmentedOption.vue` + `MotionThumb.vue`                             |
| `interface.tsx` 导出 `defaults`（含 `itemRender: node => node`）供 `props = defaults` 兜底 | 不导出 `defaults`，默认值写在 `withDefaults`                                       |
| `MotionThumb` 的 `onMotionStart` / `onMotionEnd` prop                                      | `@motion-start` / `@motion-end` 事件                                               |
| `MotionThumb` `defaults = { vertical: false }`                                             | 不导出 `defaults`（`vertical` 本身可选，语义不变）                                 |
| 无 `SegmentedSlots`                                                                        | 新增 `SegmentedSlots` 接口描述插槽；`#itemRender` 作用域经 `v-bind="ctx"` 逐层转发 |

> 注：`disabled`、`prefixCls`、`direction`、`vertical`、`name` 等非 VueNode 类型的值仍通过 props 传递。
> `MotionThumb` 内 `const visible = true` 在 @v-c 中也是死代码，两侧该项等价。
> `MotionThumb` 的渲染守卫：@v-c 为 `if (!prevStyle || !nextStyle) return null`（即 `prev && next`），vapor 为 `v-if="prevStyle || nextStyle"`。二者在实际运行中等价——`prevStyle` / `nextStyle` 始终成对写入、成对清空；仅在 `findValueElement` 某一侧取不到元素（该值已移出列表或不在布局中）时 `calcThumbStyle` 返回 `null`，此时 @v-c 整个 thumb 消失，vapor 渲染一个只有一半 CSS 变量的 thumb。
> 受控/非受控合并（`mergedValue` / `internalValue` / `controlRerender`）、箭头键跳过 `disabled`、根元素 `class` / `style` 合并、`-item-selected-text`、`-item-disabled` 挂载位置均已与 @v-c 对齐。
