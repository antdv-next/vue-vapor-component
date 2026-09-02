import type { Ref } from 'vue'
import type {
  DefaultOptionType,
  InternalFieldNames,
  LegacyKey,
  SingleValueType,
} from '../interface'
import KeyCode from '@v-c/util/dist/KeyCode'
import { SEARCH_MARK } from '../hooks/useSearchOptions'
import { getFullPathKeys, toPathKey } from '../utils/commonUtil'

export default function useKeyboard(
  options: Ref<DefaultOptionType[]>,
  fieldNames: InternalFieldNames,
  activeValueCells: Ref<LegacyKey[]>,
  setActiveValueCells: (activeValueCells: LegacyKey[]) => void,
  onKeyBoardSelect: (valueCells: SingleValueType, option: DefaultOptionType) => void,
  contextProps: {
    direction: Ref<'ltr' | 'rtl' | undefined>
    searchValue: Ref<string>
    toggleOpen: (open?: boolean) => void
    open: Ref<boolean>
  },
) {
  const getActiveStatus = () => {
    let activeIndex = -1
    let currentOptions: DefaultOptionType[] = options.value

    const mergedActiveIndexes: number[] = []
    const mergedActiveValueCells: LegacyKey[] = []

    const len = activeValueCells.value.length
    const pathKeys = getFullPathKeys(options.value, fieldNames)

    for (let i = 0; i < len && currentOptions; i += 1) {
      const nextActiveIndex = currentOptions.findIndex(
        (_option, index) =>
          (pathKeys[index] ? toPathKey(pathKeys[index] as LegacyKey[]) : (_option as any)[fieldNames.value])
          === activeValueCells.value[i],
      )

      if (nextActiveIndex === -1) {
        break
      }

      activeIndex = nextActiveIndex
      mergedActiveIndexes.push(activeIndex)
      mergedActiveValueCells.push(activeValueCells.value[i])

      currentOptions = currentOptions[activeIndex]?.[fieldNames.children as string] || []
    }

    let activeOptions: DefaultOptionType[] = options.value
    for (let i = 0; i < mergedActiveIndexes.length - 1; i += 1) {
      activeOptions =
        activeOptions[mergedActiveIndexes[i]]?.[fieldNames.children as string] || []
    }

    return {
      validActiveValueCells: mergedActiveValueCells,
      lastActiveIndex: activeIndex,
      lastActiveOptions: activeOptions,
      fullPathKeys: pathKeys,
    }
  }

  const internalSetActiveValueCells = (next: LegacyKey[]) => {
    setActiveValueCells(next)
  }

  const offsetActiveOption = (offset: number) => {
    const { lastActiveOptions, lastActiveIndex, fullPathKeys, validActiveValueCells } =
      getActiveStatus()
    const len = lastActiveOptions.length

    let currentIndex = lastActiveIndex
    if (currentIndex === -1 && offset < 0) {
      currentIndex = len
    }

    for (let i = 0; i < len; i += 1) {
      currentIndex = (currentIndex + offset + len) % len
      const option = lastActiveOptions[currentIndex]
      if (option && !option.disabled) {
        const nextActiveCells = validActiveValueCells
          .slice(0, -1)
          .concat(
            fullPathKeys[currentIndex]
              ? toPathKey(fullPathKeys[currentIndex] as LegacyKey[])
              : (option as any)[fieldNames.value],
          )
        internalSetActiveValueCells(nextActiveCells)
        return
      }
    }
  }

  const prevColumn = () => {
    const { validActiveValueCells } = getActiveStatus()
    if (validActiveValueCells.length > 1) {
      const nextActiveCells = validActiveValueCells.slice(0, -1)
      internalSetActiveValueCells(nextActiveCells)
    } else {
      contextProps.toggleOpen(false)
    }
  }

  const nextColumn = () => {
    const { lastActiveOptions, lastActiveIndex, validActiveValueCells } =
      getActiveStatus()
    const nextOptions: DefaultOptionType[] =
      lastActiveOptions[lastActiveIndex]?.[fieldNames.children as string] || []

    const nextOption = nextOptions.find((option) => !option.disabled)

    if (nextOption) {
      const nextActiveCells = [
        ...validActiveValueCells,
        (nextOption as any)[fieldNames.value],
      ]
      internalSetActiveValueCells(nextActiveCells)
    }
  }

  return {
    scrollTo: () => {},
    onKeyDown: (event: KeyboardEvent) => {
      const rtl = contextProps.direction.value === 'rtl'
      const searchValue = contextProps.searchValue.value
      const open = contextProps.open.value

      const keyCode = event.keyCode || event.which

      switch (keyCode) {
        case KeyCode.UP:
        case KeyCode.DOWN: {
          const offset = keyCode === KeyCode.UP ? -1 : 1
          offsetActiveOption(offset)
          break
        }

        case KeyCode.LEFT: {
          if (searchValue) {
            break
          }
          if (rtl) {
            nextColumn()
          } else {
            prevColumn()
          }
          break
        }

        case KeyCode.RIGHT: {
          if (searchValue) {
            break
          }
          if (rtl) {
            prevColumn()
          } else {
            nextColumn()
          }
          break
        }

        case KeyCode.BACKSPACE: {
          if (!searchValue) {
            prevColumn()
          }
          break
        }

        case KeyCode.ENTER: {
          const { validActiveValueCells, lastActiveOptions, lastActiveIndex } =
            getActiveStatus()
          if (validActiveValueCells.length) {
            const option = lastActiveOptions[lastActiveIndex]

            const originOptions: DefaultOptionType[] =
              (option as any)?.[SEARCH_MARK] || []
            if (originOptions.length) {
              onKeyBoardSelect(
                originOptions.map(
                  (opt) => (opt as Record<string, any>)[fieldNames.value],
                ),
                originOptions[originOptions.length - 1],
              )
            } else {
              onKeyBoardSelect(
                validActiveValueCells as SingleValueType,
                lastActiveOptions[lastActiveIndex],
              )
            }
          }
          break
        }

        case KeyCode.ESC: {
          contextProps.toggleOpen(false)
          if (open) {
            event.stopPropagation()
          }
          break
        }
      }
    },
    onKeyUp: () => {},
  }
}
