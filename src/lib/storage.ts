import { supabase } from './supabase'

export function compressImage(file: File, maxDim: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(img.src)
      const canvas = document.createElement('canvas')
      let { width, height } = img
      if (width > height) {
        if (width > maxDim) { height *= maxDim / width; width = maxDim }
      } else {
        if (height > maxDim) { width *= maxDim / height; height = maxDim }
      }
      canvas.width = Math.round(width)
      canvas.height = Math.round(height)
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('Canvas not supported')); return }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('Compression failed')), 'image/webp', 0.8)
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

export async function fileToBase64(file: File): Promise<string> {
  const compressed = await compressImage(file, 300)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(compressed)
  })
}

export async function uploadBabyPhoto(babyId: string, file: File): Promise<string> {
  if (!supabase) throw new Error('Supabase não configurado')

  const compressed = await compressImage(file, 300)
  const path = `${babyId}/${Date.now()}.webp`

  const { error } = await supabase.storage
    .from('baby-photos')
    .upload(path, compressed, { contentType: 'image/webp', upsert: true })

  if (error) throw error

  const { data } = supabase.storage.from('baby-photos').getPublicUrl(path)
  return data.publicUrl
}

export async function ensurePhotoUrl(babyId: string, photo: string | undefined): Promise<string | undefined> {
  if (!photo || !photo.startsWith('data:')) return photo
  if (!supabase) return photo
  try {
    const response = await fetch(photo)
    const blob = await response.blob()
    const file = new File([blob], 'photo.webp', { type: 'image/webp' })
    return await uploadBabyPhoto(babyId, file)
  } catch {
    return photo
  }
}
