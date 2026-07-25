# Playground 路由化改造方案

## 一、现状与问题

```
当前架构：
  ┌──────────────────────────────────┐
  │  #app (vdom + vaporInteropPlugin)  │  #vapor (createVaporApp, 纯 vapor)
  │  App.vue — 所有 20+ 组件 demo    │  VaporApp.vue — 同上，几乎一模一样
  │  一个文件 600+ 行，状态/模板混在一起                          │
  └──────────────────────────────────┘
```

**核心痛点：**

1. App.vue 与 VaporApp.vue 内容 99% 重复，维护成本双倍
2. 所有组件 demo 堆在一个大文件里，调试单个组件要滚动全屏
3. 没有导航，组件增多后找不到对应 demo
4. 每个组件目前只有一个 demo，后续一个组件会有多个案例，当前结构不支持

## 二、设计目标

- 左侧导航栏按组件分组，组内列出该组件的所有案例，点击切换
- 每个路由只加载对应组件对应案例的 demo（按需懒加载）
- 右侧依然保留 vdom / vapor 双列对比，方便发现 vapor 模式差异
- demo 组件拆成独立文件，一个案例一个文件，组件目录支持随时新增案例
- 状态逻辑尽量抽取共享，避免 App 与 VaporApp 重复

## 三、核心概念：Component + Case

路由的最小单位不是"组件"，而是 **"组件 + 案例"** 的组合：

```
一个组件 (component) → 包含一个或多个案例 (case)
  steps         → basic, nav, progress
  checkbox      → basic（只有一个）
  input         → basic, slot
  image         → basic, preview-group, custom-action
```

路由结构：`/<component>/<case>`

当前单案例的组件，文件名用 `basic.vue` 约定，路由 `/<component>` 自动重定向到 `/<component>/basic`。

## 四、关键架构决策

### 决策 1：保留双 App 实例，不合并

**原因：** 这是本项目的核心验证场景——vdom 与 vapor 的对比。

- `createApp` (vdom + vaporInteropPlugin) → 验证 vapor 组件能否在 vdom 宿主中正常工作
- `createVaporApp` (纯 vapor) → 验证组件在原生 vapor 模式下的行为

**方案：** 双 App 实例通过**共享状态**保持路由同步，而非合并成一个 App。

```
main.ts
  ├── createApp(RouterApp)       → 挂载 #app, 使用 vue-router 导航
  │     └── <NavSidebar /> + <RouterView />   (vdom 渲染)
  │
  ├── createVaporApp(VaporHost)  → 挂载 #vapor, 纯 vapor 渲染
  │     └── 监听 shared.currentComponent + shared.currentCase, 条件渲染
  │
  └── reactive state (shared)    → currentComponent / currentCase 两个 App 共享
```

### 决策 2：vue-router 只用于 vdom 侧

纯 vapor 侧不使用 vue-router（vapor 模式下 router 兼容性待验证），而是通过**响应式状态**同步路由：

```ts
// shared.ts
import { ref } from 'vue'

export const currentComponent = ref('steps') // 组件名
export const currentCase = ref('basic') // 案例名
```

- vdom 侧：`vue-router` 管理路由，router 变化时写入 `currentComponent.value` + `currentCase.value`
- vapor 侧：两个状态变化时，通过 `v-if` 条件渲染对应 demo（vapor 支持 `v-if`）

### 决策 3：demo 组件分两层

```
vdom 侧 (vue-router, SFC):
  demos/vdom/steps/basic.vue
  demos/vdom/steps/nav.vue
  demos/vdom/checkbox/basic.vue
  ...

vapor 侧 (v-if 条件渲染, SFC with vapor):
  demos/vapor/steps/basic.vue
  demos/vapor/steps/nav.vue
  demos/vapor/checkbox/basic.vue
  ...
```

**为什么分两层？**

- vdom 侧组件可以用普通 `<script setup>`，享受 vue-router 动态加载
- vapor 侧组件需要 `<script setup vapor>`，且不能通过 router 动态加载（vapor 编译要求）
- 两套 demo 的实现细节可能不同（如 vapor 侧不能用 `h()` 渲染 vdom vnode）

### 决策 4：共享状态逻辑提取为 composables

