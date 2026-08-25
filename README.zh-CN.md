# vue-vapor-component

vapor mode headless component

English · [中文](./README.md)

> [!WARNING]  
> This project is not the final solution for adapting `antdv-next` to `vapor`, but rather a personal attempt to explore in the early stages. However, even if this solution is not ultimately adopted, the open source protocol will be maintained. As a headless component in SFC form and compatible with vapor, it still has practical significance.

## Directory Structure

```
apps
  |- playground
packages
  |- module-a
  |- module-b
```

1. apps + packages is a best practice for project organization with clear intent: apps are the ultimate deployment, packages are the infrastructure.
2. Clear division of labor: pnpm for dependency management, vite-plus for task orchestration and caching.

## Environment Requirements

- vue > 3.6.x
- pnpm
- vite-plus

<details>
<summary>Use alone (vapor)</summary><br>

Replace `createApp` with `createVaporApp` in `main.ts`:

```diff
-- import { createApp } from 'vue'
++ import { createVaporApp } from 'vue'
import App from './App.vue'
-- createApp(App).mount('#app')
++ createVaporApp(App).mount('#app')
```

Add `vapor` to `<script>` or `<template>` tags:

```diff
-- <script setup lang='ts'>
++ <script setup vapor lang='ts'>

// or
-- <template>
++ <template vapor>
```

<br></details>

<details>
<summary>Mixed use (vapor + vdom)</summary><br>

Introduce `vaporInteropPlugin` in `main.ts`:

```diff
-- import { createApp } from 'vue'
++ import { createApp, vaporInteropPlugin } from 'vue'
import App from './App.vue'

-- createApp(App).mount('#app')
++ createApp(App).use(vaporInteropPlugin).mount('#app')
```

Pure vapor mode mixing in vdom components also requires `vaporInteropPlugin`, which pulls in the vdom runtime and offsets vapor's bundle size advantage.

```diff
-- createVaporApp(App).mount('#app')
++ createVaporApp(App).use(vaporInteropPlugin).mount('#app')
```

<br></details>

## Component Progress

- ✅ Implemented
- 🚀 Verified, consistent with vc / rc
- ⭐️ Reusable vc npm package, no re-implementation needed
- ⭕ Not started
- 🪒 In progress

| Component       | Status | Verified | Notes                                       |
| --------------- | ------ | -------- | ------------------------------------------- |
| async-validator | ⭐️     | 🚀       |                                             |
| cascader        | ⭕     |          |                                             |
| checkbox        | ✅     |          |                                             |
| collapse        | ✅     |          |                                             |
| color-picker    | ✅     |          |                                             |
| dialog          | ✅     |          |                                             |
| drawer          | ✅     |          |                                             |
| dropdown        | ✅     |          |                                             |
| fast-color      | ⭐️     | 🚀       |                                             |
| field-form      | ⭕     |          |                                             |
| image           | ✅     |          |                                             |
| input           | ✅     |          |                                             |
| input-number    | ✅     |          |                                             |
| listy           | ✅     |          |                                             |
| mentions        | ⭕     |          |                                             |
| menu            | ⭕     |          |                                             |
| mini-decimal    | ⭐️     | 🚀       |                                             |
| mutate-observer | ✅     |          |                                             |
| notification    | ✅     |          | Limited by SFC, added configRef and onReady |
| overflow        | ✅     |          |                                             |
| pagination      | ✅     |          |                                             |
| picker          | ⭕     |          |                                             |
| portal          | ✅     |          |                                             |
| progress        | ✅     |          |                                             |
| qrcode          | ✅     |          |                                             |
| rate            | ✅     |          |                                             |
| resize-observer | ✅     |          |                                             |
| segmented       | ✅     |          |                                             |
| select          | ✅     |          |                                             |
| slick           | ✅     |          |                                             |
| slider          | ✅     |          |                                             |
| steps           | ✅     |          |                                             |
| switch          | ✅     |          |                                             |
| table           | ⭕     |          |                                             |
| tabs            | ⭕     |          |                                             |
| textarea        | ✅     |          |                                             |
| tooltip         | ✅     |          |                                             |
| tour            | ✅     |          |                                             |
| tree            | ✅     |          |                                             |
| tree-select     | ✅     |          |                                             |
| trigger         | ✅     |          |                                             |
| upload          | ✅     |          |                                             |
| util            | ⭐️     | 🚀       | Some VDom-related parts need vapor compat   |
| virtual-list    | ✅     |          |                                             |
