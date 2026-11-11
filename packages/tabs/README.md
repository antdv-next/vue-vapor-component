# Tabs

## Props

| 名称               | 类型                                                     | 默认值      | 说明                        |
| ------------------ | -------------------------------------------------------- | ----------- | --------------------------- |
| prefixCls          | `string`                                                 | `'vc-tabs'` | 样式类前缀                  |
| id                 | `string \| null`                                         | `undefined` | 根元素 id，未指定时自动生成 |
| items              | `Tab[]`                                                  | `undefined` | 标签页配置数组              |
| activeKey          | `string`                                                 | `undefined` | 当前激活标签 key            |
| defaultActiveKey   | `string`                                                 | `undefined` | 默认激活标签 key            |
| direction          | `'ltr' \| 'rtl'`                                         | `undefined` | 文字方向                    |
| animated           | `boolean \| AnimatedConfig`                              | `undefined` | 是否启用动画                |
| tabBarExtraContent | `VueNode \| Partial<Record<'left' \| 'right', VueNode>>` | `undefined` | 标签栏额外内容              |
| tabBarGutter       | `number`                                                 | `undefined` | 标签间距                    |
| tabBarStyle        | `CSSProperties`                                          | `undefined` | 标签栏样式                  |
| tabPosition        | `'left' \| 'right' \| 'top' \| 'bottom'`                 | `'top'`     | 标签位置                    |
| destroyOnHidden    | `boolean`                                                | `undefined` | 隐藏时销毁面板内容          |
| scrollPosition     | `'auto' \| 'start' \| 'center' \| 'end' \| number`       | `undefined` | 激活标签滚动定位策略        |
| editable           | `EditableConfig`                                         | `undefined` | 可编辑配置（新增/删除标签） |
| getPopupContainer  | `(node: HTMLElement) => HTMLElement`                     | `undefined` | 弹层挂载节点                |
| locale             | `TabsLocale`                                             | `undefined` | 多语言文案                  |
| more               | `MoreProps`                                              | `undefined` | 更多标签下拉配置            |
| popupClassName     | `string`                                                 | `undefined` | 弹层类名                    |
| indicator          | `IndicatorConfig`                                        | `undefined` | 指示条配置                  |
| classNames         | `Partial<Record<SemanticName, string>>`                  | `undefined` | 语义化类名                  |
| styles             | `Partial<Record<SemanticName, CSSProperties>>`           | `undefined` | 语义化样式                  |

> `SemanticName` = `'popup' \| 'item' \| 'indicator' \| 'body' \| 'content' \| 'header' \| 'remove' \| 'operations'`
>
> `AnimatedConfig` = `{ inkBar?: boolean; tabPane?: boolean; tabPaneMotion?: CSSMotionProps }`
>
> `EditableConfig` = `{ onEdit: (type: 'add' \| 'remove', info: { key?: string; event: MouseEvent \| KeyboardEvent }) => void; showAdd?: boolean; removeIcon?: VueNode; addIcon?: VueNode }`
>
> `Tab` = `{ key: string; label: VueNode; tab?: VueNode; disabled?: boolean; closable?: boolean; closeIcon?: VueNode; icon?: VueNode; children?: VueNode; forceRender?: boolean; destroyOnHidden?: boolean; className?: unknown; style?: CSSProperties }`
>
> `TabsLocale` = `{ dropdownAriaLabel?: string; removeAriaLabel?: string; addAriaLabel?: string }`
>
> `MoreProps` = `{ icon?: VueNode; popupRender?: (menu: VueNode, info: { restTabs: Tab[]; onClose: () => void }) => VueNode }`
>
> `IndicatorConfig` = `{ size?: number \| ((origin: number) => number); align?: 'start' \| 'center' \| 'end' }`

## Events

| 名称              | 参数                                                            | 说明                    |
| ----------------- | --------------------------------------------------------------- | ----------------------- |
| change            | `(activeKey: string)`                                           | 激活标签变化            |
| tab-click         | `(activeKey: string, e: MouseEvent \| KeyboardEvent)`           | 点击标签                |
| tab-scroll        | `(info: { direction: 'left' \| 'right' \| 'top' \| 'bottom' })` | 标签栏滚动              |
| update:active-key | `(activeKey: string)`                                           | v-model:active-key 更新 |

## Slots

| 名称         | 作用域                                                                                       | 说明             |
| ------------ | -------------------------------------------------------------------------------------------- | ---------------- |
| renderTabBar | `{ props: TabNavListProps, TabNavList: typeof TabNavList, onTabClick, onTabScroll, onEdit }` | 自定义标签栏渲染 |

> 未提供该插槽时渲染默认 `TabNavListWrapper`。插槽作用域暴露原始 `TabNavList` 组件与事件处理器，便于用户包装或替换标签栏（等价于 @v-c 的 `renderTabBar` 函数 prop）。

## 与 @v-c 差异

| @v-c (vdom)         | vapor SFC                               |
| ------------------- | --------------------------------------- |
| `onChange` prop     | `@change` 事件                          |
| `onTabClick` prop   | `@tab-click` 事件                       |
| `onTabScroll` prop  | `@tab-scroll` 事件                      |
| `className` prop    | 透传至根元素（`useAttrs` 中 `class`）   |
| `style` prop        | 透传至根元素（`useAttrs` 中 `style`）   |
| `renderTabBar` prop | 使用 #renderTabBar 插槽自定义渲染标签栏 |
| `children` prop     | 已移除，使用 `items` prop 配置标签页    |

> 注：`prefixCls`、`tabPosition`、`animated` 等非 VueNode 类型的值仍通过 props 传递。
> `items`、`tabBarExtraContent`、`editable`、`more` 等含 VueNode 的类型仍通过 props 传入（模板中通过 `<component :is>` 或 `{{ }}` 渲染）。
> 事件如果是在 jsx/tsx 中使用，则仍以 `onXxx={xx}` 触发。