App.vue 与 VaporApp.vue 中大量重复的 `ref` / `computed` / 回调函数，
提取到 `demos/<component>/use<Name>State.ts`：

```ts
// demos/steps/useStepsState.ts
export function useStepsState() {
  const items = ref([
    { title: '已完成', description: 1, status: 'wait' },
    // ...
  ])
  return { items }
}
```

**注意：** composable 放在 `demos/<component>/` 下（不分 vdom/vapor），两则共用同一个状态文件。
如果某个案例有自己特有的状态，可以单独放 `demos/<component>/<case>.state.ts`。

### 决策 5：导航元数据集中定义

所有组件及其案例的映射关系在 `routes.ts` 中集中声明，导航栏和路由配置共用同一份数据：

```ts
// routes.ts
export const demoManifest: {
  component: string // 组件名, 对应目录名
  label: string // 显示名称
  cases: { name: string; label: string }[] // 该组件的案例列表
}[] = [
  {
    component: 'steps',
    label: 'Steps',
    cases: [{ name: 'basic', label: 'Basic' }],
    // 未来扩展:
    // cases: [
    //   { name: 'basic', label: 'Basic' },
    //   { name: 'nav',   label: 'Nav' },
    //   { name: 'progress', label: 'Progress' },
    // ],
  },
  {
    component: 'checkbox',
    label: 'Checkbox',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'input',
    label: 'Input',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  // ...
]
```

**好处：**

- 导航栏直接渲染 `demoManifest`，不需要手动维护菜单
- 路由表由 `demoManifest` 自动生成，避免重复
- 新增组件/案例只需在 manifest 中加一条 + 创建对应 `.vue` 文件

## 五、目标目录结构

```
apps/playground/src/
├── main.ts                          # 双 App 挂载
├── shared.ts                        # currentComponent / currentCase 共享状态
├── routes.ts                        # demoManifest + 路由表生成
├── RouterApp.vue                    # vdom 侧根组件
│   ├── NavSidebar.vue               # 左侧导航栏 (基于 demoManifest 渲染)
│   └── demos/vdom/                  # vdom 侧 demo (普通 SFC)
│       ├── steps/
│       │   ├── useStepsState.ts     # 共享状态 (vdom/vapor 共用)
│       │   ├── basic.vue            # <script setup>
│       │   └── nav.vue              # (未来)
│       ├── checkbox/
│       │   ├── useCheckboxState.ts
│       │   └── basic.vue
│       ├── switch/
│       │   ├── useSwitchState.ts
│       │   └── basic.vue
│       ├── input/
│       │   ├── useInputState.ts
│       │   └── basic.vue
│       ├── input-number/
│       │   ├── useInputNumberState.ts
│       │   └── basic.vue
│       ├── textarea/
│       │   ├── useTextAreaState.ts
│       │   └── basic.vue
│       ├── rate/
│       │   ├── useRateState.ts
│       │   └── basic.vue
│       ├── segmented/
│       │   ├── useSegmentedState.ts
│       │   └── basic.vue
│       ├── progress/
│       │   ├── useProgressState.ts
│       │   └── basic.vue
│       ├── pagination/
│       │   ├── usePaginationState.ts
│       │   └── basic.vue
│       ├── qrcode/
│       │   ├── useQRCodeState.ts
│       │   └── basic.vue
│       ├── image/
│       │   ├── useImageState.ts
│       │   └── basic.vue
│       ├── collapse/
│       │   ├── useCollapseState.ts
│       │   └── basic.vue
│       ├── dialog/
│       │   ├── useDialogState.ts
│       │   └── basic.vue
│       ├── drawer/
│       │   ├── useDrawerState.ts
│       │   └── basic.vue
│       ├── overflow/
│       │   ├── useOverflowState.ts
│       │   └── basic.vue
│       ├── portal/
│       │   ├── usePortalState.ts
│       │   └── basic.vue
│       ├── resize-observer/
│       │   ├── useResizeObserverState.ts
│       │   └── basic.vue
│       └── mutate-observer/
│           ├── useMutateObserverState.ts
│           └── basic.vue
│
├── VaporHost.vue                    # vapor 侧根组件
│   └── demos/vapor/                 # vapor 侧 demo (vapor SFC)
│       ├── steps/
│       │   └── basic.vue            # <script setup vapor>
│       │   └── nav.vue              # (未来)
│       ├── checkbox/
│       │   └── basic.vue
│       └── ... (与 vdom 侧一一对应)
│
└── styles/                          # Less 样式文件 (保持不变)
    ├── steps.less
    ├── checkbox.less
    └── ...
```

