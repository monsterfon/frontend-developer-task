<script setup lang="ts">
import type { Photo } from '@/types'

defineProps<{
  photo: Photo
  active: boolean
}>()

defineEmits<{
  click: []
}>()
</script>

<template>
  <div
    class="photo-card"
    :class="{ 'photo-card--active': active }"
    @click="$emit('click')"
  >
    <img
      :src="`https://picsum.photos/id/${photo.id}/400/400`"
      :alt="photo.author"
      class="photo-card__img"
    />
    <div class="photo-card__meta">
      <span class="photo-card__author">{{ photo.author }}</span>
      <a
        class="photo-card__download"
        :href="photo.download_url"
        target="_blank"
        rel="noopener"
        @click.stop
      >Download</a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as *;

.photo-card {
  background: $white;
  border-radius: $border-radius;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: border-color 0.2s, box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }

  &--active {
    border-color: $accent;
  }

  &__img {
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    display: block;
  }

  &__meta {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding: 0.6rem 0.75rem;
  }

  &__author {
    font-size: 0.8rem;
    color: $text-secondary;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__download {
    font-size: 0.75rem;
    color: $text-muted;
    text-decoration: none;
    border: 1px solid $border-light;
    border-radius: 4px;
    padding: 2px 8px;
    white-space: nowrap;
    align-self: flex-start;
    transition: background 0.15s;

    &:hover {
      background: $hover-bg;
    }
  }
}
</style>
