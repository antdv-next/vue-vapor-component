# Steps

步骤条。通过 `items` 配置数组渲染步骤，`current` 控制当前激活步骤，点击步骤项触发 `change` 事件。

## Props

| 名称           | 类型                                             | 默认值         | 说明                                                                                                                                                                          |
| -------------- | ------------------------------------------------ | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| prefixCls      | `string`                                         | `'vc-steps'`   | 样式类前缀                                                                                                                                                                    |
| status         | `Status`                                         | `'process'`    | 当前激活步骤的状态（`'error' \| 'process' \| 'finish' \| 'wait'`）                                                                                                            |
| current        | `number`                                         | `0`            | 当前步骤索引（从 `initial` 起算）；步骤索引 `< current` 记为 `finish`，`> current` 记为 `wait`                                                                                |
| initial        | `number`                                         | `0`            | 起始步骤索引，各步骤 key 从该值起递增                                                                                                                                         |
| orientation    | `'horizontal' \| 'vertical'`                     | `'horizontal'` | 步骤条方向（有效默认值；未传时 `mergedOrientation` 计算为 `'horizontal'`）                                                                                                    |
| titlePlacement | `'horizontal' \| 'vertical'`                     | `'horizontal'` | 标题相对图标的位置，仅横向布局生效（未传时计算为 `'horizontal'`）                                                                                                             |
| items          | `StepItem[]`                                     | —              | 步骤配置数组（空项被过滤）                                                                                                                                                    |
| components     | `{ root?: ComponentType; item?: ComponentType }` | —              | 自定义根节点 / 步骤项的渲染组件，`ComponentType = string \| any`                                                                                                              |
| className      | `string`                                         | —              | 自定义类名，合入根节点 `-{prefix}`                                                                                                                                            |
| style          | `CSSProperties`                                  | —              | 自定义样式（`mergedStyle` 展开到根节点）                                                                                                                                      |
| rootClassName  | `string`                                         | —              | 根节点额外类名                                                                                                                                                                |
| classNames     | `Partial<Record<SemanticName, string>>`          | —              | 语义化类名，`SemanticName = 'root' \| 'item' \| 'itemWrapper' \| 'itemHeader' \| 'itemTitle' \| 'itemSubtitle' \| 'itemSection' \| 'itemContent' \| 'itemIcon' \| 'itemRail'` |
| styles         | `Partial<Record<SemanticName, CSSProperties>>`   | —              | 语义化样式，`SemanticName` 同上（与 `classNames` 同键）                                                                                                                       |

## Events

| 名称   | 参数                | 说明                                                                    |
| ------ | ------------------- | ----------------------------------------------------------------------- |
| change | `(current: number)` | 点击非当前步骤项时触发，参数为点击项的索引（与 `current` 相同则不触发） |

## Slots

| 名称              | 作用域                            | 说明                                                                                |
| ----------------- | --------------------------------- | ----------------------------------------------------------------------------------- |
| title             | `{ title?: string \| number }`    | 自定义每个步骤项的标题，转发给每个 Step（Step 的 `#title` 插槽原样透传）            |
| subTitle          | `{ subTitle?: string \| number }` | 自定义每个步骤项的副标题，转发给每个 Step（Step 的 `#subTitle` 插槽原样透传）       |
| content           | `{ content?: string \| number }`  | 自定义每个步骤项的内容，转发给每个 Step（Step 的 `#content` 插槽原样透传）          |
| iconRender        | `{ item, index, active, icon }`   | 自定义每个步骤项的图标，转发给每个 Step（Step 的 `#iconRender` 插槽原样透传）       |
| itemRender        | `{ info: RenderInfo }`            | 自定义整个步骤节点，转发给每个 Step（`RenderInfo = { item, index, active, icon }`） |
| itemWrapperRender | `{ info: RenderInfo }`            | 自定义步骤内容包装层，转发给每个 Step                                               |

### StepItem

