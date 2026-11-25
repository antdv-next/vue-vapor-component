# Listy

高性能列表组件，支持分组（group）、虚拟滚动（virtual）与吸顶分组标题（sticky）。

## Props

| 名称        | 类型               | 默认值       | 说明                                                                          |
| ----------- | ------------------ | ------------ | ----------------------------------------------------------------------------- |
| items       | `any[]`            | `undefined`  | 列表数据                                                                      |
| rowKey      | `RowKey`           | `—`          | 行唯一标识生成器（必填），可为 `keyof T` 或 `(item: T, index: number) => Key` |
| virtual     | `boolean`          | `true`       | 是否启用虚拟滚动                                                              |
| prefixCls   | `string`           | `'vc-listy'` | 样式类前缀                                                                    |
| height      | `number?`          | `undefined`  | 列表容器高度（px）                                                            |
| itemHeight  | `number?`          | `undefined`  | 每项固定高度（px），虚拟滚动时建议提供                                        |
| group       | `Group?`           | `undefined`  | 分组配置                                                                      |
| sticky      | `boolean?`         | `undefined`  | 是否吸顶分组标题（需搭配 `group`）                                            |
| scrollWidth | `number?`          | `undefined`  | 内容区固定宽度（px），宽内容横向滚动时使用，仅 virtual 模式生效               |
| direction   | `'ltr' \| 'rtl'?`  | `undefined`  | 布局方向                                                                      |
| classNames  | `ListyClassNames?` | `undefined`  | 语义化类名（`root` / `item` / `groupHeader`）                                 |
| styles      | `ListyStyles?`     | `undefined`  | 语义化样式（`root` / `item` / `groupHeader`）                                 |

## Events

| 名称   | 参数         | 说明     |
| ------ | ------------ | -------- |
| scroll | `(e: Event)` | 列表滚动 |

## Slots

| 名称    | 作用域                         | 说明           |
| ------- | ------------------------------ | -------------- |
| default | `{ item: any, index: number }` | 渲染每个列表项 |

## Expose

| 名称     | 类型                                     | 说明                                                                                                                            |
| -------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| scrollTo | `(config?: ListyScrollToConfig) => void` | 滚动到指定位置。`config` 可为：`number`、`null`、`{ key, align?, offset? }`、`{ groupKey, align?, offset? }`、`{ left?, top? }` |

## 与 @v-c 差异

| @v-c (vdom)                                           | vapor SFC                                     |
| ----------------------------------------------------- | --------------------------------------------- |
| `itemRender` prop（函数，`(item, index) => VueNode`） | 默认插槽 `<slot :item="item" :index="index">` |
| `onScroll` prop                                       | `@scroll` 事件                                |
| `Group.title` 返回类型 `VueNode`                      | `any`（`(groupKey: Key, items: T[]) => any`） |

> 注：`items`、`rowKey`、`prefixCls`、`height`、`itemHeight`、`virtual`、`sticky`、`direction`、`group` 等非 VueNode 类型的值仍通过 props 传递，不受此差异影响。
> `Group.title` 为函数类型仍通过 props 传入，模板中直接调用渲染。
