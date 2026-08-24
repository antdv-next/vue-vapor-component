---
name: 'jsx-to-vapor-sfc'
description: |
  将 jsx（`@v-c/*`，基于 `defineComponent + render function` 或 Function component）迁移到 vue vapor SFC 格式的工程化 skill。
  触发条件：当需要把 `@v-c/*`（或任何 jsx render function 组件）迁移到 vue vapor SFC 时，加载此 skill
---

# jsx 转换到 vue vapor 单文件组件

## 一、工程结构对照

### 1.1 package.json

**源项目 (`@v-c/*`)**

```json
{
  "name": "@v-c/{name}",
  "type": "module",
  "main": "./dist/index.js",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    },
    "./dist/*": "./dist/*",
    "./package.json": "./package.json"
  },
  "files": ["dist", "package.json"],
  "dependencies": {
    "@v-c/resize-observer": "workspace:^",
    "@v-c/util": "workspace:^"
  },
  "peerDependencies": { "vue": "^3.0.0" }
}
```

**目标项目 (`@vapor-component/*`)**

```json
{
  "name": "@vapor-component/{name}",
  "type": "module",
  "main": "src/index",
  "scripts": {
    "build": "vp pack",
    "prepublish": "pnpm build"
  },
  "dependencies": {
    "@v-c/util": "catalog:",
    "@vapor-component/{internal-dep}": "workspace:^"
  },
  "peerDependencies": {
    "vue": "catalog:"
  },
  "packageManager": "pnpm@10.16.1"
}
```

**核心差异**：main 改为 `src/index`（dev），`files` 只保留 `dist`，依赖用 `catalog:` / `workspace:^`。

### 1.2 目录结构

**源项目**

```
packages/{component-name}/
├── package.json
├── src/
│   ├── {Component}.tsx     # 主组件 (JSX render function)
│   ├── {SubComponent}.tsx
│   ├── context.tsx         # inject/provide 定义在同一文件
│   ├── hooks/{useFunction}.ts
│   └── index.ts
├── docs/assets/index.less   # 样式
└── tests/
```

**目标项目**

```
packages/{component-name}/
├── package.json
├── tsconfig.json            # extends ../../tsconfig.json
├── src/
│   ├── index.ts             # 主入口
│   ├── interface.ts         # 类型定义 (Props, Context, Constants)
│   ├── {Component}.vue      # 主组件 (vapor SFC)
│   ├── {SubComponent}.vue
│   ├── {Context}Key.ts      # InjectionKey + inject helper（单独 .ts 文件）
│   ├── {Context}Provider.vue # context provider（单独 .vue 文件）
│   ├── hooks/
│   │   ├── channelUpdate.ts
│   │   └── useEffectState.ts
│   └── utils/               # 合并 utilities (如 mergeSemantic*)
└── node_modules/            # pnpm workspace 链接
```

**注意**：样式文件不放在组件包中，统一放到 `apps/playground/src/styles/` 中。

### 1.3 tsconfig.json

**所有包共用同一模式**，无差异：

```json
{
  "extends": ["../../tsconfig.json"],
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.js",
    "src/**/*.jsx",
    "src/**/*.vue"
  ]
}
```

---

## 二、组件分类与模式选择

根据组件复杂度，选择对应的迁移模式：

| 类型             | 特征                            | 示例                                | 参考                             |
| ---------------- | ------------------------------- | ----------------------------------- | -------------------------------- |
| **简单 UI 组件** | 单一组件，无子组件/无 context   | switch, checkbox, rate, qrcode      | `packages/switch/src/`           |
| **父子组件**     | 主组件 + Panel 子组件 + context | collapse, input, textarea, overflow | `packages/collapse/src/`         |
| **Portal 组件**  | 依赖 portal 做 DOM 传送门       | dialog, drawer, image               | `packages/dialog/src/`           |
| **基础设施**     | Observer 组件 + hook 双导出     | resize-observer, mutate-observer    | `packages/resize-observer/src/`  |
| **组合静态属性** | 主组件挂载子组件/常量到静态属性 | overflow, image, resize-observer    | `packages/overflow/src/index.ts` |

**迁移前首先判断**：源组件属于哪一类，决定需要创建哪些文件。

---

## 三、index.ts 导出模式

源项目 `index.ts` 通常只导出一个组件。目标项目根据组件类别选择不同导出模式：

### Pattern A：单一组件

适用于 switch, checkbox, rate, segmented, qrcode 等。

```ts
import Switch from './Switch.vue'

export type * from './interface'

export default Switch
```

### Pattern B：主组件 + 子组件

适用于 collapse (Panel), textarea, resize-observer (Collection)。

```ts
import Collapse from './Collapse.vue'
import Panel from './Panel.vue'

export type { CollapsePanelProps, CollapseProps, Key } from './interface'
export { Panel }

export default Collapse
```

### Pattern C：组合静态属性

适用于 overflow (Item, RESPONSIVE, INVALIDATE), image (PreviewGroup), resize-observer (Collection)。

```ts
import Component from './Component.vue'
import SubComponent from './SubComponent.vue'
import { CONST_A, CONST_B } from './interface'

type ComponentType = typeof Component & {
  Sub: typeof SubComponent
  CONST_A: typeof CONST_A
  CONST_B: typeof CONST_B
}

const Export = Component as ComponentType
Export.Sub = SubComponent
Export.CONST_A = CONST_A
Export.CONST_B = CONST_B

export default Export
```

---

## 四、interface.ts 类型定义

### 4.1 命名约定

| 用途            | 命名                                                 | 示例                                         |
| --------------- | ---------------------------------------------------- | -------------------------------------------- |
| 主组件 props    | `{Component}Props`                                   | `InputProps`, `DrawerProps`, `CollapseProps` |
| 子组件 props    | `{Component}{Sub}Props`                              | `CollapsePanelProps`, `DialogPanelProps`     |
| Context 类型    | `{Component}ContextType` / `{Component}ContextValue` | `CollapseContextValue`                       |
| 语义化 CSS 名称 | `SemanticName` (联合类型)                            | `'header' \| 'body' \| 'footer'`             |
| Ref 类型        | `{Component}Ref`                                     | `InputRef`, `TextAreaRef`                    |

### 4.2 通用类型导入

```ts
import type { Key, VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'
import type { ChangeEventHandler } from '@v-c/util/dist/EventInterface'
```

**注意**：`VueNode` 和 `Key` 是所有组件的通用类型；事件处理函数类型从 `@v-c/util/dist/EventInterface` 导入。

### 4.3 SemanticName + classNames/styles

对于有复杂子结构的组件（collapse, dialog, drawer, input, textarea, segmented, overflow），需定义语义化 CSS 体系：

```ts
export type SemanticName = 'header' | 'body' | 'footer' | 'title' | 'icon'
export type ComponentClassNames = Partial<Record<SemanticName, string>>
export type ComponentStyles = Partial<Record<SemanticName, CSSProperties>>
```

配合 `mergeSemanticClassNames` / `mergeSemanticStyles` 工具函数（在 `utils/` 下）：

```ts
import { mergeSemanticClassNames, mergeSemanticStyles } from './utils'

const mergedClassNames = computed(() =>
  mergeSemanticClassNames(ctx?.classNames, props.classNames),
)
```

### 4.4 事件处理函数类型

**Vapor SFC 必须使用 `defineEmits`，事件回调不能定义在 props 中**：

