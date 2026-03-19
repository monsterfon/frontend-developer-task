<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGalleryStore } from '@/stores/galleryStore'
import { fetchPhoto } from '@/api/picsum'
import type { Photo } from '@/types'

const route = useRoute()
const router = useRouter()
const store = useGalleryStore()

const photo = ref<Photo | null>(null)
const isLoading = ref(false)

async function loadPhoto(id: string) {
  store.lastViewedId = id
  isLoading.value = true
  try {
    photo.value = await fetchPhoto(id)
  } finally {
    isLoading.value = false
  }
}

// runs on first load and every time the id param changes
watch(
  () => route.params.id as string,
  (id) => loadPhoto(id),
  { immediate: true }
)

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
  <div class="page">
    <!-- Top navbar -->
    <header class="navbar">
      <span class="navbar__logo">HANNAH</span>
    </header>

    <!-- Sub-toolbar -->
    <div class="toolbar">
      <div class="toolbar__left">
        <button class="toolbar__back" @click="goBack">←</button>
        <span class="toolbar__author">{{ photo?.author ?? '…' }}</span>
      </div>

      <div class="toolbar__center">
        <button
          class="toolbar__nav-btn"
          :disabled="currentIndex() === 0"
          @click="goToPrev"
        >&lsaquo;</button>
        <button
          class="toolbar__nav-btn"
          :disabled="currentIndex() === store.photos.length - 1"
          @click="goToNext"
        >&rsaquo;</button>
      </div>

      <div class="toolbar__right">
        <a
          v-if="photo"
          class="toolbar__download"
          :href="photo.download_url"
          target="_blank"
          rel="noopener"
        >Download</a>
      </div>
    </div>

    <!-- Content -->
    <main class="detail">
      <div v-if="isLoading" class="detail__loading">Loading…</div>

      <div v-else-if="photo" class="detail__content">
        <p class="detail__dimensions">{{ photo.width }}x{{ photo.height }}</p>
        <img
          :src="`https://picsum.photos/id/${photo.id}/1080/1080`"
          :alt="photo.author"
          class="detail__image"
        />
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
  padding: 0 2rem;
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}

.navbar__logo {
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: #111;
}

/* ── Toolbar ── */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  height: 52px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}

.toolbar__left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 200px;
}

.toolbar__back {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #333;
  padding: 4px 6px;
  line-height: 1;
}

.toolbar__back:hover {
  color: #000;
}

.toolbar__author {
  font-size: 0.95rem;
  font-weight: 600;
  color: #111;
}

.toolbar__center {
  display: flex;
  gap: 4px;
}

.toolbar__nav-btn {
  width: 32px;
  height: 32px;
  background: none;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  color: #333;
  transition: background 0.15s;
}

.toolbar__nav-btn:hover:not(:disabled) {
  background: #f0f0f0;
}

.toolbar__nav-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.toolbar__right {
  min-width: 200px;
  display: flex;
  justify-content: flex-end;
}

.toolbar__download {
  font-size: 0.8rem;
  color: #333;
  text-decoration: none;
  border: 1px solid #c8c8c8;
  border-radius: 4px;
  padding: 5px 14px;
  background: #fff;
  transition: background 0.15s;
}

.toolbar__download:hover {
  background: #f5f5f5;
}

/* ── Detail content ── */
.detail {
  padding: 2rem;
  display: flex;
  justify-content: center;
}

.detail__loading {
  padding: 6rem;
  color: #888;
}

.detail__content {
  width: 100%;
  max-width: 720px;
}

.detail__dimensions {
  font-size: 0.78rem;
  color: #aaa;
  margin: 0 0 0.5rem 0;
}

.detail__image {
  width: 100%;
  border-radius: 8px;
  display: block;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
}
</style>
