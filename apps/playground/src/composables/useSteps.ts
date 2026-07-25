import { ref } from 'vue'

export function useSteps() {
  const current = ref(1)
  const items = ref([
    {
      title: '已完成',
      description: 1,
      status: 'wait',
    },
    {
      title: '进行中',
      description: 2,
      status: 'wait',
      subTitle: '剩余 00:00:07',
    },
    undefined as any,
    {
      title: '待运行',
      description: 3,
      status: 'process',
    },
    false as any,
    {
      title: '待运行',
      description: 4,
      status: 'finish',
      disabled: true,
    },
    null as any,
  ])
  return { current, items }
}
