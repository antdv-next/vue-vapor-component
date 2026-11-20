# Slick

## Props

| 名称             | 类型                                                               | 默认值                  | 说明                                                                  |
| ---------------- | ------------------------------------------------------------------ | ----------------------- | --------------------------------------------------------------------- |
| accessibility    | `boolean`                                                          | `true`                  | 开启无障碍键盘导航                                                    |
| adaptiveHeight   | `boolean`                                                          | `false`                 | 根据当前幻灯片自适应容器高度                                          |
| afterChange      | `((currentSlide: number) => void) \| null`                         | `null`                  | 切换完成后回调                                                        |
| appendDots       | `(dots: VNodeChild[]) => VNodeChild`                               | `(dots) => h('ul', …)`  | 自定义分页点容器渲染                                                  |
| arrows           | `boolean`                                                          | `true`                  | 显示左右箭头                                                          |
| autoplay         | `boolean`                                                          | `false`                 | 自动播放                                                              |
| autoplaySpeed    | `number`                                                           | `3000`                  | 自动播放间隔（ms）                                                    |
| beforeChange     | `((currentSlide: number, nextSlide: number) => void) \| null`      | `null`                  | 切换前回调                                                            |
| centerMode       | `boolean`                                                          | `false`                 | 居中模式                                                              |
| centerPadding    | `string`                                                           | `'50px'`                | 居中模式两侧留白                                                      |
| className        | `string`                                                           | `''`                    | 自定义类名                                                            |
| cssEase          | `string`                                                           | `'ease'`                | 过渡缓动函数                                                          |
| customPaging     | `(index: number) => VNodeChild`                                    | `(i) => h('button', …)` | 自定义分页点内容                                                      |
| dots             | `boolean`                                                          | `false`                 | 显示分页点                                                            |
| dotsClass        | `string`                                                           | `'slick-dots'`          | 分页点容器类名                                                        |
| draggable        | `boolean`                                                          | `true`                  | 允许鼠标拖拽                                                          |
| easing           | `string`                                                           | `'linear'`              | 缓动函数                                                              |
| edgeFriction     | `number`                                                           | `0.35`                  | 边缘拖拽阻力系数                                                      |
| fade             | `boolean`                                                          | `false`                 | 淡入淡出切换（启用时强制 `slidesToShow` 为 1）                        |
| focusOnSelect    | `boolean`                                                          | `false`                 | 点击幻灯片切换                                                        |
| infinite         | `boolean`                                                          | `true`                  | 无限循环                                                              |
| initialSlide     | `number`                                                           | `0`                     | 初始激活索引                                                          |
| lazyLoad         | `LazyLoadType`（`'ondemand' \| 'progressive' \| boolean \| null`） | `null`                  | 图片懒加载模式                                                        |
| nextArrow        | `VNodeChild`                                                       | `null`                  | 自定义"下一张"箭头（可接受 string \| number \| VNode \| () => VNode） |
| pauseOnDotsHover | `boolean`                                                          | `false`                 | 悬停分页点时暂停自动播放                                              |
| pauseOnFocus     | `boolean`                                                          | `false`                 | 聚焦时暂停自动播放                                                    |
| pauseOnHover     | `boolean`                                                          | `true`                  | 悬停时暂停自动播放                                                    |
| prevArrow        | `VNodeChild`                                                       | `null`                  | 自定义"上一张"箭头（可接受 string \| number \| VNode \| () => VNode） |
| responsive       | `ResponsiveSetting[] \| null`                                      | `null`                  | 响应式断点配置                                                        |
| rows             | `number`                                                           | `1`                     | 每页行数                                                              |
| rtl              | `boolean`                                                          | `false`                 | 从右向左方向                                                          |
| slide            | `string`                                                           | `'div'`                 | 幻灯片元素标签                                                        |
| slidesPerRow     | `number`                                                           | `1`                     | 每行幻灯片数                                                          |
| slidesToScroll   | `number`                                                           | `1`                     | 每次滚动的幻灯片数                                                    |
| slidesToShow     | `number`                                                           | `1`                     | 每次显示的幻灯片数                                                    |
| speed            | `number`                                                           | `500`                   | 切换动画时长（ms）                                                    |
| swipe            | `boolean`                                                          | `true`                  | 允许触摸滑动                                                          |
| swipeEvent       | `((direction: string) => void) \| null`                            | `null`                  | 滑动方向回调                                                          |
| swipeToSlide     | `boolean`                                                          | `false`                 | 允许滑动到相邻幻灯片                                                  |
| touchMove        | `boolean`                                                          | `true`                  | 允许触摸移动                                                          |
| touchThreshold   | `number`                                                           | `5`                     | 触发切换的触摸阈值                                                    |
| useCSS           | `boolean`                                                          | `true`                  | 使用 CSS 过渡                                                         |
| useTransform     | `boolean`                                                          | `true`                  | 使用 transform 变换                                                   |
| variableWidth    | `boolean`                                                          | `false`                 | 使用可变宽度幻灯片                                                    |
| vertical         | `boolean`                                                          | `false`                 | 垂直方向滑动                                                          |
| verticalSwiping  | `boolean`                                                          | `false`                 | 允许垂直滑动                                                          |
| waitForAnimate   | `boolean`                                                          | `true`                  | 等待动画结束后再切换                                                  |
| asNavFor         | `SlickRef \| InnerSliderRef \| null`                               | `null`                  | 关联的另一个滑块实例（导航联动）                                      |
| unslick          | `boolean`                                                          | `false`                 | 禁用滑块，直接渲染为普通列表                                          |
| style            | `CSSProperties`                                                    | —                       | 容器内联样式                                                          |

