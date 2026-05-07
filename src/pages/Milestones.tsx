import { useState, useEffect } from 'react'
import { useBabyContext } from '../context/BabyContext'
import { milestones, categoryConfig, getMilestonesForAge, getAgeGroupLabel, ageGroups, type MilestoneDef } from '../data/milestones'
import { calculateAge } from '../utils/time'

const STORAGE_PREFIX = 'baby-tracker-milestones'

function loadCompleted(babyId: string): Set<string> {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}-${babyId}`)
    if (raw) return new Set(JSON.parse(raw))
  } catch { /* ignore */ }
  return new Set()
}

function saveCompleted(babyId: string, ids: Set<string>) {
  try { localStorage.setItem(`${STORAGE_PREFIX}-${babyId}`, JSON.stringify([...ids])) } catch { /* ignore */ }
}

function monthsSinceBirth(birthDate: string): number {
  return Math.max(0, (Date.now() - new Date(birthDate).getTime()) / (30.44 * 86400000))
}

function MilestoneList({ title, items, completed, onToggle }: {
  title: string
  items: MilestoneDef[]
  completed: Set<string>
  onToggle: (id: string) => void
}) {
  if (items.length === 0) return null
  const done = items.filter(m => completed.has(m.id)).length
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 600, color: 'var(--lilac-900)', marginBottom: 8, fontSize: '0.95rem' }}>
        {title} — {done}/{items.length}
      </div>
      {items.sort((a, b) => a.category.localeCompare(b.category)).map(m => {
        const cfg = categoryConfig[m.category]
        const isDone = completed.has(m.id)
        return (
          <div
            key={m.id}
            onClick={() => onToggle(m.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
              borderRadius: 'var(--radius)', marginBottom: 4,
              background: isDone ? 'var(--lilac-100)' : 'var(--surface)',
              border: '1px solid var(--border)',
              cursor: 'pointer', transition: 'background 0.15s',
              opacity: isDone ? 0.7 : 1,
            }}
          >
            <span style={{ fontSize: '1.1rem', width: 24 }}>{isDone ? '✅' : '⬜'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', textDecoration: isDone ? 'line-through' : 'none' }}>
                {m.title}
              </div>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>{cfg?.icon} {cfg?.label}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function MilestonesPage() {
  const { selectedBaby, state } = useBabyContext()
  const [completed, setCompleted] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!selectedBaby) return
    setCompleted(loadCompleted(selectedBaby.id))
  }, [selectedBaby?.id])

  if (state.babies.length === 0 || !selectedBaby) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: 40 }}>
        <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>🌟</span>
        <p className="text-muted">Cadastre e selecione um bebê para ver os marcos</p>
      </div>
    )
  }

  const babyAgeMonths = monthsSinceBirth(selectedBaby.birthDate)
  const { current, previous, next } = getMilestonesForAge(babyAgeMonths)

  const allMilestones = milestones.filter(m => m.ageMonths <= Math.max(...ageGroups.map(g => g.months)))

  const toggle = (id: string) => {
    setCompleted(prev => {
      const ids = new Set(prev)
      if (ids.has(id)) ids.delete(id)
      else ids.add(id)
      saveCompleted(selectedBaby.id, ids)
      return ids
    })
  }

  const totalAll = allMilestones.length
  const doneAll = allMilestones.filter(m => completed.has(m.id)).length
  const pctAll = Math.round((doneAll / totalAll) * 100)

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">🌟 Marcos</h1>
        <span className="card" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
          {calculateAge(selectedBaby.birthDate)}
        </span>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontWeight: 600, color: 'var(--lilac-900)' }}>Progresso geral</span>
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>{doneAll}/{totalAll} ({pctAll}%)</span>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: 'var(--lilac-100)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pctAll}%`, background: 'var(--lilac-500)', borderRadius: 4, transition: 'width 0.3s' }} />
        </div>
      </div>

      <MilestoneList title={`🔄 ${getAgeGroupLabel(previous.length > 0 ? previous[0].ageMonths : 0)} (anterior)`} items={previous} completed={completed} onToggle={toggle} />
      <MilestoneList title={`📍 ${getAgeGroupLabel(current.length > 0 ? current[0].ageMonths : 0)} (atual)`} items={current} completed={completed} onToggle={toggle} />
      <MilestoneList title={`⏭ ${getAgeGroupLabel(next.length > 0 ? next[0].ageMonths : 0)} (próximo)`} items={next} completed={completed} onToggle={toggle} />

      {previous.length + current.length + next.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <span style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>🌟</span>
          <p className="text-muted">Nenhum marco disponível para esta idade</p>
        </div>
      )}
    </div>
  )
}
