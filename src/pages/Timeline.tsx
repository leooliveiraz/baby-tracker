import { useState } from 'react'
import { useBabyContext } from '../context/BabyContext'
import { useRecords, type FeedingRecord, type DiaperRecord, type SleepRecord, type ActivityRecord, type GrowthRecord, type BabyRecord } from '../context/RecordsContext'
import { formatTime, formatDate, calcDuration } from '../utils/time'
import { useToast } from '../context/ToastContext'

function getTimestamp(r: BabyRecord): string {
  if (r.type === 'sleep') return (r as SleepRecord).startTime
  if (r.type === 'vaccine') return (r as { date: string }).date
  return (r as FeedingRecord).timestamp
}

const typeConfig: Record<string, { icon: string; label: (r: BabyRecord) => string }> = {
  feeding: { icon: '🥛', label: (r) => {
    const f = r as FeedingRecord
    return f.method === 'breast' ? `Peito ${f.side === 'left' ? 'E' : 'D'}${f.duration ? ` · ${f.duration}min` : ''}` : `Mamadeira${f.volume ? ` · ${f.volume}ml` : ''}`
  }},
  diaper: { icon: '👶', label: (r) => {
    const d = r as DiaperRecord
    return d.diaperType === 'wet' ? 'Xixi' : d.diaperType === 'dirty' ? 'Cocô' : 'Xixi + Cocô'
  }},
  sleep: { icon: '😴', label: (r) => {
    const s = r as SleepRecord
    return s.endTime ? `${calcDuration(s.startTime, s.endTime)}min${s.location ? ` · ${s.location}` : ''}` : 'Em andamento'
  }},
  activity: { icon: '🧸', label: (r) => {
    const a = r as ActivityRecord
    return `${a.activityType.replace('_', ' ')}${a.duration ? ` · ${a.duration}min` : ''}`
  }},
  growth: { icon: '📈', label: (r) => {
    const g = r as GrowthRecord
    return `${g.weight ? `${g.weight}kg` : ''} ${g.height ? `${g.height}cm` : ''} ${g.headCircumference ? `PC ${g.headCircumference}cm` : ''}`.trim() || 'Medição'
  }},
}

export default function Timeline() {
  const { selectedBaby, state } = useBabyContext()
  const { records, deleteRecord } = useRecords()
  const { showToast } = useToast()
  const [page, setPage] = useState(1)
  const perPage = 30

  if (state.babies.length === 0 || !selectedBaby) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: 40 }}>
        <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>📋</span>
        <p className="text-muted">Cadastre e selecione um bebê para ver o histórico</p>
      </div>
    )
  }

  const allRecords = records
    .filter(r => r.babyId === selectedBaby.id)
    .sort((a, b) => {
      const ta = getTimestamp(a)
      const tb = getTimestamp(b)
      return new Date(tb).getTime() - new Date(ta).getTime()
    })

  const paginated = allRecords.slice(0, page * perPage)

  const grouped: Record<string, BabyRecord[]> = {}
  for (const r of paginated) {
    const key = formatDate(getTimestamp(r))
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(r)
  }

  return (
    <div className="container">
      <h1 className="page-title">📋 Histórico</h1>

      {paginated.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <span style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>📋</span>
          <p className="text-muted">Nenhum registro encontrado</p>
        </div>
      )}

      {Object.entries(grouped).map(([dateKey, items]) => (
        <div key={dateKey}>
          <p className="text-muted" style={{ fontWeight: 700, marginBottom: 6, fontSize: '0.85rem' }}>
            {dateKey}
          </p>
          <div style={{ position: 'relative', paddingLeft: 20 }}>
            {/* Timeline line */}
            <div style={{ position: 'absolute', left: 8, top: 8, bottom: 8, width: 2, background: 'var(--lilac-100)', borderRadius: 1 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {items.map(r => {
                const cfg = typeConfig[r.type]
                const ts = getTimestamp(r)
                return (
                  <div key={r.id} className="card" style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    position: 'relative',
                  }}>
                    {/* Timeline dot */}
                    <div style={{
                      position: 'absolute', left: -16, top: '50%', marginTop: -5,
                      width: 10, height: 10, borderRadius: '50%', background: 'var(--lilac-500)',
                      border: '2px solid var(--bg)',
                    }} />
                    <span style={{ fontSize: '1.1rem', width: 28, textAlign: 'center' }}>{cfg?.icon}</span>
                    <span className="text-muted" style={{ fontSize: '0.75rem', minWidth: 45, flexShrink: 0 }}>
                      {formatTime(ts)}
                    </span>
                    <div style={{ flex: 1, fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cfg?.label(r) ?? r.type}
                    </div>
                    <button
                      onClick={() => { if (confirm('Remover?')) { deleteRecord(r.id); showToast('Removido!', 'success') } }}
                      style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--lilac-100)', fontSize: '0.8rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >✕</button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ))}

      {paginated.length < allRecords.length && (
        <button onClick={() => setPage(p => p + 1)} className="btn btn-outline" style={{ width: '100%' }}>
          Carregar mais ({allRecords.length - paginated.length} restantes)
        </button>
      )}
    </div>
  )
}
