# InputNumber

`InputNumberProps<T extends ValueType = ValueType>`，`ValueType = string | number`（`@v-c/mini-decimal`）。
内部数值一律用 `DecimalClass` 实例表示（`getMiniDecimal`，来自 `@v-c/mini-decimal`，**未**从 `index.ts` 导出），`stringMode: false` 时经 `toNumber()` 输出，为 `true` 时经 `toString()` 输出；空值输出 `null`。

## Props

### InputNumber

| 名称             | 类型                                                                              | 默认值              | 说明                                                                                                                                       |
| ---------------- | --------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| mode             | `'input' \| 'spinner'`                                                            | `'input'`           | 步进按钮布局：`input` 时上下按钮叠放在右侧 `-actions` 容器内，`spinner` 时下/上按钮分列 input 两侧                                         |
| prefixCls        | `string`                                                                          | `'vc-input-number'` | 样式类前缀                                                                                                                                 |
| classNames       | `Partial<Record<SemanticName, string>>`                                           | —                   | 语义化类名，`SemanticName = 'root' \| 'actions' \| 'input' \| 'action' \| 'prefix' \| 'suffix' \| 'clear'`                                 |
| styles           | `Partial<Record<SemanticName, any>>`                                              | —                   | 语义化样式；`styles.root` 与 `$attrs.style` 合并到根节点，其余落到对应元素                                                                 |
| min              | `T`                                                                               | —                   | 最小值；同时用于 `aria-valuemin`，越界时钳制并加 `-out-of-range`                                                                           |
| max              | `T`                                                                               | —                   | 最大值；同时用于 `aria-valuemax`                                                                                                           |
| step             | `ValueType`                                                                       | `1`                 | 步进值；按住 Shift 时经 `getDecupleSteps` 步进 10 倍                                                                                       |
| defaultValue     | `T`                                                                               | —                   | 初始值（非受控），`value ?? defaultValue ?? ''`                                                                                            |
| value            | `T \| null`                                                                       | —                   | 当前值（受控）；存在时内部不再自更新显示值，由 `watch` 反向同步                                                                            |
| disabled         | `boolean`                                                                         | —                   | 禁用；`<input disabled>`，并跳过值提交                                                                                                     |
| readOnly         | `boolean`                                                                         | —                   | 只读；`<input readonly>`，并跳过值提交                                                                                                     |
| prefix           | `any`                                                                             | —                   | 前缀；需要渲染 VNode 时用 `#prefix` 插槽                                                                                                   |
| suffix           | `any`                                                                             | —                   | 后缀；需要渲染 VNode 时用 `#suffix` 插槽                                                                                                   |
| allowClear       | `boolean \| { disabled?: boolean, label?: string }`                               | —                   | 是否显示清空按钮。对象形式支持 `disabled`、`label`（`aria-label`，默认 `'Clear'`）；图标本体只能走 `#clearIcon` 插槽，没有 prop 形式的图标 |
| upHandler        | `any`                                                                             | —                   | 上步进按钮内容；需要渲染 VNode 时用 `#upHandler` 插槽                                                                                      |
| downHandler      | `any`                                                                             | —                   | 下步进按钮内容；需要渲染 VNode 时用 `#downHandler` 插槽                                                                                    |
| keyboard         | `boolean`                                                                         | —                   | 是否响应 ↑/↓ 步进；仅 `=== false` 时关闭                                                                                                   |
| changeOnWheel    | `boolean`                                                                         | `false`             | 聚焦时是否监听 `<input>` 的 `wheel` 事件并步进                                                                                             |
| controls         | `boolean`                                                                         | `true`              | 是否渲染步进按钮                                                                                                                           |
| parser           | `(displayValue: string \| undefined) => T`                                        | —                   | 显示值 → 内部值；省略时按 `decimalSeparator` 替换后取 `/\w.-/`                                                                             |
| formatter        | `(value: T \| undefined, info: { userTyping: boolean, input: string }) => string` | —                   | 内部值 → 显示值；提供时输入后调用 `restoreCursor` 保持光标                                                                                 |
| precision        | `number`                                                                          | —                   | 小数位数；省略时取 `max(当前值精度, step 精度)`                                                                                            |
| decimalSeparator | `string`                                                                          | —                   | 小数点分隔符，同时影响 parser 与 formatter                                                                                                 |
| changeOnBlur     | `boolean`                                                                         | —                   | 失焦时是否 flush 当前输入；`changeOnBlur ?? true`，故默认提交                                                                              |
| tabIndex         | `number`                                                                          | —                   | 原生 `tabindex`；模板显式绑 `:tabindex="tabIndex"` 到 `<input>`，未设时不写该属性                                                          |
| stringMode       | `boolean`                                                                         | `false`             | 以字符串而非 number 输出                                                                                                                   |
| placeholder      | `string`                                                                          | —                   | 占位文本                                                                                                                                   |

