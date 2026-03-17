import type { Photo } from '@/types'

const BASE_URL = 'https://picsum.photos'

export async function fetchPhotos(page: number, limit = 20): Promise<Photo[]> {
  const response = await fetch(`${BASE_URL}/v2/list?page=${page}&limit=${limit}`)
  if (!response.ok) throw new Error(`Failed to fetch photos: ${response.status}`)
  return response.json()
}

export async function fetchPhoto(id: string): Promise<Photo> {
  const response = await fetch(`${BASE_URL}/id/${id}/info`)
  if (!response.ok) throw new Error(`Failed to fetch photo ${id}: ${response.status}`)
  return response.json()
}
