import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useDubaoStore } from './dubao'

describe('useDubaoStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('unbind removes the device from the list', () => {
    const store = useDubaoStore()

    store.add({ dubaoId: 'device-1', dubaoName: '测试设备', cover: '' })
    expect(store.dubaoId).toHaveLength(1)

    expect(store.unbind('device-1')).toBe(true)
    expect(store.dubaoId).toHaveLength(0)
  })
})
