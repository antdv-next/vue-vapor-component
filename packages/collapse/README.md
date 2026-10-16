# Collapse

折叠面板。支持 `items` 配置数组与 `<Panel>` 子组件两种方式渲染面板，二者并存时同时渲染（`items` 在前）。

## Props

| 名称             | 类型                                           | 默认值          | 说明                                                                                                        |
| ---------------- | ---------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------- |
| prefixCls        | `string`                                       | `'vc-collapse'` | 样式类前缀                                                                                                  |
| activeKey        | `Key \| Key[]`                                 | —               | 当前激活面板 key（受控）；内部统一 `map(String)` 归一化为 `string[]`                                        |
| defaultActiveKey | `Key \| Key[]`                                 | —               | 初始激活面板 key（非受控）                                                                                  |
| accordion        | `boolean`                                      | —               | 手风琴模式，同一时间只展开一个；为 `true` 时根节点 `role="tablist"`、header `role="tab"`                    |
| openMotion       | `TransitionProps`                              | —               | 面板展开/收起过渡动画，透传给 `<Transition>`，内置 `appear: false`                                          |
| collapsible      | `CollapsibleType`                              | —               | 触发区域：`'header' \| 'icon' \| 'disabled'`；`'disabled'` 时面板不可展开、`tabindex="-1"`、`aria-disabled` |
| destroyOnHidden  | `boolean`                                      | —               | 收起时销毁面板内容（不传则仅 `v-show` 隐藏，内容保留在 DOM）                                                |
| items            | `ItemType[]`                                   | —               | 面板配置数组                                                                                                |
| classNames       | `Partial<Record<SemanticName, string>>`        | —               | 语义化类名，`SemanticName = 'header' \| 'title' \| 'body' \| 'icon'`                                        |
| styles           | `Partial<Record<SemanticName, CSSProperties>>` | —               | 语义化样式，`SemanticName = 'header' \| 'title' \| 'body' \| 'icon'`                                        |

> `Key = string \| number`（`@v-c/util`）。`activeKey` 为非数组且非 `string` / `number` 单值时按 `[]` 处理。

## Events

| 名称   | 参数            | 说明                                                |
| ------ | --------------- | --------------------------------------------------- |
| change | `(keys: Key[])` | 激活面板 key 列表变化；发出的是已归一化的字符串数组 |

## Slots

| 名称       | 作用域                | 说明                                                                                                                         |
| ---------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| default    | —                     | 直接放置 `<Panel>` 子组件；插槽内容原样渲染，不会被注入 collapse 级 props                                                    |
| expandIcon | `ExpandIconSlotProps` | 转发给每个 Panel，并按该 Panel 的 props 重新绑定作用域，可读到 `isActive` / `panelKey`；未提供时回退到 `<i class="arrow" />` |
| content    | —                     | 转发给每个 Panel 作为面板内容（仅 `items` 路径有意义）；未提供时回退到各 Panel 的 `children` / `content` prop 文本           |

## Expose

| 名称 | 类型                  | 说明            |
| ---- | --------------------- | --------------- |
| ref  | `Ref<HTMLDivElement>` | 根节点 DOM 引用 |

### ItemType

`items` 数组元素类型，继承 `Omit<CollapsePanelProps, 'header' \| 'prefixCls' \| 'panelKey' \| 'isActive' \| 'accordion' \| 'openMotion'>`。

| 名称            | 类型                                           | 说明                                                 |
| --------------- | ---------------------------------------------- | ---------------------------------------------------- |
| key             | `Key`                                          | 面板唯一标识；未传时取数组下标（字符串化）           |
| label           | `string`                                       | 面板标题，映射到 Panel 的 `header`                   |
| ref             | `Ref<HTMLDivElement>`                          | 解构后丢弃，不透传给 Panel                           |
| children        | `string`                                       | 面板内容文本；作为内容插槽的回退值                   |
| content         | `string`                                       | 面板内容文本，`children` 的同义别名，`children` 优先 |
| extra           | `string`                                       | header 右侧额外内容                                  |
| showArrow       | `boolean`                                      | 是否渲染展开图标                                     |
| forceRender     | `boolean`                                      | 首次强制挂载面板内容（懒渲染）                       |
| collapsible     | `CollapsibleType`                              | 覆盖 collapse 级的可触发区域                         |
| destroyOnHidden | `boolean`                                      | 覆盖 collapse 级的 `destroyOnHidden`                 |
| headerClass     | `string`                                       | header 容器额外类名                                  |
| classNames      | `Partial<Record<SemanticName, string>>`        | 与 collapse 级语义化类名合并（`clsx` 拼接）          |
| styles          | `Partial<Record<SemanticName, CSSProperties>>` | 与 collapse 级语义化样式合并（浅合并）               |
| id              | `string`                                       | 面板根节点 `id`                                      |
| role            | `string`                                       | 面板根节点 `role`                                    |

