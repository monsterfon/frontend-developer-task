import { ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchPhotos } from '@/api/picsum'
import type { Photo } from '@/types'

function setup() {

  const photos = ref<Photo[]>([])
  const currentPage = ref(1)
  const isLoading = ref(false)
  const lastViewedId = ref<string | null>(null)

  async function loadPage(page: number) {
    isLoading.value = true
    try {
      photos.value = await fetchPhotos(page)
      currentPage.value = page
    } finally {
      isLoading.value = false
    }
  }

  return { photos, currentPage, isLoading, lastViewedId, loadPage }
}

export const useGalleryStore = defineStore('gallery', setup)