> `min` / `max` 传非法值（`getDecimalIfValidate` 返回 `null`）等价于未设，不会钳制也不会给出 `aria-*`。

### StepHandler

内部子组件，不导出。

| 名称      | 类型             | 默认值  | 说明                                                                                               |
| --------- | ---------------- | ------- | -------------------------------------------------------------------------------------------------- |
| prefixCls | `string`         | —       | 取自父组件 `mergedPrefixCls`                                                                       |
| action    | `'up' \| 'down'` | —       | 决定类名后缀与 `aria-label`（`Increase Value` / `Decrease Value`）                                 |
| disabled  | `boolean`        | `false` | 加 `-disabled` 类并设 `aria-disabled`；注意仅在触发时由父组件按 `min` / `max` 拦截，点击本身仍冒泡 |

> 按住不放的节流完全在 `StepHandler` 内部：首次 `mousedown` 立即 emit 一次，`STEP_DELAY = 600` ms 后进入 `STEP_INTERVAL = 200` ms 循环；`mouseup` / `mouseleave` 经 `requestAnimationFrame` 延迟停止（修 ant-design#43088 的 Safari 事件乱序）。`emitter` 由触发源决定：按钮为 `'handler'`，键盘 ↑/↓ 为 `'keyboard'`，滚轮为 `'wheel'`。

> `:class="classNames?.action"` / `:style="styles?.action"` 不是 prop，且 `StepHandler` 设了 `inheritAttrs: false`，所以由 `mergedClassName` 显式读 `attrs.class`、模板 `:style="attrs.style"` 绑定。

## Events

### InputNumber

| 名称             | 参数                                                                                                                 | 说明                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| update:value     | `(value: ValueType \| null)`                                                                                         | v-model 更新，与 `change` 同批触发；空值输出 `null`                        |
| input            | `(text: string)`                                                                                                     | 原始输入文本，在 `triggerValueUpdate` 之后、`。` → `.` 归一化之前          |
| change           | `(value: ValueType \| null)`                                                                                         | 经越界钳制与 `precision` 处理后的值，仅实际变化时触发                      |
| clear            | 无参数                                                                                                               | 点击清空按钮；`change`（`null`）先触发，随后本事件                         |
| press-enter      | `(e: KeyboardEvent)`                                                                                                 | 回车；先 `flushInputValue(false)`，组合输入期间 `userTyping` 保持为 `true` |
| step             | `(value: ValueType, info: { offset: ValueType, type: 'up' \| 'down', emitter: 'handler' \| 'keyboard' \| 'wheel' })` | 步进触发；触达 `min` / `max` 时提前 return，不发事件                       |
| mousedown        | `(e: MouseEvent)`                                                                                                    | 根容器；「点击非 input 区域时聚焦 input」在回调之前                        |
| click            | `(e: MouseEvent)`                                                                                                    | 根容器                                                                     |
| mouseup          | `(e: MouseEvent)`                                                                                                    | 根容器                                                                     |
| mouseleave       | `(e: MouseEvent)`                                                                                                    | 根容器                                                                     |
| mousemove        | `(e: MouseEvent)`                                                                                                    | 根容器                                                                     |
| mouseenter       | `(e: MouseEvent)`                                                                                                    | 根容器                                                                     |
| mouseout         | `(e: MouseEvent)`                                                                                                    | 根容器                                                                     |
| focus            | `(e: FocusEvent)`                                                                                                    | 聚焦                                                                       |
| blur             | `(e: FocusEvent)`                                                                                                    | 失焦；`changeOnBlur ?? true` 时先 flush                                    |
| keydown          | `(e: KeyboardEvent)`                                                                                                 | ↑/↓ 在 `preventDefault` 之后仍会触发                                       |
| keyup            | `(e: KeyboardEvent)`                                                                                                 | 同时把 `userTyping` / `shiftKey` 复位                                      |
| compositionstart | `(e: CompositionEvent)`                                                                                              | IME 组合开始                                                               |
| compositionend   | `(e: CompositionEvent)`                                                                                              | IME 组合结束，回调后按 input 当前值 `collectInputValue`                    |
| beforeinput      | `(e: InputEvent)`                                                                                                    | 将 `userTyping` 置为 `true`                                                |

