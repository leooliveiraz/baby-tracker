import { useState } from 'react'
import { useBabyContext } from '../context/BabyContext'
import { useRecords, getBabyRecords, type FeedingRecord, type DiaperRecord, type SleepRecord } from '../context/RecordsContext'
import { useToast } from '../context/ToastContext'
import { formatTime, calcDuration, isToday } from '../utils/time'
import { playDiaperSound, playFeedSound, playSleepSound, isSoundEnabled } from '../utils/sounds'
import { useNavigate } from 'react-router-dom'

export default function Babysitter() {
  const { selectedBaby, state } = useBabyContext()
  const { records, addRecord, updateRecord } = useRecords()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [note, setNote] = useState('')
  const [showNoteInput, setShowNoteInput] = useState(false)

  if (state.babies.length === 0 || !selectedBaby) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: 40 }}>
        <span style={{ fontSize: 60, display: 'block', marginBottom: 12 }}>👶</span>
        <h1 className="page-title">Modo Babá</h1>
        <p className="text-muted" style={{ marginBottom: 16 }}>
          Cadastre e selecione um bebê para usar o modo babá
        </p>
        <button onClick={() => navigate('/')} className="btn btn-primary">Ir para o Dashboard</button>
      </div>
    )
  }

  const feedingRecords = getBabyRecords<FeedingRecord>(records, selectedBaby.id, 'feeding').filter(r => isToday(r.timestamp))
  const diaperRecords = getBabyRecords<DiaperRecord>(records, selectedBaby.id, 'diaper').filter(r => isToday(r.timestamp))
  const sleepRecords = getBabyRecords<SleepRecord>(records, selectedBaby.id, 'sleep').filter(r => isToday(r.startTime))
  const activeSleep = sleepRecords.find(r => !r.endTime)

  const handleBreast = (side: 'left' | 'right') => {
    const record: FeedingRecord = {
      id: crypto.randomUUID(), babyId: selectedBaby.id, type: 'feeding',
      timestamp: new Date().toISOString(), method: 'breast', side,
    }
    addRecord(record)
    if (isSoundEnabled()) playFeedSound()
    showToast(`🥛 Peito ${side === 'left' ? 'Esquerdo' : 'Direito'}!`, 'success')
  }

  const handleBottle = () => {
    const record: FeedingRecord = {
      id: crypto.randomUUID(), babyId: selectedBaby.id, type: 'feeding',
      timestamp: new Date().toISOString(), method: 'bottle', volume: 120,
    }
    addRecord(record)
    if (isSoundEnabled()) playFeedSound()
    showToast('🍼 Mamadeira!', 'success')
  }

  const handleDiaper = (type: DiaperRecord['diaperType']) => {
    const record: DiaperRecord = {
      id: crypto.randomUUID(), babyId: selectedBaby.id, type: 'diaper',
      timestamp: new Date().toISOString(), diaperType: type,
    }
    addRecord(record)
    if (isSoundEnabled()) playDiaperSound()
    showToast(type === 'wet' ? '💦 Xixi!' : type === 'dirty' ? '💩 Cocô!' : 'Registrado!', 'success')
  }

  const handleSleep = () => {
    if (activeSleep) {
      const duration = calcDuration(activeSleep.startTime)
      updateRecord({ ...activeSleep, endTime: new Date().toISOString(), quality: duration < 30 ? 2 : duration < 60 ? 3 : 4 })
      if (isSoundEnabled()) playSleepSound()
      showToast(`😴 Acordou! (${duration}min)`, 'success')
    } else {
      const record: SleepRecord = {
        id: crypto.randomUUID(), babyId: selectedBaby.id, type: 'sleep',
        startTime: new Date().toISOString(),
      }
      addRecord(record)
      if (isSoundEnabled()) playSleepSound()
      showToast('😴 Dormiu!', 'success')
    }
  }

  const handleNote = () => {
    if (!note.trim()) return
    showToast(`📝 ${note}`, 'info')
    setNote('')
    setShowNoteInput(false)
  }

  const allToday = [...feedingRecords, ...diaperRecords, ...sleepRecords]
    .sort((a, b) => new Date(
      b.type === 'sleep' ? (b as SleepRecord).startTime : b.timestamp
    ).getTime() - new Date(
      a.type === 'sleep' ? (a as SleepRecord).startTime : a.timestamp
    ).getTime())
    .slice(0, 10)

  return (
    <div className="container" style={{ maxWidth: 450, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title" style={{ fontSize: '1.2rem' }}>👶 Modo Babá</h1>
        <button onClick={() => navigate('/')} className="btn btn-outline btn-sm">
          Sair
        </button>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '12px 16px', marginBottom: 0 }}>
        <span style={{ fontSize: '1.4rem' }}>{selectedBaby.name}</span>
        <span className="text-muted" style={{ fontSize: '0.85rem', marginLeft: 8 }}>
          {activeSleep ? '😴 Dormindo' : '🙂 Acordado'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        <button onClick={() => handleBreast('left')} className="card btn" style={{ flexDirection: 'column', gap: 6, padding: '20px 12px', fontSize: '1.1rem' }}>
          <span style={{ fontSize: '2rem' }}>⬅️</span>
          <span style={{ fontWeight: 700 }}>Peito E</span>
        </button>
        <button onClick={() => handleBreast('right')} className="card btn" style={{ flexDirection: 'column', gap: 6, padding: '20px 12px', fontSize: '1.1rem' }}>
          <span style={{ fontSize: '2rem' }}>➡️</span>
          <span style={{ fontWeight: 700 }}>Peito D</span>
        </button>
        <button onClick={handleBottle} className="card btn" style={{ flexDirection: 'column', gap: 6, padding: '20px 12px', fontSize: '1.1rem' }}>
          <span style={{ fontSize: '2rem' }}>🍼</span>
          <span style={{ fontWeight: 700 }}>Mamadeira</span>
        </button>
        <button onClick={handleSleep} className="card btn" style={{
          flexDirection: 'column', gap: 6, padding: '20px 12px', fontSize: '1.1rem',
          background: activeSleep ? 'var(--lilac-100)' : undefined,
          border: activeSleep ? '2px solid var(--lilac-500)' : undefined,
        }}>
          <span style={{ fontSize: '2rem' }}>{activeSleep ? '⏹' : '😴'}</span>
          <span style={{ fontWeight: 700 }}>{activeSleep ? 'Acordou' : 'Dormiu'}</span>
        </button>
        <button onClick={() => handleDiaper('wet')} className="card btn" style={{ flexDirection: 'column', gap: 6, padding: '20px 12px', fontSize: '1.1rem' }}>
          <span style={{ fontSize: '2rem' }}>💦</span>
          <span style={{ fontWeight: 700 }}>Xixi</span>
        </button>
        <button onClick={() => handleDiaper('dirty')} className="card btn" style={{ flexDirection: 'column', gap: 6, padding: '20px 12px', fontSize: '1.1rem' }}>
          <span style={{ fontSize: '2rem' }}>💩</span>
          <span style={{ fontWeight: 700 }}>Cocô</span>
        </button>
      </div>

      {showNoteInput ? (
        <div className="card" style={{ display: 'flex', gap: 8 }}>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="O que aconteceu?"
            style={{ flex: 1, padding: '10px 14px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)', fontSize: '1rem' }}
            autoFocus onKeyDown={e => e.key === 'Enter' && handleNote()} />
          <button onClick={handleNote} className="btn btn-primary btn-sm">OK</button>
          <button onClick={() => setShowNoteInput(false)} className="btn btn-outline btn-sm">✕</button>
        </div>
      ) : (
        <button onClick={() => setShowNoteInput(true)} className="btn btn-outline" style={{ width: '100%' }}>
          📝 Adicionar Nota
        </button>
      )}

      {allToday.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <p className="text-muted" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Hoje</p>
          {allToday.map(r => {
            const icon = r.type === 'feeding' ? (r as FeedingRecord).method === 'breast' ? ((r as FeedingRecord).side === 'left' ? '⬅' : '➡') : '🍼' : r.type === 'diaper' ? ((r as DiaperRecord).diaperType === 'wet' ? '💦' : '💩') : '😴'
            const ts = r.type === 'sleep' ? (r as SleepRecord).startTime : r.timestamp
            return (
              <div key={r.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px' }}>
                <span style={{ fontSize: '1rem' }}>{icon}</span>
                <span className="text-muted" style={{ fontSize: '0.75rem', minWidth: 40 }}>{formatTime(ts)}</span>
                <span style={{ flex: 1, fontSize: '0.85rem' }}>
                  {r.type === 'feeding' ? `Mamada` : r.type === 'diaper' ? `Fralda` : `Sono ${(r as SleepRecord).endTime ? `· ${calcDuration((r as SleepRecord).startTime, (r as SleepRecord).endTime)}min` : '· em andamento'}`}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
