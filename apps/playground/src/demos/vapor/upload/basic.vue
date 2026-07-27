<script setup vapor lang="ts">
  import Upload from '@vapor-component/upload'

  import '@/styles/upload.less'

  const onChange = (file: any) => {
    console.log('Upload file:', file.name, file.type, file.size)
  }

  const onSuccess = (response: any) => {
    console.log('Upload success:', response)
  }

  const onError = (error: any) => {
    console.log('Upload error:', error)
  }
</script>

<template>
  <div>
    <p>vapor — Upload Basic</p>
    <Upload
      action="https://httpbin.org/post"
      name="file"
      @start="onChange"
      @success="onSuccess"
      @error="onError"
    >
      <button type="button">Click to Upload (vapor)</button>
    </Upload>
  </div>
</template>
