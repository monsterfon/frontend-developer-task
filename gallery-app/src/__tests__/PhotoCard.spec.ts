import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PhotoCard from '@/components/PhotoCard.vue'
import type { Photo } from '@/types'

const mockPhoto: Photo = {
  id: '42',
  author: 'Jane Doe',
  width: 1200,
  height: 800,
  url: 'http://example.com',
  download_url: 'http://dl.example.com/42',
}

describe('PhotoCard', () => {
  it('renders the author name', () => {
    const wrapper = mount(PhotoCard, { props: { photo: mockPhoto, active: false } })
    expect(wrapper.find('.photo-card__author').text()).toBe('Jane Doe')
  })

  it('renders the image with the correct src and alt', () => {
    const wrapper = mount(PhotoCard, { props: { photo: mockPhoto, active: false } })
    const img = wrapper.find('.photo-card__img')
    expect(img.attributes('src')).toContain('/id/42/')
    expect(img.attributes('alt')).toBe('Jane Doe')
  })

  it('renders the download link pointing to download_url', () => {
    const wrapper = mount(PhotoCard, { props: { photo: mockPhoto, active: false } })
    const link = wrapper.find('.photo-card__download')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('http://dl.example.com/42')
  })

  it('applies photo-card--active class when active is true', () => {
    const wrapper = mount(PhotoCard, { props: { photo: mockPhoto, active: true } })
    expect(wrapper.find('.photo-card').classes()).toContain('photo-card--active')
  })

  it('does not apply photo-card--active class when active is false', () => {
    const wrapper = mount(PhotoCard, { props: { photo: mockPhoto, active: false } })
    expect(wrapper.find('.photo-card').classes()).not.toContain('photo-card--active')
  })

  it('emits click when the card is clicked', async () => {
    const wrapper = mount(PhotoCard, { props: { photo: mockPhoto, active: false } })
    await wrapper.find('.photo-card').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does not emit click when the download link is clicked', async () => {
    const wrapper = mount(PhotoCard, { props: { photo: mockPhoto, active: false } })
    await wrapper.find('.photo-card__download').trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })
})
