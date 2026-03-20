<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGalleryStore } from '@/stores/galleryStore'
import PhotoCard from '@/components/PhotoCard.vue'

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

// Calculate the "Showing X–Y of Z" label
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
  for (let i = start; i <= Math.min(start + 4, store.totalPages); i++) {
    pages.push(i)
  }
  return pages
})
</script>

<template>
  <div class="page">
    <!-- Navbar -->
    <header class="navbar">
      <span class="navbar__logo">HANNAH</span>
    </header>

    <!-- Content panel -->
    <div class="panel">
      <!-- Toolbar -->
      <div class="toolbar">
        <span class="toolbar__range">{{ rangeLabel }}</span>
        <nav class="toolbar__pagination">
          <button
            class="toolbar__page-btn toolbar__page-btn--arrow"
            :disabled="store.currentPage === 1"
            @click="store.loadPage(store.currentPage - 1)"
          >&lsaquo;</button>
          <button
            v-for="page in pageNumbers"
            :key="page"
            class="toolbar__page-btn"
            :class="{ 'toolbar__page-btn--active': page === store.currentPage }"
            @click="store.loadPage(page)"
          >
            {{ page }}
          </button>
          <button
            class="toolbar__page-btn toolbar__page-btn--arrow"
            :disabled="store.currentPage * store.limit >= store.totalPhotos"
            @click="store.loadPage(store.currentPage + 1)"
          >&rsaquo;</button>
        </nav>
      </div>

      <!-- Grid -->
      <main class="gallery">
        <div v-if="store.isLoading" class="gallery__loading">Loading…</div>

        <div v-else-if="store.error" class="gallery__error">{{ store.error }}</div>

        <div v-else class="gallery__grid" :style="{ '--columns': store.columns }">
          <PhotoCard
            v-for="photo in store.photos"
            :key="photo.id"
            :photo="photo"
            :active="photo.id === store.lastViewedId"
            @click="goToPhoto(photo.id)"
          />
        </div>
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

// ── Layout ──────────────────────────────────────────────────────────────────
.page {
  min-height: 100vh;
  background: $white;
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

// ── Panel ────────────────────────────────────────────────────────────────────
.panel {
  margin: 1.5rem $page-padding;
  background: $bg;
  border-radius: 12px;
  border: 1px solid $border;
  overflow: hidden;
}

// ── Toolbar ──────────────────────────────────────────────────────────────────
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $page-padding;
  height: 52px;
  background: $bg;
  border-bottom: 1px solid $border;

  &__range {
    font-size: 0.78rem;
    color: $text-faint;
    min-width: 120px;
  }

  &__pagination {
    display: flex;
    gap: 4px;
  }

  &__page-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: none;
    border-radius: 4px;
    font-size: 0.875rem;
    color: $text-muted;
    cursor: pointer;
    transition: background 0.15s;

    &:hover:not(:disabled) {
      background: $hover-bg;
    }

    &--active {
      font-weight: 700;
      color: $text-primary;
      background: $active-bg;
    }

    &--arrow {
      font-size: 1.25rem;
      line-height: 1;

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
    }
  }
}

// ── Gallery ─────────────────────────────────────────────────────────────────
.gallery {
  padding: 1.5rem;

  &__loading {
    text-align: center;
    padding: 6rem;
    color: $text-faint;
  }

  &__error {
    text-align: center;
    padding: 6rem;
    color: #c0392b;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(var(--columns), 1fr);
    gap: 1rem;
  }
}
</style>