### StepHandler

| 名称 | 参数                                                         | 说明                                               |
| ---- | ------------------------------------------------------------ | -------------------------------------------------- |
| step | `(up: boolean, emitter: 'handler' \| 'keyboard' \| 'wheel')` | 由父组件 `@step` / `@Step` 接收为 `onInternalStep` |

## Slots

| 名称        | 作用域 | 说明                                                                                                                                 |
| ----------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| prefix      | —      | 无作用域变量；未提供时回退渲染 `{{ prefix }}`（即 `props.prefix` 文本）                                                              |
| suffix      | —      | 无作用域变量；未提供时回退渲染 `{{ suffix }}`                                                                                        |
| clearIcon   | —      | 替换清空按钮内容；仅 `allowClear` 为真时渲染；未提供时回退渲染 `✖`（U+2716，与 @v-c 一致）                                           |
| upHandler   | —      | 替换上步进按钮内容；`slots.upHandler \|\| props.upHandler` 有值时才转发进 `StepHandler`，否则由 `StepHandler` 渲染默认 `-inner` span |
| downHandler | —      | 同上                                                                                                                                 |
| default     | —      | **未使用**，`InputNumber.vue` 模板中没有 `<slot></slot>`                                                                             |

> `-suffix` 容器的渲染条件是 `allowClear || hasSuffix`（`hasSuffix = !!suffixNode`），两者都为空时整个容器连同清空按钮一起不渲染。
> `#upHandler` / `#downHandler` 在 `mode === 'spinner'` 与 `mode === 'input'` 两种分支下都会被渲染，且同一插槽名在两分支内重复出现，模板编译后会各绑定一次。

### StepHandler

| 名称    | 作用域 | 说明                                                                                |
| ------- | ------ | ----------------------------------------------------------------------------------- |
| default | —      | 替换按钮内部内容；无内容时渲染 `<span class="{prefixCls}-action-{action}-inner" />` |

## Expose

### InputNumber (`InputNumberRef extends HTMLInputElement`)

| 名称          | 类型                                    | 说明                                                                                   |
| ------------- | --------------------------------------- | -------------------------------------------------------------------------------------- |
| focus         | `(options?: InputFocusOptions) => void` | 经 `triggerFocus` 聚焦内部 input                                                       |
| blur          | `() => void`                            | 失焦                                                                                   |
| nativeElement | `HTMLElement \| null`                   | 根容器或 input，实际暴露 `computed(() => rootRef.value \|\| inputRef.value \|\| null)` |
| input         | `HTMLInputElement \| null`              | 内部 `<input>`，实际暴露 `ShallowRef<HTMLInputElement>`                                |

> 上表按 `interface.ts` 中声明的 `InputNumberRef` 逐字列出（与 @v-c 一致）。`dist/index.d.ts` 中推导出的类型是 `nativeElement: ComputedRef<HTMLElement \| null>`、`input: ShallowRef<HTMLInputElement \| null>`，声明类型与实际暴露的 ref 形状不一致在 @v-c 侧同样存在。
> `extends HTMLInputElement` 意味着 ref 上还挂着 input 元素自身的属性与方法，但 `nativeElement` 在无 input 时可能取到根 `div`，此时这些方法并不存在。
> `StepHandler` 没有 `defineExpose`。

## 与 @v-c 差异

