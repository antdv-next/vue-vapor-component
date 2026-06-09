# vue-vapor-component

vapor mode headless component.

## 目录结构

```three
apps
  |- playground
packages
  |- module-a
  |- module-b
```

1. apps + packages 是一种项目组织的最佳实践，意图清晰：apps 是最终要部署的，packages 是基础设施
2. 分工明确：pnpm 依赖管理，vite plus(tasks、cache) 任务编排与缓存

## 依赖环境与使用说明

- vue > 3.6.x
- pnpm
- vite-plus

<details>
<summary>单一使用（vapor）</summary><br>

vue项目需要在main.ts里引入`createVaporApp`来替换`createApp`

```diff
-- import { createApp } from 'vue'
++ import { createVaporApp } from 'vue'
import App from './App.vue'
-- createApp(App).mount('#app')
++ createVaporApp(App).mount('#app')
```

vapor component 需要在 script 标签中加上vapor

```diff
-- <script setup lang='ts'>
++ <script setup vapor lang='ts'>
```

<br></details>

<details>
<summary>混合使用（vapor + vdom）</summary><br>

使用virtualDom的vue项目想使用vapor组件需要在main.ts里引入`vaporInteropPlugin`

```diff
-- import { createApp } from 'vue'
++ import { createApp, vaporInteropPlugin } from 'vue'
import App from './App.vue'

-- createApp(App).mount('#app')
++ createApp(App).use(vaporInteropPlugin).mount('#app')
```

单一 vaporMode 如果要混合使用 virtualDom 组件则也需要引入`vaporInteropPlugin`，会拉取vdom runtime，抵消掉vapor带来的大幅缩小捆绑包的优势

```diff
-- createVaporApp(App).mount('#app')
++ createVaporApp(App).use(vaporInteropPlugin).mount('#app')
```

<br></details>

## 组件完成进度

- ✅ 已实现
- 🚀 已验证，与vc、rc表现一致
- ⭐️ 可复用vc的npm包，无需重复实现
- ⭕ 未开始
- 🪒 进行中
- ❌ 不实现

| 组件            | 状态 | 验证 | 备注                        |
| --------------- | ---- | ---- | --------------------------- |
| async-validator | ❌   | 🚀   | ⭐️                          |
| cascader        | ⭕   |      |                             |
| checkbox        | ✅   |      |                             |
| collapse        | ✅   |      |                             |
| color-picker    | ⭕   |      |                             |
| dialog          | ⭕   |      |                             |
| drawer          | ⭕   |      |                             |
| dropdown        | ⭕   |      |                             |
| fast-color      | ❌   | 🚀   | ⭐️                          |
| field-form      | ⭕   |      |                             |
| image           | ✅   |      |                             |
| input           | ✅   |      |                             |
| input-number    | ✅   |      |                             |
| listy           | ⭕   |      |                             |
| mentions        | ⭕   |      |                             |
| menu            | ⭕   |      |                             |
| mini-decimal    | ❌   | 🚀   | ⭐️                          |
| mutate-observer | ✅   |      |                             |
| notification    | ⭕   |      |                             |
| overflow        | ⭕   |      |                             |
| pagination      | ⭕   |      |                             |
| picker          | ⭕   |      |                             |
| portal          | ✅   |      |                             |
| progress        | ⭕   |      |                             |
| qrcode          | ✅   |      |                             |
| rate            | ✅   |      |                             |
| resize-observer | ✅   |      |                             |
| segmented       | ✅   |      |                             |
| select          | ⭕   |      |                             |
| slick           | ⭕   |      |                             |
| slider          | ⭕   |      |                             |
| steps           | ⭕   |      |                             |
| switch          | ✅   |      |                             |
| table           | ⭕   |      |                             |
| tabs            | ⭕   |      |                             |
| textarea        | ✅   |      |                             |
| tooltip         | ⭕   |      |                             |
| tour            | ⭕   |      |                             |
| tree            | ⭕   |      |                             |
| tree-select     | ⭕   |      |                             |
| trigger         | ⭕   |      |                             |
| upload          | ⭕   |      |                             |
| util            | ❌   | 🚀   | ⭐️部分涉及VDom的需兼容vapor |
| virtual-list    | ⭕   |      |                             |
