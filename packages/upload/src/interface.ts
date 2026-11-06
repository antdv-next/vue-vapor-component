import type { Component, CSSProperties } from 'vue'

export interface VcFile extends File {
  uid: string
}

export type BeforeUploadFileType = File | Blob | boolean | string

export type Action = string | ((file: VcFile) => string | Promise<string>)

export interface AcceptConfig {
  format: string
  filter?: 'native' | ((file: VcFile) => boolean)
}

export type UploadRequestMethod =
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'post'
  | 'put'
  | 'patch'

export type UploadRequestHeader = Record<string, string>

export type UploadRequestFile =
  | Exclude<BeforeUploadFileType, File | boolean>
  | VcFile

export interface UploadRequestError extends Error {
  status?: number
  method?: UploadRequestMethod
  url?: string
}

export interface UploadProgressEvent extends Partial<ProgressEvent> {
  percent?: number
}

export interface UploadRef {
  abort: (file?: VcFile) => void
  retry: (file: VcFile) => void
}

export interface UploadExpose extends UploadRef {}

export interface UploadRequestOption<T = any> {
  onProgress?: (event: UploadProgressEvent) => void
  onError?: (err: UploadRequestError | ProgressEvent, body?: T) => void
  onSuccess?: (body: T, xhr?: XMLHttpRequest) => void
  data?: Record<string, unknown>
  filename?: string
  file: UploadRequestFile
  withCredentials?: boolean
  action: string
  headers?: UploadRequestHeader
  method: UploadRequestMethod
}

export type CustomUploadRequestOption = (
  option: UploadRequestOption,
  info: {
    defaultRequest: (
      option: UploadRequestOption,
    ) => { abort: () => void } | void
  },
) => void | { abort: () => void }

export interface UploadProps {
  name?: string
  style?: CSSProperties
  className?: string
  disabled?: boolean
  component?: Component | string
  action?: Action
  method?: UploadRequestMethod
  directory?: boolean
  data?:
    | Record<string, unknown>
    | ((file: VcFile | string | Blob) => Record<string, unknown>)
  headers?: UploadRequestHeader
  accept?: string | AcceptConfig
  multiple?: boolean
  capture?: string
  beforeUpload?: (
    file: VcFile,
    FileList: VcFile[],
  ) => BeforeUploadFileType | Promise<void | BeforeUploadFileType> | void
  customRequest?: CustomUploadRequestOption
  withCredentials?: boolean
  openFileDialogOnClick?: boolean
  prefixCls?: string
  id?: string
  classNames?: {
    input?: string
  }
  styles?: {
    input?: CSSProperties
  }
  hasControlInside?: boolean
  pastable?: boolean
}

export interface UploadEmits {
  batchStart: [
    fileList: {
      file: VcFile
      parsedFile: Exclude<BeforeUploadFileType, boolean> | null
    }[],
  ]
  start: [file: VcFile]
  error: [error: Error, ret: Record<string, unknown>, file: VcFile | null]
  success: [
    response: Record<string, unknown>,
    file: VcFile | null,
    xhr: XMLHttpRequest,
  ]
  progress: [event: UploadProgressEvent, file: VcFile | null]
  click: [e: MouseEvent | KeyboardEvent]
  mouseenter: [e: MouseEvent]
  mouseleave: [e: MouseEvent]
}
