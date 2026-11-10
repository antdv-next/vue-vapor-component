# Image

图片，支持点击放大预览。单图通过 `preview` 配置打开预览；多图用 `<Image.PreviewGroup>` 包裹一组 `<Image>`（或传 `items`）实现分组切换预览。

## Image Props

| 名称             | 类型                                                                                                             | 默认值       | 说明                                                                                                                                                                              |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| prefixCls        | `string`                                                                                                         | `'vc-image'` | 样式类前缀                                                                                                                                                                        |
| previewPrefixCls | `string`                                                                                                         | —            | 预览弹层前缀，默认 `${prefixCls}-preview`（即 `vc-image-preview`）                                                                                                                |
| rootClassName    | `string`                                                                                                         | —            | 根节点自定义类名                                                                                                                                                                  |
| classNames       | `Partial<Record<SemanticName, string> & { popup?: Partial<Record<PreviewSemanticName, string>> }>`               | —            | 语义化类名。`SemanticName = 'root' \| 'image' \| 'cover'`；`popup` 为预览弹层的语义化类名，`PreviewSemanticName = 'root' \| 'mask' \| 'body' \| 'close' \| 'footer' \| 'actions'` |
| styles           | `Partial<Record<SemanticName, CSSProperties> & { popup?: Partial<Record<PreviewSemanticName, CSSProperties>> }>` | —            | 语义化样式，结构与 `classNames` 相同                                                                                                                                              |
| src              | `string`                                                                                                         | —            | 图片地址                                                                                                                                                                          |
| placeholder      | `boolean \| string`                                                                                              | —            | `true` 仅显示占位区域（`<img>` 加 `-img-placeholder` 类）；字符串作为 `#placeholder` 插槽的回退值，未提供插槽时渲染该文本                                                         |
| fallback         | `string`                                                                                                         | —            | 加载失败的回退地址（`useStatus` 内部在 `error` 状态回退到该地址重新加载）                                                                                                         |
| preview          | `boolean \| PreviewConfig`                                                                                       | `true`       | 是否启用点击预览；传对象时作为预览配置（见下）                                                                                                                                    |
| width            | `string \| number`                                                                                               | —            | 图片宽度，映射到根节点 `width` 与 `<img>` `width`                                                                                                                                 |
| height           | `string \| number`                                                                                               | —            | 图片高度，映射到 `<img>` `height` 与 `imgStyle`                                                                                                                                   |
| fetchPriority    | `HTMLImageElement['fetchPriority']`                                                                              | —            | 图片加载优先级                                                                                                                                                                    |

> `class` / `style` 未在 `ImageProps` 上声明，经 attrs 落入根节点（`v-bind="rootAttrs"` 不含 `class` / `style`，分别由 `:class="rootCls"`、`:style="rootStyle"` 消费）。
> `crossOrigin`、`decoding`、`draggable`、`loading`、`referrerPolicy`、`sizes`、`srcset`、`useMap`、`alt` 亦未声明在 `ImageProps` 上，运行时经 `attrs` 读取（`imgCommonProps` 同时读 `props` 与 `attrs`）并应用到内层 `<img>`，且从根节点 `attrs` 中剔除（`omit(restAttrs, COMMON_PROPS)`）。

## Image Events

| 名称    | 参数                 | 说明                                             |
| ------- | -------------------- | ------------------------------------------------ |
| click   | `(e: MouseEvent)`    | 点击根节点（可预览时也触发，与打开预览并行）     |
| error   | `(e: Event)`         | 图片加载失败                                     |
| keydown | `(e: KeyboardEvent)` | 键盘按下（`Enter` / `Space` 且可预览时打开预览） |

## Image Slots

| 名称          | 作用域                                                                                                  | 说明                                                                                                                                                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| placeholder   | —                                                                                                       | 加载中占位内容，优先级最高；未提供时回退渲染 `placeholder` prop 文本                                                                                                                                                                |
| cover         | —                                                                                                       | 预览遮罩内容（可点击区域）；未提供时回退渲染 `cover` 配置的 `coverNode`                                                                                                                                                             |
| actionsRender | `{ actions, transform, current, total, image, minScale, maxScale, actionsCls, actionCls, disabledCls }` | 预览底部工具栏自定义渲染；`actions` 含 `onActive` / `onFlipY` / `onFlipX` / `onRotateLeft` / `onRotateRight` / `onZoomOut` / `onZoomIn` / `onClose` / `onReset`；作用域经 `v-bind` 从 Footer 透传；未提供时 Footer 默认渲染内置按钮 |
| closeIcon     | —                                                                                                       | 预览关闭图标，替换默认关闭按钮内容（关闭按钮在 Preview 根节点）                                                                                                                                                                     |
| imageRender   | `{ imgNode, transform, image }`（单图无 `current` / `total`）                                           | 预览图片自定义渲染，替换默认 `<img>`；作用域经 `v-bind` 透传                                                                                                                                                                        |
| countRender   | `{ current, count }`（`current` 1 起始）                                                                | 预览计数渲染（`1 / 1`）；作用域经 `v-bind` 透传                                                                                                                                                                                     |

