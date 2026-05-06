import { useState, useEffect } from 'react'
import { useBabyContext } from '../context/BabyContext'
import { useRecords, getBabyRecords, type FeedingRecord } from '../context/RecordsContext'
import { formatTime, formatDuration, calcDuration, isToday } from '../utils/time'
import { useToast } from '../context/ToastContext'

export default function Feeding() {
  const { selectedBaby, state } = useBabyContext()
  const { records, addRecord, updateRecord, deleteRecord } = useRecords()
  const { showToast } = useToast()
  const [showBottleForm, setShowBottleForm] = useState(false)
  const [volume, setVolume] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDuration, setEditDuration] = useState('')
  const [editVolume, setEditVolume] = useState('')
  const [now, setNow] = useState(Date.now())

  const babyRecords = selectedBaby
    ? getBabyRecords<FeedingRecord>(records, selectedBaby.id, 'feeding')
    : []
  const todayRecords = babyRecords.filter(r => isToday(r.timestamp)).sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  const activeFeeding = todayRecords.find(r => r.method === 'breast' && !r.duration)

  useEffect(() => {
    if (!activeFeeding) return
    const interval = setInterval(() => setNow(Date.now()), 10000)
    return () => clearInterval(interval)
  }, [activeFeeding])

  if (state.babies.length === 0 || !selectedBaby) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: 40 }}>
        <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>🥛</span>
        <p className="text-muted">Cadastre e selecione um bebê para registrar mamadas</p>
      </div>
    )
  }

  const startBreast = (side: 'left' | 'right') => {
    if (activeFeeding) return
    const record: FeedingRecord = {
      id: crypto.randomUUID(),
      babyId: selectedBaby.id,
      type: 'feeding',
      timestamp: new Date().toISOString(),
      method: 'breast',
      side,
    }
    addRecord(record)
  }

  const stopBreast = () => {
    if (!activeFeeding) return
    const duration = calcDuration(activeFeeding.timestamp)
    updateRecord({ ...activeFeeding, duration })
  }

  const addBottle = () => {
    if (!volume) return
    const record: FeedingRecord = {
      id: crypto.randomUUID(),
      babyId: selectedBaby.id,
      type: 'feeding',
      timestamp: new Date().toISOString(),
      method: 'bottle',
      volume: Number(volume),
    }
    addRecord(record)
    setShowBottleForm(false)
    setVolume('')
  }

  return (
    <div className="container">
      <h1 className="page-title">🥛 Mamadas</h1>

      {activeFeeding && (
        <div className="card" style={{
          background: 'var(--lilac-100)',
          border: '2px solid var(--lilac-500)',
          textAlign: 'center',
        }}>
          <p style={{ fontWeight: 700, color: 'var(--lilac-700)', marginBottom: 8 }}>
            {activeFeeding.side === 'left' ? '⬅ Peito Esquerdo' : '➡ Peito Direito'}
          </p>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--lilac-900)' }}>
            {formatDuration(calcDuration(activeFeeding.timestamp, new Date(now).toISOString()))}
          </p>
          <button onClick={stopBreast} className="btn btn-primary" style={{ marginTop: 8 }}>
            ⏹ Parar
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => startBreast('left')}
          className="btn btn-outline"
          disabled={!!activeFeeding}
          style={{ flex: 1, opacity: activeFeeding && activeFeeding.side !== 'left' ? 1 : undefined }}
        >
          ⬅ Peito E
        </button>
        <button
          onClick={() => startBreast('right')}
          className="btn btn-outline"
          disabled={!!activeFeeding}
          style={{ flex: 1 }}
        >
          ➡ Peito D
        </button>
        <button
          onClick={() => { if (!activeFeeding) setShowBottleForm(true) }}
          className="btn btn-outline"
          disabled={!!activeFeeding}
          style={{ flex: 1 }}
        >
          🍼 Mamadeira
        </button>
      </div>

      {showBottleForm && (
        <div className="card" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="number"
            placeholder="Volume (ml)"
            value={volume}
            onChange={e => setVolume(e.target.value)}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 'var(--radius)',
              border: '2px solid var(--lilac-100)', fontSize: '1rem',
            }}
            autoFocus
          />
          <button onClick={addBottle} className="btn btn-primary btn-sm">Salvar</button>
          <button onClick={() => setShowBottleForm(false)} className="btn btn-outline btn-sm">✕</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p className="text-muted" style={{ fontWeight: 600 }}>Hoje ({todayRecords.length})</p>
        {todayRecords.length === 0 && (
          <p className="text-muted" style={{ textAlign: 'center', padding: 24 }}>
            Nenhuma mamada registrada hoje
          </p>
        )}
        {todayRecords.map(r => {
          const isEditing = editingId === r.id
          return (
          <div key={r.id} className="card" style={{
            display: 'flex', flexDirection: 'column', gap: 8,
            opacity: r === activeFeeding ? 0.6 : 1,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.5rem' }}>
                {r.method === 'breast' ? (r.side === 'left' ? '⬅' : '➡') : '🍼'}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>
                  {r.method === 'breast' ? `Peito ${r.side === 'left' ? 'Esquerdo' : 'Direito'}` : 'Mamadeira'}
                </div>
                <div className="text-muted">
                  {formatTime(r.timestamp)}
                  {r.duration !== undefined && ` · ${formatDuration(r.duration)}`}
                  {r.volume && ` · ${r.volume}ml`}
                  {r === activeFeeding && ' · ⏳ em andamento'}
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingId(r.id)
                  setEditDuration(String(r.duration ?? ''))
                  setEditVolume(String(r.volume ?? ''))
                }}
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
                {r.method === 'bottle' && (
                  <input type="number" placeholder="Volume (ml)" value={editVolume} onChange={e => setEditVolume(e.target.value)}
                    style={{ width: 100, padding: '6px 10px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)', fontSize: '0.85rem' }} />
                )}
                <button onClick={() => {
                  updateRecord({ ...r, duration: editDuration ? Number(editDuration) : undefined, volume: editVolume ? Number(editVolume) : undefined })
                  setEditingId(null)
                  showToast('✏️ Atualizado!', 'success')
                }} className="btn btn-primary btn-sm" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>OK</button>
                <button onClick={() => setEditingId(null)} className="btn btn-outline btn-sm" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>✕</button>
              </div>
            )}
          </div>
          )})}
      </div>
    </div>
  )
}
