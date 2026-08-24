import { shallowRef } from 'vue'

export default function useRefFunc<T extends (...args: any[]) => any>(
  callback: T,
): T {
  const funcRef = shallowRef<T>(callback)
  funcRef.value = callback

  const cacheFn = (...args: any[]) => {
    return funcRef.value(...args)
  }

  return cacheFn as T
}
