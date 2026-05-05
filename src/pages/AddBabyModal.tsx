import { useState } from 'react'
import { useBabyContext } from '../context/BabyContext'

interface Props {
  onClose: () => void
}

export default function AddBabyModal({ onClose }: Props) {
  const { addBaby } = useBabyContext()
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !birthDate) return
    addBaby(name.trim(), birthDate)
    onClose()
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(74, 26, 92, 0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, padding: 16,
      }}
    >
      <form
        onSubmit={handleSubmit}
        onClick={e => e.stopPropagation()}
        className="card"
        style={{
          width: '100%', maxWidth: 360,
          display: 'flex', flexDirection: 'column', gap: 16,
        }}
      >
        <h2 style={{ fontSize: '1.2rem', color: 'var(--lilac-900)' }}>
          👶 Novo Bebê
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Nome
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nome do bebê"
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius)',
              border: '2px solid var(--lilac-100)',
              fontSize: '1rem',
            }}
            autoFocus
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Data de Nascimento
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={e => setBirthDate(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius)',
              border: '2px solid var(--lilac-100)',
              fontSize: '1rem',
              colorScheme: 'light',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary btn-sm">
            Salvar
          </button>
        </div>
      </form>
    </div>
  )
}
