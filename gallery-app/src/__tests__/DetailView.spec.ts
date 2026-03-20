import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DetailView from '@/views/DetailView.vue'
import { useGalleryStore } from '@/stores/galleryStore'
import * as picsum from '@/api/picsum'
import type { Photo } from '@/types'

vi.mock('@/api/picsum', () => ({
  fetchPhotos: vi.fn().mockResolvedValue([]),
  fetchPhoto: vi.fn(),
}))

const mockPhoto: Photo = {
  id: '10',
  author: 'Alice',
  width: 5000,
  height: 3333,
  url: 'http://example.com',
  download_url: 'http://dl.example.com',
}

const mockPhotos: Photo[] = [
  { id: '5', author: 'Prev', width: 800, height: 600, url: 'u0', download_url: 'd0' },
  { id: '10', author: 'Alice', width: 5000, height: 3333, url: 'u1', download_url: 'd1' },
  { id: '15', author: 'Next', width: 800, height: 600, url: 'u2', download_url: 'd2' },
]

describe('DetailView', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.mocked(picsum.fetchPhoto).mockResolvedValue(mockPhoto)
  })

  async function mountDetail(id = '10') {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'gallery', component: { template: '<div/>' } },
        { path: '/photo/:id', name: 'detail', component: DetailView },
      ],
    })
    await router.push(`/photo/${id}`)
    await router.isReady()
    const wrapper = mount(DetailView, {
      global: { plugins: [pinia, router] },
    })
    return wrapper
  }

  it('shows loading while fetching', async () => {
    vi.mocked(picsum.fetchPhoto).mockReturnValue(new Promise(() => {}))
    const wrapper = await mountDetail()
    expect(wrapper.find('.detail__loading').exists()).toBe(true)
  })

  it('displays photo dimensions and image after load', async () => {
    const wrapper = await mountDetail()
    await flushPromises()
    expect(wrapper.text()).toContain('5000x3333')
    expect(wrapper.find('.detail__image').exists()).toBe(true)
  })

  it('displays the author in the toolbar', async () => {
    const wrapper = await mountDetail()
    await flushPromises()
    expect(wrapper.find('.toolbar__author').text()).toBe('Alice')
  })

  it('sets lastViewedId in the store when loading a photo', async () => {
    await mountDetail('10')
    const store = useGalleryStore()
    expect(store.lastViewedId).toBe('10')
  })

  it('disables prev button when viewing the first photo in the list', async () => {
    const wrapper = await mountDetail('5')
    const store = useGalleryStore()
    store.photos = mockPhotos
    await wrapper.vm.$nextTick()
    const [prevBtn] = wrapper.findAll('.toolbar__nav-btn')
    expect(prevBtn.attributes('disabled')).toBeDefined()
  })

  it('disables next button when viewing the last photo on the last page', async () => {
    const wrapper = await mountDetail('15')
    const store = useGalleryStore()
    store.photos = mockPhotos
    // simulate being on the last page
    store.currentPage = store.totalPages
    await wrapper.vm.$nextTick()
    const navBtns = wrapper.findAll('.toolbar__nav-btn')
    expect(navBtns[1].attributes('disabled')).toBeDefined()
  })

  it('does not disable next button when viewing the last photo but not on the last page', async () => {
    const wrapper = await mountDetail('15')
    const store = useGalleryStore()
    store.photos = mockPhotos
    store.currentPage = 1
    await wrapper.vm.$nextTick()
    const navBtns = wrapper.findAll('.toolbar__nav-btn')
    expect(navBtns[1].attributes('disabled')).toBeUndefined()
  })

  it('shows error message when fetch fails', async () => {
    vi.mocked(picsum.fetchPhoto).mockRejectedValue(new Error('Not found'))
    const wrapper = await mountDetail('10')
    await flushPromises()
    expect(wrapper.find('.detail__error').exists()).toBe(true)
    expect(wrapper.text()).toContain('Not found')
  })

  it('navigates to next page when on last photo of current page', async () => {
    vi.mocked(picsum.fetchPhotos).mockResolvedValue([
      { id: '30', author: 'Page2First', width: 800, height: 600, url: 'u3', download_url: 'd3' },
    ])
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'gallery', component: { template: '<div/>' } },
        { path: '/photo/:id', name: 'detail', component: DetailView },
      ],
    })
    await router.push('/photo/15')
    await router.isReady()
    const wrapper = mount(DetailView, { global: { plugins: [pinia, router] } })
    await flushPromises()
    const store = useGalleryStore()
    store.photos = mockPhotos
    store.currentPage = 1
    await wrapper.vm.$nextTick()
    const navBtns = wrapper.findAll('.toolbar__nav-btn')
    await navBtns[1]!.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.params.id).toBe('30')
  })

  it('shows the download link pointing to the photo download URL', async () => {
    const wrapper = await mountDetail()
    await flushPromises()
    const link = wrapper.find('.toolbar__download')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('http://dl.example.com')
  })

  it('navigates back to gallery when back button is clicked', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'gallery', component: { template: '<div/>' } },
        { path: '/photo/:id', name: 'detail', component: DetailView },
      ],
    })
    await router.push('/photo/10')
    await router.isReady()
    const wrapper = mount(DetailView, { global: { plugins: [pinia, router] } })
    await flushPromises()
    await wrapper.find('.toolbar__back').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('gallery')
  })
})
