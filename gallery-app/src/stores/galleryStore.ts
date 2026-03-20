import { ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchPhotos } from '@/api/picsum'
import type { Photo } from '@/types'

const LIMIT = 20                            // Photos per page
const TOTAL_PHOTOS = 1000                   // in the Picsum API
const TOTAL_PAGES = TOTAL_PHOTOS / LIMIT    // 50
const COLUMNS = 4                           // Grid columns

function setup() {

  const photos = ref<Photo[]>([])
  const currentPage = ref(1)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastViewedId = ref<string | null>(null)

  async function loadPage(page: number) {
    isLoading.value = true
    error.value = null
    try {
      photos.value = await fetchPhotos(page, LIMIT)
      currentPage.value = page
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load photos'
    } finally {
      isLoading.value = false
    }
  }

  return { photos, currentPage, limit: LIMIT, totalPhotos: TOTAL_PHOTOS, totalPages: TOTAL_PAGES, columns: COLUMNS, isLoading, error, lastViewedId, loadPage }
}

export const useGalleryStore = defineStore('gallery', setup)
