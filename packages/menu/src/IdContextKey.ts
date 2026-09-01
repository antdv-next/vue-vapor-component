import type { InjectionKey, Ref } from 'vue'

import { computed, provide, inject, ref } from 'vue'

const IdContextKey: InjectionKey<Ref<string>> = Symbol('IdContext')

export function useIdContextProvide(id: Ref<string>) {
  provide(IdContextKey, id)
}

export function getMenuId(uuid: string, eventKey: string) {
  return `${uuid}-${eventKey}`
}

export function useMenuId(eventKey: Ref<string>) {
  const id = inject(IdContextKey, ref(''))
  return computed(() => getMenuId(id.value, eventKey.value))
}
