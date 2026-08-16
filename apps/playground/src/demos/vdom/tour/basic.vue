<script setup lang="ts">
  import Tour from '@vapor-component/tour'
  import { computed, ref } from 'vue'

  import '@/styles/tour.less'

  const target1 = ref<HTMLElement | null>(null)
  const target2 = ref<HTMLElement | null>(null)
  const target3 = ref<HTMLElement | null>(null)
  const open = ref(false)

  const steps = computed(() => [
    {
      target: () => target1.value,
      title: 'Step 1',
      description: 'This is the first step of the tour.',
    },
    {
      target: () => target2.value,
      title: 'Step 2',
      description: 'This is the second step with more details.',
    },
    {
      target: () => target3.value,
      title: 'Step 3',
      description: 'Final step — you are done!',
    },
  ])
</script>

<template>
  <div class="tour-demo">
    <h4>Tour</h4>

    <div class="demo-controls">
      <button
        @click="
          () => {
            open = true
          }
        "
      >
        Start Tour
      </button>
      <span>Open: {{ open }}</span>
    </div>

    <div class="demo-area">
      <div ref="target1" class="target-box target-1">Target 1</div>
      <div ref="target2" class="target-box target-2">Target 2</div>
      <div ref="target3" class="target-box target-3">Target 3</div>
    </div>

    <Tour
      :open="open"
      :steps="steps"
      :z-index="1001"
      @close="
        () => {
          open = false
        }
      "
      @finish="
        () => {
          open = false
        }
      "
    />
  </div>
</template>
