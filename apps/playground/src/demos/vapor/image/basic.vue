<script setup vapor lang="ts">
  import Image, { PreviewGroup } from '@vapor-component/image'

  import { useImage } from '@/composables/useImage'
  import '@/styles/image.less'

  const { IMG1, IMG2 } = useImage()
</script>

<template>
  <label>
    Image:
    <Image
      :src="IMG1"
      :width="200"
      style="margin-right: 24px"
      @click="() => console.log('click')"
      alt="basic"
      :preview="{
        zIndex: 9999,
      }"
    />
    <Image
      :src="IMG2"
      :width="200"
      style="margin-right: 24px"
      :preview="{ cover: 'Click to Preview' }"
    >
      <template
        #actionsRender="{
          actions,
          transform,
          current,
          total,
          image,
          minScale,
          maxScale,
          actionsCls,
          actionCls,
          disabledCls,
        }"
      >
        <div :class="actionsCls">
          <button
            @click="actions.onZoomOut"
            :class="[actionCls, transform.scale <= minScale ? disabledCls : '']"
            :disabled="transform.scale <= minScale"
          >
            -
          </button>
          <button
            @click="actions.onZoomIn"
            :class="[actionCls, transform.scale >= maxScale ? disabledCls : '']"
            :disabled="transform.scale >= maxScale"
          >
            +
          </button>
          <button @click="actions.onRotateLeft" :class="[actionCls]">↺</button>
          <button @click="actions.onRotateRight" :class="[actionCls]">↻</button>
          <button @click="actions.onFlipX" :class="[actionCls]">⇋</button>
          <button @click="actions.onFlipY" :class="[actionCls]">⇅</button>
          <button @click="actions.onReset" :class="[actionCls]">reset</button>
        </div>
      </template>
      <template #closeIcon>
        <span style="color: red">x</span>
      </template>
    </Image>
    <PreviewGroup>
      <Image :src="IMG1" :width="200" style="margin-right: 24px" alt="basic" />
      <Image :src="IMG2" :width="200" style="margin-right: 24px" alt="basic" />
      <template #prevIcon> < </template>
      <template #nextIcon> > </template>
    </PreviewGroup>
  </label>
</template>