> `class` / `style` 不在 `CollapsePanelProps` 上声明，故 `ItemType` 也不含这两个字段：`items: [{ class: 'x', style: {...} }]` 会报 TS 错。但 `panels` computed 是 `v-bind="p.bind"` 整体展开：`class` 经 `attrs.class` 落到 `-item` 根节点（类型挡住、运行时可用），`style` 则连运行时也没有落点，见「与 @v-c 差异」。

## Panel（子组件）

具名导出：`import { Panel } from '@vapor-component/collapse'`。`PanelContent` 为内部组件，不导出。

### Props

| 名称            | 类型                                           | 默认值 | 说明                                                                                                                                                        |
| --------------- | ---------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id              | `string`                                       | —      | 面板根节点 `id`                                                                                                                                             |
| header          | `string`                                       | —      | 面板标题文本；作为 `#header` 插槽的回退值，插槽优先                                                                                                         |
| prefixCls       | `string`                                       | —      | 未传时依次取 collapse context 的 `prefixCls`、`'vc-collapse'`                                                                                               |
| headerClass     | `string`                                       | —      | header 容器额外类名，插在 `-{prefix}-header` 之前                                                                                                           |
| showArrow       | `boolean`                                      | `true` | 是否渲染展开图标                                                                                                                                            |
| classNames      | `Partial<Record<SemanticName, string>>`        | —      | 语义化类名，与 collapse 级合并后生效                                                                                                                        |
| styles          | `Partial<Record<SemanticName, CSSProperties>>` | —      | 语义化样式，与 collapse 级合并后生效                                                                                                                        |
| isActive        | `boolean`                                      | —      | 声明但**不参与状态判定**，激活态一律由 collapse context 计算（见「与 @v-c 差异」）                                                                          |
| openMotion      | `TransitionProps`                              | —      | 过渡动画，与 collapse 级合并（`props` 优先），内置 `appear: false`                                                                                          |
| destroyOnHidden | `boolean`                                      | —      | 与 collapse 级为「或」关系，任一为真即销毁内容                                                                                                              |
| accordion       | `boolean`                                      | —      | 不从自身读取，`ctx?.accordion ?? props.accordion`（context 优先）                                                                                           |
| forceRender     | `boolean`                                      | —      | 首次强制挂载面板内容，绕过懒渲染                                                                                                                            |
| extra           | `string`                                       | —      | header 右侧额外内容文本；`#extra` 插槽未提供时的回退值。两者都缺省时不渲染 `-extra` 节点                                                                    |
| panelKey        | `Key`                                          | —      | 面板唯一标识，激活态与 `item-click` 均以此为准。**默认插槽路径必须显式传**：vapor 无注入机制，缺省为 `undefined`，多个面板共用 `'undefined'` key 会一起展开 |
| role            | `string`                                       | —      | 面板根节点 `role`                                                                                                                                           |
| collapsible     | `CollapsibleType`                              | —      | 与 collapse 级合并（`props` 优先）                                                                                                                          |
| children        | `string`                                       | —      | 面板内容文本；`#content` 与默认插槽都未提供时的最终回退（`{{ children \|\| content }}`）                                                                    |
| content         | `string`                                       | —      | 面板内容文本，`children` 的同义别名，回退时 `children` 优先                                                                                                 |

### Events

| 名称       | 参数         | 说明                                                                                                                                                 |
| ---------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| item-click | `(key: Key)` | header 被点击或按 Enter 时触发；`collapsible === 'disabled'` 时不触发。同时会调用 collapse context 的 `onItemClick`，因此与父级 `@change` 是串联关系 |

### Slots

| 名称       | 作用域                | 说明                                                                               |
| ---------- | --------------------- | ---------------------------------------------------------------------------------- |
| content    | —                     | 面板内容（可承载 VNode），优先级最高；未提供时落到默认插槽                         |
| default    | —                     | 面板内容，`#content` 未提供时的回退；再回退渲染 `{{ children \|\| content }}` 文本 |
| header     | —                     | 面板标题；未提供时回退渲染 `header` prop 文本                                      |
| extra      | —                     | 面板额外内容；未提供时回退渲染 `extra` prop 文本                                   |
| expandIcon | `ExpandIconSlotProps` | 本面板的展开图标，无内容时回退渲染 `<i class="arrow" />`                           |

