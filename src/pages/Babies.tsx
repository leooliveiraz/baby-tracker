import { useState } from 'react'
import { useBabyContext } from '../context/BabyContext'
import AddBabyModal from './AddBabyModal'

export default function Babies() {
  const { state, selectBaby, removeBaby, selectedBaby } = useBabyContext()
  const [showAdd, setShowAdd] = useState(false)

  const handleSelect = (id: string) => {
    selectBaby(id)
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Meus Bebês</h1>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary btn-sm">
          + Novo
        </button>
      </div>

      {state.babies.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <span style={{ fontSize: 48, marginBottom: 12, display: 'block' }}>👶</span>
          <p className="text-muted">Nenhum bebê cadastrado ainda</p>
          <button
            onClick={() => setShowAdd(true)}
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
            onClick={() => handleSelect(baby.id)}
          >
            <span style={{ fontSize: 36 }}>👶</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: 'var(--lilac-900)' }}>{baby.name}</div>
              <div className="text-muted">
                {new Date(baby.birthDate).toLocaleDateString('pt-BR')}
              </div>
            </div>
            <button
              onClick={e => { e.stopPropagation(); removeBaby(baby.id) }}
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

      {showAdd && <AddBabyModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}
