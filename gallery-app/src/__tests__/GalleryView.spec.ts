import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GalleryView from '@/views/GalleryView.vue'
import { useGalleryStore } from '@/stores/galleryStore'
import type { Photo } from '@/types'

vi.mock('@/api/picsum', () => ({
  fetchPhotos: vi.fn().mockResolvedValue([]),
  fetchPhoto: vi.fn().mockResolvedValue(null),
}))

const mockPhotos: Photo[] = [
  { id: '10', author: 'Alice', width: 800, height: 600, url: 'u1', download_url: 'http://dl1' },
  { id: '20', author: 'Bob', width: 1024, height: 768, url: 'u2', download_url: 'http://dl2' },
]

describe('GalleryView', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  async function mountView() {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'gallery', component: GalleryView },
        { path: '/photo/:id', name: 'detail', component: { template: '<div/>' } },
      ],
    })
    await router.push('/')
    await router.isReady()
    const wrapper = mount(GalleryView, {
      global: { plugins: [pinia, router] },
    })
    await flushPromises()
    return wrapper
  }

  it('shows loading indicator when isLoading is true', async () => {
    const wrapper = await mountView()
    const store = useGalleryStore()
    store.isLoading = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.gallery__loading').exists()).toBe(true)
    expect(wrapper.text()).toContain('Loading')
  })

  it('renders a card for each photo', async () => {
    const wrapper = await mountView()
    const store = useGalleryStore()
    store.photos = mockPhotos
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.photo-card')).toHaveLength(2)
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).toContain('Bob')
  })

  it('highlights the card matching lastViewedId', async () => {
    const wrapper = await mountView()
    const store = useGalleryStore()
    store.photos = mockPhotos
    store.lastViewedId = '10'
    await wrapper.vm.$nextTick()
    const cards = wrapper.findAll('.photo-card')
    expect(cards[0].classes()).toContain('photo-card--active')
    expect(cards[1].classes()).not.toContain('photo-card--active')
  })

  it('displays the correct range label', async () => {
    const wrapper = await mountView()
    const store = useGalleryStore()
    store.photos = mockPhotos
    await wrapper.vm.$nextTick()
    // page 1, limit 20, total 1000 → "1–20 of 1000"
    expect(wrapper.find('.toolbar__range').text()).toBe('1\u201320 of 1000')
  })

  it('renders 5 pagination buttons centred around current page', async () => {
    const wrapper = await mountView()
    const store = useGalleryStore()
    store.photos = mockPhotos
    await wrapper.vm.$nextTick()
    const pageNumBtns = wrapper.findAll('.toolbar__page-btn:not(.toolbar__page-btn--arrow)')
    expect(pageNumBtns).toHaveLength(5)
  })

  it('marks the current page button as active', async () => {
    const wrapper = await mountView()
    const store = useGalleryStore()
    store.photos = mockPhotos
    await wrapper.vm.$nextTick()
    const active = wrapper.findAll('.toolbar__page-btn--active')
    expect(active).toHaveLength(1)
    expect(active[0].text()).toBe('1')
  })

  it('navigates to detail route when a card is clicked', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'gallery', component: GalleryView },
        { path: '/photo/:id', name: 'detail', component: { template: '<div/>' } },
      ],
    })
    await router.push('/')
    await router.isReady()
    const wrapper = mount(GalleryView, { global: { plugins: [pinia, router] } })
    await flushPromises()
    const store = useGalleryStore()
    store.photos = mockPhotos
    await wrapper.vm.$nextTick()
    await wrapper.findAll('.photo-card')[0].trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('detail')
    expect(router.currentRoute.value.params.id).toBe('10')
  })
})