```ts
// interface.ts — 只定义 props 数据字段，不包含 onXxx
interface SwitchProps {
  prefixCls?: string
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  name?: string
  value?: any
}

// Switch.vue — 用 defineEmits 声明事件
const emit = defineEmits<{
  change: [e: SwitchChangeEvent]
  'update:checked': [checked: boolean]
  'update:defaultChecked': [checked: boolean]
}>()

// 父组件 — 用 @xxx 语法
<Switch @change="handler" @update:checked="(v) => checked = v" />
```

**❌ 不要在 props 中定义 onXxx**：源 JSX 项目通过 `onChange?: (e) => void` 定义在 props 中，父组件用 `:onChange="h"` 传递。Vapor SFC 必须改为 `defineEmits` + `emit('change', e)`，父组件用 `@change="h"`。这是正在进行的全面改造的核心规则（见规则 18）。

---

## 五、Context 模式

根据源组件的 context 用法选择对应模式：

### Pattern 1：简单 provide/inject（最常用）

适用于 collapse, image 等父子通信场景。

**源项目 (context.tsx)**

```tsx
const CollapseContextKey: InjectionKey<CollapseContextValue> =
  Symbol('CollapseContext')
export function useCollapseContext() {
  return inject(CollapseContextKey, null)
}
export function provideCollapseContext(value: CollapseContextValue) {
  provide(CollapseContextKey, value)
}
```

**目标项目：拆为两个文件**

```ts
// CollapseContextKey.ts
const CollapseContextKey: InjectionKey<CollapseContextValue> =
  Symbol('CollapseContext')
export function useCollapseContext() {
  return inject(CollapseContextKey, null)
}
export function provideCollapseContext(value: CollapseContextValue) {
  provide(CollapseContextKey, value)
}
```

```vue
<!-- CollapseProvider.vue（可选，仅在需要显式包装时使用） -->
<script setup vapor lang="ts">
  import { provideCollapseContext } from './CollapseContextKey'

  provideCollapseContext({ prefixCls, activeKeys, accordion, onItemClick })
</script>
<template><slot /></template>
```

**注意**：简单 context 通常不需要 Provider.vue，在父组件中直接调用 `provideCollapseContext()` 即可。

### Pattern 2：Ref 共享 context

适用于 dialog, drawer 等需要子组件向上报告 DOM ref 的场景。

```ts
// context.ts
const RefContext: InjectionKey<RefContextProps> = Symbol('RefContext')

export function useRefProvide(customSet?: (panel: HTMLDivElement) => void) {
  const panel = shallowRef<HTMLDivElement>()
  const setPanel = (el: HTMLDivElement) => {
    panel.value = el
    customSet?.(el)
  }
  provide(RefContext, { panel, setPanel })
  return { panel, setPanel }
}

export function useRefContext() {
  return inject(RefContext, { panel: shallowRef(), setPanel: () => {} })!
}
```

### Pattern 3：上下文 Provider 组件（overflow 特殊模式）

适用于 context 需要显式传入值，且被非父子组件消费的场景。

```vue
<!-- {Context}Provider.vue -->
<script setup vapor lang="ts">
  import type { ContextType } from './interface'
  import { computed, provide } from 'vue'
  import { ContextKey } from './ContextKey'

  defineOptions({ name: 'ContextProvider', inheritAttrs: false })
  const props = defineProps<{ value?: ContextType | null }>()
  provide(
    ContextKey,
    computed(() => props.value ?? null),
  )
</script>
<template><slot /></template>
```

**关键**：provider 的值用 `computed(() => props.value ?? null)` 包装，因为 SFC props 是响应式的。

### Pattern 4：Context Value 为 ComputedRef

当 context 提供的是一个 `ComputedRef` 时（overflow 的模式）：

```ts
// ContextKey.ts
export const ContextKey: InjectionKey<ComputedRef<ContextType | null>> =
  Symbol('ContextKey')

export function useContext() {
  return inject(ContextKey, null)
}
```

**使用方需要注意**：`inject` 返回的是 `ComputedRef`，需通过 `.value` 取值。在 SFC 中用 `computed(() => contextRef?.value ?? null)` 包装：

```vue
<script setup vapor lang="ts">
  const contextRef = useContext()
  const contextValue = computed<ContextType | null>(
    () => contextRef?.value ?? null,
  )
</script>
```

---

## 六、Script 部分转换

### 6.1 组件声明

| 源 JSX                                                                        | 目标 Vapor SFC                                         |
| ----------------------------------------------------------------------------- | ------------------------------------------------------ |
| `defineComponent({ name: 'Comp', inheritAttrs: false, props, emits, setup })` | `defineOptions({ name: 'Comp', inheritAttrs: false })` |

### 6.2 Props 声明

**方案 A：withDefaults（推荐，大多数组件使用）**

```ts
const props = withDefaults(defineProps<PropsType>(), {
  prefixCls: 'vc-component',
  itemWidth: 10,
})
```

**方案 B：解构 + 默认值（switch, checkbox 使用）**

```ts
const { prefixCls = 'vc-switch', checked = false } = defineProps<PropsType>()
```

**Props 中常见属性**（大多数组件共有）：

| Prop         | 类型                                           | 说明                           |
| ------------ | ---------------------------------------------- | ------------------------------ |
| `prefixCls`  | `string?`                                      | CSS 类名前缀，默认 `vc-{name}` |
| `classNames` | `Partial<Record<SemanticName, string>>`        | 语义化类名映射                 |
| `styles`     | `Partial<Record<SemanticName, CSSProperties>>` | 语义化样式映射                 |
| `disabled`   | `boolean?`                                     | 禁用状态                       |

**⚠️ 重要**：

- **`class` / `style` 永远不进 props**：这两个属性会被 Vue 自动 hoist 到 `attrs`（见规则 15），必须在 `inheritAttrs: false` + `useAttrs()` 模式下从 `attrs` 读取，不能声明为 props。`styles`、`rootStyle`、`className` 等命名不受影响。
- **`onXxx` 事件回调不进 props**：用 `defineEmits` 声明（见规则 18），父组件用 `@xxx` 语法，不用 `:onXxx`。

### 6.3 Emits 声明

```ts
// 方案 A：显式定义
const emit = defineEmits<{
  change: [value: any, e: Event]
  'update:checked': [checked: boolean]
}>()

// 方案 B：仅 props 回调（部分组件使用）
// 直接在 props 中声明 onChange?: (value: T) => void，不需要 emit
```

### 6.4 attrs 处理

**所有 `inheritAttrs: false` 的组件都需要处理 attrs**：

```ts
import { useAttrs } from 'vue'
import omit from '@v-c/util/dist/omit'

const attrs = useAttrs()
const restAttrs = computed(() =>
  omit(attrs as Record<string, any>, ['class', 'style', 'default']),
)
```

**class/style 合并**：

```ts
import { clsx } from '@v-c/util'

const nodeCls = computed(() =>
  clsx(!props.invalidate && props.prefixCls, props.class, attrs.class as any),
)
```

### 6.5 状态管理：useMergedState

用于受控/非受控状态同步（collapse, rate, image 使用）：

```ts
import useMergedState from '@v-c/util/dist/hooks/useMergedState'

const [activeKey, setActiveKey] = useMergedState<Key[], Ref<Key[]>>([], {
  value: toRef(props, 'activeKey') as Ref<Key | Key[]>,
  onChange: v => props.onChange?.(v as Key[]),
  defaultValue: props.defaultActiveKey,
  postState: normalizeToArray,
})
```

