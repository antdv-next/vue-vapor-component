<script setup lang="ts">
  import Upload from '@vapor-component/upload'

  import '@/styles/upload.less'

  const handleChange = (file: any) => {
    console.log('Upload file:', file.name, file.type, file.size)
  }

  const handleSuccess = (response: any) => {
    console.log('Upload success:', response)
  }

  const handleError = (error: any) => {
    console.log('Upload error:', error)
  }
</script>

<template>
  <div>
    <p>Basic Upload Demo</p>
    <Upload
      action="https://httpbin.org/post"
      name="file"
      @start="handleChange"
      @success="handleSuccess"
      @error="handleError"
    >
      <button type="button">Click to Upload</button>
    </Upload>
  </div>
</template>
