<script setup vapor lang="ts">
  import type { MentionsContextProps } from './interface'
  import { computed } from 'vue'
  import { useMentionsContextProvider } from './MentionsContextKey'

  defineOptions({ name: 'MentionsProvider', inheritAttrs: false })

  const props = defineProps<{ value: MentionsContextProps }>()
  useMentionsContextProvider(computed(() => props.value))
</script>

<template>
  <slot />
</template>
