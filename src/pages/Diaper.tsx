import { useState } from 'react'
import { useBabyContext } from '../context/BabyContext'
import { useRecords, getBabyRecords, type DiaperRecord } from '../context/RecordsContext'
import { formatTime, isToday } from '../utils/time'
import { useToast } from '../context/ToastContext'
import SwipeableCard from '../components/ui/SwipeableCard'
import { playDiaperSound, isSoundEnabled } from '../utils/sounds'

const consistencyOptions = ['normal', 'soft', 'liquid'] as const

const consistencyLabel: Record<string, string> = {
  normal: 'Normal',
  soft: 'Pastosa',
  liquid: 'Líquida',
}

export default function Diaper() {
  const { selectedBaby, state } = useBabyContext()
  const { records, addRecord, deleteRecord, updateRecord } = useRecords()
  const { showToast } = useToast()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editConsistency, setEditConsistency] = useState<string>('normal')
  const [editType, setEditType] = useState<DiaperRecord['diaperType']>('wet')
  const [editTime, setEditTime] = useState('')

  const babyRecords = selectedBaby
    ? getBabyRecords<DiaperRecord>(records, selectedBaby.id, 'diaper')
    : []
  const todayRecords = babyRecords.filter(r => isToday(r.timestamp)).sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  if (state.babies.length === 0 || !selectedBaby) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: 40 }}>
        <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>👶</span>
        <p className="text-muted">Cadastre e selecione um bebê para registrar fraldas</p>
      </div>
    )
  }

  const addDiaper = (diaperType: DiaperRecord['diaperType']) => {
    const record: DiaperRecord = {
      id: crypto.randomUUID(),
      babyId: selectedBaby.id,
      type: 'diaper',
      timestamp: new Date().toISOString(),
      diaperType,
      consistency: diaperType === 'wet' ? undefined : 'normal',
    }
    addRecord(record)
    if (isSoundEnabled()) playDiaperSound()
    showToast(diaperType === 'wet' ? '💦 Xixi registrado!' : diaperType === 'dirty' ? '💩 Cocô registrado!' : 'Registrado!', 'success')
  }

  return (
    <div className="container">
      <h1 className="page-title">👶 Fraldas</h1>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => addDiaper('wet')} className="btn btn-primary" style={{ flex: 1 }}>
          💦 Xixi
        </button>
        <button onClick={() => addDiaper('dirty')} className="btn btn-primary" style={{ flex: 1 }}>
          💩 Cocô
        </button>
        <button onClick={() => addDiaper('both')} className="btn btn-primary" style={{ flex: 1 }}>
          💦💩 Ambos
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p className="text-muted" style={{ fontWeight: 600 }}>Hoje ({todayRecords.length})</p>
        {todayRecords.length === 0 && (
          <p className="text-muted" style={{ textAlign: 'center', padding: 24 }}>
            Nenhuma fralda registrada hoje
          </p>
        )}
        {todayRecords.map(r => (
            <SwipeableCard key={r.id} onDelete={() => { deleteRecord(r.id); showToast('Removido!', 'success') }}>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '1.5rem' }}>
              {r.diaperType === 'wet' ? '💦' : r.diaperType === 'dirty' ? '💩' : '💦💩'}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>
                {r.diaperType === 'wet' ? 'Xixi' : r.diaperType === 'dirty' ? 'Cocô' : 'Xixi + Cocô'}
              </div>
              <div className="text-muted">{formatTime(r.timestamp)}</div>
              {r.consistency && r.diaperType !== 'wet' && (
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                  Consistência: {consistencyLabel[r.consistency] ?? r.consistency}
                </div>
              )}
            </div>

            {r.diaperType !== 'wet' && editingId !== r.id && (
              <button
                onClick={() => { setEditingId(r.id); setEditType(r.diaperType); setEditConsistency(r.consistency ?? 'normal'); setEditTime(r.timestamp.slice(0, 16)) }}
                className="btn btn-outline btn-sm"
                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
              >
                Editar
              </button>
            )}

            {editingId === r.id && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0', width: '100%' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <select value={editType} onChange={e => setEditType(e.target.value as DiaperRecord['diaperType'])}
                    style={{ flex: 1, padding: '6px 10px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)', fontSize: '0.85rem' }}>
                    <option value="wet">💦 Xixi</option>
                    <option value="dirty">💩 Cocô</option>
                    <option value="both">💦💩 Ambos</option>
                  </select>
                  <input type="datetime-local" value={editTime} onChange={e => setEditTime(e.target.value)}
                    style={{ flex: 2, padding: '6px 10px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)', fontSize: '0.85rem' }} />
                </div>
                {editType !== 'wet' && (
                  <select value={editConsistency} onChange={e => setEditConsistency(e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)', fontSize: '0.85rem' }}>
                    {consistencyOptions.map(c => (<option key={c} value={c}>{consistencyLabel[c]}</option>))}
                  </select>
                )}
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <button onClick={() => {
                    updateRecord({ ...r, diaperType: editType, consistency: editType !== 'wet' ? editConsistency as DiaperRecord['consistency'] : undefined, timestamp: new Date(editTime).toISOString() })
                    setEditingId(null)
                    showToast('✏️ Atualizado!', 'success')
                  }} className="btn btn-primary btn-sm" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>OK</button>
                  <button onClick={() => setEditingId(null)} className="btn btn-outline btn-sm" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>✕</button>
                </div>
              </div>
            )}

            <button
              onClick={() => { if (confirm('Remover?')) { deleteRecord(r.id); showToast('Removido!', 'success') } }}
              style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--lilac-100)', fontSize: '0.9rem' }}
            >
              ✕
            </button>
            </div>
            </SwipeableCard>
          ))}
      </div>
    </div>
  )
}
