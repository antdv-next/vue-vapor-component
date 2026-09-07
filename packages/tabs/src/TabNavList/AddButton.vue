<script setup vapor lang="ts">
  import type { AddButtonProps } from '../interface'

  import { useTemplateRef } from 'vue'

  defineOptions({ name: 'VcTabsAddButton', inheritAttrs: false })

  const props = defineProps<AddButtonProps>()
  const emit = defineEmits<{
    edit: [type: 'add', info: { event: MouseEvent }]
  }>()

  const buttonRef = useTemplateRef<HTMLButtonElement>('buttonRef')

  function handleClick(event: MouseEvent) {
    if (props.editable) {
      emit('edit', 'add', { event })
      props.editable.onEdit('add', { event })
    }
  }

  defineExpose({
    buttonRef,
  })
</script>

<template>
  <button
    v-if="editable && editable.showAdd !== false"
    ref="buttonRef"
    type="button"
    :class="`${prefixCls}-nav-add`"
    :style="style"
    :aria-label="locale?.addAriaLabel || 'Add tab'"
    @click="handleClick"
  >
    <span>{{ editable.addIcon || '+' }}</span>
  </button>
</template>
