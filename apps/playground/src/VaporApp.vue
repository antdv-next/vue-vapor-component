<script setup vapor lang="ts">
  import type { CollapseProps } from '@vapor-component/collapse'

  import Checkbox from '@vapor-component/checkbox'
  import Collapse from '@vapor-component/collapse'
  import Dialog from '@vapor-component/dialog'
  import Drawer from '@vapor-component/drawer'
  import Image, { PreviewGroup } from '@vapor-component/image'
  import Input from '@vapor-component/input'
  import InputNumber from '@vapor-component/input-number'
  import MutateObserver from '@vapor-component/mutate-observer'
  import Portal from '@vapor-component/portal'
  import { QRCodeCanvas, QRCodeSVG } from '@vapor-component/qrcode'
  import Rate from '@vapor-component/rate'
  import ResizeObserver from '@vapor-component/resize-observer'
  import Segmented from '@vapor-component/segmented'
  import Switch from '@vapor-component/switch'
  import TextArea from '@vapor-component/textarea'
  import { ref, computed, onUnmounted, version, h } from 'vue'

  import './styles/switch.less'
  import './styles/rate.less'
  import './styles/segmented.less'
  import './styles/input.less'
  import './styles/input-number.less'
  import './styles/textarea.less'
  import './styles/portal.less'
  import './styles/image.less'
  import './styles/collapse.less'
  import './styles/dialog.less'
  import './styles/drawer-common.less'
  import './styles/drawer-motion.less'

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
  const show = ref(true)
  const customizeContainer = ref(false)
  const lock = ref(false)
  const divRef = ref<HTMLDivElement | null>(null)

  onUnmounted(() => {
    console.log('Demo unmount!!')
  })

  // ===================== Collapse demo =====================
  // NOTE: this app is mounted with `createVaporApp` (no vdom interop), so panel
  // content is provided as plain strings rather than `h()` vnodes, and the
  // default arrow icon is used. (`h()` VueNodes render in an interop host.)
  const collapseActiveKey = ref<(string | number)[]>(['1'])
  const collapseText =
    'A dog is a type of domesticated animal. Known for its loyalty and faithfulness, it can be found as a welcome guest in many households across the world.'
  const collapseItems = computed<CollapseProps['items']>(() => [
    { key: '1', label: 'This is panel header 1', children: collapseText },
    { key: '2', label: 'This is panel header 2', children: collapseText },
    {
      key: '3',
      label: 'This is panel header 3 (disabled)',
      collapsible: 'disabled',
      children: collapseText,
    },
  ])

  const getContainer = computed(() =>
    customizeContainer.value ? () => divRef.value : undefined,
  )
  const contentCls = computed(() => (customizeContainer.value ? '' : 'abs'))

  function toggleShow() {
    show.value = !show.value
  }

  function toggleCustomizeContainer() {
    customizeContainer.value = !customizeContainer.value
  }

  function toggleLock() {
    lock.value = !lock.value
  }
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
  const visible = ref(false)
  const open = ref(false)

  function onClose() {
    open.value = false
  }

  function onToggle() {
    open.value = !open.value
  }
  const maskMotion = {
    appear: true,
    name: 'mask-motion',
  }

  const motion: any = (placement: string) =>
    ({
      appear: true,
      name: `panel-motion-${placement}`,
    }) as any

  const motionProps = {
    maskMotion,
    motion,
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
    <hr />
    <label>
      Portal:
      <div style="height: 200px">
        <div style="border: 2px solid red">
          Real Version: {{ version }}
          <button @click="toggleShow">show: {{ show.toString() }}</button>
          <button @click="toggleCustomizeContainer">
            customize container: {{ customizeContainer.toString() }}
          </button>
          <button @click="toggleLock">
            lock scroll: {{ lock.toString() }}
          </button>
          <div
            id="customize"
            ref="divRef"
            style="border: 1px solid green; min-height: 10px"
          />
        </div>

        <Portal :open="show" :get-container="getContainer" :auto-lock="lock">
          <p class="root" :class="[contentCls]">Hello Root</p>
          <Portal :open="show" :get-container="getContainer" :auto-lock="lock">
            <p class="parent" :class="[contentCls]">Hello Parent</p>
            <Portal
              :open="show"
              :get-container="getContainer"
              :auto-lock="lock"
            >
              <p class="children" :class="[contentCls]">Hello Children</p>
            </Portal>
          </Portal>
        </Portal>
      </div>
    </label>
    <hr />
    <label>
      Image:
      <Image
        src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
        :width="200"
        style="margin-right: 24px"
        @click="
          () => {
            console.log('click')
          }
        "
        alt="basic"
        :preview="{
          zIndex: 9999,
        }"
      />
      <Image
        src="https://gw.alipayobjects.com/mdn/rms_08e378/afts/img/A*P0S-QIRUbsUAAAAAAAAAAABkARQnAQ"
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
        <Image
          src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
          :width="200"
          style="margin-right: 24px"
          alt="basic"
        />
        <Image
          src="https://gw.alipayobjects.com/mdn/rms_08e378/afts/img/A*P0S-QIRUbsUAAAAAAAAAAABkARQnAQ"
          :width="200"
          style="margin-right: 24px"
          alt="basic"
        />
        <template #prevIcon> < </template>
        <template #nextIcon> > </template>
      </PreviewGroup>
    </label>
    <hr />
    <label>
      Collapse:
      <Collapse
        :active-key="collapseActiveKey"
        :items="collapseItems"
        @change="k => (collapseActiveKey = k)"
      />
    </label>
    <hr />
    <label>
      Dialog:
      <button @click="visible = !visible">Open Dialog</button>
      <Dialog
        v-model:visible="visible"
        title="Dialog Title"
        :get-container="getContainer"
        :force-render="true"
        :mask-closable="false"
        @close="
          () => {
            console.log('Dialog closed')
            visible = !visible
          }
        "
      >
        <p>This is the content of the dialog.</p>
        <p>You can put any content here, such as forms, text, or images.</p>
        <template #footer>
          <button @click="visible = !visible">Close</button>
        </template>
      </Dialog>
    </label>
    <hr />
    <label>
      Drawer:
      <Drawer
        :open="open"
        placement="right"
        width="60%"
        v-bind="motionProps"
        :after-open-change="
          c => {
            console.log('transitionEnd: ', c)
          }
        "
        @close="onClose"
      >
        content
      </Drawer>
      <button @click="onToggle">打开</button>
    </label>
  </fieldset>
</template>
