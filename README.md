# vue-vapor-component

vapor mode headless component.  

## 目录结构

``` three
apps  
  |- playground  
packages  
  |- module-a  
  |- module-b  
```  

已经有了 pnpm workspace 的 monorepo，为何还要引入 turbo？  

1. apps + packages 是一种项目组织的最佳实践，意图清晰：apps 是最终要部署的，packages 是基础设施
2. 分工明确：pnpm 依赖管理，turbo 任务编排与缓存

## 环境与要求

vue >3.6.x  
pnpm  

vapor component 需要在 script 标签中加上vapor

``` javascript
<script setup vapor lang="ts"></script>
```

使用virtualDom的vue项目想使用vapor组件需要在main.ts里引入`vaporInteropPlugin`

``` diff
-- import { createApp } from 'vue'
++ import { createApp, vaporInteropPlugin } from 'vue'
import App from './App.vue'

-- createApp(App).mount('#app')
++ createApp(App).use(vaporInteropPlugin).mount('#app')
```

单vaporDom的vue项目需要在main.ts里引入`createVaporApp`来替换`createApp`，如果需要混合使用则也需要引入`vaporInteropPlugin`，会拉取vdom runtime，抵消掉vapor带来的大幅缩小捆绑包的优势

``` diff
-- import { createApp } from 'vue'
++ import { createVaporApp } from 'vue'
import App from './App.vue'
-- createApp(App).mount('#app')
++ createVaporApp(App).mount('#app')
```

## 库构建工具

tsdown，被定义为使用 rolldown 的 vite8 的库编译模式的基座，优势：支持多种输出格式esm、cjs、umd等，自动生成 typescript 声明文件`.d.ts`，借助 rolldown 基于 Rust 提供的高性能，构建速度极快
