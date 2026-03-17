<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGalleryStore } from '@/stores/galleryStore'
import { fetchPhoto } from '@/api/picsum'
import type { Photo } from '@/types'

const route = useRoute()
const router = useRouter()
const store = useGalleryStore()

const photo = ref<Photo | null>(null)
const isLoading = ref(false)

onMounted(async () => {
  const id = route.params.id as string
  store.lastViewedId = id
  isLoading.value = true
  try {
    photo.value = await fetchPhoto(id)
  } finally {
    isLoading.value = false
  }
})

function currentIndex() {
  return store.photos.findIndex(p => p.id === route.params.id)
}

function goToPrev() {
  const index = currentIndex()
  if (index > 0) {
    router.push({ name: 'detail', params: { id: store.photos[index - 1].id } })
  }
}

function goToNext() {
  const index = currentIndex()
  if (index < store.photos.length - 1) {
    router.push({ name: 'detail', params: { id: store.photos[index + 1].id } })
  }
}

function goBack() {
  router.push({ name: 'gallery' })
}
</script>

<template>
  <main class="detail">
    <button class="detail__back" @click="goBack">← Back to gallery</button>

    <div v-if="isLoading" class="detail__loading">Loading...</div>

    <div v-else-if="photo" class="detail__content">
      <img
        :src="`https://picsum.photos/id/${photo.id}/800/600`"
        :alt="photo.author"
        class="detail__image"
      />

      <div class="detail__info">
        <p class="detail__author">{{ photo.author }}</p>
        <p class="detail__size">{{ photo.width }} × {{ photo.height }}</p>
      </div>

      <div class="detail__navigation">
        <button :disabled="currentIndex() === 0" @click="goToPrev">← Previous</button>
        <button :disabled="currentIndex() === store.photos.length - 1" @click="goToNext">Next →</button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.detail {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.detail__back {
  margin-bottom: 1.5rem;
  cursor: pointer;
  background: none;
  border: none;
  font-size: 1rem;
  padding: 0;
  text-decoration: underline;
}

.detail__loading {
  text-align: center;
  padding: 4rem;
}

.detail__image {
  width: 100%;
  border-radius: 6px;
  display: block;
}

.detail__info {
  margin-top: 1rem;
}

.detail__author {
  font-size: 1.25rem;
  font-weight: bold;
}

.detail__size {
  color: #888;
  margin-top: 0.25rem;
}

.detail__navigation {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.detail__navigation button {
  padding: 0.5rem 1.25rem;
  cursor: pointer;
}

.detail__navigation button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
