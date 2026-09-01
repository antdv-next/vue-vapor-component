import type { InjectionKey, Ref } from 'vue'

import { computed, provide, inject, ref } from 'vue'

const EmptyList: string[] = []

// ========================= Path Register =========================
export interface PathRegisterContextProps {
  registerPath: (key: string, keyPath: string[]) => void
  unregisterPath: (key: string, keyPath: string[]) => void
}

const PathRegisterContextKey: InjectionKey<PathRegisterContextProps> = Symbol(
  'PathRegisterContext',
)

export function useMeasure() {
  return inject(PathRegisterContextKey, null)
}

export function useMeasureProvider(context: PathRegisterContextProps) {
  provide(PathRegisterContextKey, context)
}

// ========================= Path Tracker ==========================

const PathTrackerContextKey: InjectionKey<Ref<string[]>> =
  Symbol('PathTrackerContext')

export function useFullPath(eventKey?: Ref<string | undefined>) {
  const parentKeyPath = inject(PathTrackerContextKey, ref(EmptyList))
  return computed(() => {
    if (eventKey !== undefined) {
      return [...parentKeyPath.value, eventKey.value]
    }
    return parentKeyPath.value
  })
}

export function usePathTrackerProvider(keyPath: Ref<string[]>) {
  provide(PathTrackerContextKey, keyPath)
}

// =========================== Path User ===========================
export interface PathUserContextProps {
  isSubPathKey: (pathKeys: string[], eventKey: string) => boolean
}

const PathUserContextKey: InjectionKey<Ref<PathUserContextProps>> =
  Symbol('PathUserContext')

export function usePathUserContextProvider(context: Ref<PathUserContextProps>) {
  provide(PathUserContextKey, context)
}

export function usePathUserContext() {
  return inject(PathUserContextKey, {
    value: {
      isSubPathKey: () => false,
    },
  } as any)
}
