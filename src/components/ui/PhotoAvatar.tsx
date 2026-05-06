import { useState, useEffect, useRef } from 'react'

interface Props {
  photo?: string
  size: number
  name: string
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('baby-tracker-cache', 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains('photos')) {
        db.createObjectStore('photos')
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function getCached(url: string): Promise<string | null> {
  try {
    const db = await openDB()
    return new Promise(resolve => {
      const tx = db.transaction('photos', 'readonly')
      const req = tx.objectStore('photos').get(url)
      req.onsuccess = () => {
        resolve(req.result ?? null)
        db.close()
      }
      req.onerror = () => { db.close(); resolve(null) }
    })
  } catch { return null }
}

async function cachePhoto(url: string, data: string) {
  try {
    const db = await openDB()
    const tx = db.transaction('photos', 'readwrite')
    tx.objectStore('photos').put(data, url)
    tx.oncomplete = () => db.close()
  } catch { /* ignore */ }
}

async function loadWithCache(photo: string): Promise<string> {
  if (!photo.startsWith('http')) return photo
  const cached = await getCached(photo)
  if (cached) return cached
  try {
    const res = await fetch(photo)
    const blob = await res.blob()
    return new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        cachePhoto(photo, dataUrl)
        resolve(dataUrl)
      }
      reader.readAsDataURL(blob)
    })
  } catch {
    return photo
  }
}

export default function PhotoAvatar({ photo, size, name }: Props) {
  const [src, setSrc] = useState<string | undefined>(photo)
  const [error, setError] = useState(false)
  const loaded = useRef(false)

  useEffect(() => {
    if (!photo) { setSrc(undefined); setError(false); return }
    loaded.current = false
    setError(false)
    loadWithCache(photo).then(cached => {
      if (!loaded.current) {
        setSrc(cached)
        loaded.current = true
      }
    })
  }, [photo])

  if (src && !error) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setError(true)}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid var(--lilac-300)',
          flexShrink: 0,
        }}
      />
    )
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--lilac-100)',
        border: '2px solid var(--lilac-200)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.5,
        flexShrink: 0,
      }}
    >
      👶
    </div>
  )
}
