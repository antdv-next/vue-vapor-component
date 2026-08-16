<script setup vapor lang="ts">
  import type {
    BeforeUploadFileType,
    UploadProgressEvent,
    UploadProps,
    UploadRequestError,
    UploadRequestOption,
    VcFile,
  } from './interface'

  import { clsx } from '@v-c/util'
  import pickAttrs from '@v-c/util/dist/pickAttrs'
  import {
    computed,
    onMounted,
    onUnmounted,
    onUpdated,
    ref,
    shallowRef,
    useAttrs,
  } from 'vue'

  import defaultRequest from './request'
  import attrAccept from './utils/attrAccept'
  import traverseFileTree from './utils/traverseFileTree'
  import getUid from './utils/uid'

  defineOptions({ name: 'Upload', inheritAttrs: false })

  const props = withDefaults(defineProps<UploadProps>(), {
    prefixCls: 'vc-upload',
    name: 'file',
    component: 'span',
    multiple: false,
    withCredentials: false,
    openFileDialogOnClick: true,
    hasControlInside: false,
    pastable: false,
  })
  const emit = defineEmits<{
    'batch-start': [
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
    'mouse-enter': [e: MouseEvent]
    'mouse-leave': [e: MouseEvent]
  }>()
  const attrs = useAttrs()

  // ==================== State ====================
  const uid = shallowRef(getUid())
  const fileInputRef = ref<HTMLInputElement>()
  const reqs = ref<Record<string, { abort(): void }>>({})
  const isMounted = ref(false)

  // ==================== Computed ====================
  const cls = computed(() =>
    clsx({
      [props.prefixCls]: true,
      [`${props.prefixCls}-disabled`]: props.disabled,
      [props.className!]: !!props.className,
    }),
  )

  const acceptFormat = computed(() =>
    typeof props.accept === 'string'
      ? props.accept
      : (props.accept?.format as string | undefined),
  )

  const dirProps = computed(() =>
    props.directory
      ? {
          directory: 'directory' as const,
          webkitdirectory: 'webkitdirectory' as const,
        }
      : {},
  )

  const inputStyle = computed(() => ({
    display: 'none',
    ...(props.styles?.input ?? {}),
  }))

  const captureAttr = computed(() =>
    props.capture !== undefined && props.capture !== null
      ? ({ capture: props.capture as 'user' | 'environment' } as const)
      : ({} as const),
  )

  // ==================== Filter ====================
  const filterFile = (file: VcFile | File, force = false) => {
    const { accept, directory } = props

    let filterFn: ((file: VcFile) => boolean) | undefined
    let format: string | undefined

    if (typeof accept === 'string') {
      format = accept
    } else if (accept) {
      const { filter, format: fmt } = accept
      format = fmt
      filterFn = filter === 'native' ? () => true : filter
    }

    const mergedFilter =
      filterFn ??
      (directory || force ? (f: VcFile) => attrAccept(f, format) : () => true)

    return mergedFilter(file as VcFile)
  }

  // ==================== Click / Key ====================
  const onClick = (event: MouseEvent | KeyboardEvent) => {
    if (!fileInputRef.value) return

    const target = event.target as HTMLElement
    if (target && target.tagName === 'BUTTON') {
      const parent = fileInputRef.value.parentNode as HTMLDivElement
      parent.focus()
      target.blur()
    }

    fileInputRef.value.click()
    emit('click', event)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      onClick(e)
    }
  }

  // ==================== Drop / Drag ====================
  const onFileDrop = (e: DragEvent) => {
    e.preventDefault()
    if (e.type === 'drop' && e.dataTransfer) {
      onDataTransferFiles(e.dataTransfer)
    }
  }

  const onFileDragOver = (e: DragEvent) => {
    e.preventDefault()
  }

  // ==================== Paste ====================
  const onFilePaste = async (e: ClipboardEvent) => {
    const { pastable } = props
    if (!pastable) return

    const clipboardData = e.clipboardData
    if (!clipboardData) return

    const hasFiles =
      clipboardData.files?.length > 0 ||
      [...(clipboardData.items ?? [])].some(item => item.kind === 'file')

    if (hasFiles) {
      e.preventDefault()
      await onDataTransferFiles(clipboardData)
    }
  }

  // ==================== Process / Upload ====================
  interface ParsedFileInfo {
    origin: VcFile
    action: string | null
    data: Record<string, unknown> | undefined
    parsedFile: VcFile | null
  }

  const processFile = async (
    file: VcFile,
    fileList: VcFile[],
  ): Promise<ParsedFileInfo> => {
    const { beforeUpload } = props

    let transformedFile: BeforeUploadFileType | undefined = file
    if (beforeUpload) {
      try {
        const result = await beforeUpload(file, fileList)
        transformedFile = result === undefined ? file : result
      } catch {
        transformedFile = false
      }
      if (transformedFile === false) {
        return { origin: file, parsedFile: null, action: null, data: undefined }
      }
    }

    // Resolve action (string or async fn)
    const { action } = props
    const mergedAction =
      typeof action === 'function' ? await action(file) : (action as string)

    // Resolve data (object or async fn)
    const { data } = props
    const mergedData =
      typeof data === 'function'
        ? await data(file)
        : (data as Record<string, unknown> | undefined)

    // Build parsed file
    const parsedData =
      typeof transformedFile === 'object' || typeof transformedFile === 'string'
        ? transformedFile
        : file

    let parsedFile: File
    if (parsedData instanceof File) {
      parsedFile = parsedData
    } else {
      parsedFile = new File([parsedData as BlobPart], file.name, {
        type: file.type,
      })
    }

    const mergedParsedFile = parsedFile as VcFile
    mergedParsedFile.uid = file.uid

    return {
      origin: file,
      data: mergedData,
      parsedFile: mergedParsedFile,
      action: mergedAction,
    }
  }

  const uploadFiles = (files: File[]) => {
    const originFiles = [...files] as VcFile[]

    const postFiles = originFiles.map(file => {
      const vcFile = file as VcFile & { uid?: string }
      vcFile.uid = getUid()
      return processFile(vcFile, originFiles)
    })

    Promise.all(postFiles).then(fileList => {
      emit(
        'batch-start',
        fileList.map(({ origin, parsedFile }) => ({
          file: origin,
          parsedFile,
        })),
      )

      fileList.filter(file => file.parsedFile !== null).forEach(post)
    })
  }

  const post = ({ data, origin, action, parsedFile }: ParsedFileInfo) => {
    if (!isMounted.value) return
    if (!parsedFile || !action) return

    const { customRequest, name, headers, withCredentials, method } = props
    const { uid: fileUid } = origin
    const request = customRequest || defaultRequest

    const requestOption: UploadRequestOption = {
      action,
      filename: name,
      data,
      file: parsedFile,
      headers,
      withCredentials,
      method: method ?? 'post',
      onProgress: (e: UploadProgressEvent) => {
        emit('progress', e, parsedFile)
      },
      onSuccess: (ret: any, xhr?: XMLHttpRequest) => {
        if (xhr) {
          emit('success', ret, parsedFile, xhr)
        }
        delete reqs.value[fileUid]
      },
      onError: (err: UploadRequestError | ProgressEvent, ret?: any) => {
        if (err instanceof Error) {
          emit('error', err, ret as Record<string, unknown>, parsedFile)
        }
        delete reqs.value[fileUid]
      },
    }

    emit('start', origin)
    const abortHandle = request(requestOption, { defaultRequest })
    if (abortHandle?.abort) {
      reqs.value[fileUid] = abortHandle
    }
  }

  const onDataTransferFiles = async (dataTransfer: DataTransfer) => {
    const { multiple, directory } = props
    const items: DataTransferItem[] = [...(dataTransfer.items ?? [])]
    let files: File[] = [...(dataTransfer.files ?? [])]

    if (directory) {
      files = await traverseFileTree(items as any[], f => filterFile(f))
      uploadFiles(files)
    } else {
      let acceptFiles = [...files].filter(file => filterFile(file, true))
      if (multiple === false) {
        acceptFiles = acceptFiles.slice(0, 1)
      }
      uploadFiles(acceptFiles)
    }
  }

  // ==================== File input change ====================
  const onChange = (e: Event) => {
    const files = (e.target as HTMLInputElement).files
    const acceptedFiles = [...(files ?? [])].filter(file => filterFile(file))
    uploadFiles(acceptedFiles)
    reset()
  }

  const reset = () => {
    uid.value = getUid()
  }

  // ==================== Abort ====================
  const abort = (file?: VcFile) => {
    if (file) {
      const key = file.uid ?? (file as any)
      const handle = reqs.value[key]
      if (handle && handle.abort) {
        handle.abort()
      }
      delete reqs.value[key]
    } else {
      Object.keys(reqs.value).forEach(key => {
        const handle = reqs.value[key]
        if (handle && handle.abort) {
          handle.abort()
        }
        delete reqs.value[key]
      })
    }
  }

  defineExpose({ abort })

  // ==================== Lifecycle ====================
  let prevPastable: boolean | undefined

  onMounted(() => {
    isMounted.value = true
    if (props.pastable) {
      document.addEventListener('paste', onFilePaste)
    }
    prevPastable = props.pastable
  })

  onUpdated(() => {
    const { pastable } = props
    if (pastable && !prevPastable) {
      document.addEventListener('paste', onFilePaste)
    } else if (!pastable && prevPastable) {
      document.removeEventListener('paste', onFilePaste)
    }
    prevPastable = pastable
  })

  onUnmounted(() => {
    isMounted.value = false
    abort()
    document.removeEventListener('paste', onFilePaste)
  })

  // ==================== Events ====================
  const isDisabled = computed(() => props.disabled)
  const canOpenFile = computed(
    () => !isDisabled.value && props.openFileDialogOnClick,
  )

  const onWrapMouseEnter = (e: MouseEvent) => {
    if (isDisabled.value) return
    emit('mouse-enter', e)
  }

  const onWrapMouseLeave = (e: MouseEvent) => {
    if (isDisabled.value) return
    emit('mouse-leave', e)
  }

  const onWrapClick = (e: MouseEvent) => {
    console.log('[Upload] onWrapClick', {
      isDisabled: isDisabled.value,
      canOpenFile: canOpenFile.value,
    })
    if (!isDisabled.value && canOpenFile.value) {
      onClick(e)
    }
  }

  const onWrapKeyDown = (e: KeyboardEvent) => {
    if (!isDisabled.value && canOpenFile.value) {
      onKeyDown(e)
    }
  }
</script>

<template>
  <div
    :class="cls"
    :style="style"
    :tabindex="hasControlInside ? undefined : 0"
    :role="hasControlInside ? undefined : 'button'"
    @click="onWrapClick"
    @keydown="onWrapKeyDown"
    @mouseenter="onWrapMouseEnter"
    @mouseleave="onWrapMouseLeave"
    @drop="onFileDrop"
    @dragover="onFileDragOver"
  >
    <input
      v-bind="{
        ...pickAttrs(attrs as Record<string, any>, { aria: true, data: true }),
        ...(dirProps as any),
        ...captureAttr,
      }"
      :id="id"
      :name="name"
      :disabled="disabled"
      type="file"
      ref="fileInputRef"
      @click="e => (e as Event).stopPropagation()"
      :key="uid"
      :style="inputStyle"
      :class="classNames?.input"
      :multiple="multiple"
      :accept="acceptFormat"
      @change="onChange"
    />
    <slot />
  </div>
</template>