### 6.6 Ref 使用约定

| 类型             | 用途                                          | 示例                                                     |
| ---------------- | --------------------------------------------- | -------------------------------------------------------- |
| `shallowRef`     | DOM ref、简单值                               | `const rootRef = shallowRef<HTMLDivElement>()`           |
| `useTemplateRef` | 模板 ref（input, textarea, switch, checkbox） | `const rootRef = useTemplateRef<HTMLDivElement>('root')` |
| `ref`            | 复杂响应式值（Map, Array, object）            | `const widths = ref<Map<Key, number>>(new Map())`        |

### 6.7 defineExpose 公共 API

用于暴露公共方法给父组件（input, checkbox, textarea, rate, input-number, image, dialog Panel 使用）：

```ts
defineExpose({
  focus: () => rootRef.value?.focus(),
  blur: () => rootRef.value?.blur(),
  nativeElement: computed(() => rootRef.value),
})
```

---

## 七、Template 部分转换

### 7.1 内容渲染（通用规则）

**字符串/数字/boolean 等原始值用 `{{ }}` 文本插值**：

```vue
<!-- ✅ 正确 -->
<template v-if="content">{{ content }}</template>
<slot v-else />

<!-- ❌ 错误 — 字符串会被当作组件名解析 -->
<component :is="content" />
```

**仅当值是 HTML tag时才采用 `<component :is>`**：

```vue
<!-- 渲染自定义组件（来自 renderItem 函数） -->
<component :is="props.component" />
```

### 7.2 v-for + key

**`<template v-for>` 本身不加 `:key`**，key 放在内部每个组件上：

```vue
<template v-for="(item, idx) in mergedData">
  <Item :key="getKey(item, idx)" :item="item" :order="idx" />
</template>
```

### 7.3 v-if / v-else

```vue
<template v-for="(item, idx) in mergedData">
  <ContextProvider v-if="props.renderRawItem" :value="context">
    <component :is="props.renderRawItem(item, idx)" />
  </ContextProvider>
  <Item v-else :key="getKey(item, idx)" :item="item" />
</template>
```

**注意**：`v-else` 必须紧跟 `v-if`，且都在同一个父 `<template>` 内。

### 7.4 条件渲染 + 子组件绑定

```vue
<Comp v-if="someValue" :prop1="x" :prop2="y">
  <slot name="content" />
</Comp>
```

### 7.5 动态组件渲染

**仅当 props 中存在 `component` 属性且类型为 HTML 标签字符串（如 `'div'`、`'span'`、`'section'`）时，才使用 `<component :is>` 动态渲染**：

```vue
<!-- ✅ 正确：component 类型是 HTML 标签 -->
<component
  :is="props.component ?? 'div'"
  :class="nodeCls"
  :style="nodeStyle"
  v-bind="restAttrs"
>
  ...
</component>
```

**对于 `props.xxRender(args)` 渲染函数模式，使用 `<slot>` 替代，由父组件通过 slot 传入渲染逻辑**。slot props 在 script 中构建为对象，模板中用 `v-bind` 绑定：

```ts
// script 中构建 slot props
const slotProps = { item, index: idx }
```

```vue
<!-- ✅ 正确：render 函数模式用 slot -->
<template v-if="slots.xxRender">
  <slot name="xxRender" v-bind="slotProps" />
</template>

<!-- ❌ 错误：不要把 render 函数的返回值当作组件动态渲染 -->
<!-- <component :is="props.xxRender(item, idx)" /> -->
```

**原因**：render 函数可能返回 VNode（vdom），在 vapor 模式下无法直接渲染为 `<component :is>`，会触发 vapor/vdom 互斥问题。使用 slot 将渲染逻辑交给父组件的 SFC 模板处理，保持 vapor 上下文一致。

### 7.6 模板中的布尔表达式类型问题

当 `computed` 返回的布尔值与模板类型推断冲突时，显式标注类型：

```ts
// ❌ 可能推断为 number | boolean（当 data.length 为 0 时）
const shouldResponsive = computed(() => data.value.length && isResponsive.value)

// ✅ 显式标注 boolean
const shouldResponsive = computed<boolean>(
  () => data.value.length > 0 && isResponsive.value,
)
```

### 7.7 Slot 使用

```vue
<slot />
<!-- 默认 slot -->
<slot name="header" />
<!-- 命名 slot -->
<slot name="closeIcon">默认内容</slot>
<!-- 带默认内容 -->
<template v-if="content">{{ content }}</template>
<slot v-else />
<!-- 条件渲染 slot -->
```

### 7.8 Slot 转发模式（重要）

**问题**：当一个组件 A 包装了组件 B，而 B 的 `#default` slot 传递了 slot props（如 `VcVirtualList` 的 `{ item, index, ... }`），在 A 中不能直接在 B 的 slot 模板内写 `<slot>`，因为 Vapor 模式下 slot 解析作用域会混乱，导致 slot props 变为 `undefined`。

**修复**：在中间组件（如 `Listy.vue`）中显式使用 `<template #default="slotProps"><slot v-bind="slotProps" /></template>` 做中转。

**示例**（`Listy.vue` 包装 `VirtualList.vue`，而 `VirtualList.vue` 内部用 VcVirtualList 的 `#default` slot）：

```vue
<!-- ✅ 正确：Listy.vue 中显式转发 slot props -->
<template>
  <VirtualList ref="listRef" :data="data" :row-key="props.rowKey" ...>
    <template #default="slotProps">
      <slot v-bind="slotProps" />
    </template>
  </VirtualList>
</template>
```

**原理**：`Listy` 这层负责捕获下层 `VirtualList` 的 slot props 并转发给上层（用户组件），绕过了 Vapor 嵌套 slot 解析的限制。用户组件的 `<template #default="slotProps">` 就能正确拿到 `{ item, index }`。

**适用场景**：

- 组件 A 包装了组件 B，B 的 slot 带 props，A 需要把这些 props 透传给上层
- 任何中间层需要转发 slot 的场景

### 7.9 Slot props 用 v-bind 对象字面量

在 vapor 模板中给 `<slot>` 传 props 时，推荐使用 `v-bind` 对象字面量语法：

```vue
<!-- ✅ 推荐：对象字面量，清晰可靠 -->
<slot v-bind="{ item: row.item, index: row.index }" />

<!-- 不推荐：多个独立绑定，vapor 编译中可能出现解析问题 -->
<slot :item="row.item" :index="row.index" />
```

**场景**：当 slot props 需要从行数据对象中提取（如 `flattenRows.rows` 中每个 row 含 `item` 和 `index`）时，`v-bind` 对象语法让数据转换逻辑一目了然。

---

## 八、组件迁移步骤

### Step 1：判断组件类型

根据源组件特征确定：

| 问题                                         | 决定                                           |
| -------------------------------------------- | ---------------------------------------------- |
| 是否有子组件（Panel, Item, Collection 等）？ | 决定是 Pattern A / B / C                       |
| 是否有 context？                             | 决定使用 Pattern 1 / 2 / 3 / 4                 |
| 是否依赖 Portal？                            | 需要加 `@vapor-component/portal` 依赖          |
| 是否有 ResizeObserver 依赖？                 | 需要加 `@vapor-component/resize-observer` 依赖 |
| 是 Observer 基础设施还是 UI 组件？           | Observer 组件有独特的双导出模式                |

### Step 2：创建基础文件

