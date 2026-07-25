<script setup lang="ts">
  import Image, { PreviewGroup } from '@vapor-component/image'
  import { h } from 'vue'

  import { useImage } from '@/composables/useImage.ts'
  import '@/styles/image.less'

  const { IMG1, IMG2 } = useImage()

  const defaultIcons = {
    rotateLeft: h('button', '<'),
    rotateRight: h('button', '>'),
    zoomIn: h('button', '+'),
    zoomOut: h('button', '-'),
    close: () => h('span', 'x'),
    left: h('button', '<-'),
    right: h('button', '->'),
    flipX: h('button', '^'),
    flipY: h(
      'button',
      { style: { display: 'inline-block', transform: 'rotate(180deg)' } },
      '^',
    ),
  }
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
        defaultIcons,
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
          actionCls,
          disabledCls,
        }"
      >
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
