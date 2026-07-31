import { shallowRef } from 'vue'

export interface NodeSize {
  width: number
  height: number
}

export type NodeSizeMap = Record<string, NodeSize>

export default function useSizes() {
  const sizeMap = shallowRef<NodeSizeMap>({})

  const setNodeSize = (key: string, node: HTMLDivElement | null) => {
    if (!node) {
      if (!(key in sizeMap.value)) {
        return
      }
      const next = { ...sizeMap.value }
      delete next[key]
      sizeMap.value = next
      return
    }

    const nextSize: NodeSize = {
      width: node.offsetWidth,
      height: node.offsetHeight,
    }
    const prev = sizeMap.value[key]
    if (
      prev &&
      prev.width === nextSize.width &&
      prev.height === nextSize.height
    ) {
      return
    }
    sizeMap.value = {
      ...sizeMap.value,
      [key]: nextSize,
    }
  }

  return [sizeMap, setNodeSize] as const
}
