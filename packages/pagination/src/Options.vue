<script setup vapor lang="ts">
  import type { VueNode } from '@v-c/util/dist/type'

  import type { PaginationLocale, SizeChangerRender } from './interface'

  import KeyCode from '@v-c/util/dist/KeyCode'
  import { computed, nextTick, ref } from 'vue'

  defineOptions({ name: 'PaginationOptions' })

  const props = defineProps<{
    disabled?: boolean
    locale: PaginationLocale
    rootPrefixCls: string
    pageSize: number
    pageSizeOptions?: number[]
    goButton?: boolean | string | VueNode
    buildOptionText?: (value: string | number) => string
    changeSize?: (size: number) => void
    quickGo?: (value: number | undefined) => void
    showSizeChanger: boolean
    sizeChangerRender?: SizeChangerRender
  }>()

  const defaultPageSizeOptions = [10, 20, 50, 100]

  const goInputText = ref('')

  const getValidValue = computed(() => {
    return !goInputText.value || Number.isNaN(Number(goInputText.value))
      ? undefined
      : Number(goInputText.value)
  })

  const mergeBuildOptionText = computed(() =>
    typeof props.buildOptionText === 'function'
      ? props.buildOptionText
      : (value: string | number) => `${value} ${props.locale.items_per_page}`,
  )

  const getterPageSizeOptions = computed(
    () => props.pageSizeOptions || defaultPageSizeOptions,
  )

  const getPageSizeOptions = () => {
    if (
      getterPageSizeOptions.value.some(
        option => option.toString() === props.pageSize.toString(),
      )
    ) {
      return getterPageSizeOptions.value
    }
    return getterPageSizeOptions.value
      .concat([props.pageSize])
      .sort((a, b) => {
        const numberA = Number.isNaN(Number(a)) ? 0 : Number(a)
        const numberB = Number.isNaN(Number(b)) ? 0 : Number(b)
        return numberA - numberB
      })
  }

  const prefixCls = computed(() => `${props.rootPrefixCls}-options`)

  function handleChange(e: Event) {
    const value = (e.target as HTMLInputElement).value
    if (/^\d*$/.test(value)) {
      goInputText.value = value
    }
  }

  function handleBlur(e: FocusEvent) {
    if (props.goButton || goInputText.value === '') {
      return
    }
    nextTick(() => {
      goInputText.value = ''
    })
    const relTarget = e.relatedTarget as HTMLInputElement | null
    if (
      (relTarget && relTarget.className.includes(`${props.rootPrefixCls}-item-link`))
      || relTarget?.className.includes(`${props.rootPrefixCls}-item`)
    ) {
      return
    }
    props.quickGo?.(getValidValue.value)
  }

  function go(e: any) {
    if (goInputText.value === '') {
      return
    }
    if (e.keyCode === KeyCode.ENTER || e.type === 'click') {
      nextTick(() => {
        goInputText.value = ''
      })
      props.quickGo?.(getValidValue.value)
    }
  }

  // size changer
  const changeSelect = computed<VueNode | null>(() => {
    if (!props.showSizeChanger || !props.sizeChangerRender) return null
    return props.sizeChangerRender({
      disabled: props.disabled as boolean,
      size: props.pageSize,
      onSizeChange: (nextValue) => {
        props.changeSize?.(Number(nextValue))
      },
      'aria-label': props.locale.page_size as string,
      className: `${prefixCls.value}-size-changer`,
      options: getPageSizeOptions().map(opt => ({
        label: mergeBuildOptionText.value(opt),
        value: opt,
      })),
    })
  })

  // go button
  const showGotoButton = computed(() => !!props.goButton)

  // quick jumper div
  const showQuickJumper = computed(() => !!props.quickGo)
</script>

<template>
  <li :class="prefixCls">
    <template v-if="props.showSizeChanger || props.quickGo">
      <component :is="changeSelect" />
      <div v-if="showQuickJumper" :class="`${prefixCls}-quick-jumper`">
        {{ props.locale.jump_to }}
        <input
          :disabled="props.disabled"
          type="text"
          :value="goInputText"
          @input="handleChange"
          @keyup="go"
          @blur="handleBlur"
          :aria-label="props.locale.page"
        />
        {{ props.locale.page }}
        <template v-if="showGotoButton">
          <button
            v-if="typeof props.goButton === 'boolean'"
            type="button"
            @click="go"
            @keyup="go"
            :disabled="props.disabled"
            :class="`${prefixCls}-quick-jumper-button`"
          >
            {{ props.locale.jump_to_confirm }}
          </button>
          <span
            v-else
            @click="go"
            @keyup="go"
          >
            {{ props.goButton }}
          </span>
        </template>
      </div>
    </template>
  </li>
</template>