## PreviewConfig

`preview?: boolean | PreviewConfig`，对象形式配置预览弹层（继承 `Omit<InternalPreviewConfig, 'countRender'>`）。

| 名称            | 类型                                                                                          | 说明                                                                                                                                                       |
| --------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| cover           | `VueNode \| CoverConfig \| false`                                                             | 预览遮罩：`VueNode` 直接渲染、`CoverConfig = { coverNode?: VueNode; placement?: 'top' \| 'bottom' \| 'center' }`、`false` 关闭遮罩                         |
| imageRender     | `(originalNode: VueNode, info: { transform: TransformType; image: ImgInfo }) => VueNode`      | 预览图片自定义渲染（单图无 `current` / `total`）                                                                                                           |
| actionsRender   | `(originalNode: VueNode, info: Omit<ToolbarRenderInfoType, 'current' \| 'total'>) => VueNode` | 预览工具栏自定义渲染（单图无 `current` / `total`）                                                                                                         |
| onOpenChange    | `(open: boolean) => void`                                                                     | 预览开关状态变化（单图）                                                                                                                                   |
| rootClassName   | `string`                                                                                      | 预览弹层根类名（建议用 `classNames.root` 替代）                                                                                                            |
| src             | `string`                                                                                      | 预览图片地址，覆盖 `src`                                                                                                                                   |
| alt             | `string`                                                                                      | 预览图片 alt                                                                                                                                               |
| scaleStep       | `number`                                                                                      | 缩放步长（默认 `0.5`）                                                                                                                                     |
| minScale        | `number`                                                                                      | 最小缩放（默认 `1`）                                                                                                                                       |
| maxScale        | `number`                                                                                      | 最大缩放（默认 `50`）                                                                                                                                      |
| motionName      | `string`                                                                                      | 过渡动画名（默认 `'fade'`）                                                                                                                                |
| open            | `boolean`                                                                                     | 受控打开                                                                                                                                                   |
| getContainer    | `PortalProps['getContainer']`                                                                 | 弹层挂载容器                                                                                                                                               |
| zIndex          | `number`                                                                                      | 弹层 z-index                                                                                                                                               |
| maskClosable    | `boolean`                                                                                     | 点击遮罩关闭（默认 `true`）                                                                                                                                |
| afterOpenChange | `(open: boolean) => void`                                                                     | 过渡结束后触发                                                                                                                                             |
| focusTrap       | `boolean`                                                                                     | 焦点锁定（默认 `true`）                                                                                                                                    |
| movable         | `boolean`                                                                                     | 是否可拖拽移动（默认 `true`）                                                                                                                              |
| icons           | `OperationIcons`                                                                              | **vapor 端口未消费**：操作图标经 `#prevIcon` / `#nextIcon` / `#closeIcon` / `#actionsRender` 插槽提供；传 `icons` 不会出现在默认工具栏/关闭按钮/切换按钮中 |
| closeIcon       | `VueNode \| boolean \| null`                                                                  | 关闭图标：`false` / `null` 隐藏关闭按钮；`true` 且无 `#closeIcon` 插槽时按钮内容为空（无默认 × 图标）                                                      |

> `countRender` 不在 `PreviewConfig` 中（单图预览无分页计数）。

## PreviewGroup（子组件）

静态属性挂载：`Image.PreviewGroup`（`import Image from '@vapor-component/image'` 后 `Image.PreviewGroup`；或 `import { PreviewGroup } from '@vapor-component/image'`）。包裹一组 `<Image>` 或传 `items` 实现多图分组预览。

### PreviewGroup Props