`items` 数组元素类型，描述单个步骤项。

| 名称        | 类型                                               | 说明                                                                                                                                    |
| ----------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| title       | `string \| number`                                 | 步骤标题文本；VNode 标题需用 `Steps` 的 `#title` 插槽（经 Step 透传）                                                                   |
| subTitle    | `string \| number`                                 | 步骤副标题文本；VNode 副标题需用 `Steps` 的 `#subTitle` 插槽（经 Step 透传）                                                            |
| content     | `string \| number`                                 | 步骤内容文本；VNode 内容需用 `Steps` 的 `#content` 插槽（经 Step 透传）                                                                 |
| description | `string \| number`                                 | 步骤描述；`@deprecated`，请改用 `content`，`content` 优先（`mergedContent = content ?? description`）；VNode 走 `#content` 插槽         |
| icon        | `string`                                           | 自定义图标文本/类名；非空时步骤项加 `-custom` 类（图标本体需经 `#iconRender` 插槽渲染）                                                 |
| status      | `Status`                                           | 覆盖该步骤的状态，缺省时按索引相对 `current` 计算                                                                                       |
| disabled    | `boolean`                                          | 禁用该步骤项（不可点击，不加 `role="button"` / `tabindex`）                                                                             |
| onClick     | `(e: MouseEvent) => void`                          | 步骤项点击回调，与父级 `change` 串联（先调 `onItemClick` 再上报索引）                                                                   |
| classNames  | `Partial<Record<ItemSemanticName, string>>`        | 语义化类名，`ItemSemanticName = 'root' \| 'wrapper' \| 'header' \| 'title' \| 'subtitle' \| 'section' \| 'content' \| 'icon' \| 'rail'` |
| styles      | `Partial<Record<ItemSemanticName, CSSProperties>>` | 语义化样式，`ItemSemanticName` 同上                                                                                                     |
| class       | `string`                                           | 步骤项根节点额外类名                                                                                                                    |
| style       | `CSSProperties`                                    | 步骤项根节点样式（与 `-item` 级语义化样式合并）                                                                                         |

## Step（子组件）

具名导出：`import { Step } from '@vapor-component/steps'`。通常由 `Steps` 内部使用，`items` 路径下无需手动使用。

### Props

| 名称       | 类型       | 默认值 | 说明                                    |
| ---------- | ---------- | ------ | --------------------------------------- |
| prefixCls  | `string`   | —      | 样式类前缀（由 `Steps` 传入）           |
| classNames | `any`      | —      | 语义化类名（由 `Steps` 传入）           |
| styles     | `any`      | —      | 语义化样式（由 `Steps` 传入）           |
| data       | `StepItem` | —      | 当前步骤数据（`Steps` 会注入 `status`） |
| nextStatus | `Status?`  | —      | 下一步骤状态，用于 rail 颜色            |
| active     | `boolean?` | —      | 是否为当前激活步骤（加 `-active` 类）   |
| index      | `number`   | —      | 当前步骤索引                            |
| last       | `boolean`  | —      | 是否为最后一步（最后一步不渲染 rail）   |

### Events

| 名称  | 参数              | 说明                                                         |
| ----- | ----------------- | ------------------------------------------------------------ |
| click | `(index: number)` | 步骤项被点击或按 Enter / 空格时触发（`data.onClick` 先调用） |

### Slots

| 名称              | 作用域                            | 说明                                                                                     |
| ----------------- | --------------------------------- | ---------------------------------------------------------------------------------------- |
| title             | `{ title?: string \| number }`    | 自定义标题；未提供时回退渲染 `{{ title }}`（`string \| number`）                         |
| subTitle          | `{ subTitle?: string \| number }` | 自定义副标题；未提供时回退渲染 `{{ subTitle }}`（`string \| number`）                    |
| content           | `{ content?: string \| number }`  | 自定义内容；未提供时回退渲染 `{{ content }}`（`string \| number`，`description` 同路径） |
| iconRender        | `{ item, index, active, icon }`   | 自定义图标，未提供时回退渲染 `<StepIcon />`                                              |
| itemRender        | `{ info: RenderInfo }`            | 自定义整个步骤节点                                                                       |
| itemWrapperRender | `{ info: RenderInfo }`            | 自定义内容包装层                                                                         |

