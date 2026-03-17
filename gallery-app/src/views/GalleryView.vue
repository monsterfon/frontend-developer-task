<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGalleryStore } from '@/stores/galleryStore'

const store = useGalleryStore()
const router = useRouter()

onMounted(() => {
  if (store.photos.length === 0) {
    store.loadPage(1)
  }
})

function goToPhoto(id: string) {
  router.push({ name: 'detail', params: { id } })
}

function prevPage() {
  if (store.currentPage > 1) {
    store.loadPage(store.currentPage - 1)
  }
}

function nextPage() {
  store.loadPage(store.currentPage + 1)
}
</script>

<template>
  <main class="gallery">
    <div v-if="store.isLoading" class="gallery__loading">Loading...</div>

    <div v-else class="gallery__grid">
      <div
        v-for="photo in store.photos"
        :key="photo.id"
        class="gallery__item"
        :class="{ 'gallery__item--active': photo.id === store.lastViewedId }"
        @click="goToPhoto(photo.id)"
      >
        <img
          :src="`https://picsum.photos/id/${photo.id}/200/300`"
          :alt="photo.author"
        />
      </div>
    </div>

    <div class="gallery__pagination">
      <button :disabled="store.currentPage === 1" @click="prevPage">Previous</button>
      <span>Page {{ store.currentPage }}</span>
      <button @click="nextPage">Next</button>
    </div>
  </main>
</template>

<style scoped>
.gallery {
  padding: 2rem;
}

.gallery__loading {
  text-align: center;
  padding: 4rem;
}

.gallery__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.gallery__item {
  cursor: pointer;
  overflow: hidden;
  border-radius: 4px;
  border: 3px solid transparent;
  transition: border-color 0.2s;
}

.gallery__item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.gallery__item--active {
  border-color: #646cff;
}

.gallery__pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
}

.gallery__pagination button {
  padding: 0.5rem 1.25rem;
  cursor: pointer;
}

.gallery__pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