| 名称             | 类型                                                              | 默认值               | 说明                                                                                                  |
| ---------------- | ----------------------------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------- |
| previewPrefixCls | `string`                                                          | `'vc-image-preview'` | 预览弹层前缀                                                                                          |
| classNames       | `{ popup?: Partial<Record<PreviewSemanticName, string>> }`        | —                    | 预览弹层语义化类名                                                                                    |
| styles           | `{ popup?: Partial<Record<PreviewSemanticName, CSSProperties>> }` | —                    | 预览弹层语义化样式                                                                                    |
| icons            | `PreviewProps['icons']`                                           | `() => ({})`         | **vapor 端口未消费**，操作图标经 `#prevIcon` / `#nextIcon` / `#closeIcon` / `#actionsRender` 插槽提供 |
| items            | `(string \| ImageElementProps)[]`                                 | —                    | 分组预览图片数据；传了 `items` 时按 `data.src` 匹配，否则按注册的 `<Image>` `id` 匹配                 |
| fallback         | `string`                                                          | —                    | 加载失败回退地址                                                                                      |
| preview          | `boolean \| GroupPreviewConfig`                                   | —                    | 是否启用分组预览（默认启用）；对象形式作为预览配置（见下）                                            |
| children         | `VueNode`                                                         | —                    | 子内容，通常放一组 `<Image>`（默认插槽）                                                              |

### PreviewGroup Events

| 名称   | 参数                              | 说明         |
| ------ | --------------------------------- | ------------ |
| change | `(current: number, prev: number)` | 预览切换图片 |

### PreviewGroup Slots

| 名称          | 作用域                                                                                                  | 说明                                                |
| ------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| default       | —                                                                                                       | 放置一组 `<Image>`；经 `<slot />` 原样渲染          |
| prevIcon      | —                                                                                                       | 上一张图标，转发给 Preview（`PrevNext`）            |
| nextIcon      | —                                                                                                       | 下一张图标，转发给 Preview（`PrevNext`）            |
| countRender   | `{ current: number, count: number }`                                                                    | 计数渲染，`current` 为 1 起始                       |
| actionsRender | `{ actions, transform, current, total, image, minScale, maxScale, actionsCls, actionCls, disabledCls }` | 工具栏自定义渲染，作用域同 Footer 的 `renderResult` |
| closeIcon     | —                                                                                                       | 关闭图标                                            |

> PreviewGroup **显式转发** `actionsRender` / `prevIcon` / `nextIcon` / `countRender` / `closeIcon` 五个插槽给 Preview（不再用 `<template v-for>` 全量转发）；**不转发** `imageRender`（分组场景无此插槽）、`actions`（该插槽已移除，合并进 `actionsRender`）。

### GroupPreviewConfig

`preview?: boolean | GroupPreviewConfig`，对象形式配置（继承 `Omit<InternalPreviewConfig, 'imageRender'>`）。

| 名称         | 类型                                                                                                      | 说明                                                                                            |
| ------------ | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| current      | `number`                                                                                                  | 当前预览下标（受控）                                                                            |
| imageRender  | `(originalNode: VueNode, info: { transform: TransformType; current: number; image: ImgInfo }) => VueNode` | 预览图片自定义渲染（分组带 `current`）                                                          |
| onOpenChange | `(value: boolean, info: { current: number }) => void`                                                     | 预览开关状态变化（分组带当前下标）                                                              |
| onChange     | `(current: number, prevCurrent: number) => void`                                                          | 预览切换（分组）                                                                                |
| countRender  | `(current: number, total: number) => VueNode`                                                             | **vapor 端口未渲染**（配置函数未消费）；请用 `#countRender` 插槽（作用域 `{ current, count }`） |

> 其余字段同 `PreviewConfig`（`src` / `alt` / `scaleStep` / `minScale` / `maxScale` / `motionName` / `open` / `getContainer` / `zIndex` / `maskClosable` / `afterOpenChange` / `focusTrap` / `movable` / `icons` / `closeIcon` / `actionsRender` / `rootClassName`）。

## 与 @v-c 差异

