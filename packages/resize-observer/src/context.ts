import type { InjectionKey } from 'vue'

import type { SizeInfo } from './interface'

export type OnCollectionResize = (
  size: SizeInfo,
  element: HTMLElement,
  data: any,
) => void

export const CollectionContext: InjectionKey<OnCollectionResize> =
  Symbol('CollectionContext')
