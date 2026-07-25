import { ref } from 'vue'

export function useDrawer() {
  const open = ref(false)
  const maskMotion = {
    appear: true,
    name: 'mask-motion',
  }
  const motion = (placement: string) =>
    ({
      appear: true,
      name: `panel-motion-${placement}`,
    }) as any
  const motionProps = { maskMotion, motion }

  function onClose() {
    open.value = false
  }
  function onToggle() {
    open.value = !open.value
  }
  return { open, motionProps, onClose, onToggle }
}
