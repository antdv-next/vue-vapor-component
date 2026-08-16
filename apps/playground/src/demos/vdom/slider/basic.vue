<script setup lang="ts">
  import Slider from '@vapor-component/slider'

  import { useSlider } from '@/composables/useSlider.ts'
  import '@/styles/slider.less'

  const { value, rangeValue, marksValue, disabledValue, verticalValue, marks } =
    useSlider()
</script>

<template>
  <div style="padding: 24px; max-width: 600px">
    <h3>Slider</h3>

    <h4>Basic</h4>
    <Slider
      :value="value"
      :min="0"
      :max="100"
      :step="1"
      @change="
        v => {
          value = v as number
        }
      "
    />
    <p>Value: {{ value }}</p>

    <h4>Range</h4>
    <Slider
      :value="rangeValue"
      :min="0"
      :max="100"
      :step="1"
      :range="true"
      @change="
        v => {
          rangeValue = v as number[]
        }
      "
    />
    <p>Range: {{ rangeValue.join(' - ') }}</p>

    <h4>With Marks</h4>
    <Slider
      :value="marksValue"
      :min="0"
      :max="100"
      :step="5"
      :marks="marks"
      :dots="true"
      @change="
        v => {
          marksValue = v as number
        }
      "
    />
    <p style="margin-top: 15px">Marks: {{ marksValue }}</p>

    <h4>Disabled</h4>
    <Slider
      :value="disabledValue"
      :min="0"
      :max="100"
      :step="1"
      :disabled="true"
    />

    <h4>Vertical</h4>
    <div style="display: flex; gap: 40px; height: 240px">
      <Slider
        :value="verticalValue"
        :min="0"
        :max="100"
        :step="1"
        :vertical="true"
        @change="
          v => {
            verticalValue = v as number
          }
        "
      />
      <span>{{ verticalValue }}</span>
    </div>
  </div>
</template>
