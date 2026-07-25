import type { CollapseProps } from '@vapor-component/collapse'

import { computed, ref } from 'vue'

export function useCollapse() {
  const activeKey = ref<(string | number)[]>(['1'])
  const collapseText =
    'A dog is a type of domesticated animal. Known for its loyalty and faithfulness, it can be found as a welcome guest in many households across the world.'
  const items = computed<CollapseProps['items']>(() => [
    { key: '1', label: 'This is panel header 1', children: collapseText },
    { key: '2', label: 'This is panel header 2', children: collapseText },
    {
      key: '3',
      label: 'This is panel header 3 (disabled)',
      collapsible: 'disabled',
      children: collapseText,
    },
  ])
  return { activeKey, items }
}
