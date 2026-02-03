import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { QRCodeCanvas, QRCodeSVG } from '../src'

describe('qrcode render', () => {
  it('canvas Render', () => {
    const wrapper = mount(QRCodeCanvas, {
      props: {
        value: 'https://www.baidu.com',
      },
    })
    expect(wrapper.find('canvas').exists()).toBe(true)
  })
  it('svg Render', () => {
    const wrapper2 = mount(QRCodeSVG, {
      props: {
        value: 'https://www.baidu.com',
      },
    })
    expect(wrapper2.find('svg').exists()).toBe(true)
  })
})