**说明：**

- 样式 `.less` 文件不动，由各自的 demo 组件按需 `import`
- `use<Name>State.ts` 放在 `demos/vdom/<component>/` 下（也可以放在独立的 `demos/shared/` 下，视团队偏好）
- `components/demo/demo.vue`（空文件）删除

## 六、路由配置

### 6.1 demoManifest → 自动生成路由

```ts
// routes.ts

import type { RouteRecordRaw } from 'vue-router'

export const demoManifest: {
  component: string
  label: string
  cases: { name: string; label: string }[]
}[] = [
  {
    component: 'steps',
    label: 'Steps',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'checkbox',
    label: 'Checkbox',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'switch',
    label: 'Switch',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'input',
    label: 'Input',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'input-number',
    label: 'InputNumber',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'textarea',
    label: 'TextArea',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'rate',
    label: 'Rate',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'segmented',
    label: 'Segmented',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'progress',
    label: 'Progress',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'pagination',
    label: 'Pagination',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'qrcode',
    label: 'QRCode',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'image',
    label: 'Image',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'collapse',
    label: 'Collapse',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'dialog',
    label: 'Dialog',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'drawer',
    label: 'Drawer',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'overflow',
    label: 'Overflow',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'portal',
    label: 'Portal',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'resize-observer',
    label: 'ResizeObserver',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'mutate-observer',
    label: 'MutateObserver',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
]

// 自动生成路由表: /<component>/<case>
export const routes: RouteRecordRaw[] = demoManifest.flatMap(
  ({ component, cases }) =>
    cases.map(caseItem => ({
      path: `/${component}/${caseItem.name}`,
      component: () => import(`./demos/vdom/${component}/${caseItem.name}.vue`),
    })),
)

// 单案例组件: /<component> 重定向到 /<component>/basic
const singleCaseRedirects = demoManifest
  .filter(item => item.cases.length === 1)
  .map(item => ({
    path: `/${item.component}`,
    redirect: `/${item.component}/${item.cases[0].name}`,
  })) as RouteRecordRaw[]

export const allRoutes = [
  { path: '/', redirect: '/steps/basic' },
  ...routes,
  ...singleCaseRedirects,
]
```

- 使用 `createWebHashHistory('/vue-vapor-component/')`（兼容 GitHub Pages base 部署）
- 所有 demo 路由使用懒加载 `() => import()`，初始 bundle 最小

### 6.2 添加新组件的完整流程

**场景：给 checkbox 新增一个 `group` 案例**

```ts
// routes.ts — demoManifest 中 checkbox 的 cases 增加一项:
{
  component: 'checkbox',
  label: 'Checkbox',
  cases: [
    { name: 'basic', label: 'Basic' },
    { name: 'group', label: 'Group' },  // ← 新增
  ],
}
```

```
demos/vdom/checkbox/group.vue    ← 创建（普通 SFC）
demos/vapor/checkbox/group.vue   ← 创建（vapor SFC）
```

无需改动 router 配置、无需改动导航栏代码——manifest 是唯一数据源。

### 6.3 添加新组件的完整流程

**场景：新增 `notification` 组件**

```ts
// routes.ts — demoManifest 末尾追加:
{
  component: 'notification',
  label: 'Notification',
  cases: [{ name: 'basic', label: 'Basic' }],
}
```

```
demos/vdom/notification/useNotificationState.ts
demos/vdom/notification/basic.vue
demos/vapor/notification/basic.vue
```

同样无需改动 router 配置和导航栏代码。

## 七、核心文件伪代码

### shared.ts

```ts
import { ref } from 'vue'

export const currentComponent = ref('steps')
export const currentCase = ref('basic')
```

### main.ts（改造后）

