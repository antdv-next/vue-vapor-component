import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'

import Slider from '../src'

describe('slider render', () => {
  it('renders basic slider', () => {
    const wrapper = mount(Slider, {
      props: {
        value: 20,
      },
    })

    expect(wrapper.find('.vc-slider').exists()).toBe(true)
    expect(wrapper.find('.vc-slider-rail').exists()).toBe(true)
    expect(wrapper.find('.vc-slider-handle').exists()).toBe(true)
  })

  it('renders horizontal class by default', () => {
    const wrapper = mount(Slider, {
      props: {
        value: 20,
      },
    })

    expect(wrapper.find('.vc-slider').classes()).toContain(
      'vc-slider-horizontal',
    )
  })

  it('renders vertical class', () => {
    const wrapper = mount(Slider, {
      props: {
        value: 20,
        vertical: true,
      },
    })

    expect(wrapper.find('.vc-slider').classes()).toContain('vc-slider-vertical')
    expect(wrapper.find('.vc-slider').classes()).not.toContain(
      'vc-slider-horizontal',
    )
  })

  it('renders range slider with two handles', () => {
    const wrapper = mount(Slider, {
      props: {
        value: [20, 50],
        range: true,
      },
    })

    const handles = wrapper.findAll('.vc-slider-handle')
    expect(handles.length).toBe(2)
  })

  it('renders marks', () => {
    const marks = {
      0: '0',
      50: '50',
      100: '100',
    }
    const wrapper = mount(Slider, {
      props: {
        value: 20,
        marks,
      },
    })

    expect(wrapper.find('.vc-slider-mark').exists()).toBe(true)
    expect(wrapper.findAll('.vc-slider-mark-text').length).toBe(3)
    expect(wrapper.classes()).toContain('vc-slider-with-marks')
  })

  it('renders dots when dots prop is true', () => {
    const wrapper = mount(Slider, {
      props: {
        value: 20,
        dots: true,
      },
    })

    expect(wrapper.find('.vc-slider-step').exists()).toBe(true)
    expect(wrapper.findAll('.vc-slider-dot').length).toBeGreaterThan(0)
  })

  it('renders disabled class', () => {
    const wrapper = mount(Slider, {
      props: {
        value: 20,
        disabled: true,
      },
    })

    expect(wrapper.find('.vc-slider').classes()).toContain('vc-slider-disabled')
  })

  it('emits change when mark is clicked', async () => {
    const changes: number[] = []
    const marks = {
      0: '0',
      50: '50',
      100: '100',
    }
    const wrapper = mount(Slider, {
      props: {
        value: 20,
        marks,
        onChange: (v: number) => {
          changes.push(v)
        },
      },
    })

    await wrapper.find('.vc-slider-mark-text').trigger('click')

    expect(changes.length).toBeGreaterThan(0)
  })
})
