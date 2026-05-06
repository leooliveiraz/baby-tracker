import { useState } from 'react'
import { useBabyContext } from '../context/BabyContext'
import { useRecords } from '../context/RecordsContext'
import BabyFormModal from './BabyFormModal'
import PhotoAvatar from '../components/ui/PhotoAvatar'
import type { Baby } from '../context/BabyContext'

export default function Babies() {
  const { state, selectBaby, removeBaby, selectedBaby } = useBabyContext()
  const { deleteRecordsByBaby } = useRecords()
  const [showForm, setShowForm] = useState(false)
  const [editBaby, setEditBaby] = useState<Baby | null>(null)

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Meus Bebês</h1>
        <button onClick={() => { setEditBaby(null); setShowForm(true) }} className="btn btn-primary btn-sm">
          + Novo
        </button>
      </div>

      {state.babies.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <span style={{ fontSize: 48, marginBottom: 12, display: 'block' }}>👶</span>
          <p className="text-muted">Nenhum bebê cadastrado ainda</p>
          <button
            onClick={() => { setEditBaby(null); setShowForm(true) }}
            className="btn btn-primary"
            style={{ marginTop: 16 }}
          >
            Adicionar Bebê
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {state.babies.map(baby => (
          <div
            key={baby.id}
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              border: baby.id === selectedBaby?.id ? '2px solid var(--lilac-500)' : '2px solid transparent',
            }}
            onClick={() => selectBaby(baby.id)}
          >
            <PhotoAvatar photo={baby.photo} size={40} name={baby.name} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: 'var(--lilac-900)' }}>{baby.name}</div>
              <div className="text-muted">
                {new Date(baby.birthDate).toLocaleDateString('pt-BR')}
              </div>
              {(baby.motherName || baby.fatherName) && (
                <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: 2 }}>
                  {baby.motherName && `👩 ${baby.motherName}`}
                  {baby.motherName && baby.fatherName && ' · '}
                  {baby.fatherName && `👨 ${baby.fatherName}`}
                </div>
              )}
            </div>

            <button
              onClick={e => { e.stopPropagation(); setEditBaby(baby); setShowForm(true) }}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--white)', border: '2px solid var(--lilac-300)',
                fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              aria-label={`Editar ${baby.name}`}
            >
              ✏️
            </button>

            <button
              onClick={e => {
                e.stopPropagation()
                if (confirm(`Remover ${baby.name} e todos os seus registros?`)) {
                  removeBaby(baby.id)
                  deleteRecordsByBaby(baby.id)
                }
              }}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--lilac-100)', fontSize: '0.9rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              aria-label={`Remover ${baby.name}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {showForm && (
        <BabyFormModal
          baby={editBaby ?? undefined}
          onClose={() => { setShowForm(false); setEditBaby(null) }}
        />
      )}
    </div>
  )
}
