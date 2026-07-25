<script setup vapor lang="ts">
  import Overflow from '@vapor-component/overflow'

  import { useOverflow } from '@/composables/useOverflow.ts'
  import '@/styles/overflow.less'

  const { data } = useOverflow()
</script>

<template>
  <label>
    Overflow:
    <div style="max-width: 300px; border: 1px solid #ddd; padding: 8px">
      <Overflow
        :data="data"
        :itemKey="(item: any) => item.key"
        :renderItem="(item: { key: string; label: string }) => item.label"
        :maxCount="3"
        :renderRest="
          (omitted: { key: string; label: string }[]) => `+${omitted.length}...`
        "
        prefix="⏮"
        suffix="⏭"
        @visibleChange="
          (count: number) => console.log('visible change:', count)
        "
      />
    </div>
    <div style="margin-top: 8px">
      <button
        @click="
          () =>
            (data =
              data.length > 3
                ? data.slice(0, data.length - 1)
                : [
                    ...data,
                    {
                      key: `item-${data.length + 1}`,
                      label: `Item ${data.length + 1}`,
                    },
                  ])
        "
      >
        Toggle Data
      </button>
    </div>
  </label>
</template>