## 与 @v-c 差异

| @v-c (vdom)                                                                                                                                              | vapor SFC                                                                                                                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `onChange` prop                                                                                                                                          | `@change` 事件                                                                                                                                                                                                                                         |
| `iconRender` / `itemRender` / `itemWrapperRender` 渲染函数 props                                                                                         | `#iconRender` / `#itemRender` / `#itemWrapperRender` 插槽                                                                                                                                                                                              |
| `StepItem` 的 `title` / `subTitle` / `content` / `description` / `icon` 为 `VueNode`，`Step.tsx` 按节点渲染 `{title}` / `{subTitle}` / `{mergedContent}` | 收窄为基本类型：`title` / `subTitle` / `content` / `description` 为 `string \| number`，`icon` 为 `string`；VNode 承载改用 `Steps` 的 `#title` / `#subTitle` / `#content` 插槽（经 Step 透传，`description` 走 `#content`），图标经 `#iconRender` 插槽 |
| `Step.tsx` 点击用 `e.key === 'Enter' \| ' '` + `e.currentTarget.click()`                                                                                 | 用 `KeyCode.ENTER / SPACE` 直接 `emit('click', index)`（不触发原生 `click`，`data.onClick` 由 `handleClick` 单独调用）                                                                                                                                 |
| `iconNode = iconRender ? iconRender(...) : <StepIcon />`，`iconRender` 入参含 `components: { Icon }`                                                     | `#iconRender` 插槽作用域直接为 `{ item, index, active, icon }`，无 `components` 包装                                                                                                                                                                   |
| `StepIconSemanticContextProvider` 组件（provide 包裹图标节点）                                                                                           | 改用 `provide(StepIconSemanticKey, computed(...))`（provide/inject，实现细节）                                                                                                                                                                         |
| `useItems` 无；`Steps` 仅经 `items` 渲染                                                                                                                 | 相同，无 `useItems`                                                                                                                                                                                                                                    |
| 仅导出 `useUnstableContext`                                                                                                                              | 额外导出 `provideUnstableContext`                                                                                                                                                                                                                      |
| index.ts 仅导出 `StepsProps` 类型                                                                                                                        | 额外导出 `StepItem`、`Status`、`SemanticName` 类型                                                                                                                                                                                                     |
| `Steps.tsx` 导出 `StepIconRender`、`ComponentType` 类型                                                                                                  | 从 interface.ts 移除（`ComponentType` 保留在 interface 内，不导出 `StepIconRender`）                                                                                                                                                                   |
| `defineComponent<StepsProps>({ setup(props = defaults) })` 兜底默认值                                                                                    | 默认值写在 `withDefaults`（`prefixCls` / `status` / `current` / `initial`）                                                                                                                                                                            |

> 注：`prefixCls`、`status`、`current`、`initial`、`orientation`、`titlePlacement`、`components` 等非 VueNode 类型的值仍通过 props 传递，不受差异影响。
> 源项目 `StepItem.title` / `subTitle` / `content` / `description` / `icon` 为 `VueNode` 经 `items` prop 原样按节点渲染；vapor 收窄为 `string \| number`（`icon` 为 `string`），VNode 承载改用 `Steps` 的 `#title` / `#subTitle` / `#content` 插槽（经 Step 透传，`description` 走 `#content`），图标经 `#iconRender` 插槽。
> 事件若以 JSX/TSX 使用，仍以 `onChange` / `onClick` 形式触发；插槽若以 JSX/TSX 使用，以 `v-slots={{ slotName: () => <Comp /> }}` 形式使用。
