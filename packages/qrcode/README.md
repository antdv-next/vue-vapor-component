# QRCode

提供两个渲染实现：`QRCodeCanvas`（Canvas）与 `QRCodeSVG`（SVG）。

## Props

两个组件共用 `QRProps`。

| 名称          | 类型                   | 默认值      | 说明                                                                                                                                    |
| ------------- | ---------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| value         | `string \| string[]`   | —           | 要编码的值；传字符串数组表示多个分段，可进一步优化编码                                                                                  |
| size          | `number`               | `128`       | 渲染尺寸（像素）                                                                                                                        |
| level         | `ErrorCorrectionLevel` | `'L'`       | 纠错级别：`'L' \| 'M' \| 'Q' \| 'H'`                                                                                                    |
| minVersion    | `number`               | `1`         | 编码使用的最小版本，有效值 1-40，值越大二维码越复杂                                                                                     |
| boostLevel    | `boolean`              | —           | 若能在不提升版本的情况下提高纠错级别则提升；未传时由 `encodeSegments` 内部默认 `true` 生效                                              |
| bgColor       | `string`               | `'#FFFFFF'` | 背景色                                                                                                                                  |
| fgColor       | `string`               | `'#000000'` | 前景色                                                                                                                                  |
| includeMargin | `boolean`              | `false`     | 是否渲染 4 modules 的边距；已废弃，请使用 `marginSize`                                                                                  |
| marginSize    | `number`               | —           | 边距的 modules 数，会经 `Math.floor` 取整；同时指定时覆盖 `includeMargin`。未传时按 `includeMargin` 计算（`false` → `0`，`true` → `4`） |
| imageSettings | `ImageSettings`        | —           | 嵌入图片配置                                                                                                                            |
| title         | `string`               | —           | 无障碍标题                                                                                                                              |

## ImageSettings

| 名称        | 类型                                     | 默认值 | 说明                                                    |
| ----------- | ---------------------------------------- | ------ | ------------------------------------------------------- |
| src         | `string`                                 | —      | 图片地址（必填）                                        |
| width       | `number`                                 | —      | 图片宽度（必填，未传时按 `size * 0.1` 计算）            |
| height      | `number`                                 | —      | 图片高度（必填，未传时按 `size * 0.1` 计算）            |
| excavate    | `boolean`                                | —      | 是否挖空图片下方的模块（必填）                          |
| x           | `number`                                 | —      | 图片 x 坐标；未传时水平居中                             |
| y           | `number`                                 | —      | 图片 y 坐标；未传时垂直居中                             |
| opacity     | `number`                                 | —      | 不透明度，未传时按 `1`                                  |
| crossOrigin | `'anonymous' \| 'use-credentials' \| ''` | —      | 跨域设置；未设置时图片会污染画布，Canvas 无法导出为图片 |

## Expose

### QRCodeCanvas

| 名称      | 类型                                                       | 说明                |
| --------- | ---------------------------------------------------------- | ------------------- |
| toDataURL | `(type?: string, quality?: number) => string \| undefined` | 导出画布为 data URL |

### QRCodeSVG

| 名称   | 类型                 | 说明           |
| ------ | -------------------- | -------------- |
| svgRef | `Ref<SVGSVGElement>` | SVG 根元素引用 |

## 与 @v-c 差异

| @v-c (vdom)                                                                 | vapor SFC                                                                                                                                                                                            |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useQRCode(ctx: Ref<Options>)` 返回 `computed`                              | `useQRCode(ctx: Options)` 接收普通对象并返回立即求值的对象，组件侧用 `computed(() => useQRCode({...}))` 包裹以收集 props 依赖                                                                        |
| `useQRCode` 内 `memoizedQrcode` 为 `computed`，跨渲染缓存编码结果           | 内层已改为普通函数，无跨渲染缓存；`encodeSegments` 每次 hook 求值只调用一次                                                                                                                          |
| `inheritAttrs: false` + `{...attrs}` + `style={[canvasStyle, attrs.style]}` | canvas 已对齐（`inheritAttrs: false`、`v-bind="attrs"` 在前、`canvasStyle` 为 `[{ height, width }, attrs?.style]` 数组形式）；SVG 设置了 `inheritAttrs: false` 但未 `v-bind="attrs"`，额外属性被丢弃 |
| `<img alt="QR-Code">`                                                       | `<img alt="">`                                                                                                                                                                                       |
| `interface.tsx` 导出 `defaults`，供 `setup(props = defaults)` 兜底          | 不导出 `defaults`，默认值直接写在 `defineProps` 的解构参数上                                                                                                                                         |

> 注：`value`、`size`、`level`、`bgColor` 等非 VueNode 类型的值仍通过 props 传递。
> `useQRCode` 返回立即求值的普通对象，组件侧的 `computed(() => useQRCode({...}))` 才是响应式来源；副作用是该 computed 跟踪全部 options，改 `size` / `marginSize` 也会重新编码（@v-c 的 `memoizedQrcode` 只依赖 `value` / `level` / `minVersion` / `boostLevel`，改 `size` 不会重新编码）。
> `excavate` 只控制是否挖空模块，不控制是否渲染图片（与 @v-c 一致）；`excavate: false` 时图片仍会压在未被挖空的模块上。
