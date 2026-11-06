# Upload

## Props

| 名称                  | 类型                                                                                                          | 默认值        | 说明                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------- |
| name                  | `string`                                                                                                      | `'file'`      | 上传字段名                                                                              |
| style                 | `CSSProperties`                                                                                               | —             | 容器样式                                                                                |
| className             | `string`                                                                                                      | —             | 自定义类名                                                                              |
| disabled              | `boolean`                                                                                                     | —             | 是否禁用                                                                                |
| component             | `Component \| string`                                                                                         | `'span'`      | 容器组件（当前 vapor 版未使用，恒渲染 `<div>` 根节点）                                  |
| action                | `Action`                                                                                                      | —             | 上传地址，或接收文件返回地址的函数（`string \| ((file) => string \| Promise<string>)`） |
| method                | `UploadRequestMethod`                                                                                         | —             | 请求方法（`POST \| PUT \| PATCH \| post \| put \| patch`）                              |
| directory             | `boolean`                                                                                                     | —             | 是否支持目录上传                                                                        |
| data                  | `Record<string, unknown> \| ((file: VcFile \| string \| Blob) => Record<string, unknown>)`                    | —             | 附加请求数据，可为对象或返回对象的函数                                                  |
| headers               | `UploadRequestHeader`                                                                                         | —             | 请求头                                                                                  |
| accept                | `string \| AcceptConfig`                                                                                      | —             | 接受的文件类型（`AcceptConfig` 含 `format` + 可选 `filter`）                            |
| multiple              | `boolean`                                                                                                     | `false`       | 是否多选                                                                                |
| capture               | `string`                                                                                                      | —             | 原生 capture 属性（`'user' \| 'environment'`）                                          |
| beforeUpload          | `(file: VcFile, FileList: VcFile[]) => BeforeUploadFileType \| Promise<void \| BeforeUploadFileType> \| void` | —             | 上传前处理，返回 `false` 可取消上传                                                     |
| customRequest         | `CustomUploadRequestOption`                                                                                   | —             | 自定义上传请求                                                                          |
| withCredentials       | `boolean`                                                                                                     | `false`       | 是否携带凭证                                                                            |
| openFileDialogOnClick | `boolean`                                                                                                     | `true`        | 点击容器是否打开文件对话框                                                              |
| prefixCls             | `string`                                                                                                      | `'vc-upload'` | 样式类前缀                                                                              |
| id                    | `string`                                                                                                      | —             | 原生 id                                                                                 |
| classNames            | `{ input?: string }`                                                                                          | —             | 语义化类名                                                                              |
| styles                | `{ input?: CSSProperties }`                                                                                   | —             | 语义化样式                                                                              |
| hasControlInside      | `boolean`                                                                                                     | `false`       | 容器内部是否包含控制元素（为 `true` 时不设 tabIndex/role）                              |
| pastable              | `boolean`                                                                                                     | `false`       | 是否支持粘贴上传                                                                        |

## Events

| 名称       | 参数                                                                                         | 说明             |
| ---------- | -------------------------------------------------------------------------------------------- | ---------------- |
| batchStart | `(fileList: { file: VcFile, parsedFile: Exclude<BeforeUploadFileType, boolean> \| null }[])` | 批量上传开始     |
| start      | `(file: VcFile)`                                                                             | 单个文件开始上传 |
| error      | `(error: Error, ret: Record<string, unknown>, file: VcFile \| null)`                         | 上传失败         |
| success    | `(response: Record<string, unknown>, file: VcFile \| null, xhr: XMLHttpRequest)`             | 上传成功         |
| progress   | `(event: UploadProgressEvent, file: VcFile \| null)`                                         | 上传进度         |
| click      | `(e: MouseEvent \| KeyboardEvent)`                                                           | 点击容器         |
| mouseenter | `(e: MouseEvent)`                                                                            | 鼠标移入         |
| mouseleave | `(e: MouseEvent)`                                                                            | 鼠标移出         |

## Slots

| 名称    | 作用域 | 说明           |
| ------- | ------ | -------------- |
| default | —      | 上传触发器内容 |

## Expose

| 名称  | 类型                      | 说明                                              |
| ----- | ------------------------- | ------------------------------------------------- |
| abort | `(file?: VcFile) => void` | 取消上传（省略参数取消全部）                      |
| retry | `(file: VcFile) => void`  | 重试上传（传入失败文件，同 uid 请求未结束则忽略） |

## 与 @v-c 差异

| @v-c (vdom)                                | vapor SFC                                    |
| ------------------------------------------ | -------------------------------------------- |
| `onBatchStart` prop                        | `@batchStart` 事件                           |
| `onStart` prop                             | `@start` 事件                                |
| `onError` prop                             | `@error` 事件                                |
| `onSuccess` prop                           | `@success` 事件                              |
| `onProgress` prop                          | `@progress` 事件                             |
| `onMouseEnter` prop                        | `@mouseenter` 事件                           |
| `onMouseLeave` prop                        | `@mouseleave` 事件                           |
| `onClick` prop                             | `@click` 事件                                |
| `component` prop 渲染动态根节点（`<Tag>`） | 声明了 `component` prop 但模板恒渲染 `<div>` |
| `data` / `headers` 默认 `{}`               | 默认 `undefined`                             |

> 注：`name`、`disabled`、`prefixCls`、`multiple`、`withCredentials`、`openFileDialogOnClick`、`hasControlInside`、`pastable`、`directory`、`accept` 等非 VueNode 类型的值仍通过 props 传递。
> 事件如果是在 jsx/tsx 中使用，则仍以 `onXxx={xx}` 触发。
> 插槽如果是在 jsx/tsx 中使用，则以 `v-slots={{ default: () => <Comp/> }}` 形式使用。