## Events

| 名称          | 参数                       | 说明                           |
| ------------- | -------------------------- | ------------------------------ |
| init          | —                          | 初始化完成                     |
| reInit        | —                          | props 或子节点变化后重新初始化 |
| lazyLoad      | `(slidesToLoad: number[])` | 需要懒加载的幻灯片索引列表     |
| lazyLoadError | —                          | 幻灯片图片加载失败             |
| edge          | `(direction: string)`      | 非无限模式下拖拽到边缘时触发   |
| swipe         | `(direction: string)`      | 滑动切换时触发                 |

## Slots

| 名称    | 作用域 | 说明                           |
| ------- | ------ | ------------------------------ |
| default | —      | 幻灯片内容（每个子节点为一页） |

## Expose

| 名称        | 类型                                             | 说明                      |
| ----------- | ------------------------------------------------ | ------------------------- |
| innerSlider | `Ref<InnerSliderRef \| null>`                    | 内部 InnerSlider 实例引用 |
| slickPrev   | `() => void`                                     | 切换到上一张              |
| slickNext   | `() => void`                                     | 切换到下一张              |
| slickGoTo   | `(slide: number, dontAnimate?: boolean) => void` | 跳转到指定索引            |
| slickPause  | `() => void`                                     | 暂停自动播放              |
| slickPlay   | `() => void`                                     | 开始自动播放              |

## 与 @v-c 差异

| @v-c (vdom)                                                                                         | vapor SFC                                                                                                                                                    |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `onInit` / `onEdge` / `onSwipe` / `onLazyLoad` / `onLazyLoadError` / `onReInit` 作为 props 传入     | 转为 `init` / `edge` / `swipe` / `lazyLoad` / `lazyLoadError` / `reInit` 事件，由 Slick 在 `<InnerSlider>` 上监听并转发，以 `@init` / `@lazyLoad` 等方式监听 |
| 通过 `filterEmpty` + `rows` / `slidesPerRow` / `variableWidth` 将 children 包裹为 `.slick-slide` 组 | `default` slot 内容直接透传给 InnerSlider/Track，无 rows / slidesPerRow 包裹与空节点过滤                                                                     |
| 子节点数 ≤ `slidesToShow` 时设置 `settings.unslick = true`                                          | InnerSlider 内基于 DOM `slideCount` 计算 `effectiveUnslick`（`unslick \|\| slideCount <= slidesToShow`）                                                     |
| `console.warn` 校验 `centerMode` / `fade` / `variableWidth` 非法组合                                | 移除（不打印开发警告）                                                                                                                                       |

> 注：`accessibility`、`autoplay`、`slidesToShow`、`speed` 等非 VueNode 类型的值仍通过 props 传递，不受此差异影响。
> `prevArrow`、`nextArrow`、`appendDots`、`customPaging` 为 VueNode / 函数类型，仍通过 props 传入（模板中通过 `<component :is>` 或渲染函数渲染）。
> 事件如果是在 jsx/tsx 中使用，则仍以 `onXxx={xx}` 触发。
> 多词事件名采用 camelCase（`lazyLoad` / `lazyLoadError` / `reInit`）；模板中也可写 kebab 形式 `@lazy-load` / `@lazy-load-error` / `@re-init`，Vue 会自动映射。
