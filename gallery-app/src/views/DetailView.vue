<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGalleryStore } from '@/stores/galleryStore'
import { fetchPhoto } from '@/api/picsum'
import type { Photo } from '@/types'

const route = useRoute()
const router = useRouter()
const store = useGalleryStore()

const photo = ref<Photo | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

async function loadPhoto(id: string) {
  store.lastViewedId = id
  isLoading.value = true
  error.value = null
  try {
    photo.value = await fetchPhoto(id)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load photo'
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

const isPrevDisabled = computed(() => currentIndex() === 0 && store.currentPage === 1)
const isNextDisabled = computed(() => currentIndex() === store.photos.length - 1 && store.currentPage === store.totalPages)

async function goToPrev() {
  const index = currentIndex()
  if (index > 0) {
    const prev = store.photos[index - 1]
    if (prev) router.push({ name: 'detail', params: { id: prev.id } })
  } else if (store.currentPage > 1) {
    await store.loadPage(store.currentPage - 1)
    const last = store.photos[store.photos.length - 1]
    if (last) router.push({ name: 'detail', params: { id: last.id } })
  }
}

async function goToNext() {
  const index = currentIndex()
  if (index < store.photos.length - 1) {
    const next = store.photos[index + 1]
    if (next) router.push({ name: 'detail', params: { id: next.id } })
  } else if (store.currentPage < store.totalPages) {
    await store.loadPage(store.currentPage + 1)
    const first = store.photos[0]
    if (first) router.push({ name: 'detail', params: { id: first.id } })
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
          :disabled="isPrevDisabled"
          @click="goToPrev"
        >&lsaquo;</button>
        <button
          class="toolbar__nav-btn"
          :disabled="isNextDisabled"
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

      <div v-else-if="error" class="detail__error">{{ error }}</div>

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

<style lang="scss" scoped>
@use '@/assets/variables' as *;

// ── Layout ──────────────────────────────────────────────────────────────────
.page {
  min-height: 100vh;
  background: $bg;
}

// ── Navbar ──────────────────────────────────────────────────────────────────
.navbar {
  display: flex;
  align-items: center;
  padding: 0 $page-padding;
  height: $navbar-height;
  background: $white;
  border-bottom: 1px solid $border;

  &__logo {
    font-size: 1rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    color: $text-primary;
  }
}

// ── Toolbar ─────────────────────────────────────────────────────────────────
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $page-padding;
  height: 52px;
  background: $white;
  border-bottom: 1px solid $border;

  &__left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 200px;
  }

  &__back {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    color: $text-secondary;
    padding: 4px 6px;
    line-height: 1;

    &:hover {
      color: $text-primary;
    }
  }

  &__author {
    font-size: 0.95rem;
    font-weight: 600;
    color: $text-primary;
  }

  &__center {
    display: flex;
    gap: 4px;
  }

  &__nav-btn {
    width: 32px;
    height: 32px;
    background: none;
    border: 1px solid $border-light;
    border-radius: 4px;
    font-size: 1.25rem;
    line-height: 1;
    cursor: pointer;
    color: $text-secondary;
    transition: background 0.15s;

    &:hover:not(:disabled) {
      background: $hover-bg;
    }

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
  }

  &__right {
    min-width: 200px;
    display: flex;
    justify-content: flex-end;
  }

  &__download {
    font-size: 0.8rem;
    color: $text-secondary;
    text-decoration: none;
    border: 1px solid $border-lighter;
    border-radius: 4px;
    padding: 5px 14px;
    background: $white;
    transition: background 0.15s;

    &:hover {
      background: $hover-bg;
    }
  }
}

// ── Detail content ───────────────────────────────────────────────────────────
.detail {
  padding: $page-padding;
  display: flex;
  justify-content: center;

  &__loading {
    padding: 6rem;
    color: $text-faint;
  }

  &__error {
    padding: 6rem;
    color: #c0392b;
  }

  &__content {
    width: 100%;
    max-width: 720px;
  }

  &__dimensions {
    font-size: 0.78rem;
    color: $text-subtle;
    margin: 0 0 0.5rem 0;
  }

  &__image {
    width: 100%;
    border-radius: 8px;
    display: block;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
  }
}
</style>
