<script setup vapor lang="ts">
  import { clsx } from '@v-c/util'
  import { computed } from 'vue'

  import useBaseProps from '../../hooks/useBaseProps'
  import { useSelectInputContext } from '../SelectInputContextKey'

  defineOptions({ name: 'Placeholder', inheritAttrs: false })

  const props = defineProps<{ show?: boolean }>()
  const selectInputContext = useSelectInputContext()
  const baseProps = useBaseProps()

  const placeholderShow = computed(() => {
    if (props.show === false) return false
    if (selectInputContext.value?.displayValues?.length) return false
    return true
  })
</script>

<template v-if="placeholderShow">
  <div
    :class="
      clsx(
        `${selectInputContext?.prefixCls}-placeholder`,
        baseProps?.classNames?.placeholder,
      )
    "
    :style="{
      ...(show === false ? { visibility: 'hidden' as const } : {}),
      ...baseProps?.styles?.placeholder,
    }"
  >
    {{ selectInputContext?.placeholder }}
  </div>
</template>
