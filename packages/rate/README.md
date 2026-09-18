# Rate

评分组件。

## Props

| 名称            | 类型                                     | 默认值      | 说明                                                        |
| --------------- | ---------------------------------------- | ----------- | ----------------------------------------------------------- |
| prefixCls       | `string`                                 | `'vc-rate'` | 样式类前缀                                                  |
| count           | `number`                                 | `5`         | 星级数量                                                    |
| value           | `number`                                 | `—`         | 当前值（受控）                                              |
| defaultValue    | `number`                                 | `—`         | 初始值（非受控）                                            |
| allowHalf       | `boolean`                                | `false`     | 是否允许半星                                                |
| allowClear      | `boolean`                                | `true`      | 是否允许点击当前值时清空评分                                |
| keyboard        | `boolean`                                | `true`      | 是否启用左右方向键响应                                      |
| character       | `string`                                 | `'★'`       | 星形元素 也可使用插槽                                       |
| disabled        | `boolean`                                | `—`         | 是否禁用                                                    |
| direction       | `Direction`                              | `'ltr'`     | 方向，支持 `'ltr'` 与 `'rtl'`                               |
| tabIndex        | `number \| string`                       | `0`         | 键盘导航序号                                                |
| autoFocus       | `boolean`                                | `—`         | 是否自动聚焦                                                |
| id              | `string`                                 | `—`         | 外层 `ul` 的 `id`                                           |
| onUpdate:value  | `(value: number) => void`                | `—`         | v-model 更新回调                                            |
| characterRender | `(origin: any, props: StarProps) => any` | `—`         | 已由 `#characterRender` 插槽替代，见「与 @v-c 差异」        |

> `type Direction = 'ltr' | 'rtl'`

## Events

| 名称         | 参数                           | 说明       |
| ------------ | ------------------------------ | ---------- |
| change       | `(value: number)`              | 评分改变   |
| focus        | `—`                            | 聚焦       |
| blur         | `—`                            | 失焦       |
| hover-change | `(value: number \| undefined)` | 悬停值改变 |
| mouse-leave  | `(e: MouseEvent)`              | 鼠标离开   |
| keydown      | `(e: KeyboardEvent)`           | 键盘按下   |

## Slots

| 名称            | 作用域                                                                                         | 说明                 |
| --------------- | ---------------------------------------------------------------------------------------------- | -------------------- |
| characterRender | `{ value, index, prefixCls, allowHalf, disabled, character, characterRender, focused, count }` | 自定义整颗星星的渲染 |
| character       | `{ disabled, prefixCls, index, count, value }`                                                 | 自定义星形内容       |

## Expose

| 名称  | 类型         | 说明 |
| ----- | ------------ | ---- |
| focus | `() => void` | 聚焦 |
| blur  | `() => void` | 失焦 |

## 与 @v-c 差异

| @v-c (vdom)                                                                             | vapor SFC                                                                                                |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `characterRender` prop：`(origin: Star VNode, props) => any`，接收节点并返回节点        | `#characterRender` slot：作用域为 `StarProps` 字段，不接收也不返回节点                                   |
| `character` prop 可为 `VueNode`，VNode 经 `cloneVNode` 复制两次后挂载                   | `character` 仅支持字符串（模板以 `{{ character }}` 插值）；另提供 `#character` slot                      |
| `onChange` / `onHoverChange` / `onFocus` / `onBlur` / `onKeyDown` / `onMouseLeave` prop | `@change` / `@hover-change` / `@focus` / `@blur` / `@keydown` / `@mouse-leave` 事件                      |
| `useMergedState(defaultValue \|\| 0, { value })` 支持受控/非受控                        | `ref((props.value \|\| props.defaultValue) ?? 0)`，不使用 `useMergedState`                               |
| `inheritAttrs: false`（Rate 与 Star 均设置）                                            | 未设置 `inheritAttrs: false`（`class` / `style` 由 `getAttrStyleAndClass` 手动处理）                     |
| `ref={setStarRef(index)}` 按 index 收集星节点                                           | `:ref="el => setStarRef(el)"` 未按 index 收集，`getStarValue` 取不到节点，`allowHalf` 点击判定退化为整星 |
| Star 的 `name` 为 `'RateStar'`                                                          | Star 的 `name` 为 `'Star'`                                                                               |

> 注：`prefixCls`、`count`、`allowHalf`、`disabled`、`value` 等 `string`、`number`、`boolean` 类型的值仍通过 props 传递，不受此差异影响。  
> 注：`#characterRender` 的作用域不包含节点引用 —— vapor 无虚拟 DOM，无法把节点交给插槽作用域后再渲染回去（`RateSlots.characterRender` 类型中声明的 `node` 参数实际未传入）。  
> 注：事件如果是在 jsx/tsx 中使用，则仍以 `onXxx={xx}` 触发

### Star（内部子组件，未从 `index.ts` 导出）

## Props

| 名称            | 类型                                     | 默认值 | 说明                                                        |
| --------------- | ---------------------------------------- | ------ | ----------------------------------------------------------- |
| value           | `number`                                 | `—`    | 当前评分值                                                  |
| index           | `number`                                 | `—`    | 当前星的序号                                                |
| prefixCls       | `string`                                 | `—`    | 样式类前缀（由 Rate 传入 `${prefixCls}-star`）              |
| allowHalf       | `boolean`                                | `—`    | 是否允许半星                                                |
| disabled        | `boolean`                                | `—`    | 是否禁用                                                    |
| character       | `((props: StarProps) => any) \| VueNode` | `—`    | 星形元素（可接受 string \| number \| VNode \| () => VNode） |
| characterRender | `(origin: any, props: StarProps) => any` | `—`    | 类型中声明但模板未使用，已改为插槽                          |
| focused         | `boolean`                                | `—`    | 是否聚焦                                                    |
| count           | `number`                                 | `—`    | 星级总数                                                    |

## Events

| 名称  | 参数                                              | 说明                     |
| ----- | ------------------------------------------------- | ------------------------ |
| hover | `(e: MouseEvent, index: number)`                  | 悬停                     |
| click | `(e: MouseEvent \| KeyboardEvent, index: number)` | 点击（Enter 键同样触发） |

## Slots

| 名称            | 作用域                                                                                         | 说明                                        |
| --------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------- |
| characterRender | `{ value, index, prefixCls, allowHalf, disabled, character, characterRender, focused, count }` | 自定义整颗星星的渲染，默认内容为一个 `<li>` |
| character       | `{ disabled, prefixCls, index, count, value }`                                                 | 自定义星形内容，默认渲染 `character`        |

## 与 @v-c 差异

| @v-c (vdom)                                      | vapor SFC                                          |
| ------------------------------------------------ | -------------------------------------------------- |
| `onClick` / `onHover` prop                       | `@click` / `@hover` 事件                           |
| `characterRender` prop 包裹整个 `<li>`           | `#characterRender` slot，`<li>` 作为 slot 默认内容 |
| `character` 为函数时调用 `character({...})` 取值 | `character` 以 `{{ }}` 插值，函数不会被调用        |
| `character` 的 VNode 经 `cloneVNode` 复制两份    | 无需 clone（vapor 中不存在 VNode 复用问题）        |
| `inheritAttrs: false`                            | 未设置 `inheritAttrs: false`                       |

> 注：`value`、`index`、`prefixCls`、`allowHalf`、`disabled`、`focused`、`count` 等 `string`、`number`、`boolean` 类型的值仍通过 props 传递，不受此差异影响。
