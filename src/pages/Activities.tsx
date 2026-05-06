import { useState } from 'react'
import { useBabyContext } from '../context/BabyContext'
import { useRecords, getBabyRecords, type ActivityRecord } from '../context/RecordsContext'
import { formatTime, formatDuration, isToday } from '../utils/time'
import { useToast } from '../context/ToastContext'

const activityTypes = [
  { key: 'tummy_time' as const, icon: '🧎', label: 'Tummy Time' },
  { key: 'bath' as const, icon: '🛁', label: 'Banho' },
  { key: 'reading' as const, icon: '📖', label: 'Leitura' },
  { key: 'screen_time' as const, icon: '📱', label: 'Tela' },
]

export default function Activities() {
  const { selectedBaby, state } = useBabyContext()
  const { records, addRecord, updateRecord, deleteRecord } = useRecords()
  const { showToast } = useToast()

  const babyRecords = selectedBaby
    ? getBabyRecords<ActivityRecord>(records, selectedBaby.id, 'activity')
    : []
  const todayRecords = babyRecords.filter(r => isToday(r.timestamp)).sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  const [activeForm, setActiveForm] = useState<string | null>(null)
  const [duration, setDuration] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDuration, setEditDuration] = useState('')

  if (state.babies.length === 0 || !selectedBaby) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: 40 }}>
        <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>🧸</span>
        <p className="text-muted">Cadastre e selecione um bebê para registrar atividades</p>
      </div>
    )
  }

  const startActivity = (activityType: ActivityRecord['activityType']) => {
    setActiveForm(activityType)
    setDuration('')
  }

  const saveActivity = () => {
    if (!activeForm) return
    const record: ActivityRecord = {
      id: crypto.randomUUID(),
      babyId: selectedBaby.id,
      type: 'activity',
      timestamp: new Date().toISOString(),
      activityType: activeForm as ActivityRecord['activityType'],
      duration: duration ? Number(duration) : undefined,
    }
    addRecord(record)
    showToast('🧸 Atividade registrada!', 'success')
    setActiveForm(null)
    setDuration('')
  }

  return (
    <div className="container">
      <h1 className="page-title">🧸 Atividades</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {activityTypes.map(a => (
          <button
            key={a.key}
            onClick={() => startActivity(a.key)}
            className="card btn"
            style={{
              flexDirection: 'column', gap: 4, padding: 20,
              background: activeForm === a.key ? 'var(--lilac-100)' : 'var(--white)',
              border: activeForm === a.key ? '2px solid var(--lilac-500)' : 'none',
            }}
          >
            <span style={{ fontSize: '1.8rem' }}>{a.icon}</span>
            <span style={{ fontWeight: 600, color: 'var(--lilac-900)' }}>{a.label}</span>
          </button>
        ))}
      </div>

      {activeForm && (
        <div className="card" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="number"
            placeholder="Duração (minutos)"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 'var(--radius)',
              border: '2px solid var(--lilac-100)', fontSize: '1rem',
            }}
            autoFocus
          />
          <button onClick={saveActivity} className="btn btn-primary btn-sm">Salvar</button>
          <button onClick={() => setActiveForm(null)} className="btn btn-outline btn-sm">✕</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p className="text-muted" style={{ fontWeight: 600 }}>Hoje ({todayRecords.length})</p>
        {todayRecords.length === 0 && (
          <p className="text-muted" style={{ textAlign: 'center', padding: 24 }}>
            Nenhuma atividade registrada hoje
          </p>
        )}
        {todayRecords.map(r => {
          const act = activityTypes.find(a => a.key === r.activityType)
          const isEditing = editingId === r.id
          return (
            <div key={r.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.5rem' }}>{act?.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{act?.label ?? r.activityType}</div>
                  <div className="text-muted">
                    {formatTime(r.timestamp)}
                    {r.duration !== undefined && ` · ${formatDuration(r.duration)}`}
                  </div>
                </div>
                <button
                  onClick={() => { setEditingId(r.id); setEditDuration(String(r.duration ?? '')) }}
                  style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--lilac-300)', background: 'var(--surface)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >✏️</button>
                <button
                  onClick={() => { if (confirm('Remover?')) { deleteRecord(r.id); showToast('Removido!', 'success') } }}
                  style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--lilac-100)', fontSize: '0.9rem' }}
                >✕</button>
              </div>
              {isEditing && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="number" placeholder="Duração (min)" value={editDuration} onChange={e => setEditDuration(e.target.value)}
                    style={{ flex: 1, padding: '6px 10px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)', fontSize: '0.85rem' }} />
                  <button onClick={() => {
                    updateRecord({ ...r, duration: editDuration ? Number(editDuration) : undefined })
                    setEditingId(null)
                    showToast('✏️ Atualizado!', 'success')
                  }} className="btn btn-primary btn-sm" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>OK</button>
                  <button onClick={() => setEditingId(null)} className="btn btn-outline btn-sm" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>✕</button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