| @v-c (vdom)                                                                                                                                                                                                                                                      | vapor SFC                                                                                                                                                                                                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onInput`、`onChange`、`onPressEnter`、`onStep`、`onMouseDown`、`onClick`、`onMouseUp`、`onMouseLeave`、`onMouseMove`、`onMouseEnter`、`onMouseOut`、`onFocus`、`onBlur`、`onKeyDown`、`onKeyUp`、`onCompositionStart`、`onCompositionEnd`、`onBeforeInput` prop | 18 个事件：`@input`、`@change`、`@press-enter`、`@step`、`@mousedown`、`@click`、`@mouseup`、`@mouseleave`、`@mousemove`、`@mouseenter`、`@mouseout`、`@focus`、`@blur`、`@keydown`、`@keyup`、`@compositionstart`、`@compositionend`、`@beforeinput` |
| `onChange?: (value: T \| null) => void`，`defineComponent` 的 `emits` 仅 `['update:value']`                                                                                                                                                                      | `change` 也进了 `defineEmits`，签名同为 `(value: ValueType \| null)`；`clear` 无参数，与 `onClear?: () => void` 一致                                                                                                                                  |
| `StepHandler` 声明 `onStep` prop（`{ type: Function, required: true }`，`props.onStep` 从不被读，触发靠 `emit('step')`）                                                                                                                                         | `StepHandlerProps` 里没有对应字段，只留 `defineEmits(['step'])`；父组件 `@step` 监听器照样绑定触发，见下方 `setFullProps` 说明                                                                                                                        |
| `allowClear.clearIcon?: VueNode`（prop 形式的图标）                                                                                                                                                                                                              | 对象形式只留 `disabled` / `label`，图标一律走 `#clearIcon` 插槽                                                                                                                                                                                       |
| `className?: string` / `style?: any` prop；`mergedClassName = props.className \|\| attrs.class`，`mergedStyle` 里 `props.style` 优先于 `attrs.style`                                                                                                             | 两者都不声明，`class` / `style` 一律走 `useAttrs()`（`attrs.class` / `attrs.style`）                                                                                                                                                                  |

