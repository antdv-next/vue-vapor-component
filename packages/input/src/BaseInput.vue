<script setup vapor lang="ts">
  import type { BaseInputProps } from './interface'

  import { clsx } from '@v-c/util'
  import { computed, shallowRef, useSlots, h, Fragment, Text } from 'vue'

  import { hasAddon, hasPrefixSuffix } from './utils/commonUtils'

  defineOptions({ name: 'BaseInput', inheritAttrs: false })

  const props = defineProps<BaseInputProps>()
  const slots = useSlots()

  const containerRef = shallowRef<HTMLElement | null>(null)
  const groupRef = shallowRef<HTMLElement | null>(null)

  const hasAffix = computed(
    () => hasPrefixSuffix(props) || !!slots.prefix || !!slots.suffix,
  )
  const hasGroup = computed(
    () => hasAddon(props) || !!slots.addonBefore || !!slots.addonAfter,
  )
  const hasPrefix = computed(() => !!slots.prefix || !!props.prefix)
  const hasSuffix = computed(() => !!slots.suffix || !!props.suffix)
  const hasAddonBefore = computed(
    () => !!slots.addonBefore || !!props.addonBefore,
  )
  const hasAddonAfter = computed(() => !!slots.addonAfter || !!props.addonAfter)
  const hasAllowClear = computed(() => !!slots.clearIcon || props.allowClear)

  function onInputClick(e: MouseEvent) {
    if (containerRef.value?.contains(e.target as Element)) {
      props?.triggerFocus?.()
    }
  }

  function handleClearClick(event: MouseEvent) {
    props?.handleReset?.(event as any)
    props?.onClear?.()
  }

  function onClearMouseDown(e: MouseEvent) {
    // Do not trigger onBlur when clear input
    // https://github.com/ant-design/ant-design/issues/31200
    e.preventDefault()
  }

  const affixWrapperPrefixCls = computed(
    () => `${props.prefixCls}-affix-wrapper`,
  )
  const affixWrapperCls = computed(() =>
    clsx(
      affixWrapperPrefixCls.value,
      {
        [`${props.prefixCls}-disabled`]: props.disabled,
        [`${affixWrapperPrefixCls.value}-disabled`]: props.disabled,
        [`${affixWrapperPrefixCls.value}-focused`]: props.focused,
        [`${affixWrapperPrefixCls.value}-readonly`]: props.readOnly,
        [`${affixWrapperPrefixCls.value}-input-with-clear-btn`]:
          hasSuffix.value && props.allowClear && props.value,
      },
      props.classNames?.affixWrapper,
      props.classNames?.variant,
    ),
  )

  const clearIconBaseCls = computed(() => `${props.prefixCls}-clear-icon`)
  const needClear = computed(
    () => !props.disabled && !props.readOnly && !!props.value,
  )
  const clearBtnCls = computed(() =>
    clsx(clearIconBaseCls.value, {
      [`${clearIconBaseCls.value}-hidden`]: !needClear.value,
      [`${clearIconBaseCls.value}-has-suffix`]: hasSuffix.value,
    }),
  )

  const groupBaseCls = computed(() => `${props.prefixCls}-group`)
  const addonCls = computed(() => `${groupBaseCls.value}-addon`)
  const groupWrapperBaseCls = computed(() => `${groupBaseCls.value}-wrapper`)

  const mergedWrapperClassName = computed(() =>
    clsx(
      `${props.prefixCls}-wrapper`,
      groupBaseCls.value,
      props.classNames?.wrapper,
    ),
  )

  const mergedGroupClassName = computed(() =>
    clsx(
      groupWrapperBaseCls.value,
      {
        [`${groupWrapperBaseCls.value}-disabled`]: props.disabled,
      },
      props.classNames?.groupWrapper,
    ),
  )

  const suffixWrapCls = computed(() =>
    clsx(`${props.prefixCls}-suffix`, props.classNames?.suffix),
  )
  const prefixWrapCls = computed(() =>
    clsx(`${props.prefixCls}-prefix`, props.classNames?.prefix),
  )

  const affixWrapperTag = computed(
    () => props.components?.affixWrapper || 'span',
  )
  const groupWrapperTag = computed(
    () => props.components?.groupWrapper || 'span',
  )
  const wrapperTag = computed(() => props.components?.wrapper || 'span')
  const groupAddonTag = computed(() => props.components?.groupAddon || 'span')

  // Render a VueNode prop (string | VNode | array | function) inline
  const renderPrefix = computed(() => props.prefix || null)
  const renderSuffix = computed(() => props.suffix || null)
  const renderAddonBefore = computed(() => props.addonBefore || null)
  const renderAddonAfter = computed(() => props.addonAfter || null)
  const renderClearIcon = () =>
    typeof props.allowClear === 'object' && props.allowClear?.clearIcon
      ? props.allowClear.clearIcon
      : '✖'

  defineExpose({
    nativeElement: computed(() => groupRef.value || containerRef.value),
  })
