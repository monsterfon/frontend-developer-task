import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGalleryStore } from '@/stores/galleryStore'
import * as picsum from '@/api/picsum'
import type { Photo } from '@/types'

const mockPhotos: Photo[] = [
  { id: '1', author: 'Alice', width: 800, height: 600, url: 'u1', download_url: 'd1' },
  { id: '2', author: 'Bob', width: 1024, height: 768, url: 'u2', download_url: 'd2' },
]

describe('galleryStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it('initialises with empty photos, page 1, not loading, no error, no lastViewedId', () => {
    const store = useGalleryStore()
    expect(store.photos).toEqual([])
    expect(store.currentPage).toBe(1)
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
    expect(store.lastViewedId).toBeNull()
  })

  it('exposes correct constants', () => {
    const store = useGalleryStore()
    expect(store.limit).toBe(20)
    expect(store.totalPhotos).toBe(1000)
    expect(store.totalPages).toBe(50)
    expect(store.columns).toBe(4)
  })

  it('loadPage fetches photos and updates state', async () => {
    vi.spyOn(picsum, 'fetchPhotos').mockResolvedValue(mockPhotos)
    const store = useGalleryStore()
    await store.loadPage(3)
    expect(picsum.fetchPhotos).toHaveBeenCalledWith(3, 20)
    expect(store.photos).toEqual(mockPhotos)
    expect(store.currentPage).toBe(3)
  })

  it('loadPage sets isLoading true during fetch and false after', async () => {
    let resolve!: (v: Photo[]) => void
    vi.spyOn(picsum, 'fetchPhotos').mockReturnValue(new Promise(r => { resolve = r }))
    const store = useGalleryStore()

    const promise = store.loadPage(1)
    expect(store.isLoading).toBe(true)
    resolve(mockPhotos)
    await promise
    expect(store.isLoading).toBe(false)
  })

  it('loadPage sets error and resets isLoading on fetch error', async () => {
    vi.spyOn(picsum, 'fetchPhotos').mockRejectedValue(new Error('Network error'))
    const store = useGalleryStore()
    await store.loadPage(1)
    expect(store.isLoading).toBe(false)
    expect(store.error).toBe('Network error')
  })

  it('loadPage clears error on successful fetch', async () => {
    vi.spyOn(picsum, 'fetchPhotos').mockRejectedValueOnce(new Error('fail'))
    const store = useGalleryStore()
    await store.loadPage(1)
    expect(store.error).toBe('fail')
    vi.spyOn(picsum, 'fetchPhotos').mockResolvedValue(mockPhotos)
    await store.loadPage(1)
    expect(store.error).toBeNull()
  })

  it('lastViewedId can be set directly', () => {
    const store = useGalleryStore()
    store.lastViewedId = '99'
    expect(store.lastViewedId).toBe('99')
  })
})