```ts
import { createApp, createVaporApp, vaporInteropPlugin } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'

import RouterApp from './RouterApp.vue'
import VaporHost from './VaporHost.vue'
import { currentComponent, currentCase } from './shared'
import { allRoutes } from './routes'

// ---- vdom 侧：vue-router 驱动 ----
const router = createRouter({
  history: createWebHashHistory('/vue-vapor-component/'),
  routes: allRoutes,
})
router.afterEach(to => {
  // 从 /steps/basic 解析出 component='steps', case='basic'
  const [, component, caseName] = to.path.split('/')
  if (component) {
    currentComponent.value = component
    currentCase.value = caseName
  }
})

createApp(RouterApp).use(vaporInteropPlugin).use(router).mount('#app')

// ---- vapor 侧：监听 shared state ----
createVaporApp(VaporHost).mount('#vapor')
```

### RouterApp.vue（vdom 侧根）

```vue
<script setup lang="ts">
  import NavSidebar from './NavSidebar.vue'
</script>

<template>
  <div class="router-app">
    <aside class="nav-sidebar"><NavSidebar /></aside>
    <main class="demo-area"><router-view /></main>
  </div>
</template>

<style scoped>
  .router-app {
    display: flex;
    height: 100vh;
  }
  .nav-sidebar {
    width: 220px;
    border-right: 1px solid #eee;
    overflow-y: auto;
  }
  .demo-area {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
  }
</style>
```

### NavSidebar.vue

```vue
<script setup lang="ts">
  import { demoManifest } from '../routes'
  import { currentComponent, currentCase } from '../shared'
  import { useRouter } from 'vue-router'

  const router = useRouter()

  function navigate(component: string, caseName: string) {
    router.push(`/${component}/${caseName}`)
  }
</script>

<template>
  <div class="nav">
    <h3>Playground</h3>
    <div v-for="group in demoManifest" :key="group.component" class="nav-group">
      <div class="nav-group-title">{{ group.label }}</div>
      <div
        v-for="caseItem in group.cases"
        :key="caseItem.name"
        class="nav-item"
        :class="{
          active:
            currentComponent === group.component &&
            currentCase === caseItem.name,
        }"
        @click="navigate(group.component, caseItem.name)"
      >
        {{ caseItem.label }}
      </div>
    </div>
  </div>
</template>
```

### VaporHost.vue（vapor 侧根）

```vue
<script setup vapor lang="ts">
  import { currentComponent, currentCase } from '../shared'

  // 所有 vapor demo 静态 import（vapor 编译时就必须知道所有组件）
  import StepsBasic from './demos/vapor/steps/basic.vue'
  import CheckboxBasic from './demos/vapor/checkbox/basic.vue'
  import SwitchBasic from './demos/vapor/switch/basic.vue'
  import InputBasic from './demos/vapor/input/basic.vue'
  import InputNumberBasic from './demos/vapor/input-number/basic.vue'
  import TextAreaBasic from './demos/vapor/textarea/basic.vue'
  import RateBasic from './demos/vapor/rate/basic.vue'
  import SegmentedBasic from './demos/vapor/segmented/basic.vue'
  import ProgressBasic from './demos/vapor/progress/basic.vue'
  import PaginationBasic from './demos/vapor/pagination/basic.vue'
  import QRCodeBasic from './demos/vapor/qrcode/basic.vue'
  import ImageBasic from './demos/vapor/image/basic.vue'
  import CollapseBasic from './demos/vapor/collapse/basic.vue'
  import DialogBasic from './demos/vapor/dialog/basic.vue'
  import DrawerBasic from './demos/vapor/drawer/basic.vue'
  import OverflowBasic from './demos/vapor/overflow/basic.vue'
  import PortalBasic from './demos/vapor/portal/basic.vue'
  import ResizeObserverBasic from './demos/vapor/resize-observer/basic.vue'
  import MutateObserverBasic from './demos/vapor/mutate-observer/basic.vue'
</script>

<template>
  <fieldset class="vapor-host">
    <legend>vapor mode — {{ currentComponent }}/{{ currentCase }}</legend>

    <StepsBasic
      v-if="currentComponent === 'steps' && currentCase === 'basic'"
    />
    <CheckboxBasic
      v-if="currentComponent === 'checkbox' && currentCase === 'basic'"
    />
    <SwitchBasic
      v-if="currentComponent === 'switch' && currentCase === 'basic'"
    />
    <!-- ... 其他组件同理 ... -->
  </fieldset>
</template>
```