</script>

<template>
  <!-- With addon (group wrapper) -->
  <component
    :is="groupWrapperTag"
    v-if="hasGroup"
    ref="groupRef"
    :class="mergedGroupClassName"
    :hidden="hidden"
    v-bind="$attrs"
  >
    <component :is="wrapperTag" :class="mergedWrapperClassName">
      <component :is="groupAddonTag" v-if="hasAddonBefore" :class="addonCls">
        <slot name="addonBefore">
          {{ renderAddonBefore }}
        </slot>
      </component>

      <!-- Affix wrapper or plain input -->
      <component
        :is="affixWrapperTag"
        v-if="hasAffix"
        ref="containerRef"
        :class="affixWrapperCls"
        :style="styles?.affixWrapper"
        v-bind="dataAttrs?.affixWrapper"
        @click="onInputClick"
      >
        <span v-if="hasPrefix" :class="prefixWrapCls" :style="styles?.prefix">
          <slot name="prefix">
            {{ renderPrefix }}
          </slot>
        </span>
        <slot />
        <span
          v-if="hasSuffix || hasAllowClear"
          :class="suffixWrapCls"
          :style="styles?.suffix"
        >
          <button
            v-if="hasAllowClear"
            type="button"
            :tabindex="-1"
            :class="clearBtnCls"
            @click="handleClearClick"
            @mousedown="onClearMouseDown"
          >
            <slot name="clearIcon">
              <template v-if="allowClear?.clearIcon">
                {{ allowClear.clearIcon }}
              </template>
              <template v-else>✖</template>
            </slot>
          </button>
          <slot name="suffix" v-if="hasSuffix">
            {{ renderSuffix }}
          </slot>
        </span>
      </component>
      <slot v-else />

      <component :is="groupAddonTag" v-if="hasAddonAfter" :class="addonCls">
        <slot name="addonAfter">
          {{ renderAddonAfter }}
        </slot>
      </component>
    </component>
  </component>

  <!-- Affix wrapper only (no addon) -->
  <component
    :is="affixWrapperTag"
    v-else-if="hasAffix"
    ref="containerRef"
    :class="affixWrapperCls"
    :style="styles?.affixWrapper"
    :hidden="hidden"
    v-bind="{ ...$attrs, ...(dataAttrs?.affixWrapper ?? {}) }"
    @click="onInputClick"
  >
    <span v-if="hasPrefix" :class="prefixWrapCls" :style="styles?.prefix">
      <slot name="prefix">
        {{ renderPrefix }}
      </slot>
    </span>
    <slot />
    <span
      v-if="hasSuffix || hasAllowClear"
      :class="suffixWrapCls"
      :style="styles?.suffix"
    >
      <button
        v-if="hasAllowClear"
        type="button"
        :tabindex="-1"
        :class="clearBtnCls"
        @click="handleClearClick"
        @mousedown="onClearMouseDown"
      >
        <slot name="clearIcon">
          <component :is="renderClearIcon" />
        </slot>
      </button>
      <slot name="suffix" v-if="hasSuffix">
        {{ renderSuffix }}
      </slot>
    </span>
  </component>

  <!-- Plain (no wrappers) -->
  <slot v-else />
</template>
