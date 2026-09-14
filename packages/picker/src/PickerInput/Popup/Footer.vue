<script setup vapor lang="ts">
import type { FooterProps } from './interface'
import { clsx } from '@v-c/util'
import { computed, useSlots } from 'vue'
import useTimeInfo from '../../hooks/useTimeInfo'
import { usePickerContext } from '../context'

defineOptions({ name: 'Footer', inheritAttrs: false })

const props = defineProps<FooterProps>()
const slots = useSlots()

const pickerCtx = usePickerContext()

const mode = computed(() => props.mode)
const internalMode = computed(() => props.internalMode)
const renderExtraFooter = computed(() => !!slots.extraFooter)
const showNow = computed(() => props.showNow)
const showTime = computed(() => props.showTime as any)
const invalid = computed(() => props.invalid)
const needConfirm = computed(() => props.needConfirm)

const generateConfig = computed(() => props.generateConfig || pickerCtx.value.generateConfig)
const disabledDate = computed(() => props.disabledDate)

const prefixCls = computed(() => pickerCtx.value.prefixCls || 'vc-picker')
const locale = computed(() => pickerCtx.value.locale)
const buttonComponent = computed(() => pickerCtx.value.button ?? 'button')
const classNames = computed(() => pickerCtx.value.classNames)
const styles = computed(() => pickerCtx.value.styles)

// >>> Now
const now = computed(() => generateConfig.value.getNow())

const [getValidTime] = useTimeInfo(generateConfig, showTime, now)

const nowDisabled = computed(() =>
  disabledDate.value
    ? disabledDate.value(now.value, { type: mode.value })
    : false,
)

const onInternalNow = () => {
  if (!nowDisabled.value) {
    const validateNow = getValidTime(now.value)
    props.onNow?.(validateNow)
  }
}

// ========================= Render =========================
const footerPrefixCls = computed(() => `${prefixCls.value}-footer`)
const nowPrefixCls = computed(() => `${prefixCls.value}-now`)
const nowBtnPrefixCls = computed(() => `${nowPrefixCls.value}-btn`)

const nowText = computed(() =>
  internalMode.value === 'date' ? locale.value.today : locale.value.now,
)

const extraNode = computed(() => renderExtraFooter.value)

const showRange = computed(() => !!showNow.value || !!needConfirm.value)

const footerCls = computed(() =>
  clsx(footerPrefixCls.value, classNames.value?.popup?.footer),
)
const footerStyle = computed(() => styles.value?.popup?.footer)
</script>

<template>
  <div
    v-if="extraNode || showRange"
    :class="footerCls"
    :style="footerStyle"
  >
    <div v-if="extraNode" :class="`${footerPrefixCls}-extra`">
      <slot name="extraFooter" :mode="mode"></slot>
    </div>
    <ul v-if="showRange" :class="`${prefixCls}-ranges`">
      <li v-if="showNow" :class="nowPrefixCls">
        <a
          :class="clsx(nowBtnPrefixCls, nowDisabled && `${nowBtnPrefixCls}-disabled`)"
          :aria-disabled="nowDisabled"
          @click="onInternalNow"
        >
          {{ nowText }}
        </a>
      </li>
      <li v-if="needConfirm" :class="`${prefixCls}-ok`">
        <component :is="buttonComponent" :disabled="invalid" @click="onSubmit">
          {{ locale.ok }}
        </component>
      </li>
    </ul>
  </div>
</template>
