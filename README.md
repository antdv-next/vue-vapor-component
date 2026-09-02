# vue-vapor-component

蒸汽模式无头组件

[English](./README.en-US.md) · 中文

> [!WARNING]  
> 本项目不是 `antdv-next` 适配 `vapor` 的最终方案，只是前期探索的个人尝试，但即使该方案最终未被采纳，也会维持开源协议，作为 SFC 形式且兼容 vapor 的 headless component 来说，仍有实现意义

## 目录结构

```
apps
  |- playground
packages
  |- module-a
  |- module-b
```

1. apps + packages 是一种项目组织的最佳实践，意图清晰：apps 是最终要部署的，packages 是基础设施
2. 分工明确：pnpm 依赖管理，vite-plus (tasks、cache) 任务编排与缓存

## 依赖环境与使用说明

- vue > 3.6.x
- pnpm
- vite-plus

<details>
<summary>单一使用（vapor）</summary><br>

vue 项目需要在 `main.ts` 里引入 `createVaporApp` 来替换 `createApp`

```diff
-- import { createApp } from 'vue'
++ import { createVaporApp } from 'vue'
import App from './App.vue'
-- createApp(App).mount('#app')
++ createVaporApp(App).mount('#app')
```

vapor 组件需要在 `script` 或 `template` 标签中加上 `vapor`

```diff
-- <script setup lang='ts'>
++ <script setup vapor lang='ts'>

// or
-- <template>
++ <template vapor>
```

<br></details>

<details>
<summary>混合使用（vapor + vdom）</summary><br>

使用 virtualDom 的 vue 项目想使用 vapor 组件需要在 `main.ts` 里引入 `vaporInteropPlugin`

```diff
-- import { createApp } from 'vue'
++ import { createApp, vaporInteropPlugin } from 'vue'
import App from './App.vue'

-- createApp(App).mount('#app')
++ createApp(App).use(vaporInteropPlugin).mount('#app')
```

单一 vaporMode 如果要混合使用 virtualDom 组件也需要引入 `vaporInteropPlugin`，会拉取 vdom runtime，抵消掉 vapor 带来的大幅缩小捆绑包的优势

```diff
-- createVaporApp(App).mount('#app')
++ createVaporApp(App).use(vaporInteropPlugin).mount('#app')
```

<br></details>

## 组件完成进度

- ✅ 已实现
- 🚀 已验证，与 vc、rc 表现一致
- ⭐️ 可复用 vc 的 npm 包，无需重复实现
- ⭕ 未开始
- 🪒 进行中

| 组件            | 状态 | 验证 | 备注                                |
| --------------- | ---- | ---- | ----------------------------------- |
| async-validator | ⭐️   | 🚀   |                                     |
| cascader        | ✅   |      |                                     |
| checkbox        | ✅   |      |                                     |
| collapse        | ✅   |      |                                     |
| color-picker    | ✅   |      |                                     |
| dialog          | ✅   |      |                                     |
| drawer          | ✅   |      |                                     |
| dropdown        | ✅   |      |                                     |
| fast-color      | ⭐️   | 🚀   |                                     |
| field-form      | ⭕   |      |                                     |
| image           | ✅   |      |                                     |
| input           | ✅   |      |                                     |
| input-number    | ✅   |      |                                     |
| listy           | ✅   |      |                                     |
| mentions        | ⭕   |      |                                     |
| menu            | ✅   |      |                                     |
| mini-decimal    | ⭐️   | 🚀   |                                     |
| mutate-observer | ✅   |      |                                     |
| notification    | ✅   |      | 受限 SFC，多了 configRef 与 onReady |
| overflow        | ✅   |      |                                     |
| pagination      | ✅   |      |                                     |
| picker          | ⭕   |      |                                     |
| portal          | ✅   |      |                                     |
| progress        | ✅   |      |                                     |
| qrcode          | ✅   |      |                                     |
| rate            | ✅   |      |                                     |
| resize-observer | ✅   |      |                                     |
| segmented       | ✅   |      |                                     |
| select          | ✅   |      |                                     |
| slick           | ✅   |      |                                     |
| slider          | ✅   |      |                                     |
| steps           | ✅   |      |                                     |
| switch          | ✅   |      |                                     |
| table           | ⭕   |      |                                     |
| tabs            | ⭕   |      |                                     |
| textarea        | ✅   |      |                                     |
| tooltip         | ✅   |      |                                     |
| tour            | ✅   |      |                                     |
| tree            | ✅   |      |                                     |
| tree-select     | ✅   |      |                                     |
| trigger         | ✅   |      |                                     |
| upload          | ✅   |      |                                     |
| util            | ⭐️   | 🚀   | 部分涉及 VDom 的需兼容 vapor        |
| virtual-list    | ✅   |      |                                     |
