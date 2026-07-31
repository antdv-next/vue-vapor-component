# 与vc实现差异

configRef 和 onReady 是为了让 useNotification hook 在 Vapor 模式下能够与 ContextHolder 建立连接而产生的两个产物，它们的存在完全是 Vapor 模式下的架构约束所致

## configRef

`const configRef = computed(() => unref(rootConfig) || {})`
只是把传入的 rootConfig（可能是 MaybeRef）包成一个计算 ref，方便作为 prop 传给 ContextHolder：
  `<ContextHolder :config="configRef" :on-ready="onReady" />`

  本质上就是 props.config 的响应式引用。目标仓库的 tuple API [api, ContextHolder] 中，ContextHolder 在 `<script setup>` 中直接以 JSX/组件形式渲染，config 通过作用域内变量自动捕获，不需要显式暴露一个 ref
  传下去。这里因为改成了 纯 Vapor SFC + props，必须走 prop 传参，所以需要一个可传的 ref。

## onReady — 这是真正的设计差异所在

  作用：让 hook 拿到 ContextHolder 内部的 Notifications 组件实例引用。

  调用链：
  useNotification 内部
    notificationRef (shallowRef, 初始为 undefined)
         ↓
  返回 onReady 回调 → demo 传给 ContextHolder
         ↓
  ContextHolder onMounted → useTemplateRef('notificationRef') 解析
         ↓
  watch(internalRef) → 调用 props.onReady(Notifications实例)
         ↓
  hook 内部：notificationRef.value = ref → dispatchTasks()

  为什么必须有这个桥接？因为目标仓库的 hook 内部有一个 vdom wrapper（Holder / defineComponent），用 `<component :is="ContextHolder">`包裹，ref 自然通过父子组件链传递，不需要 callback bridge。

  但 Vapor 模式下 defineComponent 会触发 "returned non-block value" 警告，不能用。于是改成 demo 中直接写 `<ContextHolder>`，hook 就拿不到内部的 Notifications ref 了。onReady 就是让 ContextHolder 反向通知 hook
  "我准备好了" 的回调通道，从而让 taskQueue 能在 ref 就绪后派发。

  ---
  总结：这两个都是 Vapor 模式下"没有 vdom wrapper"这个约束的补偿方案。如果未来能在 Vapor 里安全地用 wrapper，或者换一种方式让 hook 直接拿到 ref（比如提供/inject），它们就可以消失。
