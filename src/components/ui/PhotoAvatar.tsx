import { useState } from 'react'

interface Props {
  photo?: string
  size: number
  name: string
}

export default function PhotoAvatar({ photo, size, name }: Props) {
  const [error, setError] = useState(false)

  if (photo && !error) {
    return (
      <img
        src={photo}
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