1. `package.json`（见上文模式）
2. `tsconfig.json`（见上文模式）
3. `src/interface.ts`（提取 Props 接口、常量、类型）

### Step 3：处理 Context

按 Pattern 1~4 选择，拆分到 `{Context}Key.ts` 和可选的 `{Context}Provider.vue`。

### Step 4：迁移主组件

1. Script 部分：Props → `defineProps`，Attrs → `useAttrs()` + `omit`，状态 → `ref`/`shallowRef`/`computed`
2. Template 部分：JSX 元素 → `<component :is>`，JSX 文本 → `{{ }}`，JSX 条件 → `v-if/v-else`，JSX 循环 → `v-for`
3. 注意 `inheritAttrs: false` 组件必须显式处理 attrs

### Step 5：迁移子组件

与主组件相同步骤，通常更简单。

### Step 6：处理自定义 Hooks

将源项目的 hooks 复制到 `src/hooks/` 目录下，适配为 vue 的 API：

- `useEvent` → 用 `ref` + `computed` 替代
- `useMergedState` → 从 `@v-c/util/dist/hooks/useMergedState` 导入
- `useEffectState`（overflow 特有）→ 复制到 hooks/

### Step 7：编写 index.ts

根据组件类型选择 Pattern A/B/C。

### Step 8：在 playground 中注册

1. `apps/playground/package.json` 添加 `"@vapor-component/{name}": "workspace:*"`
2. `App.vue` + `VaporApp.vue` 添加 `import Component from '@vapor-component/{name}'`
3. 添加 `import './styles/{component}.less'`
4. 添加 demo 模板
5. `pnpm install`

### Step 9：验证

```bash
# 类型检查
npx vue-tsc --noEmit --project packages/{name}
npx vue-tsc --noEmit --project apps/playground

# 启动 playground 验证
cd apps/playground && npx vp dev
```

---

## 九、Portal 组件模式

dialog, drawer, image 等组件使用 Portal 做 DOM 传送门，有额外约定：

**依赖**：`"@vapor-component/portal": "workspace:^"`

**`:open` 必须显式传值**（常见遗漏）：

`@vapor-component/portal` 的 `open` 默认值是 `false`，如果不显式传 `:open="true"`，Portal 内部的 `canRender` 计算为 `false`，**内容完全不会渲染**（无报错、无警告）。

```vue
<!-- ✅ 正确：明确 :open="true" -->
<Portal :open="true" :get-container="() => container">
  <div>内容</div>
</Portal>

<!-- ❌ 错误：忘记 :open，内容不渲染（silent fail） -->
<Portal :get-container="() => container">
  <div>内容</div>
</Portal>
```

**适用场景**：所有使用 Portal 做 DOM 传送门的组件（dialog, drawer, image, sticky header, tour）。

**核心 props**：

```ts
interface PortalBasedProps {
  visible?: boolean
  getContainer?: () => HTMLElement | string
  destroyOnHidden?: boolean
  forceRender?: boolean
  mask?: boolean
  maskClosable?: boolean
  keyboard?: boolean
  autoFocus?: boolean
  zIndex?: number
  transitionName?: string
  maskTransitionName?: string
}
```

**模板模式**：

```vue
<Portal
  :open="visible || forceRender || animatedVisible"
  :auto-destroy="false"
  :onEsc="onEsc"
  :getContainer="getContainer"
  :auto-lock="visible || animatedVisible"
>
  <Content>
    <!-- 组件内容 -->
  </Content>
</Portal>
```

**animatedVisible 模式**（用于控制动画生命周期）：

```ts
const animatedVisible = ref(false)
watch(
  () => props.visible,
  newVal => {
    if (newVal) {
      animatedVisible.value = true
    } else {
      // 等待动画结束后销毁
    }
  },
)
```

---

## 十、Observer 基础设施模式

resize-observer, mutate-observer 是基础设施组件，有独特的双导出模式：

**index.ts**：

```ts
import Collection from './Collection.vue'
import Observer from './Observer.vue'
import { _rs } from './utils/observerUtil'

export { default as useObserver } from './useObserver'
export { _rs } // 测试用

export type { ObserverProps, SizeInfo } from './interface'

Observer.Collection = Collection
export default Observer as typeof Observer & { Collection: typeof Collection }
```

**特点**：组件 + hook 同时导出，组件提供模板用法，hook 提供组合式用法。

---

## 十一、vapor SFC 关键约定

### 1. `<script setup vapor>` 标记

必须有 `vapor` 属性：

```vue
<script setup vapor lang="ts">
```

### 2. defineOptions

```ts
defineOptions({ name: 'ComponentName', inheritAttrs: false })
```

- `name`：PascalCase
- `inheritAttrs: false`：组件管理自己 attrs 时使用（大多数组件）
- 简单组件（switch, checkbox）可不设

### 3. 模板中不能直接访问 script 变量

模板中引用 script 变量时，确保变量在 setup scope 中已定义。

### 4. computed 返回值类型

当类型推断不准确时，显式标注：

```ts
const shouldResponsive = computed<boolean>(
  () => data.value.length > 0 && isResponsive.value,
)
```

### 5. v-for + key 约束

`<template v-for="item in items">` 要加 `:key`，`<template v-for="item in items" :key="item.xx">`。

### 6. 静态属性挂载

在 `index.ts` 中挂载子组件/常量到主组件静态属性上。

### 7. 布尔 prop 的 `??` fallback 失效（vapor 强制转换）

**问题**：当 prop 类型包含 `false` 分支时（如 `?: (() => HTMLElement) | false`），vapor 编译会把未传的 `undefined` 强制转为 `false`，导致 `??` 默认值回退失效：

```ts
// ❌ 危险：undefined 被强制转为 false，false ?? default → false（fallback 被跳过）
const merged = computed(() => props.xxx ?? defaultProps.xxx)

// ✅ 安全：false 是 falsy 值，|| 会正确回退到默认值
const merged = computed(() => props.xxx || defaultProps.xxx)
```

**更根本的修复**：在 `interface.ts` 中**去除 `false` 分支**，让类型本身不包含布尔值：

```ts
// ❌ 危险：包含 false，vapor 会强制转换
getContainer?: (() => HTMLElement) | false
mask?: boolean | { style: CSSProperties; color: string }

// ✅ 安全：不包含 false，undefined 不会被强制转换
getContainer?: () => HTMLElement
mask?: { style: CSSProperties; color: string }
```

**检测手段**：构建后检查 `dist/index.js` 中 prop 类型声明是否包含 `Boolean`：

```bash
grep -n "getContainer.*type" packages/{name}/dist/index.js
# ❌ { type: [Function, Boolean] } — 包含 Boolean，会强制转换
# ✅ { type: Function } — 只有 Function，不会强制转换
```

**常见受影响场景**：

- `getContainer?: (() => HTMLElement) | false`（Portal 相关）
- 任何 `boolean | { ... }` 联合类型（如 `mask`，其中 `false` 表示关闭、`object` 表示配置）
- 需要 `??` 做默认值回退的所有布尔 prop

