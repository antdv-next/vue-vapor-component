import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'

import TextArea from '../src'

describe('textarea render', () => {
  it('renders textarea', () => {
    const wrapper = mount(TextArea, {
      props: {
        value: 'hello',
      },
    })

    expect(wrapper.find('textarea').exists()).toBe(true)
    expect(
      (wrapper.find('textarea').element as HTMLTextAreaElement).value,
    ).toBe('hello')
  })

  it('renders count suffix', () => {
    const wrapper = mount(TextArea, {
      props: {
        value: 'hello',
        count: { show: true, max: 10 },
      },
    })

    expect(wrapper.text()).toContain('5 / 10')
  })

  it('triggers change after composition end by default', async () => {
    const changes: string[] = []
    const wrapper = mount(TextArea, {
      props: {
        onChange: (e: Event) => {
          changes.push((e.target as HTMLTextAreaElement).value)
        },
      },
    })

    const textarea = wrapper.find('textarea')
    await textarea.trigger('compositionstart')
    await textarea.setValue('你')
    expect(changes).toEqual([])
    await textarea.trigger('compositionend')
    expect(changes).toEqual(['你'])
  })

  it('triggers clear change event', async () => {
    const changes: string[] = []
    const wrapper = mount(TextArea, {
      props: {
        value: 'hello',
        allowClear: true,
        onChange: (e: Event) => {
          changes.push((e.target as HTMLTextAreaElement).value)
        },
      },
    })

    await wrapper.find('button').trigger('click')
    expect(changes.at(-1)).toBe('')
  })
})
