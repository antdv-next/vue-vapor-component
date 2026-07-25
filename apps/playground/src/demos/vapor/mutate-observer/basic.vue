<script setup vapor lang="ts">
  import MutateObserver from '@vapor-component/mutate-observer'

  import { useMutateObserver } from '@/composables/useMutateObserver.ts'

  const { internalRef, flag, onMutate } = useMutateObserver()
</script>

<template>
  <label>
    MutateObserver:
    <MutateObserver @mutate="onMutate">
      <button
        ref="internalRef"
        :class="[flag ? 'aaa' : 'bbb']"
        @click="flag = !flag"
      >
        click
      </button>
    </MutateObserver>
  </label>
</template>
