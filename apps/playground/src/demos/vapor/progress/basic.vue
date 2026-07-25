<script setup vapor lang="ts">
  import { Circle, Line } from '@vapor-component/progress'

  import { useProgress } from '@/composables/useProgress.ts'
  import '@/styles/progress.less'

  const { percent, color, changeState, changeIncrease, changeReduce } =
    useProgress()
</script>

<template>
  <label>
    Progress:
    <!-- Line -->
    <div style="width: 250px">
      <Line :percent="percent" :stroke-width="4" :strokeColor="color" />
      <Line
        :percent="[percent / 2, percent / 2]"
        :stroke-width="4"
        :strokeColor="[color, '#ccc']"
      />
    </div>
    <!-- Circle -->
    <div
      style="
        margin-bottom: 16px;
        width: 250px;
        height: 250px;
        display: inline-block;
      "
    >
      <Circle
        :percent="percent"
        :stroke-width="6"
        stroke-linecap="round"
        :strokeColor="color"
      />
    </div>
    <div
      style="
        margin-bottom: 16px;
        width: 250px;
        height: 250px;
        display: inline-block;
      "
    >
      <Circle
        :percent="percent"
        :stroke-width="6"
        stroke-linecap="butt"
        :strokeColor="color"
      />
    </div>
    <div
      style="
        margin-bottom: 16px;
        width: 200px;
        height: 200px;
        display: inline-block;
      "
    >
      <Circle
        :percent="percent"
        :stroke-width="6"
        stroke-linecap="square"
        :strokeColor="color"
      />
    </div>
    <p>
      <button @click="changeState">Change State</button>
      <button @click="changeIncrease">Increase</button>
      <button @click="changeReduce">Reduce</button>
    </p>
  </label>
</template>
