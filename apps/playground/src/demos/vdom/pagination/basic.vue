<script setup lang="ts">
  import Pagination from '@vapor-component/pagination'

  import { usePagination } from '@/composables/usePagination.ts'
  import '@/styles/pagination.less'

  const { total } = usePagination()
</script>

<template>
  <label>
    Pagination:
    <Pagination
      :total="total"
      :default-page-size="5"
      @change="(p, s) => console.log('page:', p, 'size:', s)"
    />
    <div style="margin-top: 8px">
      <button @click="() => (total = total > 50 ? 50 : total + 50)">
        Toggle Total ({{ total }})
      </button>
    </div>
  </label>
</template>
