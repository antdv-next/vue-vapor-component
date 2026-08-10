<script setup vapor lang="ts">
  import Slick from '@vapor-component/slick'

  import { useSlick } from '@/composables/useSlick.ts'
  import '@/styles/slick.less'
  import '@/styles/slick-theme.less'

  const { images } = useSlick()
</script>

<template>
  <div class="slider-container">
    <Slick
      :dots="true"
      :infinite="true"
      :speed="500"
      :slides-to-show="1"
      :slides-to-scroll="1"
    >
      <div
        v-for="(img, i) in images"
        :key="`${img}-${i}`"
        class="slide-item"
      >
        <img :src="img" :alt="`slide-${i + 1}`" />
      </div>
    </Slick>
    <Slick
      :dots="true"
      :infinite="true"
      :speed="500"
      :slides-to-show="1"
      :slides-to-scroll="1"
    >
      <div
        v-for="i in 6"
        :key="i"
        class="slide-item"
      >
        <h3>{{ i }}</h3>
      </div>
    </Slick>
  </div>
</template>
