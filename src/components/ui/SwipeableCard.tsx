import { useState, useRef, type ReactNode, type TouchEvent, type MouseEvent } from 'react'

interface Props {
  children: ReactNode
  onDelete: () => void
  threshold?: number
}

export default function SwipeableCard({ children, onDelete, threshold = 80 }: Props) {
  const [offsetX, setOffsetX] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const startX = useRef(0)
  const currentX = useRef(0)

  const handleStart = (x: number) => {
    startX.current = x
    setSwiping(true)
  }

  const handleMove = (x: number) => {
    if (!swiping) return
    currentX.current = x
    const diff = startX.current - currentX.current
    if (diff > 0) {
      setOffsetX(Math.min(diff, threshold + 60))
      setShowDelete(diff > threshold)
    } else {
      setOffsetX(0)
      setShowDelete(false)
    }
  }

  const handleEnd = () => {
    setSwiping(false)
    if (showDelete) {
      onDelete()
    }
    setOffsetX(0)
    setShowDelete(false)
  }

  const onTouchStart = (e: TouchEvent) => handleStart(e.touches[0].clientX)
  const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX)
  const onTouchEnd = () => handleEnd()

  const onMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return
    handleStart(e.clientX)
    const onMove = (ev: globalThis.MouseEvent) => handleMove(ev.clientX)
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); handleEnd() }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius)' }}>
      <div
        style={{
          position: 'absolute', right: 0, top: 0, bottom: 0,
          width: threshold + 60,
          background: '#E74C3C',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderTopRightRadius: 'var(--radius)',
          borderBottomRightRadius: 'var(--radius)',
          transition: showDelete ? 'none' : 'opacity 0.2s',
          opacity: showDelete ? 1 : 0.7,
        }}
      >
        <span style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>Remover</span>
      </div>
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        style={{
          transform: `translateX(${-offsetX}px)`,
          transition: swiping ? 'none' : 'transform 0.3s ease',
          cursor: 'grab',
          position: 'relative',
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
        }}
      >
        {children}
      </div>
    </div>
  )
}
