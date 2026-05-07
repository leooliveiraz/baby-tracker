import { useEffect } from 'react'

interface Props {
  src: string
  name: string
  onClose: () => void
}

export default function PhotoViewer({ src, name, onClose }: Props) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, cursor: 'zoom-out',
      }}
    >
      <img
        src={src}
        alt={name}
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          borderRadius: 12,
          objectFit: 'contain',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        }}
      />
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 16, right: 16,
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          color: 'white', border: 'none', fontSize: '1.3rem',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        ✕
      </button>
    </div>
  )
}