> 注：`string`、`number`、`boolean` 等非 VueNode 类型的值仍通过 props 传递。`prefix` / `suffix` / `upHandler` / `downHandler` 在 @v-c 中是 `any` 且 `slots.x?.() ?? props.x` 二选一，vapor 侧改为「props 存字符串、VNode 走同名插槽」，插槽无作用域，回退内容由模板内的 `{{ prefix }}` 等文本插值提供。
> 滚轮步进被简化：@v-c 累积 `deltaY`（`WHEEL_STEP_DISTANCE = 100`、`WHEEL_LINE_HEIGHT = 40`、`WHEEL_PAGE_HEIGHT = 800`、`WHEEL_DELTA_RESET_INTERVAL = 200`，并用 `getWheelDeltaY` 按 `deltaMode` 归一化为像素，反向滚动清空残留位移），vapor 改为每次 `wheel` 事件直接按 `event.deltaY < 0` 步进一步。高精度触控板连续发出大量微小 delta 时，vapor 会每事件步进一次，步数明显多于 @v-c；`deltaMode` 为行/页时也不再换算像素。
> `onBlur` 少了「焦点移到内部控件不算失焦」的早退：@v-c 有 `if (e.relatedTarget instanceof Node && rootRef.value?.contains(e.relatedTarget)) return`，vapor 无条件执行 flush 与 `onBlur`。在 `changeOnBlur` 为默认时点击步进按钮可能提前提交正在编辑的值。
> `collectInputValue` 少了 `inputValueUpdateId` 竞态守卫：@v-c 用递增 id 让过期的 `onNextPromise` 回调直接 return，vapor 保留递归（`。` → `.` 归一化后重入）但没有守卫，连续输入时可能重复走一遍解析与提交。
> `className` / `style` prop 两侧都删了，`class` / `style` 一律从 `useAttrs()` 取。@v-c 是 `{ ...styles?.root, ...props.style, ...attrs.style }`，vapor 是 `{ ...styles?.root, ...Object.assign({}, ...attrs.style) }`——vapor 把多个来源预先合并成**数组**（实测 `attrs.class = [["root-dyn"]]`、`attrs.style = [{"border":"2px solid magenta"}]`），所以不能写 `...(attrs.style)?.[0]` 只取第一个来源；class 侧交给 `clsx` 递归展开即可。优先级与 @v-c 一致：`styles.root` < 行内 `style`。
> 两个坑。一是 vapor 不做 key camelize：`getAttrFromRawProps` 按原始 key 查 `rawProps`，没有 `camelize`，所以 `attrs.className` 恒为 `undefined`，必须写 `attrs.class`。二是 `isReservedProp` 在 Vue 3.6 只收录 `key`、`ref`、`ref_for`、`ref_key` 及一批 `onVnode*` 钩子，**不含** `class` / `style`——正因为不保留，未声明的 `class` / `style` 才进得了 `attrs`；反过来一旦声明成 prop，`setFullProps` 会把它们收进 `props` 并从 `attrs` 消失，这也是「声明了 `style` 却取不到」的根因。
> suffix 容器的判断粒度不同：容器出现条件两侧一致（`allowClear || hasSuffix`），但 `hasSuffix` 的算法不同——@v-c 用 `isVueRenderable(suffixNode)`，vapor 用 `!!suffixNode`（`suffixNode = slots.suffix || props.suffix`）。空字符串都会被忽略，但空白字符串等不可渲染值在 vapor 侧仍会判定为有内容，从而多渲染一个空的 `-suffix` 容器。
> `StepHandler` 的默认内容：@v-c 用 `filterEmpty(slots?.default?.())` 过滤后按 `children.length > 0` 决定回退；vapor 用 `<slot>` 的默认内容回退。两侧的 `StepHandler` 的 `disabled` 入参都只来自 `upDisabled` / `downDisabled`，与 `props.disabled` 无关；min/max 的拦截在父组件 `onInternalStep` 的 `upDisabled` / `downDisabled` 判断里，`props.disabled` / `props.readOnly` 的拦截更深处，在 `triggerValueUpdate` 的 `!readOnly && !disabled` 分支里——因此禁用状态下点按钮，值不变但 `@step` 仍会带着旧值触发，`inputRef.focus()` 也照跑（此时 input 是 `disabled`，focus 无效）。
> `spinner` 分支的步进事件绑定写成了 `@Step="onInternalStep"`（首字母大写），`input` 分支写 `@step`。模板编译后 `@Step` 的 handler key 是 `onStep`（`dist/index.js` 中可见），与 `emit('step')` 解析出的 `onStep` 一致，功能等价，只是与另一分支写法不统一。
> `StepHandler` 不声明 `onStep` prop 也能正常工作，原因是 `setFullProps` 对 `onXxx` 的分支：只有在该 key 已被声明时才收进 `props`，否则若 `emits` 里有对应事件，`isEmitListener` 为真便**整个丢弃**（不进 `attrs`，因此 `<span>` 上不会出现多余的 `step` 属性，也没有 `Missing required prop` 告警）。而 `emit` 取 handler 走的是 `baseEmit(instance, instance.vnode.props, ...)`——直接读父组件 vdom/vnode 上的 `onStep`，与 `props` / `attrs` 代理无关，所以回调链不受影响。前提仍是 `defineEmits(['step'])` 在：`baseEmit` 的 dev 断言会在「事件既不在 `emits`、也没有同名 `onXxx` prop」时告警，`'step'` 已在 `emits` 里，声明 `props.onStep` 才是冗余的。
> `InputNumber` 未声明 `inheritAttrs: false`（@v-c 声明了）。vapor 有自己的 attr fallthrough 实现（`@vue/runtime-vapor` 的 `applyFallthroughAttrs`，受 `instance.hasFallthrough && inheritAttrs !== false` 守卫），所以未声明的属性（`id`、`data-*`）**会**落到根 `div`。后果是这些属性同时出现在根 `div` 和 `<input>` 上（`<input>` 来自 `v-bind="inputAttrs"`），产生重复 `id`；@v-c 侧只落在 input 上。
> `inputAttrs` 的 `omit` 列表比 @v-c 短：所有 `onXxx` 项都不在里面，因为 vapor 下它们是 `defineEmits` 而不是 prop / attr；两侧都 `omit` 了 `class` / `style`。另 `tabIndex` 两侧都不在 `omit` 列表里，又因为它是已声明的 prop、进不了 `attrs`，所以都不会落到 `<input>`。
> `defineEmits` 的泛型已收窄到 `ValueType`（`change` / `update:value` 为 `ValueType \| null`，`step` 的 `value` 与 `info.offset` 为 `ValueType`，`clear` 为 `[]`），与 @v-c 的 `InputNumberProps<T>` 回调签名一致。差别只剩泛型本身：@v-c 是 `T extends ValueType = ValueType`，`defineEmits` 拿不到该 `T`，只能用其默认值 `ValueType`。
> `index.ts` 两侧逐字一致：`export default InputNumber` + `export type { InputNumberProps, InputNumberRef, ValueType }`，都不导出 `DecimalClass`（它是 `@v-c/mini-decimal` 的类型）。`StepHandler`、`hooks/`、`utils/numberUtil.ts` 也都没从 `index.ts` 导出。文件布局有一处差异：@v-c 没有 `src/interface.ts`，`InputNumberProps` 内联在 `InputNumber.tsx`、`StepHandlerProps` 内联在 `StepHandler.tsx`，vapor 把三者统一拆进独立的 `interface.ts`。
