# Progress

进度条组件，包含 `Line`（线形）与 `Circle`（环形）两种形态，二者共享同一套 `ProgressProps` 类型定义。

## Props

`Line` 与 `Circle` 均接受以下 `ProgressProps`（默认值取自各自 `withDefaults`，有差异处以注释标明）：

| 名称          | 类型                                           | 默认值                            | 说明                                                                             |
| ------------- | ---------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------- |
| id            | `string`                                       | —                                 | 组件唯一标识；Line / Circle 未传时自动生成 `vc_progress_{uuid}`                  |
| strokeWidth   | `number`                                       | `1`                               | 进度条宽度                                                                       |
| railWidth     | `number`                                       | `1`（Line）；Circle 未设默认      | 底部轨道宽度；Circle 未传时回退用 `strokeWidth`                                  |
| percent       | `number \| number[]`                           | `0`                               | 进度百分比（0~100），支持多段                                                    |
| strokeColor   | `StrokeColorType`                              | `'#2db7f5'`                       | 进度条颜色；支持 `string`、渐变对象 `Record<string, string \| boolean>` 或其数组 |
| railColor     | `string`                                       | `'#D9D9D9'`                       | 底部轨道颜色                                                                     |
| strokeLinecap | `StrokeLinecapType`                            | `'round'`                         | 端点形状：`round` \| `butt` \| `square`                                          |
| prefixCls     | `string`                                       | `'vc-progress'`                   | 样式类前缀                                                                       |
| gapDegree     | `number`                                       | —                                 | 环形缺口角度（Circle 专属）                                                      |
| gapPosition   | `GapPositionType`                              | `'bottom'`（Circle）；Line 不使用 | 环形缺口位置：`top` \| `right` \| `bottom` \| `left`                             |
| transition    | `string`                                       | —                                 | 自定义过渡动画                                                                   |
| loading       | `boolean`                                      | `false`                           | 是否加载中（indeterminate 动画）                                                 |
| steps         | `number \| { count: number; gap: number }`     | —                                 | 步进模式：步数或 `{ count, gap }`                                                |
| classNames    | `Partial<Record<SemanticName, string>>`        | —                                 | 语义化类名（Circle 使用）                                                        |
| styles        | `Partial<Record<SemanticName, CSSProperties>>` | —                                 | 语义化样式（Circle 使用）                                                        |

> `SemanticName = 'root' \| 'rail' \| 'track'`
> `StrokeColorType = string \| Record<string, string \| boolean> \| (string \| Record<string, string \| boolean>)[]`
> `GapPositionType = 'top' \| 'right' \| 'bottom' \| 'left'`
> `StrokeLinecapType = 'round' \| 'butt' \| 'square'`

## Events

| 名称  | 类型                      | 说明                                            |
| ----- | ------------------------- | ----------------------------------------------- |
| click | `(e: MouseEvent) => void` | 点击进度条（svg）时触发（Line / Circle 均支持） |

## Slots

无插槽。

## Expose

| 名称     | 类型                                           | 说明                                                   |
| -------- | ---------------------------------------------- | ------------------------------------------------------ |
| getPaths | `() => (SVGPathElement \| SVGCircleElement)[]` | 返回内部路径/圆环 DOM 引用（Circle 暴露；Line 无暴露） |

## 与 @v-c 差异

| @v-c (vdom)                                                   | vapor SFC                              |
| ------------------------------------------------------------- | -------------------------------------- |
| `defaultProps` 统一默认值 + `useTransitionDuration` 共享 hook | 各自 `withDefaults` + 内联 `onMounted` |
| `PtgCircle` 暴露 `circleRef`                                  | `Circle` 暴露 `getPaths` 方法          |

> 注：`strokeWidth`、`railWidth`、`percent`、`strokeColor`、`railColor`、`strokeLinecap`、`prefixCls`、`gapDegree`、`gapPosition`、`transition`、`loading`、`steps` 等非 VueNode 类型的值仍通过 props 传递。
