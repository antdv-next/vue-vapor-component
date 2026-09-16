<script setup lang="ts">
  import Picker, { RangePicker } from '@vapor-component/picker'
  import dayjsGenerateConfig from '@vapor-component/picker/generate/dayjs'
  import { ref } from 'vue'

  import '@/styles/picker.less'

  const generateConfig = dayjsGenerateConfig
  const now = generateConfig.getNow()

  const singlePresets = [
    { label: 'Today', value: now },
    { label: 'A week ago', value: generateConfig.addDate(now, -7) },
    { label: 'End of month', value: generateConfig.getEndDate(now) },
  ]

  const rangePresets = [
    {
      label: 'Today',
      value: () => [generateConfig.getNow(), generateConfig.getNow()],
    },
    {
      label: '± 1 week',
      value: () => {
        const n = generateConfig.getNow()
        return [generateConfig.addDate(n, -7), generateConfig.addDate(n, 7)]
      },
    },
    {
      label: 'Last month',
      value: () => {
        const n = generateConfig.getNow()
        return [generateConfig.addMonth(n, -1), generateConfig.getNow()]
      },
    },
  ]

  const singleValue = ref<any>(generateConfig.getNow())
  const datetimeValue = ref<any>(generateConfig.getNow())
  const rangeValue = ref<any>(null)
  const rangeTimeValue = ref<any>(null)
  const disabledFlag = ref(false)
  const allowClearFlag = ref(true)

  const disabledDate = (date: any) =>
    generateConfig.isAfter(
      date,
      generateConfig.addMonth(generateConfig.getNow(), 1),
    )

  function onSingleChange(val: any, str: any) {
    singleValue.value = val
    console.log('Picker change:', str)
  }

  function onDatetimeChange(val: any, str: any) {
    datetimeValue.value = val
    console.log('datetime change:', str)
  }

  function onRangeChange(val: any, str: any) {
    rangeValue.value = val
    console.log('RangePicker change:', str)
  }

  function onRangeTimeChange(val: any, str: any) {
    rangeTimeValue.value = val
    console.log('RangePicker datetime change:', str)
  }
</script>

<template>
  <div class="picker-demo">
    <h4>Picker</h4>

    <div class="demo-controls">
      <label><input type="checkbox" v-model="disabledFlag" />disabled</label>
      <label
        ><input type="checkbox" v-model="allowClearFlag" />allowClear</label
      >
    </div>

    <div class="demo-area">
      <div class="demo-section">
        <p>Basic + presets</p>
        <Picker
          :generate-config="generateConfig"
          :value="singleValue"
          :presets="singlePresets"
          :disabled="disabledFlag"
          :allow-clear="allowClearFlag"
          :placeholder="'Select date'"
          @change="onSingleChange"
          @open-change="open => console.log('open:', open)"
          @calendar-change="(_, str) => console.log('calendar change:', str)"
        />
        <p>
          Current value: <code>{{ String(singleValue) }}</code>
        </p>
      </div>

      <div class="demo-section">
        <p>Datetime (showTime + needConfirm footer)</p>
        <Picker
          :generate-config="generateConfig"
          :value="datetimeValue"
          show-time
          show-now
          @change="onDatetimeChange"
          @ok="val => console.log('OK:', val)"
        />
      </div>

      <div class="demo-section">
        <p>Other modes</p>
        <Picker
          :generate-config="generateConfig"
          :picker="'month'"
          :default-value="now"
        />
        <Picker
          :generate-config="generateConfig"
          :picker="'week'"
          :default-value="now"
        />
        <Picker
          :generate-config="generateConfig"
          :picker="'quarter'"
          :default-value="now"
        />
        <Picker
          :generate-config="generateConfig"
          :picker="'year'"
          :default-value="now"
        />
        <Picker
          :generate-config="generateConfig"
          :picker="'decade'"
          :default-value="now"
        />
      </div>

      <div class="demo-section">
        <p>RangePicker + presets</p>
        <RangePicker
          :generate-config="generateConfig"
          :value="rangeValue"
          :presets="rangePresets"
          :allow-clear="allowClearFlag"
          :placeholder="['Start date', 'End date']"
          @change="onRangeChange"
          @calendar-change="(_, str) => console.log('range calendar:', str)"
        />
        <p>
          Current value: <code>{{ String(rangeValue) }}</code>
        </p>
      </div>

      <div class="demo-section">
        <p>RangePicker datetime + renderExtraFooter</p>
        <RangePicker
          :generate-config="generateConfig"
          :value="rangeTimeValue"
          :presets="rangePresets"
          show-time
          render-extra-footer="Range with time — pick both sides."
        />
      </div>

      <div class="demo-section">
        <p>Disabled future dates</p>
        <Picker
          :generate-config="generateConfig"
          :default-value="now"
          :disabled-date="disabledDate"
        />
      </div>
    </div>
  </div>
</template>
