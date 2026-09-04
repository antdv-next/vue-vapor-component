<script setup vapor lang="ts">
  import type { OptionProps } from './interface'

  defineOptions({ name: 'MentionsOption', inheritAttrs: false })

  defineProps<OptionProps>()
</script>

<template>
  <slot />
</template>
