# jsx-to-vapor-sfc

## 概述

将 jsx（`@v-c/*`，基于 `defineComponent + render function`）迁移到 vue vapor SFC 格式的工程化 skill。基于 15 个已迁移组件（collapse, dialog, drawer, switch, checkbox, input, input-number, textarea, rate, segmented, image, qrcode, portal, resize-observer, overflow）的通用模式提炼而成。

## 触发条件

当需要把 `@v-c/*`（或任何 jsx render function 组件）迁移到 vue vapor SFC 时，加载此 skill。

---

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
  "devDependencies": {
    "vite": "catalog:",
    "vite-plus": "catalog:"
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

```ts
import type {
  ChangeEventHandler,
  FocusEventHandler,
  KeyboardEventHandler,
} from '@v-c/util/dist/EventInterface'

interface SwitchProps {
  onChange?: ChangeEventHandler
  onFocus?: FocusEventHandler
  onKeyDown?: KeyboardEventHandler
}
```

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

| Prop                  | 类型                                           | 说明                             |
| --------------------- | ---------------------------------------------- | -------------------------------- |
| `prefixCls`           | `string?`                                      | CSS 类名前缀，默认 `vc-{name}`   |
| `className` / `class` | `string?`                                      | 自定义类名（部分组件保留）       |
| `style`               | `CSSProperties?`                               | 自定义样式                       |
| `classNames`          | `Partial<Record<SemanticName, string>>`        | 语义化类名映射                   |
| `styles`              | `Partial<Record<SemanticName, CSSProperties>>` | 语义化样式映射                   |
| `disabled`            | `boolean?`                                     | 禁用状态                         |
| `on*`                 | `EventHandler?`                                | 事件回调（onChange, onFocus 等） |

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

**仅当值是 Component 构造函数或 `<component>` 才用 `:is`**：

```vue
<!-- 渲染自定义组件（来自 renderItem 函数） -->
<component :is="props.renderRawItem(item, idx)" />
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

```vue
<component
  :is="props.component ?? 'div'"
  :class="nodeCls"
  :style="nodeStyle"
  v-bind="restAttrs"
>
  <slot />
</component>
```

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

`<template v-for>` 不加 `:key`，内部组件加 `:key`。

### 6. 静态属性挂载

在 `index.ts` 中挂载子组件/常量到主组件静态属性上。

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

| 依赖                               | 用途         | 谁依赖                |
| ---------------------------------- | ------------ | --------------------- |
| `@vapor-component/portal`          | DOM 传送门   | dialog, drawer, image |
| `@vapor-component/resize-observer` | 元素尺寸监听 | textarea, overflow    |

### 简单组件无内部依赖

checkbox, switch, rate, segmented, qrcode 等无需 `workspace:^` 依赖。

---

## 十三、类型检查错误速查

| 错误                                                        | 原因                                | 修复                                    |
| ----------------------------------------------------------- | ----------------------------------- | --------------------------------------- |
| `TS2783: 'x' is specified more than once`                   | prop 在 v-bind 展开和显式声明中重复 | 分开声明或移除重复                      |
| `Type 'number \| 0' is not assignable to type 'boolean'`    | `x && y` 推断为联合类型             | 显式标注 `computed<boolean>` 或改 `> 0` |
| `TS6133: declared but never read`                           | 未使用变量                          | 删除                                    |
| `Cannot find module '@vapor-component/x'`                   | playground 未添加依赖               | 在 `apps/playground/package.json` 添加  |
| `has no exported member 'X'`                                | SFC 用 default import               | `import X from './X.vue'`               |
| `Property 'value' does not exist`                           | inject 返回 ComputedRef             | `computed(() => ref?.value)`            |
| `TS2322: Type 'string' is not assignable to type 'boolean'` | v-for + key 位置错误                | key 放在内部组件上                      |
| `TS2345: Argument of type '{...}' is not assignable`        | v-bind 展开类型不匹配               | 显式声明 props 或用 getter 对象         |

---

## 十四、参考清单

### 源项目（@v-c/\*）

- `@v-c/overflow` — jsx 版 overflow 实现
- `@v-c/resize-observer` — jsx 版 resize-observer
- `@v-c/util` — 通用工具库

### 已迁移组件（@vapor-component/\*）

| 包              | 模式                    | 特点                                    |
| --------------- | ----------------------- | --------------------------------------- |
| switch          | 简单 UI                 | defineEmits 用法                        |
| checkbox        | 简单 UI                 | useTemplateRef                          |
| rate            | 简单 UI                 | useRefs hook                            |
| segmented       | 简单 UI                 | 无内部依赖                              |
| qrcode          | 简单 UI                 | useQRCode hook                          |
| input           | 表单组件                | useCount hook                           |
| input-number    | 表单组件                | useCursor, useFrame                     |
| textarea        | 表单组件                | resize-observer 依赖                    |
| collapse        | 父子组件                | SemanticName, mergeSemantic             |
| dialog          | Portal 组件             | RefContext, animatedVisible             |
| drawer          | Portal 组件             | useDrag, useFocusable, 双 context       |
| image           | Portal 组件             | PreviewGroup, useRegisterImage          |
| portal          | 基础设施                | useScrollLocker, useEscKeyDown          |
| resize-observer | Observer                | Collection 子组件, 双导出               |
| mutate-observer | Observer                | useMutateObserver hook                  |
| overflow        | 父子 + Context Provider | useEffectState batcher, v-for v-if 共存 |

### 工程文件参考

- `packages/collapse/package.json` — 标准 package.json 模板
- `packages/collapse/tsconfig.json` — 标准 tsconfig 模板
- `packages/collapse/src/index.ts` — Pattern B 导出示例
- `packages/overflow/src/index.ts` — Pattern C 导出示例
- `packages/switch/src/index.ts` — Pattern A 导出示例
- `apps/playground/package.json` — playground 依赖注册