| @v-c (vdom)                                                                                                                                                                   | vapor SFC                                                                                                                                                                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `onClick` / `onError` / `onKeydown` prop                                                                                                                                      | `@click` / `@error` / `@keydown` 事件                                                                                                                                                                                                                                                      |
| `PreviewGroup` 的 `onChange` prop                                                                                                                                             | `@change` 事件                                                                                                                                                                                                                                                                             |
| `ImageProps extends Partial<Omit<ImageElementProps, 'src'>>` 显式声明 `crossOrigin` / `loading` / `alt` 等图片属性                                                            | `ImageProps` 不再声明这些字段；运行时经 `attrs` 读取（`imgCommonProps` 同时读 `props` 与 `attrs`）并应用到内层 `<img>`，且从根节点 `attrs` 中剔除（`omit(restAttrs, COMMON_PROPS)`）                                                                                                       |
| context 含 `canPreview: ComputedRef<boolean>`；Image `canPreview = !!props.preview && (!groupContext                                                                          |                                                                                                                                                                                                                                                                                            | groupContext.canPreview.value)` | context 只剩 `register` / `onPreview`；Image `canPreview = !!props.preview`（去掉 group 判定） |
| `PreviewGroup` `canPreview = props.preview !== false && props.preview !== null`，并有 `watch(canPreview)` 关闭预览、`canPreview && <Preview>` 守卫渲染                        | 去掉 `canPreview` 相关逻辑：Preview 始终渲染，显隐由内部 `shouldShowContent` 控制                                                                                                                                                                                                          |
| `InternalPreviewConfig.wheel`（滚轮缩放开关）                                                                                                                                 | 移除 `wheel`，滚轮缩放始终启用（`useMouseEvent` 无 wheel 参数）                                                                                                                                                                                                                            |
| `InternalPreviewConfig.onTransform`                                                                                                                                           | 移除；Preview 改用 `emit('transform')`（Preview 为内部组件，不对外导出）                                                                                                                                                                                                                   |
| Footer 内置渲染 prev / next / flipY / flipX / rotateLeft / rotateRight / zoomOut / zoomIn 八个 action 按钮（`renderOperation`），`actionsRender` 函数 prop 收到 `actionsNode` | Footer 用 `#actionsRender` 插槽绑定 `renderResult`（`actions` 处理器 + `transform` / `current` / `total` / `image` / `minScale` / `maxScale` / `actionsCls` / `actionCls` / `disabledCls`）；`#actionsRender` 默认渲染内置 flip / rotate / zoom 按钮（文本字形），`icons` prop **未消费**; |
| `CloseBtn` 组件渲染关闭按钮，`closeIcon` prop（`closeIcon !== false && closeIcon !== null`）                                                                                  | 原生 `<button>` + `#closeIcon` 插槽，**渲染在 Preview 根节点**（`body` 与 `PrevNext` 之间，非 Footer）；`showClose = (closeIcon !== false && closeIcon !== null)                                                                                                                           |                                 | !!slots.closeIcon`                                                                             |
| Image 打开预览同步触发                                                                                                                                                        | 用 `requestAnimationFrame` 延迟一帧（修复 vapor 委托 `click` 导致预览被自身关闭按钮立即关闭的 bug）                                                                                                                                                                                        |
| `slots.placeholder?.()` + `isVueRenderable` 判定自定义占位                                                                                                                    | `!!props.placeholder \|\| !!slots.placeholder`（placeholder 为 `boolean \| string`；`true` 时 `imgCls` 加 `-img-placeholder` 类）                                                                                                                                                          |
| `slots.imageRender?.(originNode, info)` 以函数形式被调用，消费方拿到 `originNode` / `info`                                                                                    | `#imageRender` 经 `v-bind="renderedImage"` 透传作用域（`{ imgNode, transform, image, current? }`）；`#countRender` 经 `v-bind` 透传 `{ current, count }`                                                                                                                                   |

> 注：`prefixCls`、`src`、`width`、`height`、`fallback`、`fetchPriority`、`preview` 等非 VueNode 类型的值仍通过 props 传递，不受此差异影响。
> `placeholder` 为 `boolean | string`（移除 `VueNode`；`true` 时 `<img>` 加 `-img-placeholder` 类）；字符串作为 `#placeholder` 插槽的回退文本，`placeholderNode` 对 `true` 返回 `null` 避免渲染 `"true"`（`<slot name="placeholder">{{ placeholderNode }}</slot>`）；`cover` 仍为 `VueNode` 类型但源项目也是 props 传入，vapor 模板中经插槽回退渲染（`<slot name="cover">{{ coverNode }}</slot>`），保持 props 形式不变。
> 事件若以 JSX/TSX 使用，仍以 `onClick` / `onError` / `onKeydown` / `onChange` 形式触发；插槽若以 JSX/TSX 使用，以 `v-slots={{ ... }}` 形式使用。
> PreviewGroup 传了 `items` 时按 `data.src` 匹配下标，否则按 `<Image>` 注册的 `id` 匹配（`fromItems` 为 `true` 走 `src` 分支）。
