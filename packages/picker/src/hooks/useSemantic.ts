import type { Ref } from 'vue'

import type { SharedPickerProps } from '../interface'

import { computed } from 'vue'

// `popup` is optional inside the `styles` / `classNames` intersection, so a
// single `NonNullable<...>['popup']` still resolves to `... | undefined`.
// Double it: the semantic maps are always materialised as objects by
// `useSemantic` below (`|| {}`), and consumers read `styles.body` etc.
// directly.
export type FilledPanelClassNames = NonNullable<
  NonNullable<SharedPickerProps['classNames']>['popup']
>

export type FilledPanelStyles = NonNullable<
  NonNullable<SharedPickerProps['styles']>['popup']
>

export type FilledClassNames = NonNullable<SharedPickerProps['classNames']> & {
  popup: FilledPanelClassNames
}

export type FilledStyles = NonNullable<SharedPickerProps['styles']> & {
  popup: FilledPanelStyles
}

/**
 * Convert `classNames` & `styles` to a fully filled object
 */
export default function useSemantic(
  classNames?: Ref<SharedPickerProps['classNames']>,
  styles?: Ref<SharedPickerProps['styles']>,
) {
  return computed(() => {
    const mergedClassNames: FilledClassNames = {
      ...(classNames?.value || {}),
      popup: classNames?.value?.popup || {},
    }

    const mergedStyles: FilledStyles = {
      ...(styles?.value || {}),
      popup: styles?.value?.popup || {},
    }

    return [mergedClassNames, mergedStyles] as const
  })
}
