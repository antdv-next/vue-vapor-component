import type { Ref } from 'vue'
import type { TourProps } from '../interface'
import type { TourStepInfo } from '../interface'
import type { ClosableConfig } from '../interface'
import { computed } from 'vue'

type StepClosable = TourStepInfo['closable']
type StepCloseIcon = TourStepInfo['closeIcon']

function isConfigObj(
  closable: StepClosable,
): closable is Exclude<StepClosable, boolean> {
  return closable !== null && typeof closable === 'object'
}

function getClosableConfig(
  closable: StepClosable,
  closeIcon: StepCloseIcon,
  preset: boolean,
): ClosableConfig | null | 'empty' {
  if (
    closable === false
    || (closeIcon === false && (!isConfigObj(closable) || !closable?.closeIcon))
  ) {
    return null
  }

  const mergedCloseIcon = typeof closeIcon !== 'boolean' ? closeIcon : undefined

  if (isConfigObj(closable)) {
    return {
      ...closable,
      closeIcon: closable?.closeIcon ?? mergedCloseIcon,
    }
  }

  return preset || closable || closeIcon
    ? {
        closeIcon: mergedCloseIcon,
      }
    : 'empty'
}

export function useClosable(
  stepClosable: Ref<StepClosable>,
  stepCloseIcon: Ref<StepCloseIcon>,
  closable: Ref<TourProps['closable']>,
  closeIcon: Ref<TourProps['closeIcon']>,
) {
  return computed(() => {
    const stepClosableConfig = getClosableConfig(
      stepClosable.value,
      stepCloseIcon.value,
      false,
    )
    const rootCloseableConfig = getClosableConfig(
      closable.value,
      closeIcon.value,
      true,
    )
    if (stepClosableConfig !== 'empty') {
      return stepClosableConfig
    }
    return rootCloseableConfig
  })
}