参见[规则 13](#13-可选非布尔-prop如-iconfunction-也被-vapor-强制转为-false) — Vapor 强制转换不只影响布尔类型，可选的非布尔 prop（如 `switcherIcon?: IconType`）也会被强制转为 `false`。

### 8. `Exclude<>` 工具类型在运行时类型提取中无效

`Exclude<T, false>` 在 TypeScript 层面正确排除了 `false`，但 **Vue 运行时类型提取仍会识别出 `Boolean`**，导致与规则 7 相同的强制转换问题。

```ts
// ❌ 编译期正确，但运行时仍提取出 Boolean → vapor 强制转换仍然生效
getContainer?: Exclude<PortalProps['getContainer'], false>

// ✅ 直接定义不含 false 的显式类型
getContainer?: string | ContainerType | (() => ContainerType)
```

**原则**：涉及 Portal 等外部组件类型复用、且需要排除 `false` 的场景，**必须用显式联合类型替代 `Exclude<>`**。

### 9. Portal 必须显式 `:open="true"`

`@vapor-component/portal` 的 `open` 默认为 `false`。不传 `:open="true"` 时 Portal 静默不渲染，无任何报错。

```vue
<!-- ✅ 正确 -->
<Portal :open="true" :get-container="() => container">...</Portal>
```

参见[九、Portal 组件模式](#九portal-组件模式)。

### 10. 布尔 prop 必须显式传 `:attr="true"`（不要省略值）

在 vapor 模板中，不带值的裸属性（如 `<VcVirtualList virtual>`）实际解析为 `undefined`，而非 `true`，随后被 vapor 强制转换为 `false`，导致该 prop 被禁用。

```vue
<!-- ❌ 错误：裸属性 virtual 解析为 undefined → 被强制转为 false，虚拟模式被禁用 -->
<VcVirtualList virtual ... />

<!-- ✅ 正确：:virtual="true" 显式传值 -->
<VcVirtualList :virtual="true" ... />
```

**原因**：Vue 模板中带值属性 `virtual` 解析为 `undefined`，vapor 模式下布尔类型的 `undefined` 被强制转换为 `false`（参见规则 7）。`??` 和默认值回退同样失效。必须用 `:attr="true"` 显式传递布尔值。

**常见受影响属性**：`virtual`、`sticky`、`fixed`、`open`、`full-height` 等布尔 prop。

### 11. 模板中直接用变量名（不要加 `props.` 前缀）

Vue 编译器会将 `<template>` 中出现的 `props.xxx` 自动展开为 `xxx`。在 `<template>` 中写 `props.xxx` 虽然能工作，但属于反模式，应统一省略 `props.` 前缀。

```vue
<script setup>
  const props = defineProps<{ title: string; disabled: boolean }>()
</script>

<template>
  <!-- ❌ 反模式：写了 props. -->
  <div>{{ props.title }}</div>
  <button :disabled="props.disabled" />

  <!-- ✅ 正确：直接用变量名，编译器自动处理 -->
  <div>{{ title }}</div>
  <button :disabled="disabled" />
</template>
```

**注意**：此规则**仅适用于 `<template>`**。`<script>` 中必须用 `props.xxx`。

**批量检测**：

```bash
for f in packages/*/src/*.vue; do
  awk '/<script/ { s=1 } /<\/script>/ { s=0 } /<style/ { st=1 } /<\/style>/ { st=0 } !s && !st && /props\./ { print FILENAME ":" NR ":" $0 }' "$f"
done
```

### 12. `reactive()` + `watchEffect` 在 Vapor 中不可靠

在 Vapor 模式下，`reactive()` 创建时捕获的 `let` 变量和 prop 值，通过 `watchEffect` 重新赋值后**不会可靠地触发** `computed(() => reactiveObj)` 重新计算。子组件通过 inject 获取的 context 值会过时。

**原始写法（失效）**：

```ts
const treeCtx = reactive<any>({
  selectable: props.selectable,
  checkable: props.checkable,
  get onNodeClick() {
    return onNodeClick
  },
})
provideTreeContext(computed(() => treeCtx))

// watchEffect 重新赋值 → Vapor 中不触发 computed 重新计算
watchEffect(() => {
  treeCtx.selectable = props.selectable
  treeCtx.checkable = props.checkable
})
```

**修复**：对所有属性使用 **getter**，并在提供 context 时用 `computed(() => reactiveObj)`：

```ts
const treeCtx = reactive<any>({
  get selectable() {
    return props.selectable
  },
  get checkable() {
    return props.checkable
  },
  get onNodeClick() {
    return onNodeClick
  },
})
provideTreeContext(computed(() => treeCtx))
// 无需 watchEffect — getter 保证每次访问都读到最新值
```

### 13. 可选非布尔 prop（如 icon/function）也被 Vapor 强制转为 `false`

规则 7 不仅影响布尔类型。当可选 prop 类型为 `IconType | undefined` 等非布尔联合时，如果未传递该 prop，Vapor 仍可能将其强制转换为 `false`（而非 `undefined`），导致 `??` 和 `||` 回退都失效。

**典型场景** — Tree 的 `switcherIcon`：

```ts
// interface.ts 中 switcherIcon 为可选 IconType
switcherIcon?: IconType

// TreeNode.vue 中：
const switcherIcon = props.switcherIcon || ctx.value?.switcherIcon
// Vapor 下未传时 props.switcherIcon === false（非 undefined），|| 判断 false 为 falsy
// 继续到 ctx 分支，但 ctx.switcherIcon 也是 false → 最终 switcherIcon = false
// renderSwitcherIconDom 返回 false → showSwitcher = false → 不渲染 switcher
```

**修复**：对可能被 Vapor 强制转换的 prop，显式检查 `=== false`：

```ts
const switcherIcon = props.switcherIcon || ctx.value?.switcherIcon
if (typeof switcherIcon === 'function')
  return (switcherIcon as any)({ ...props, isLeaf: isInternalLeaf })
if (switcherIcon === false) return '' // 显式回退到空字符串
return switcherIcon
```

**受影响 prop 类型特征**：可选的非布尔联合类型（`T | undefined`），其中 `T` 不是 `boolean`，但在 Vapor 中仍被强制转换为 `false`。

**常见受影响场景**：

- `switcherIcon?: IconType`（Tree）
- `icon?: IconType`
- 任何 `?: SomeType` 可选 prop（当 SomeType 不包含 `boolean` 时也可能受影响）

### 14. 无 CSSTransition 时跳过过渡 placeholder 逻辑

源项目（Vue Components）的展开/折叠动画通常通过 `CSSTransition` 包装 placeholder 节点，在动画结束后触发 `onMotionEnd` 清理。Vapor 版本若没有对应的过渡组件，placeholder 会永久残留。

**源项目模式**：

```ts
// 插入 placeholder 节点 → CSSTransition 播放动画 → onMotionEnd 清理
const MOTION_FLATTEN_DATA = { key: '__tree_motion_placeholder__', title: null, ... }
newData.splice(keyIndex + 1, 0, MOTION_FLATTEN_DATA)
transitionData.value = newData
motionType.value = 'show'  // CSSTransition 完成后 onMotionEnd 会被调用
```

**Vapor 修复**：当没有过渡组件时，直接更新到最终状态，跳过 placeholder 逻辑：

```ts
if (diffExpanded.key !== null) {
  // 无 CSSTransition — placeholder 永远不会被清理
  // 直接更新到最终数据状态
  prevData.value = newData
  transitionData.value = newData
  transitionRange.value = []
  motionType.value = null
}
```

**适用场景**：任何原本依赖 CSSTransition/CSSMotion 做过渡并需要清理中间状态的组件（Tree 展开/折叠、Collapse 面板切换等）。

### 15. `class?:` 和 `style?:` 不能定义在 props 中（Vue 会 hoist 到 attrs）

Vue 会自动将 `class` 和 `style` 属性从 `defineProps` 中 hoist 到 `attrs`。即使你在 props 类型中声明了 `class?:` 或 `style?:`，父组件传递的 `class="foo"` 或 `:style="..."` 也会进入 `attrs` 而非 `props`，导致 `props.class`/`props.style` 始终为 `undefined`（Vapor 中为 `false`）。

**错误做法**：

```ts
const props = defineProps<{
  page: number
  class?: string // 永远拿不到值！Vue 将其 hoist 到 attrs
  style?: CSSProperties // 同上
}>()
// template: :style="style" → 拿到 undefined/false
```

**正确做法**：从 `attrs` 中读取：

```ts
defineOptions({ name: 'Xxx', inheritAttrs: false })
const attrs = useAttrs()
const props = defineProps<{
  page: number
  // 不声明 class/style
}>()
// template: :style="(attrs as any).style"
// script:  clsx(..., (attrs as any).class)
```

**注意**：

- `className?:` 不受影响（不是特殊属性名，不会被 hoist）
- `styles?:`、`rootStyle?:` 等也都不受影响
- 只有精确名为 `class` 和 `style` 的 prop 才会被 hoist
- 数据对象（如 `StepItem`、`SegmentedLabeledOption`）中的 `class?:`/`style?:` 不受影响，因为它们不是组件 props

### 16. `v-bind="omit(props, ...)"` 在 Vapor 中不会响应式更新

`omit`（`@v-c/util/dist/omit`）返回一个普通对象快照（plain object clone + delete）。在 Vapor 编译模式下，模板中的 `v-bind="omit(props, ['xxx'])"` 只会在组件初次编译时求值一次，之后 props 变化不会触发重新计算。

**失效场景** — DialogWrap.vue 传递 visible：

```vue
<script setup vapor lang="ts">
  const props = defineProps<{ visible?: boolean }>()
  const animatedVisible = shallowRef(false)
</script>
<template>
  <Dialog
    v-bind="omit(props, ['onClose'])"   <!-- ❌ visible 永远是初始值 false -->
    :destroyOnHidden="destroyOnHidden"
  />
</template>
```

点击按钮 `visible = true` 后，`omit(props, ...)` 仍然返回 `{ visible: false, ... }` 的快照，Dialog 收不到更新。

**修复**：直接用 `v-bind="props"`（响应式代理），不需要 omit 的字段就不传：

```vue
<Dialog
  v-bind="props"                          <!-- ✅ props 是响应式的 -->
  :destroyOnHidden="destroyOnHidden"
/>
```

如果确实需要排除某些字段，用 `computed` 包装：

```ts
const safeProps = computed(() => omit(props, ['onClose']))
```

```vue
<Dialog v-bind="safeProps" />
```

**根因**：`omit` 的实现是 `{...obj}` + `delete`，返回的是纯对象，不是 computed。Vapor 编译器对模板中的 `omit(props, ...)` 表达式不会自动包装为响应式依赖追踪。

**受影响组件**：任何在模板中直接用 `v-bind="omit(props, ...)"` 的 Vapor 组件（如 DialogWrap、MotionTreeNode 等）。批量检测：

```bash
grep -rn 'v-bind="omit(props' packages/*/src/*.vue
```

### 17. `attrs.style` 必须用 `for...in` 手动拷贝，不能用 `...attrs.style` 展开

Vapor 运行时的 `resolveDynamicProps` 会将多个来源的 `style` 合并为数组（`ret.style = normalizeStyle([ret.style, toMerge.style])`），最终 `patchStyle` 遍历 style 对象时通过 `setStyle(style, key, value)` 设置到 `CSSStyleDeclaration` 上。`CSSStyleDeclaration` 有 `[0]`、`[1]` 等索引属性，当 `style` 对象包含数字 key 或意外 key 时会触发 `TypeError: Failed to set an indexed property [0] on 'CSSStyleDeclaration'`。

**失效写法**（ResizableTextArea.vue、Item.vue、Overflow.vue 都曾踩坑）：

```ts
const nodeStyle = computed<CSSProperties>(() => ({
  ...(attrs.style as CSSProperties),     <!-- ❌ 展开 attrs.style，proxy keys 可能包含非样式 key -->
  overflow: 'auto',
}))
```

**正确写法**：

```ts
const nodeStyle = computed<CSSProperties>(() => {
  const result: CSSProperties = {}
  const parentStyle = attrs.style
  if (
    parentStyle &&
    typeof parentStyle === 'object' &&
    !Array.isArray(parentStyle)
  ) {
    for (const key in parentStyle) {
      result[key] = parentStyle[key]
    }
  }
  result.overflow = 'auto'
  return result
})
```

**根因**：`attrs` 是 Vue 的响应式 proxy，vapor 模式下 `...attrs.style` 展开时可能读取到 proxy 内部的非样式 key（如数字索引），这些 key 会随 `normalizeStyle` 合并流程进入 `patchStyle`，最终在 `CSSStyleDeclaration[name] = value` 时崩溃。`for...in` 手动拷贝只取 `attrs.style` 对象自身的可枚举属性。

**同时必须从 `restAttrs` 中排除 `style`**：

```ts
const restAttrs = computed(() =>
  omit(attrs as Record<string, any>, ['class', 'style', 'default']),
)
```

否则 `v-bind="restAttrs"` 会把 `style` 作为普通 DOM 属性传入，vapor 的 `resolveDynamicProps` 会将其与显式绑定的 `:style` 合并，产生相同的问题。

**受影响组件**：任何使用 `useAttrs()` + `inheritAttrs: false` + `v-bind="restAttrs"` + `:style="computed"` 模式的 Vapor 组件（textarea、overflow、portal 等）。

### 18. `onXxx` prop 回调必须改为 `defineEmits` + `@xxx`

Vapor SFC 中组件间事件通信的标准做法是 `defineEmits` + `emit('xxx', args)` + 父组件 `@xxx="handler"`。不能使用 `onXxx?: (args) => void` 定义在 props 中，父组件用 `:onXxx="handler"` 或 `:on-xxx="handler"` 传递。

**源 JSX 模式（❌ 不可用于 Vapor SFC）**：

```tsx
// 子组件：onXxx 定义在 props 中
interface Props {
  onChange?: (e) => void
  onClose?: () => void
}
const { onChange, onClose } = defineProps<Props>()
// 调用：onChange?.(e)
```

```vue
<!-- 父组件：:onXxx / :on-xxx 传递 -->
<Tree :onExpand="handleExpand" :on-Select="handleSelect" />
```

**Vapor SFC 标准模式（✅）**：

```vue
<script setup vapor lang="ts">
  const emit = defineEmits<{
    change: [e: any]
    close: []
    expand: [keys: string[]]
    'visible-change': [count: number]  <!-- 带连字符的事件名用引号 -->
  }>()

  // 调用
  emit('change', e)
  emit('close')
  emit('expand', keys)
  emit('visible-change', count)
</script>
```

```vue
<!-- 父组件：@xxx 语法 -->
<Tree @expand="handleExpand" @select="handleSelect" />
<Overflow @visible-change="count => console.log(count)" />
```

**onXxx → defineEmits 命名对照**：

| 源 JSX props 中的字段 | Vapor SFC emit 名称 | 父组件写法        |
| --------------------- | ------------------- | ----------------- |
| `onXxx`               | `xxx`               | `@xxx`            |
| `onKeyDown`           | `keydown`           | `@keydown`        |
| `onVisibleChange`     | `visible-change`    | `@visible-change` |
| `onUpdateChecked`     | `update:checked`    | `@update:checked` |
| `onAfterClose`        | `after-close`       | `@after-close`    |
| `onMouseEnter`        | `mouse-enter`       | `@mouse-enter`    |

**批量迁移检测**：

```bash
# 找子组件 props 中残留的 onXxx
grep -rn "on[A-Z][a-zA-Z]*?" packages/*/src/interface.ts

# 找父组件模板中残留的 :onXxx / :on-xxx
grep -rn ':on[A-Z]\|:on-[a-z]' packages/*/src/*.vue apps/playground/src/demos/
```

**不迁移的边界**：

- **Hook 回调**：`useDrag`、`useResizeObserver`、`useHeights`、`useDiffItem` 等 .ts 文件中的 `options.onXxx` 不变（不是组件 prop，是 hook 内部回调）
- **Context 透传**：不经过 props 的 context 通信不变（如 Collapse 通过 context 传递 `onChange` 给 PanelContent）
- **跨包依赖先改子包**：Portal、Trigger、ResizeObserver 被其他包依赖，需先改造它们，再改造依赖方

**迁移步骤（父子组件对）**：

1. 子组件：加 `const emit = defineEmits<{...}>()`，将 `props.onXxx?.(args)` 改为 `emit('xxx', args)`
2. 父组件模板：`:onXxx` / `:on-xxx="handler"` → `@xxx="handler"`
3. interface.ts：删除 `onXxx?:` 字段
4. index.ts：如果导出相关类型则更新

### 19. `{ ...props }` 展开会丢失事件处理器（Vapor props proxy 不枚举 emit 绑定的 onXxx）

在 Vapor 模式下，props proxy 的 `getOwnPropertyDescriptor` 对 emit 绑定的 `onXxx` 属性返回 `undefined`，导致 `{ ...props }` 展开时静默丢失所有事件处理器（如 `onFocus`、`onBlur`）。

**错误写法**：

```ts
// ❌ vapor 下 onFocus/onBlur 等 emit 绑定的事件会被静默丢弃
const forwardProps = computed(() => ({
  ...props,
  ...attrs,
}))
```

**正确写法**：用 `Reflect.ownKeys` + 显式属性读取：

```ts
// ✅ Reflect.ownKeys 能拿到所有属性名，通过 get trap 显式读取值
const forwardProps = computed(() => {
  const result: Record<string, any> = {}
  for (const key of Reflect.ownKeys(props) as string[]) {
    if (!omitKeyList.includes(key)) {
      result[key] = (props as any)[key]
    }
  }
  return { ...result, ...attrs }
})
```

**根因**：Vue Vapor 编译将 `defineEmits` 的事件处理器挂载到 props proxy 上时不走标准 enumerable 路径，`Object.keys` / `Object.getOwnPropertyDescriptors` / 展开运算符都无法拿到，但通过 `in` 运算符或 `Reflect.ownKeys` 可以。

**适用场景**：任何需要将 props 转发给子组件的中间层组件（如 Select → BaseSelect、DialogWrap → Dialog）。

### 20. Vapor 中 `v-bind` / `:ref` 不触发回调式 ref

在 Vapor 模式下，`:ref="callbackFunction"` 和 `v-bind` 中的回调 ref 不会被自动调用。必须用 `shallowRef` + `watch` 手动触发。

**错误写法**：

```vue
<script>
const setRef = (el) => { /* ... */ }
</script>
<template>
  <!-- ❌ vapor 下 callback ref 不会被调用 -->
  <div :ref="setRef" />
  <!-- 或 v-bind 传递 callback ref -->
  <SelectInput v-bind="{ ref: setRef }" />
</template>
```

**正确写法**：用 `shallowRef` + `watch` 手动调用：

```vue
<script setup vapor lang="ts">
const rootRef = shallowRef<HTMLElement>()
const { setRef } = defineProps<{ setRef?: (el: HTMLElement) => void }>()

watch(
  [rootRef, computed(() => setRef)],
  ([el, cb]) => {
    if (el && cb) cb(el)
  },
  { immediate: true },
)
</script>
<template>
  <div ref="rootRef" />
</template>
```

**适用场景**：所有从父组件接收回调 ref 并需要转发到 DOM 元素的场景（Trigger 组件的 `setRef` 回调是典型用例）。

### 21. Vapor 中 computed `:class` 绑定可能不响应式更新

在 Vapor 模式下，依赖响应式状态的 computed class 绑定（如 focus/open 状态类）可能不会在状态变化时更新。需要用 `watch` + `classList.toggle` 作为兜底。

**不够可靠的写法**：

```vue
<script setup vapor lang="ts">
const nodeCls = computed(() => clsx(prefixCls, { focused, open }))
</script>
<template>
  <!-- ❌ focused/open 变化时类名可能不更新 -->
  <div :class="nodeCls" />
</template>
```

**正确写法**：`:class` 绑定 + `watch` 兜底双重保障：

```vue
<script setup vapor lang="ts">
const rootRef = shallowRef<HTMLElement>()
const nodeCls = computed(() => clsx(prefixCls, { focused, open }))

watch(
  [rootRef, focused, open],
  ([el, f, o]) => {
    if (!el) return
    el.classList.toggle(`${prefixCls.value}-focused`, f)
    el.classList.toggle(`${prefixCls.value}-open`, o)
  },
  { immediate: true },
)
</script>
<template>
  <div ref="rootRef" :class="nodeCls" />
</template>
```

**适用场景**：依赖响应式状态（focus/open/active 等）的动态 CSS 类名。`:class` 用于初始渲染，`watch` 确保后续更新。

### 22. 转发 Trigger 组件的 triggerProps 时必须剥离 `onClick`

当组件通过 mousedown 自行管理弹出层的打开/关闭逻辑，同时又从 Trigger/Popup 组件接收 `triggerProps` 时，必须从 `triggerProps` 中移除 `onClick`，否则会产生双击翻转（double-toggle）问题。

**问题流程**：mousedown 触发打开 → click 事件随后触发 → Trigger 的 onClick 看到 open 已为 true → 立即关闭 → 表现为点一下就关上。

**正确写法**：

```ts
const triggerMergedProps = computed(() => {
  const tp = props.triggerProps || {}
  // 移除 onClick 防止双击翻转
  const { ref: _, onClick: __, ...rest } = tp
  return rest
})
```

**适用场景**：所有自己管理 mousedown 开关逻辑、又使用 Trigger/Popup 组件的场景（Select、Dropdown 等）。

### 23. 弹窗组件的 SSR 安全打开状态

受控/非受控的弹窗打开状态在 SSR 场景下需要额外处理，防止 hydration mismatch。在 `onMounted` 之前强制状态为关闭。

```ts
import { onMounted } from 'vue'

const rendered = shallowRef(false)
onMounted(() => { rendered.value = true })

// ssrSafeOpen：SSR 阶段强制 false，客户端挂载后才使用真实状态
const ssrSafeOpen = computed(() => (rendered.value ? stateOpen.value : false))
```

**适用场景**：所有有 `defaultOpen: true` 的弹窗组件。

---

## 十二、依赖关系速查

### 外部工具包

| 包                                    | 用途                  | 导入路径                              |
| ------------------------------------- | --------------------- | ------------------------------------- |
| `@v-c/util`                           | clsx, omit, pickAttrs | `@v-c/util`                           |
| `@v-c/util/dist/type`                 | Key, VueNode          | `@v-c/util/dist/type`                 |
| `@v-c/util/dist/raf`                  | requestAnimationFrame | `@v-c/util/dist/raf`                  |
| `@v-c/util/dist/omit`                 | 对象属性过滤          | `@v-c/util/dist/omit`                 |
| `@v-c/util/dist/pickAttrs`            | attrs 过滤            | `@v-c/util/dist/pickAttrs`            |
| `@v-c/util/dist/hooks/useMergedState` | 受控/非受控状态       | `@v-c/util/dist/hooks/useMergedState` |
| `@v-c/util/dist/EventInterface`       | ChangeEventHandler 等 | `@v-c/util/dist/EventInterface`       |
| `@v-c/util/dist/KeyCode`              | KeyCode.ENTER 等      | `@v-c/util/dist/KeyCode`              |
| `@v-c/util/dist/Dom/canUseDom`        | SSR 守卫              | `@v-c/util/dist/Dom/canUseDom`        |
| `@v-c/util/dist/Dom/focus`            | triggerFocus          | `@v-c/util/dist/Dom/focus`            |

### 内部组件依赖

| 依赖                               | 用途         | 谁依赖                             |
| ---------------------------------- | ------------ | ---------------------------------- |
| `@vapor-component/portal`          | DOM 传送门   | dialog, drawer, image, listy, tour |
| `@vapor-component/trigger`         | 弹出层定位   | tooltip, tour, select              |
| `@vapor-component/resize-observer` | 元素尺寸监听 | textarea, overflow                 |
| `@vapor-component/virtual-list`    | 虚拟列表     | listy, select                      |

### 简单组件无内部依赖

checkbox, switch, rate, segmented, qrcode 等无需 `workspace:^` 依赖。

---

## 十三、类型检查错误速查

| 错误                                                                        | 原因                                                                                           | 修复                                                                            |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `TS2783: 'x' is specified more than once`                                   | prop 在 v-bind 展开和显式声明中重复                                                            | 分开声明或移除重复                                                              |
| `Type 'number \| 0' is not assignable to type 'boolean'`                    | `x && y` 推断为联合类型                                                                        | 显式标注 `computed<boolean>` 或改 `> 0`                                         |
| `TS6133: declared but never read`                                           | 未使用变量                                                                                     | 删除                                                                            |
| `Cannot find module '@vapor-component/x'`                                   | playground 未添加依赖                                                                          | 在 `apps/playground/package.json` 添加                                          |
| `has no exported member 'X'`                                                | SFC 用 default import                                                                          | `import X from './X.vue'`                                                       |
| `Property 'value' does not exist`                                           | inject 返回 ComputedRef                                                                        | `computed(() => ref?.value)`                                                    |
| `TS2322: Type 'string' is not assignable to type 'boolean'`                 | v-for + key 位置错误                                                                           | key 放在内部组件上                                                              |
| `TS2345: Argument of type '{...}' is not assignable`                        | v-bind 展开类型不匹配                                                                          | 显式声明 props 或用 getter 对象                                                 |
| 默认值不生效 / `??` 回退被跳过                                              | 布尔 prop 被 vapor 强制转为 `false`                                                            | `??` 改为 `                                                                     |     | `，或去除 prop 类型中的 `false` 分支 |
| `TypeError: Failed to set an indexed property [0] on 'CSSStyleDeclaration'` | `...attrs.style` 展开引入非样式 key 或数字 key，`patchStyle` 设置到 CSSStyleDeclaration 时崩溃 | `attrs.style` 用 `for...in` 手动拷贝；`restAttrs` 排除 `style`；详见规则 17     |
| 子组件收不到父组件更新的 props 值（如 Dialog 无法弹出）                     | 模板中 `v-bind="omit(props, ...)"` 返回普通对象快照，vapor 不响应式更新                        | 改为 `v-bind="props"` 或用 `computed(() => omit(props, ...))` 包装；详见规则 16 |
| 事件不触发（`:onXxx` 写了但没反应）                                         | `onXxx` 定义在 props 中但 vapor 下父子组件间事件应走 `defineEmits`                             | 子组件加 `defineEmits` + `emit()`；父组件 `:onXxx` → `@xxx`；详见规则 18        |
| `TS2322: Type '(...) => void' is not assignable to type 'X'`                | `:onXxx` 类型不匹配，props 中的 `onXxx` 与父组件传递的函数签名不一致                           | 删除 props 中的 `onXxx`，改用 `defineEmits` 声明事件                            |

---

## 十四、参考清单

### 源项目（@v-c/\*）

- `@v-c/overflow` — jsx 版 overflow 实现
- `@v-c/resize-observer` — jsx 版 resize-observer
- `@v-c/util` — 通用工具库

### 已迁移组件（@vapor-component/\*）

| 包              | 模式                      | 特点                                                                                             |
| --------------- | ------------------------- | ------------------------------------------------------------------------------------------------ |
| switch          | 简单 UI                   | defineEmits 用法                                                                                 |
| checkbox        | 简单 UI                   | useTemplateRef                                                                                   |
| rate            | 简单 UI                   | useRefs hook                                                                                     |
| segmented       | 简单 UI                   | 无内部依赖                                                                                       |
| qrcode          | 简单 UI                   | useQRCode hook                                                                                   |
| input           | 表单组件                  | useCount hook                                                                                    |
| input-number    | 表单组件                  | useCursor, useFrame                                                                              |
| textarea        | 表单组件                  | resize-observer 依赖；`attrs.style` 必须 `for...in` 拷贝（规则 17）                              |
| collapse        | 父子组件                  | SemanticName, mergeSemantic                                                                      |
| dialog          | Portal 组件               | RefContext, animatedVisible；`omit(props, ...)` 快照不响应式更新（规则 16）                      |
| drawer          | Portal 组件               | useDrag, useFocusable, 双 context                                                                |
| image           | Portal 组件               | PreviewGroup, useRegisterImage                                                                   |
| portal          | 基础设施                  | useScrollLocker, useEscKeyDown                                                                   |
| resize-observer | Observer                  | Collection 子组件, 双导出                                                                        |
| mutate-observer | Observer                  | useMutateObserver hook                                                                           |
| overflow        | 父子 + Context Provider   | useEffectState batcher；`attrs.style` 必须 `for...in` 拷贝（规则 17）                            |
| tour            | Portal + Trigger 组合     | useTarget hook, 布尔 prop 强制转换坑                                                             |
| listy           | Portal + VirtualList 组合 | slot 转发模式（`#default="slotProps"` 中转）、Portal `:open="true"` 必传、`onVisibleChange` 回调 |
| select          | Trigger + VirtualList 组合 + 多层 context | `{...props}` 展开丢事件（规则 19）；回调 ref 不触发（规则 20）；computed class 不更新（规则 21）；triggerProps 剥离 onClick（规则 22）；SSR 安全打开状态（规则 23）；useOptions 双数据源；useOpen MessageChannel macroTask |

### 工程文件参考

- `packages/collapse/package.json` — 标准 package.json 模板
- `packages/collapse/tsconfig.json` — 标准 tsconfig 模板
- `packages/collapse/src/index.ts` — Pattern B 导出示例
- `packages/overflow/src/index.ts` — Pattern C 导出示例
- `packages/switch/src/index.ts` — Pattern A 导出示例
- `apps/playground/package.json` — playground 依赖注册
