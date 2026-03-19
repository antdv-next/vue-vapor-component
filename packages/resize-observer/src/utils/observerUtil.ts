import ResizeObserver from 'resize-observer-polyfill'

export type ResizeListener = (element: Element) => void

// =============================== Const ===============================
const elementListeners = new Map<Element, Set<ResizeListener>>()

function onResize(entities: ResizeObserverEntry[]) {
  entities.forEach(entity => {
    const { target } = entity
    elementListeners.get(target)?.forEach(listener => listener(target))
  })
}

// Note: ResizeObserver polyfill not support option to measure border-box resize
const resizeObserver = new ResizeObserver(onResize)

// Dev env only

export const _el = import.meta.env.PROD ? elementListeners : null

export const _rs = import.meta.env.PROD ? onResize : null

// ============================== Observe ==============================
export function observe(element: Element, callback: ResizeListener) {
  if (!elementListeners.has(element)) {
    elementListeners.set(element, new Set())
    resizeObserver.observe(element)
  }
  elementListeners?.get?.(element)?.add?.(callback)
}

export function unobserve(element: Element, callback: ResizeListener) {
  if (elementListeners.has(element)) {
    elementListeners?.get?.(element)?.delete?.(callback)
    if (!elementListeners?.get?.(element)?.size) {
      resizeObserver.unobserve(element)
      elementListeners.delete(element)
    }
  }
}
