<script setup vapor lang="ts">
  import Checkbox from '@vapor-component/checkbox'
  import Input from '@vapor-component/input'
  import InputNumber from '@vapor-component/input-number'
  import MutateObserver from '@vapor-component/mutate-observer'
  import { QRCodeCanvas, QRCodeSVG } from '@vapor-component/qrcode'
  import Rate from '@vapor-component/rate'
  import ResizeObserver from '@vapor-component/resize-observer'
  import Segmented from '@vapor-component/segmented'
  import Switch from '@vapor-component/switch'
  import TextArea from '@vapor-component/textarea'
  import { ref } from 'vue'

  import './styles/switch.less'
  import './styles/rate.less'
  import './styles/segmented.less'
  import './styles/input.less'
  import './styles/input-number.less'
  import './styles/textarea.less'

  defineOptions({ name: 'VaporApp' })
  const checked1 = ref(false)
  const checked2 = ref(false)
  const times = ref(0)
  const disabled = ref(false)
  const width = ref(0)
  const height = ref(0)
  function onResize(size: { width: number; height: number }) {
    const { width: w, height: h } = size
    console.log('Resize:', '\n', 'BoundingBox', w, h, '\n', 'Offset')
    times.value += 1
    width.value = w
    height.value = h
  }
  const internalRef = ref()

  function onMutate(mutations: MutationRecord[], observer: MutationObserver) {
    console.log(mutations)
    console.log(observer)
    console.log(internalRef)
  }

  const flag = ref(true)
  const value = ref(1)
  const textValue = ref('hello\ntextarea')
  function handleTextAreaChange(e: Event) {
    textValue.value = (e.target as HTMLTextAreaElement).value
  }
</script>

<template>
  <fieldset>
    <legend>vapor mode</legend>
    <label>
      qrcode-canvas:
      <QRCodeCanvas value="https://www.baidu.com" color="red" />
    </label>
    <label>
      qrcode-svg:
      <QRCodeSVG value="https://www.baidu.com" />
    </label>
    <hr />
    <label>
      checkbox:
      <Checkbox
        :checked="checked1"
        @change="e => (checked1 = e.target.checked)"
      />
    </label>
    <hr />
    <label>
      switch:
      <Switch
        v-model:checked="checked2"
        checked-children="开"
        un-checked-children="关"
        @change="e => console.log(e)"
      />
    </label>
    <hr />
    <label>
      ResizeObserver:
      <div style="transform: scale(1.1); transform-origin: 0% 0%">
        <Checkbox :checked="disabled" @change="() => (disabled = !disabled)" />
        Disabled Observe >>> Resize times: {{ times }} {{ width }}/{{ height }}
      </div>
      <ResizeObserver :disabled="disabled" @resize="onResize">
        <textarea placeholder="I'm a textarea!" />
      </ResizeObserver>
    </label>
    <hr />
    <label>
      MutateObserver:
      <MutateObserver @mutate="onMutate">
        <button
          ref="internalRef"
          :class="[flag ? 'aaa' : 'bbb']"
          @click="flag = !flag"
        >
          click
        </button>
      </MutateObserver>
    </label>
    <hr />
    <label>
      Rate:
      <Rate
        :default-value="2.5"
        style="font-size: 40px"
        allow-half
        :allow-clear="false"
        @change="(v: number) => console.log('selected star', v)"
      />
    </label>
    <hr />
    <label>
      Segmented:
      <Segmented
        :options="['ios', 'android', 'harmony']"
        default-value="ios"
        @change="v => console.log('selected option', v)"
      />
    </label>
    <hr />
    <label>
      Input:
      <Input
        prefix-cls="vc-input"
        prefix="propPrefix"
        suffix="propSuffix"
        addon-before="propBefore"
        addon-after="propAfter"
        allow-clear
        :count="{ show: true, max: 5 }"
      />
      <br />
      <br />
      &nbsp;
      <Input prefix-cls="vc-input" allow-clear :count="{ show: true, max: 5 }">
        <template #prefix>slotPrefix</template>
        <template #suffix>slotSuffix</template>
        <template #addonBefore>slotBefore</template>
        <template #addonAfter>slotAfter</template>
        <template #clearIcon>*</template>
      </Input>
    </label>
    <hr />
    <label>
      InputNumber:
      <InputNumber v-model:value="value" :min="1" :max="5" suffix="%" />
    </label>
    <hr />
    <label>
      TextArea:
      <TextArea
        :value="textValue"
        prefix-cls="vc-textarea"
        prefix="propPrefix"
        suffix="propSuffix"
        allow-clear
        :count="{ show: true, max: 20 }"
        :auto-size="{ minRows: 2, maxRows: 4 }"
        @change="handleTextAreaChange"
      />
      <br />
      <br />
      <TextArea
        prefix-cls="vc-textarea"
        allow-clear
        :count="{ show: true, max: 10 }"
        placeholder="slot based textarea"
      >
        <template #prefix>slotPrefix</template>
        <template #suffix>slotSuffix</template>
        <template #clearIcon>*</template>
      </TextArea>
    </label>
  </fieldset>
</template>
