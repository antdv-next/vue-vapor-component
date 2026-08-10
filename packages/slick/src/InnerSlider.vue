<script setup vapor lang="ts">
  import type {
    AutoPlayType,
    InnerSliderProps,
    InnerSliderRef,
    InnerSliderState,
    PauseType,
  } from './interface'

  import { clsx } from '@v-c/util'
  import { getStylePxValue } from '@v-c/util/dist/props-util'
  import {
    computed,
    nextTick,
    onBeforeUnmount,
    onMounted,
    onUpdated,
    reactive,
    shallowRef,
    watch,
  } from 'vue'
  import Arrow from './Arrows.vue'
  import defaultProps from './defaultProps'
  import Dots from './Dots.vue'
  import initialState from './initial-state'
  import Track from './Track.vue'
  import { debounce } from './utils/debounce'
  import {
    canGoNext,
    changeSlide as changeSlideUtil,
    extractObject,
    getHeight,
    getOnDemandLazySlides,
    getPostClones,
    getPreClones,
    getTrackCSS,
    getTrackLeft,
    initializedState,
    keyHandler as keyHandlerUtil,
    slideHandler as slideHandlerUtil,
    swipeEnd as swipeEndUtil,
    swipeMove as swipeMoveUtil,
    swipeStart as swipeStartUtil,
  } from './utils/innerSliderUtils'

  defineOptions({ name: 'InnerSlider' })

  const props = withDefaults(
    defineProps<InnerSliderProps>(),
    defaultProps as any,
  )

  const listRef = shallowRef<HTMLDivElement | null>(null)
  const trackRef = shallowRef<HTMLDivElement | null>(null)

  const callbackTimers: Array<ReturnType<typeof setTimeout>> = []
  let autoplayTimer: ReturnType<typeof setInterval> | null = null
  let lazyLoadTimer: ReturnType<typeof setInterval> | null = null
  let animationEndCallback: ReturnType<typeof setTimeout> | null = null
  let debouncedResize: any = null
  let ro: ResizeObserver | null = null
  let asNavForIndex: number | null = null
  let clickable = true

  let lastChildrenCount = 0

  // slideCount is derived from DOM (trackRef.value.children.length) after mount

  // Fill defaults at runtime for props that were not passed
  const mergedProps = computed<Record<string, any>>(() => {
    const dp = defaultProps as Record<string, any>
    return Object.keys(dp).reduce((acc, key) => {
      const pk = key as keyof typeof dp
      acc[pk] = (props as any)[pk] ?? dp[pk]
      return acc
    }, {} as Record<string, any>)
  })

  const state = reactive<InnerSliderState>({
    ...initialState,
    currentSlide: mergedProps.value.initialSlide ?? 0,
    targetSlide: mergedProps.value.initialSlide ?? 0,
    slideCount: 0,
  })

  const setState = (nextState: Partial<InnerSliderState>, callback?: () => void) => {
    Object.assign(state, nextState)
    if (callback) nextTick(callback)
  }

  const getSpec = (extra?: Record<string, any>) => ({
    ...mergedProps.value,
    ...state,
    listRef: listRef.value,
    trackRef: trackRef.value,
    slideCount: state.slideCount,
    ...extra,
  })

  const adaptHeight = () => {
    if (!mergedProps.value.adaptiveHeight || !listRef.value) return
    const elem = listRef.value.querySelector(
      `[data-index="${state.currentSlide}"]`,
    ) as HTMLElement | null
    if (elem) listRef.value.style.height = `${getHeight(elem)}px`
  }

  const updateState = (
    spec: Record<string, any>,
    setTrackStyle: boolean,
    callback?: () => void,
  ) => {
    const updatedState = initializedState(spec) as Partial<InnerSliderState>
    const mergedSpec = { ...spec, ...updatedState, slideIndex: updatedState.currentSlide }
    const targetLeft = getTrackLeft(mergedSpec)
    const trackStyle = getTrackCSS({ ...mergedSpec, left: targetLeft })
    if (setTrackStyle) updatedState.trackStyle = trackStyle
    setState(updatedState, callback)
  }

  const getSsrState = (slideCount: number) => {
    if (slideCount === 0) return {}
    if (mergedProps.value.variableWidth) {
        const trackNode = trackRef.value
        if (!trackNode) return {}
        let trackWidth = 0
        let trackLeft = 0
        const childrenWidths: number[] = []
        const preClones = getPreClones(getSpec())
        const postClones = getPostClones(getSpec())

        for (let i = 0; i < trackNode.children.length; i++) {
            childrenWidths.push(getWidth(trackNode.children[i]))
            trackWidth += childrenWidths[i]
        }

      for (let i = 0; i < preClones; i += 1) {
        trackLeft += childrenWidths[childrenWidths.length - 1 - i]
        trackWidth += childrenWidths[childrenWidths.length - 1 - i]
      }
      for (let i = 0; i < postClones; i += 1) {
        trackWidth += childrenWidths[i]
      }
      for (let i = 0; i < state.currentSlide; i += 1) {
        trackLeft += childrenWidths[i]
      }
      const trackStyle: Record<string, any> = {
        width: `${trackWidth}px`,
        left: `${-trackLeft}px`,
      }
      if (mergedProps.value.centerMode) {
        const currentWidth = `${childrenWidths[state.currentSlide]}px`
        trackStyle.left = `calc(${trackStyle.left} + (100% - ${currentWidth}) / 2 )`
      }
      return { trackStyle }
    }

    const spec = { ...mergedProps.value, ...state, slideCount }
    const totalSlideCount = getPreClones(spec) + getPostClones(spec) + slideCount
    const trackWidth = (100 / mergedProps.value.slidesToShow) * totalSlideCount
    const slideWidth = 100 / totalSlideCount
    let trackLeft = (-slideWidth * (getPreClones(spec) + state.currentSlide) * trackWidth) / 100
    if (mergedProps.value.centerMode) {
      trackLeft += (100 - (slideWidth * trackWidth) / 100) / 2
    }
    const trackStyle = {
      width: `${trackWidth}%`,
      left: `${trackLeft}%`,
    }
    return {
      slideWidth: `${slideWidth}%`,
      trackStyle,
    }
  }

  Object.assign(state, getSsrState(0))

  // ---------- image lazy load ----------

  const checkImagesLoad = () => {
    const listNode = listRef.value
    if (!listNode || typeof document === 'undefined') return
    const images = listNode.querySelectorAll('.slick-slide img')
    const imagesCount = images.length
    let loadedCount = 0
    ;[...images].forEach((img: Element) => {
      const image = img as HTMLImageElement
      const handler = () => {
        loadedCount += 1
        if (loadedCount >= imagesCount) onWindowResized()
      }
      if (!image.onclick) {
        image.onclick = () => image.parentElement?.focus()
      } else {
        const prevClickHandler = image.onclick
        image.onclick = function (e) {
          ;(prevClickHandler as any).call(this, e)
          image.parentElement?.focus()
        }
      }
      if (!image.onload) {
        if (mergedProps.value.lazyLoad) {
          image.onload = () => {
            adaptHeight()
            callbackTimers.push(setTimeout(onWindowResized, mergedProps.value.speed))
          }
        } else {
          image.onload = handler
          image.onerror = () => {
            handler()
            mergedProps.value.onLazyLoadError?.()
          }
        }
      }
    })
  }

  const progressiveLazyLoad = () => {
    const slidesToLoad: number[] = []
    const spec = getSpec()
    for (
      let index = state.currentSlide;
      index < state.slideCount + getPostClones(spec);
      index += 1
    ) {
      if (!state.lazyLoadedList.includes(index)) {
        slidesToLoad.push(index)
        break
      }
    }
    for (
      let index = state.currentSlide - 1;
      index >= -getPreClones(spec);
      index -= 1
    ) {
      if (!state.lazyLoadedList.includes(index)) {
        slidesToLoad.push(index)
        break
      }
    }
    if (slidesToLoad.length > 0) {
      setState({ lazyLoadedList: state.lazyLoadedList.concat(slidesToLoad) })
      mergedProps.value.onLazyLoad?.(slidesToLoad)
    } else if (lazyLoadTimer) {
      clearInterval(lazyLoadTimer)
      lazyLoadTimer = null
    }
  }

  // ---------- navigation ----------

  const resolveInnerSlider = (nav: any): InnerSliderRef | null => {
    if (!nav) return null
    if (typeof nav.slideHandler === 'function') return nav as InnerSliderRef
    if (nav.innerSlider) {
      const inner = nav.innerSlider
      if (inner && typeof inner === 'object' && 'value' in inner) return inner.value ?? null
      return inner as InnerSliderRef
    }
    return null
  }

  const slideHandler = (index: number, dontAnimate = false) => {
    const { asNavFor, beforeChange, onLazyLoad, speed, afterChange } = mergedProps.value
    const currentSlide = state.currentSlide
    const { state: newState, nextState } = slideHandlerUtil({
      index,
      ...mergedProps.value,
      ...state,
      trackRef: trackRef.value,
      useCSS: mergedProps.value.useCSS && !dontAnimate,
    })
    if (!newState) return
    beforeChange?.(currentSlide, (newState as any).currentSlide)
    const slidesToLoad = (newState as any).lazyLoadedList?.filter(
      (value: number) => !state.lazyLoadedList.includes(value),
    ) ?? []
    if (onLazyLoad && slidesToLoad.length > 0) onLazyLoad(slidesToLoad)
    if (!mergedProps.value.waitForAnimate && animationEndCallback) {
      clearTimeout(animationEndCallback)
      animationEndCallback = null
      afterChange?.(currentSlide)
    }
    setState(newState as Partial<InnerSliderState>, () => {
      const navTarget = resolveInnerSlider(asNavFor)
      if (navTarget && asNavForIndex !== index) {
        asNavForIndex = index
        navTarget.slideHandler(index)
      }
      if (!nextState) return
      animationEndCallback = setTimeout(() => {
        const { animating, ...firstBatch } = nextState as Record<string, any>
        setState(firstBatch, () => {
          callbackTimers.push(setTimeout(() => setState({ animating }), 10))
          afterChange?.((newState as any).currentSlide)
          animationEndCallback = null
        })
      }, speed)
    })
  }

  const changeSlide = (options: any, dontAnimate = false) => {
    const targetSlide = changeSlideUtil(getSpec(), options)
    if (targetSlide !== 0 && !targetSlide) return
    slideHandler(targetSlide, dontAnimate)
    if (mergedProps.value.autoplay) autoPlay('update')
    if (mergedProps.value.focusOnSelect && listRef.value) {
      const nodes = listRef.value.querySelectorAll('.slick-current')
      const target = nodes?.[0] as HTMLElement | undefined
      target?.focus()
    }
  }

  const clickHandler = (e: MouseEvent) => {
    if (clickable === false) {
      e.stopPropagation()
      e.preventDefault()
    }
    clickable = true
  }

  const keyHandler = (e: KeyboardEvent) => {
    const dir = keyHandlerUtil(e, mergedProps.value.accessibility, mergedProps.value.rtl)
    if (dir !== '') changeSlide({ message: dir })
  }

  // ---------- window-level drag listeners ----------
  // Attaching to window ensures drag continues if cursor leaves the slider div
  function onWindowMouseMove(e: MouseEvent) {
    if (state.dragging && touchMove.value) swipeMove(e)
  }
  function onWindowMouseUp(e: MouseEvent) {
    swipeEnd(e)
    // Always clean up window listeners after drag ends
    unbindWindowDragEvents()
  }
  function bindWindowDragEvents() {
    window.addEventListener('mousemove', onWindowMouseMove as any)
    window.addEventListener('mouseup', onWindowMouseUp as any)
  }
  function unbindWindowDragEvents() {
    window.removeEventListener('mousemove', onWindowMouseMove as any)
    window.removeEventListener('mouseup', onWindowMouseUp as any)
  }

  // Explicit event wrapper functions for vapor template bindings
  const onMousedown = (e: MouseEvent) => {
    if (touchMove.value) {
      bindWindowDragEvents()
      swipeStart(e)
    }
  }
  const onMousemove = (e: MouseEvent) => { if (state.dragging && touchMove.value) swipeMove(e) }
  const onMouseup = (e: MouseEvent) => {
    unbindWindowDragEvents()
    if (touchMove.value) swipeEnd(e)
  }
  const onMouseleaveDrag = (e: MouseEvent) => {
    if (state.dragging && touchMove.value) swipeEnd(e)
  }
  const onTouchstart = (e: TouchEvent) => { if (touchMove.value) swipeStart(e) }
  const onTouchmove = (e: TouchEvent) => { if (state.dragging && touchMove.value) swipeMove(e) }
  const onTouchcancel = (e: TouchEvent) => { if (state.dragging && touchMove.value) swipeEnd(e) }
  const onKeydown = (e: KeyboardEvent) => { if (mergedProps.value.accessibility) keyHandler(e) }

  const selectHandler = (options: any) => { changeSlide(options) }

  const disableBodyScroll = () => {
    if (typeof window === 'undefined') return
    window.ontouchmove = (event: Event) => event.preventDefault()
  }
  const enableBodyScroll = () => {
    if (typeof window === 'undefined') return
    window.ontouchmove = null
  }

  // ---------- swipe / touch ----------

  const swipeStart = (e: MouseEvent | TouchEvent) => {
    if (mergedProps.value.verticalSwiping) disableBodyScroll()
    const swipeState = swipeStartUtil(
      e,
      mergedProps.value.swipe,
      mergedProps.value.draggable,
    )
    if (swipeState !== '') setState(swipeState)
  }
  const swipeMove = (e: MouseEvent | TouchEvent) => {
    const swipeState = swipeMoveUtil(e, {
      ...mergedProps.value,
      ...state,
      trackRef: trackRef.value,
      listRef: listRef.value,
      slideIndex: state.currentSlide,
    })
    if (!swipeState) return
    if (swipeState.swiping) clickable = false
    setState(swipeState)
  }
  const swipeEnd = (e: MouseEvent | TouchEvent) => {
    const swipeState = swipeEndUtil(e, {
      ...mergedProps.value,
      ...state,
      trackRef: trackRef.value,
      listRef: listRef.value,
      slideIndex: state.currentSlide,
    })
    if (!swipeState) return
    const triggerSlideHandler = (swipeState as any).triggerSlideHandler
    delete (swipeState as any).triggerSlideHandler
    setState(swipeState)
    if (triggerSlideHandler === undefined) return
    slideHandler(triggerSlideHandler)
    if (mergedProps.value.verticalSwiping) enableBodyScroll()
  }
  const touchEnd = (e: TouchEvent) => {
    swipeEnd(e)
    clickable = true
  }

  // ---------- slick API ----------

  const slickPrev = () => {
    callbackTimers.push(setTimeout(() => changeSlide({ message: 'previous' }), 0))
  }
  const slickNext = () => {
    callbackTimers.push(setTimeout(() => changeSlide({ message: 'next' }), 0))
  }
  const slickGoTo = (slide: number, dontAnimate = false) => {
    const target = Number(slide)
    if (Number.isNaN(target)) return
    callbackTimers.push(
      setTimeout(
        () => changeSlide(
          { message: 'index', index: target, currentSlide: state.currentSlide },
          dontAnimate,
        ),
        0,
      ),
    )
  }

  const play = () => {
    let nextIndex = 0
    if (mergedProps.value.rtl) {
      nextIndex = state.currentSlide - mergedProps.value.slidesToScroll
    } else if (canGoNext({ ...mergedProps.value, ...state })) {
      nextIndex = state.currentSlide + mergedProps.value.slidesToScroll
    } else {
      return false
    }
    slideHandler(nextIndex)
    return true
  }

  function autoPlay(playType: AutoPlayType) {
    if (autoplayTimer) clearInterval(autoplayTimer)
    const autoplaying = state.autoplaying
    if (playType === 'update') {
      if (autoplaying === 'hovered' || autoplaying === 'focused' || autoplaying === 'paused') return
    } else if (playType === 'leave') {
      if (autoplaying === 'paused' || autoplaying === 'focused') return
    } else if (playType === 'blur') {
      if (autoplaying === 'paused' || autoplaying === 'hovered') return
    }
    autoplayTimer = setInterval(play, mergedProps.value.autoplaySpeed + 50)
    setState({ autoplaying: 'playing' })
  }

  const pause = (pauseType: PauseType) => {
    if (autoplayTimer) {
      clearInterval(autoplayTimer)
      autoplayTimer = null
    }
    const autoplaying = state.autoplaying
    if (pauseType === 'paused') setState({ autoplaying: 'paused' })
    else if (pauseType === 'focused') {
      if (autoplaying === 'hovered' || autoplaying === 'playing') setState({ autoplaying: 'focused' })
    } else if (autoplaying === 'playing') {
      setState({ autoplaying: 'hovered' })
    }
  }

  const onDotsOver = () => mergedProps.value.autoplay && pause('hovered')
  const onDotsLeave = () => mergedProps.value.autoplay && state.autoplaying === 'hovered' && autoPlay('leave')
  const onTrackOver = () => mergedProps.value.autoplay && pause('hovered')
  const onTrackLeave = () => mergedProps.value.autoplay && state.autoplaying === 'hovered' && autoPlay('leave')
  const onSlideFocus = () => mergedProps.value.autoplay && pause('focused')
  const onSlideBlur = () => mergedProps.value.autoplay && state.autoplaying === 'focused' && autoPlay('blur')

  // ---------- resize ----------

  function onWindowResized(setTrackStyle?: boolean) {
    if (debouncedResize?.cancel) debouncedResize.cancel()
    debouncedResize = debounce(() => resizeWindow(setTrackStyle), 50)
    debouncedResize()
  }

  function resizeWindow(setTrackStyle = true) {
    if (!trackRef.value) return
    updateState(getSpec(), setTrackStyle, () => {
      if (mergedProps.value.autoplay) autoPlay('update')
      else pause('paused')
    })
    setState({ animating: false })
    if (animationEndCallback) {
      clearTimeout(animationEndCallback)
      animationEndCallback = null
    }
  }

  const didPropsChange = (
    prevProps: Record<string, any>,
    nextProps: Record<string, any>,
    prevChildren: number,
    nextChildren: number,
  ) => {
    let setTrackStyle = false
    for (const key of Object.keys(nextProps)) {
      if (!Object.prototype.hasOwnProperty.call(prevProps, key)) { setTrackStyle = true; break }
      const prevValue = (prevProps as any)[key]
      if (typeof prevValue === 'object' || typeof prevValue === 'function' || Number.isNaN(prevValue)) continue
      if (prevValue !== (nextProps as any)[key]) { setTrackStyle = true; break }
    }
    return setTrackStyle || prevChildren !== nextChildren
  }

  // ---------- lifecycle ----------

  onMounted(() => {
    state.slideCount = trackRef.value?.children.length ?? 0
    lastChildrenCount = state.slideCount
    mergedProps.value.onInit?.()
    if (mergedProps.value.lazyLoad) {
      const slidesToLoad = getOnDemandLazySlides(getSpec())
      if (slidesToLoad.length > 0) {
        setState({ lazyLoadedList: state.lazyLoadedList.concat(slidesToLoad) })
        mergedProps.value.onLazyLoad?.(slidesToLoad)
      }
    }
    updateState(getSpec(), true, () => {
      adaptHeight()
      if (mergedProps.value.autoplay) autoPlay('playing')
    })
    if (mergedProps.value.lazyLoad === 'progressive') {
      lazyLoadTimer = setInterval(progressiveLazyLoad, 1000)
    }
    if (typeof ResizeObserver !== 'undefined' && listRef.value) {
      ro = new ResizeObserver(() => {
        if (state.animating) {
          onWindowResized(false)
          callbackTimers.push(setTimeout(() => onWindowResized(), mergedProps.value.speed))
        } else {
          onWindowResized()
        }
      })
      ro.observe(listRef.value)
    }
    if (typeof document !== 'undefined') {
      const allSlides = document.querySelectorAll('.slick-slide')
      ;[...allSlides].forEach((s: Element) => {
        const slide = s as HTMLElement
        slide.onfocus = mergedProps.value.pauseOnFocus ? onSlideFocus : null
        slide.onblur = mergedProps.value.pauseOnFocus ? onSlideBlur : null
      })
    }
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('resize', onWindowResized as any)
    }
  })

  const handlePropsOrChildrenChange = (
    prevProps: Record<string, any>,
    nextProps: Record<string, any>,
    prevCount: number,
    nextCount: number,
  ) => {
    if (!prevProps) return
    checkImagesLoad()
    mergedProps.value.onReInit?.()
    if (mergedProps.value.lazyLoad) {
      const slidesToLoad = getOnDemandLazySlides(getSpec())
      if (slidesToLoad.length > 0) {
        setState({ lazyLoadedList: state.lazyLoadedList.concat(slidesToLoad) })
        mergedProps.value.onLazyLoad?.(slidesToLoad)
      }
    }
    adaptHeight()
    const setTrackStyle = didPropsChange(prevProps, nextProps, prevCount, nextCount)
    if (setTrackStyle) {
      updateState(getSpec(), setTrackStyle, () => {
        if (state.currentSlide >= state.slideCount) {
          changeSlide({
            message: 'index',
            index: state.slideCount - mergedProps.value.slidesToShow,
            currentSlide: state.currentSlide,
          })
        }
        if (
          prevProps.autoplay !== mergedProps.value.autoplay
          || prevProps.autoplaySpeed !== mergedProps.value.autoplaySpeed
        ) {
          if (!prevProps.autoplay && mergedProps.value.autoplay) autoPlay('playing')
          else if (mergedProps.value.autoplay) autoPlay('update')
          else pause('paused')
        }
      })
    }
  }

  watch(mergedProps, (nextProps, prevProps) => {
    if (prevProps) {
        handlePropsOrChildrenChange(
            prevProps as Record<string, any>,
            nextProps as Record<string, any>,
            lastChildrenCount,
            state.slideCount,
        )
        lastChildrenCount = state.slideCount
    }
  }, { flush: 'post' })

  onUpdated(() => {
    const newCount = trackRef.value?.children.length ?? 0
    if (newCount !== lastChildrenCount) {
        handlePropsOrChildrenChange(
            mergedProps.value,
            mergedProps.value,
            lastChildrenCount,
            newCount,
        )
        lastChildrenCount = newCount
        state.slideCount = newCount
    }
  })

  onBeforeUnmount(() => {
    if (animationEndCallback) clearTimeout(animationEndCallback)
    if (lazyLoadTimer) clearInterval(lazyLoadTimer)
    if (callbackTimers.length) {
      callbackTimers.forEach(timer => clearTimeout(timer))
      callbackTimers.length = 0
    }
    if (typeof window !== 'undefined' && window.removeEventListener) {
      window.removeEventListener('resize', onWindowResized as any)
    }
    if (autoplayTimer) clearInterval(autoplayTimer)
    ro?.disconnect()
  })

  defineExpose<InnerSliderRef>({
    slickPrev,
    slickNext,
    slickGoTo,
    autoPlay,
    pause,
    play,
    slideHandler,
    changeSlide,
  })

  // ---------- slide count from DOM ----------

  const fallbackSsrState = computed(() => {
    if (state.slideCount === 0) return {}
    if (state.trackStyle && Object.keys(state.trackStyle).length > 0) return {}
    const ssr = getSsrState(state.slideCount)
    return { trackStyle: ssr.trackStyle || {} }
  })

  const className = computed(() =>
    clsx('slick-slider', mergedProps.value.className, {
      'slick-vertical': mergedProps.value.vertical,
      'slick-initialized': true,
    }),
  )

  // ---------- child component props (as any to bypass type check) ----------

  const trackPropsObj = computed(() => {
    const spec = {
        ...mergedProps.value,
        ...state,
        ...fallbackSsrState.value,
        slideCount: state.slideCount,
    }
    const extracted = extractObject(spec, [
        'fade', 'cssEase', 'speed', 'infinite', 'centerMode', 'focusOnSelect',
        'currentSlide', 'lazyLoad', 'lazyLoadedList', 'rtl', 'slideWidth',
        'slideHeight', 'listHeight', 'vertical', 'slidesToShow', 'slidesToScroll',
        'slideCount', 'trackStyle', 'variableWidth', 'unslick', 'centerPadding',
        'targetSlide', 'useCSS', 'useTransform',
    ]) as Record<string, any>
    const { pauseOnHover } = mergedProps.value
    return {
        ...extracted,
        ...(pauseOnHover ? {
          onMouseEnter: onTrackOver,
          onMouseLeave: onTrackLeave,
          onMouseOver: onTrackOver,
        } : {}),
        focusOnSelect: mergedProps.value.focusOnSelect && clickable ? selectHandler : undefined,
        nodeRef: trackRef,
    }
  })

  const dotsPropsObj = computed<Record<string, any> | null>(() => {
    if (mergedProps.value.dots !== true || state.slideCount > 0 && state.slideCount < mergedProps.value.slidesToShow) return null
    const spec = {
        ...mergedProps.value,
        ...state,
        ...fallbackSsrState.value,
        slideCount: state.slideCount,
    }
    const dotProps = extractObject(spec, [
        'dotsClass', 'slideCount', 'slidesToShow', 'currentSlide',
        'slidesToScroll', 'customPaging', 'infinite', 'appendDots',
    ]) as Record<string, any>
    const { pauseOnDotsHover } = mergedProps.value
    return {
        ...dotProps,
        clickHandler: changeSlide,
        ...(pauseOnDotsHover ? {
          onMouseEnter: onDotsLeave,
          onMouseOver: onDotsOver,
          onMouseLeave: onDotsLeave,
        } : {}),
    }
  })

  const arrowPropsObj = computed<Record<string, any>>(() => {
    const spec = {
        ...mergedProps.value,
        ...state,
        slideCount: state.slideCount,
    }
    const extracted = extractObject(spec, [
        'infinite', 'centerMode', 'currentSlide', 'slideCount',
        'slidesToShow', 'prevArrow', 'nextArrow',
    ]) as Record<string, any>
    extracted.clickHandler = changeSlide
    return extracted
  })

  const prevArrowProps = computed<Record<string, any>>(() => ({ ...arrowPropsObj.value, type: 'prev' }))
  const nextArrowProps = computed<Record<string, any>>(() => ({ ...arrowPropsObj.value, type: 'next' }))

  // forceUnslick: too few slides to need a slider
  const effectiveUnslick = computed(() =>
    mergedProps.value.unslick || (state.slideCount > 0 && state.slideCount <= mergedProps.value.slidesToShow)
  )

  // ---------- list props ----------

  const listStyle = computed(() => {
    const style: Record<string, any> = {}
    if (mergedProps.value.vertical) style.height = getStylePxValue(state.listHeight)
    if (mergedProps.value.centerMode === true) {
      if (mergedProps.value.vertical === false) style.padding = `0px ${mergedProps.value.centerPadding}`
      else style.padding = `${mergedProps.value.centerPadding} 0px`
    }
    return style
  })

  const listClass = computed(() => effectiveUnslick.value ? 'slick-list' : 'slick-list')
  const touchMove = computed(() => mergedProps.value.touchMove)
</script>

<template>
  <div :class="className" dir="ltr" :style="mergedProps.style">
    <Arrow
      v-if="!effectiveUnslick"
      v-bind="prevArrowProps as any"
    />
    <div
      ref="listRef"
      :class="listClass"
      :style="listStyle"
      @click="clickHandler"
      @mousedown="onMousedown"
      @mousemove="onMousemove"
      @mouseup="onMouseup"
      @mouseleave="onMouseleaveDrag"
      @touchstart="onTouchstart"
      @touchmove="onTouchmove"
      @touchend="touchEnd"
      @touchcancel="onTouchcancel"
      @keydown="onKeydown"
    >
      <Track v-bind="trackPropsObj as any"><slot /></Track>
    </div>
    <Arrow
      v-if="!effectiveUnslick"
      v-bind="nextArrowProps as any"
    />
    <Dots
      v-if="!effectiveUnslick && dotsPropsObj"
      v-bind="dotsPropsObj as any"
    />
  </div>
</template>