## 与 @v-c 差异

| @v-c (vdom)                                                                                                                                                    | vapor SFC                                                                                                                                                                                                                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onChange` prop                                                                                                                                                | `@change` 事件                                                                                                                                                                                                                                                                                             |
| `CollapsePanelProps.onItemClick` prop                                                                                                                          | `@item-click` 事件                                                                                                                                                                                                                                                                                         |
| `useItems(items, slots.default)` 同时消费 `items` 与默认插槽，`getNewChild` 用 `cloneElement` 给插槽子节点注入 `isActive` / `onItemClick` / 合并后的语义化样式 | 移除 `useItems` / `cloneElement`：`items` 由 `panels` computed 映射为 `v-bind` props；默认插槽仅原样渲染传入的 `<Panel>`，不做任何 props 注入                                                                                                                                                              |
| `getNewChild` 用 `cloneElement` 给默认插槽子节点注入 `panelKey = child.key \|\| String(index)`，`<Panel>` 无需自带 key                                         | 不做任何注入 → 默认插槽的 `<Panel>` 的 `panelKey` 为 `undefined`，而 `isActive` 里是 `String(props.panelKey)` = `'undefined'`，**所有面板共用同一 key：点任意一个全部展开**（accordion 模式同样）。默认插槽路径必须给每个 `<Panel>` 显式传 `:panel-key`；`items` 路径不受影响（`panelKey` 在 `p.bind` 里） |
| `Panel.tsx` `expose({ ref: refWrapper })`，`refWrapper` 绑在 `-item` 根，外部可经模板 ref 取到面板节点                                                         | `Panel.vue` 无 `defineExpose`、无 template ref → `panelRef.value?.ref` 拿不到 `-item` 节点。`Collapse` 的 `defineExpose({ ref: refWrapper })` 保留                                                                                                                                                         |
| `useItems` 里 `if (Array.isArray(items)) return convertItemsToNodes(...)`：传了 `items` 就完全不读 `slots.default`，`<Panel>` 子节点被丢弃                     | 两者同时渲染（`items` 在前）：同一批面板在 `items` 与默认插槽里都写时会出现重复面板                                                                                                                                                                                                                        |
| 无 provide/inject，collapse 级 props 在渲染函数里逐层下发给每个 Panel                                                                                          | 新增 `context.ts`，`provideCollapseContext` 下发 **getter 形式** 的响应式 context，Panel 经 `useCollapseContext()` 读取                                                                                                                                                                                    |
| `interface.ts` 导出 `defaults`，组件 `defineComponent<CollapseProps>({ setup(props = defaults, ...) })` 兜底默认值                                             | 不导出 `defaults`，默认值写在 `withDefaults`（Collapse 仅 `prefixCls`，Panel 仅 `showArrow`）                                                                                                                                                                                                              |
| `isActive` / `accordion` / `onItemClick` 由 Collapse 在渲染时下发，是 Panel 状态的唯一来源                                                                     | 这三个字段在 Panel 上**退化为冗余声明**：`isActive` 由 `ctx.activeKeys` + `panelKey` 计算，`accordion` 读 `ctx?.accordion ?? props.accordion`，点击经 `ctx.onItemClick` 上报                                                                                                                               |
| `destroyOnHidden` 取 `childDestroyOnHidden ?? collapseDestroyOnHidden`                                                                                         | `props.destroyOnHidden \|\| ctx?.destroyOnHidden`（或关系，语义略宽：父级为真时子级无法再恢复「保留」）                                                                                                                                                                                                    |
| `tabIndex`、`'aria-expanded'` 等属性大小写混写                                                                                                                 | 统一 kebab-case（`tabindex` / `aria-expanded` / `aria-disabled`），语义相同                                                                                                                                                                                                                                |
| 无 `defineSlots`，插槽类型由模板自动推导                                                                                                                       | 新增 `CollapseSlots` / `CollapsePanelSlots` / `ExpandIconSlotProps`，用 `defineSlots<>()` 显式声明（与 `BaseInput.vue` 的 `InputSlots` 约定一致），`!!slots.x` 可用于判定插槽存在                                                                                                                          |
| `expandIcon?: (props: object) => any` prop（Collapse 级 + Panel 级，`props` 优先合并）                                                                         | 改为 `#expandIcon` 插槽；`expandIcon` 已从 `CollapseProps`、`CollapsePanelProps`、`ItemType` 的 Omit 列表全部移除，`CollapseContextValue.expandIcon` 与 Collapse 的 context getter 同步删除                                                                                                                |
| `expandIcon(props)` 入参含全部 Panel props，可用 `isActive` 做旋转动画                                                                                         | 能力保留：Collapse 级用 `<template #expandIcon="ctxProps"><slot name="expandIcon" v-bind="ctxProps" /></template>` 把 Panel 的作用域原样转给消费者，编译后带 `$`，作用域类型抽为 `ExpandIconSlotProps`                                                                                                     |
| `expandIcon(props)` 返回值经 `isVueRenderable` 判空，不可渲染时**整个图标容器都不渲染**                                                                        | 无此判空：容器只由 `showArrow` 控制，插槽无内容时回退 `<i class="arrow" />`。vapor 的空转发插槽被判为无效块而落到 fallback（`isValidBlock` 对空数组返回 `false`），所以 Collapse 无条件转发 `#expandIcon` **不会**吞掉默认箭头                                                                             |
| `header` / `extra` 为 `VueNode`，按节点渲染                                                                                                                    | 收窄为 `string`，改用 `#header` / `#extra` 插槽承载 VNode，`string` prop 降级为插槽回退值；`ItemType.label` 随之为 `string`；原 `typeof extra !== 'boolean'` 判空守卫随类型收窄移除                                                                                                                        |
| `Panel.tsx` 仅当 `extra` prop 非空才渲染 `-extra` 节点                                                                                                         | `ifExtraExist` 放宽为 `!!slots.extra \|\| props.extra != null`：只传 `#extra` 插槽、不传 `extra` prop 也能渲染（`-extra` 带 `margin: 0 16px 0 auto`，不能无条件渲染）                                                                                                                                      |
| `mergeSemanticClassNames` / `mergeSemanticStyles` 定义在 `hooks/useItems.tsx`，合并发生在 Collapse → Panel 边界                                                | 同名函数移到 `utils.ts`，合并在 Panel 内部（`ctx` 级为 source、`props` 级为 target），对 `items` 与 `<Panel>` 两条路径统一生效                                                                                                                                                                             |
| `children?: VueNode \| string`，内容按节点/文本分支渲染                                                                                                        | 收窄为 `children?: string`（`VueNode` 已不再引用，`@v-c/util/dist/type` 的 import 同步去掉），并新增 `content?: string` 作同义别名（回退时 `{{ children \|\| content }}`，`children` 优先）；富文本改用 `#content` 插槽，不受 `string` 限制                                                                |
| `PanelContent` 通过 `v-slots={{ default: () => children }}` 接收 `children` prop                                                                               | `children` / `content` 只作为 `#content` 插槽的回退文本：Panel 侧 `<slot name="content"><slot>{{ children \|\| content }}</slot></slot>`（`#content` > 默认插槽 > prop 文本三级回退），`PanelContent` 内部只留一个 `<slot />`，不再按对象/文本分支渲染                                                     |
| 无 collapse 级内容插槽                                                                                                                                         | 新增 `CollapseSlots.content` 与 `<template #content><slot name="content" /></template>`，`items` 路径可给所有 Panel 统一内容；编译为无条件转发 `createSlot("content", null, null, 4)`，空转发被判无效块而落到 Panel 的 prop 回退，与 `#expandIcon` 同一行为                                                |
| `<Panel>文本</Panel>` 默认插槽有效，与 `children` prop 等价                                                                                                    | 保留为**嵌套回退**：`<slot name="content"><slot>{{ children \|\| content }}</slot></slot>`。vapor 支持嵌套插槽回退，`renderSlotFallback` 先取自身 `getFallback()`、取不到才沿 `boundary.parent` 上溯，内层 `<slot>` 有自己的文本回退故优先命中，不会被外层吞掉                                             |
| `CollapsePanelProps.class?: string` 作为 prop 解构为 `className`，作用于 `-item` 根节点                                                                        | 从 interface 移除，改经 `attrs.class` 合入 `collapsePanelClassNames`，仍作用于 `-item` 根节点，**等价**（vapor 中声明为 prop 会命中 `setFullProps` 的 `hasOwn(options, key)` 分支写进 `props` 而不进 `attrs`，故必须移除）                                                                                 |
| `Panel.tsx` 未解构 `style`，它落在 `...restProps` 里被展开到 `-item` 根节点，`<Panel style="...">` 生效                                                        | `CollapsePanelProps` 已移除 `style`，但 `Panel.vue` 的 `-item` 根节点也没有 `:style` 绑定，`attrs.style` 无人读取 → `<Panel style="...">` 与 `items[].style` **静默丢失，属回归**                                                                                                                          |
| `ItemType` 继承 `class` / `style`（未列入 Omit 列表），`items[].class`、`items[].style` 类型合法且经 `convertItemsToNodes` 的 `...restProps` 生效              | `CollapsePanelProps` 已无这两个字段，`ItemType` 也随之不含，二者都会报 TS 错。但 `panels` computed 走 `v-bind="p.bind"` 整体展开：`class` 运行时仍可用，`style` 则类型与运行时都不生效                                                                                                                     |
| `Panel.tsx` 渲染 `PanelContent` 时未传 `class` / `style`，`-panel` 节点只有 `-{prefix}-panel` + active/inactive 类                                             | 相同：`Panel.vue` 亦未把 `class` / `style` 绑定到 `PanelContent`，`-panel` 节点两侧都不接收外部样式，**此项等价，不是差异**                                                                                                                                                                                |
| `ItemType` 允许每项携带 `onItemClick`（未列入 Omit 列表）                                                                                                      | 不支持：`CollapsePanelProps` 已无 `onItemClick`，逐项点击处理请改用默认插槽里的 `<Panel @item-click>`                                                                                                                                                                                                      |

