// src/components/RouteLabel.test.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import RouteLabel from './RouteLabel.vue'

describe('RouteLabel', () => {
  it('正確渲染組件', () => {
    const wrapper = mount(RouteLabel)
    expect(wrapper.exists()).toBe(true)
  })

  // 更多測試...
})