> ⚠️ vapor 侧用 `v-if` 而非 router：vapor 模式对动态组件/异步路由的支持有限制，
> `v-if` 条件渲染是最稳妥的方案。所有 demo 需静态 import，新增案例时同步在此加 import + v-if。

### demos/vdom/steps/basic.vue（示例）

```vue
<script setup lang="ts">
  import Steps from '@vapor-component/steps'
  import { useStepsState } from './useStepsState'
  import '../../../styles/steps.less'

  const { items } = useStepsState()
</script>

<template>
  <label>
    Steps:
    <Steps :current="1" :items="items">
      <template #iconRender="{ index, icon }">
        <component :is="icon">{{ index }}</component>
      </template>
    </Steps>
  </label>
</template>
```

### demos/vapor/steps/basic.vue（示例）

```vue
<script setup vapor lang="ts">
  import Steps from '@vapor-component/steps'
  import { useStepsState } from '../vdom/steps/useStepsState'
  import '../../../../styles/steps.less'

  const { items } = useStepsState()
</script>

<template>
  <label>
    Steps:
    <Steps :current="1" :items="items">
      <template #iconRender="{ index, icon }">
        <component :is="icon">{{ index }}</component>
      </template>
    </Steps>
  </label>
</template>
```

## 八、改造步骤（建议顺序）

| 步骤 | 内容                                    | 说明                                                             |
| ---- | --------------------------------------- | ---------------------------------------------------------------- |
| 1    | 安装 `vue-router`                       | `vp add -D vue-router`                                           |
| 2    | 创建 `shared.ts`                        | `currentComponent` + `currentCase` 响应式状态                    |
| 3    | 创建 `routes.ts`                        | `demoManifest` + 自动生成 `allRoutes`                            |
| 4    | 抽取 composables                        | `demos/vdom/<component>/use<Name>State.ts`                       |
| 5    | 拆分 vdom demo                          | `demos/vdom/<component>/<case>.vue`（从 App.vue 逐一剪切）       |
| 6    | 拆分 vapor demo                         | `demos/vapor/<component>/<case>.vue`（从 VaporApp.vue 逐一剪切） |
| 7    | 创建 `RouterApp.vue` + `NavSidebar.vue` | vdom 侧路由框架 + 导航栏                                         |
| 8    | 创建 `VaporHost.vue`                    | vapor 侧 `v-if` 条件渲染                                         |
| 9    | 改造 `main.ts`                          | 双 App + 路由同步                                                |
| 10   | 更新 `index.html` 样式                  | flex 侧边栏布局                                                  |
| 11   | 删除旧文件                              | `App.vue`、`VaporApp.vue`、空 `demo.vue`                         |
| 12   | 启动 `vp dev` 验证                      | 所有组件在两个模式下回归测试                                     |

## 九、样式处理

- 每个 demo 组件自行 `import` 对应的 `.less` 文件（如 `steps/basic.vue` import `steps.less`）
- 样式文件位置不变（`styles/` 目录），仅引用路径随文件移动而调整
- 公共样式（如 `drawer-common.less`、`drawer-motion.less`）由 drawer demo 统一引入

## 十、注意事项

1. **vapor 侧不能动态 import 组件**：vapor 编译时就需要知道所有组件，必须全部静态 import，用 `v-if` 控制显示。新增案例时同步更新 `VaporHost.vue`
2. **`h()` vnode 问题**：vapor 侧 demo 中如果有 `h()` 渲染的 icon（如 Image 的 `defaultIcons`），需要用 plain string / DOM 替代，纯 vapor 模式不渲染 vdom vnode
3. **boolean prop 默认值**：vapor 模式下 boolean prop 会被 cast 为 `false`，`??` 默认值回退会失效，demo 中注意显式传值
4. **GitHub Pages base path**：使用 `createWebHashHistory('/vue-vapor-component/')` 确保 hash 路由在 base 路径下正确工作
5. **manifest 是唯一数据源**：导航栏、路由表都从 `demoManifest` 生成，新增组件/案例只需改 manifest + 创建文件，不碰 router/nav 代码
6. **composable 共享**：`use<Name>State.ts` 放 `demos/vdom/<component>/` 下，vapor demo 跨目录引用 `../vdom/<component>/use<Name>State`
