<script setup lang="ts">
import { computed, onMounted } from 'vue'
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

const rangeLabel = computed(() => {
  if (!store.totalPhotos) return ''
  const from = (store.currentPage - 1) * store.limit + 1
  const to = Math.min(store.currentPage * store.limit, store.totalPhotos)
  return `${from}–${to} of ${store.totalPhotos}`
})

// Show 5 page numbers centred around the current page
const pageNumbers = computed(() => {
  const current = store.currentPage
  const half = 2
  let start = Math.max(1, current - half)
  const pages = []
  for (let i = start; i < start + 5; i++) {
    pages.push(i)
  }
  return pages
})
</script>

<template>
  <div class="page">
    <!-- Navbar -->
    <header class="navbar">
      <div class="navbar__left">
        <span class="navbar__logo">HANNAH</span>
        <span v-if="rangeLabel" class="navbar__range">{{ rangeLabel }}</span>
      </div>
      <nav class="navbar__pagination">
        <button
          v-for="page in pageNumbers"
          :key="page"
          class="navbar__page-btn"
          :class="{ 'navbar__page-btn--active': page === store.currentPage }"
          @click="store.loadPage(page)"
        >
          {{ page }}
        </button>
      </nav>
    </header>

    <!-- Grid -->
    <main class="gallery">
      <div v-if="store.isLoading" class="gallery__loading">Loading…</div>

      <div v-else class="gallery__grid" :style="{ '--columns': store.columns }">
        <div
          v-for="photo in store.photos"
          :key="photo.id"
          class="gallery__card"
          :class="{ 'gallery__card--active': photo.id === store.lastViewedId }"
          @click="goToPhoto(photo.id)"
        >
          <img
            :src="`https://picsum.photos/id/${photo.id}/400/400`"
            :alt="photo.author"
            class="gallery__img"
          />
          <div class="gallery__meta">
            <span class="gallery__author">{{ photo.author }}</span>
            <a
              class="gallery__download"
              :href="photo.download_url"
              target="_blank"
              rel="noopener"
              @click.stop
            >Download</a>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* ── Layout ── */
.page {
  min-height: 100vh;
  background: #f2f3f5;
}

/* ── Navbar ── */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}

.navbar__left {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.navbar__logo {
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: #111;
}

.navbar__range {
  font-size: 0.7rem;
  color: #888;
}

.navbar__pagination {
  display: flex;
  gap: 4px;
}

.navbar__page-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #555;
  cursor: pointer;
  transition: background 0.15s;
}

.navbar__page-btn:hover {
  background: #f0f0f0;
}

.navbar__page-btn--active {
  font-weight: 700;
  color: #111;
  background: #ebebeb;
}

/* ── Gallery ── */
.gallery {
  padding: 1.5rem 2rem;
}

.gallery__loading {
  text-align: center;
  padding: 6rem;
  color: #888;
}

.gallery__grid {
  display: grid;
  grid-template-columns: repeat(var(--columns), 1fr);
  gap: 1rem;
}

/* ── Card ── */
.gallery__card {
  background: #fff;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.gallery__card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.gallery__card--active {
  border-color: #5b6cf9;
}

.gallery__img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  display: block;
}

.gallery__meta {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.6rem 0.75rem;
}

.gallery__author {
  font-size: 0.8rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gallery__download {
  font-size: 0.75rem;
  color: #555;
  text-decoration: none;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  padding: 2px 8px;
  white-space: nowrap;
  align-self: flex-start;
  transition: background 0.15s;
}

.gallery__download:hover {
  background: #f5f5f5;
}
</style>
