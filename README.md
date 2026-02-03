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

## React jsx --> Vue SFC 的一些技巧

### useState

- 视情况使用 ref、shallowRef、reactive、shallowReactive

```jsx
// react
const [state, setState] = useState(0)
setState(state => state + 1)

// vue
const state = ref(0)
state.value = state.value + 1
```

### useRef

- 视情况使用 ref、useTemplateRef，如果是获取组件 dom 的话，3.5+后官方文档是更推荐用useTemplateRef

```jsx
// react
const num = useRef(0)
num.current = 1
const inputRef = useRef(null)

<input ref={inputRef} />

// vue
const num = ref(0)
num.value = 1
const inputRef = useTemplate('ref')

<input ref="input" />
```

### useEffect、useXxxEffect

- 视情况使用 watch、watchEffect
- react有个场景是在组件卸载后触发一些清理逻辑

```jsx
useEffect(() => {
  return () => {
    // ...
  }
}, [xx])

// vue 中可以使用 onUnMounted，一些需要用到函数内部上下文变量的则需要使用 watch、watchEffect 的 onCleanup
watch(value, (newVal, oldVal, onCleanup) => {
  onCleanup(() => xx)
})
watchEffect((onCleanup) => {
  onCleanup(() => xx)
})

// 3.5+ 之后还可以选择使用 onWatchCleanup
onWatchCleanup(() => xx)
```

### useCallback、useMemo

- 视情况使用 computed

### forwardRef、useImperativeHandle

```jsx
const CompA = forwardRef((props, ref) => {
  const inputRef = useRef(null)

  useImperativeHandle(ref, () => ({
    focus() {
      inputRef.current?.focus()
    }
  }), [])
  return <input ref={inputRef} />
})

function CompB() {
  const ref = useRef(null)

  function handleChange() {
    ref.current.focus()
  }

  return (
    <>
      <CompA ref={ref} />
      <button onClick={handleChange}>click</button>
    </>
  )
}
```

等价于

```html
<script setup>
  defineOptions({ name: 'CompA'})

  const inputRef = useTemplateRef('input')

  defineExpose({
    focus: () => inputRef.value.focus()
  })
</script>

<template>
  <input ref="input" />
</template>

<!-- use -->

<script setup>
  defineOptions({ name: 'CompB'})

  const inputRef = useTemplateRef('input')

  function handleChange() {
    inputRef.value.focus()
  }
</script>

<template>
  <CompA ref="input"></CompA>
  <button @click="handleChange">click</button>
</template>
```

### 受控与非受控概念

vue 大部分场景是用不到受控的，一些特殊场景比方需要一直弹出的 tooltip 不受属性更新而改变则需要有这个概念，可以参考[Naive ui 受控与非受控一文](https://www.naiveui.com/zh-CN/os-theme/docs/controlled-uncontrolled)

### `<></>`、Fragment、Suspense

- 使用同名的 Fragment 或者 template
- 使用同名的 Suspense