> 注：`prefixCls`、`accordion`、`collapsible`、`showArrow`、`forceRender`、`panelKey` 等非 VueNode 类型的值仍通过 props 传递，不受此差异影响。
> `class` 两侧都落到 `-item` 根节点（@v-c 经 `props.class`、vapor 经 `attrs.class`），等价；`-panel` 节点两侧都不接收外部样式。
> `style` 是四处真实回归之一：@v-c 经 `restProps` 展开到 `-item`，vapor 侧 `-item` 根节点无 `:style` 绑定。要恢复只需在 `Panel.vue` 的 `-item` 上补 `:style="attrs.style"`（`style` 已不在 `CollapsePanelProps` 中，`attrs.style` 可直接取到）。
> Panel 级内容走**嵌套插槽回退**（`<slot name="content"><slot>…</slot></slot>`）。vapor 支持这种写法：`renderSlotFallback` 先取当前 boundary 自身的 `getFallback()`，取不到才沿 `boundary.parent` 上溯，所以内层 `<slot>` 命中自己的文本回退，不会被外层 `#content` 吞掉；`syncNodes` 取 `activeFallback || content`，内层已提交回退时 `isValidSlot` 亦为真。
> `content` prop 与 `children` 完全同义，回退顺序为 `#content` 插槽 > `children` > `content`；两者同时传只取 `children`。
> `PanelContent` 内部读 `attrs.class` / `attrs.style` 恒为 `undefined`：父级 `Panel` 未转发绑定，且声明了 `inheritAttrs: false` 不自动透传。与 @v-c 一致，无需修改。
> 事件若以 JSX/TSX 使用，仍以 `onChange` / `onItemClick` 形式触发；插槽若以 JSX/TSX 使用，以 `v-slots={{ slotName: () => <Comp /> }}` 形式使用。
> 四处真实回归：① `-item` 的 `style`；② 默认插槽 `<Panel>` 缺 `panelKey`；③ `Panel` 无 `defineExpose`；④ `items` 与默认插槽不再互斥。
> 边角差异：`getActiveKeysArray` 额外接受 `bigint`（@v-c 只接受 `number` / `string`）；`getActiveKey` 先 `String(key)` 再比较，@v-c 拿原始 `key` 与已字符串化的 `activeKey` 直接比，数字 key 下 accordion 收起判断失效（`'0' === 0` 为 false），vapor 顺带修了；@v-c 默认插槽路径 `child.key \|\| String(index)` 会吞掉 key `0`，`panels` computed 用 `String(key ?? index)` 保留；`pickAttrs` 只作用于 `attrs`（@v-c 作用于 `{ ...props, ...omit(attrs, ['class','style']) }`），因 Collapse 无任何 `aria-*` / `data-*` 声明为 prop，实际等价；`-item` 根承接的属性来源不同——@v-c 是解构残留的已声明 prop（正好是 `id` / `role` / `style`），vapor 是 `omit(attrs, ['class','style'])` + 显式 `:id` / `:role`，`id` / `role` / 普通 attr 两侧一致，仅 `style` 差。
> `defineOptions.name` 为 `'VcCollapsePanel'`（对齐 `'VcCollapse'`），与 @v-c 的 `'CollapsePanel'` 不同；影响 devtools 显示与 `keep-alive` 按 name 匹配。
