import { useState, useEffect } from 'react'
import { useBabyContext } from '../context/BabyContext'
import { useRecords, getBabyRecords, type SleepRecord } from '../context/RecordsContext'
import { formatTime, formatDuration, calcDuration, isToday } from '../utils/time'

const locations = ['Berço', 'Cama', 'Carrinho', 'Colo', 'Sling', 'Outro']

export default function Sleep() {
  const { selectedBaby, state } = useBabyContext()
  const { records, addRecord, updateRecord, deleteRecord } = useRecords()
  const [showManual, setShowManual] = useState(false)
  const [manualStart, setManualStart] = useState('')
  const [manualEnd, setManualEnd] = useState('')
  const [now, setNow] = useState(Date.now())

  const babyRecords = selectedBaby
    ? getBabyRecords<SleepRecord>(records, selectedBaby.id, 'sleep')
    : []
  const todayRecords = babyRecords.filter(r => isToday(r.startTime)).sort((a, b) =>
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  )

  const activeSleep = todayRecords.find(r => !r.endTime)

  useEffect(() => {
    if (!activeSleep) return
    const interval = setInterval(() => setNow(Date.now()), 10000)
    return () => clearInterval(interval)
  }, [activeSleep])

  if (state.babies.length === 0 || !selectedBaby) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: 40 }}>
        <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>😴</span>
        <p className="text-muted">Cadastre e selecione um bebê para registrar o sono</p>
      </div>
    )
  }

  const startSleep = (location?: string) => {
    const record: SleepRecord = {
      id: crypto.randomUUID(),
      babyId: selectedBaby.id,
      type: 'sleep',
      startTime: new Date().toISOString(),
      location,
    }
    addRecord(record)
  }

  const stopSleep = () => {
    if (!activeSleep) return
    const duration = calcDuration(activeSleep.startTime)
    const quality = duration < 30 ? 2 : duration < 60 ? 3 : duration < 120 ? 4 : 5
    updateRecord({ ...activeSleep, endTime: new Date().toISOString(), quality })
  }

  const addManual = () => {
    if (!manualStart || !manualEnd) return
    const record: SleepRecord = {
      id: crypto.randomUUID(),
      babyId: selectedBaby.id,
      type: 'sleep',
      startTime: new Date(manualStart).toISOString(),
      endTime: new Date(manualEnd).toISOString(),
    }
    addRecord(record)
    setShowManual(false)
    setManualStart('')
    setManualEnd('')
  }

  const todaySleepMinutes = todayRecords
    .filter(r => r.endTime)
    .reduce((acc, r) => acc + calcDuration(r.startTime, r.endTime), 0)

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">😴 Sono</h1>
        <span className="card" style={{ padding: '8px 16px', fontSize: '0.9rem', fontWeight: 600 }}>
          Total: {formatDuration(todaySleepMinutes + (activeSleep ? calcDuration(activeSleep.startTime, new Date(now).toISOString()) : 0))}
        </span>
      </div>

      {activeSleep ? (
        <div className="card" style={{
          background: 'var(--lilac-100)', border: '2px solid var(--lilac-500)', textAlign: 'center',
        }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 4 }}>😴</span>
          <p style={{ fontWeight: 700, color: 'var(--lilac-700)', marginBottom: 4 }}>
            Dormindo{activeSleep.location ? ` (${activeSleep.location})` : ''}
          </p>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--lilac-900)' }}>
            {formatDuration(calcDuration(activeSleep.startTime, new Date(now).toISOString()))}
          </p>
          <p className="text-muted" style={{ marginBottom: 12 }}>
            Desde {formatTime(activeSleep.startTime)}
          </p>
          <button onClick={stopSleep} className="btn btn-primary">
            ⏹ Acordou!
          </button>
        </div>
      ) : (
        <> {!activeSleep && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => startSleep()} className="btn btn-primary" style={{ flex: 1 }}>
              😴 Iniciar Sono
            </button>
            <button onClick={() => setShowManual(true)} className="btn btn-outline" style={{ flex: 1 }}>
              📝 Registrar Manual
            </button>
          </div>
        )}

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {locations.map(loc => (
              <button
                key={loc}
                onClick={() => startSleep(loc)}
                className="btn btn-outline btn-sm"
              >
                {loc}
              </button>
            ))}
          </div>
        </>
      )}

      {showManual && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Início</label>
              <input type="datetime-local" value={manualStart} onChange={e => setManualStart(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)' }}
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Fim</label>
              <input type="datetime-local" value={manualEnd} onChange={e => setManualEnd(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => setShowManual(false)} className="btn btn-outline btn-sm">Cancelar</button>
            <button onClick={addManual} className="btn btn-primary btn-sm">Salvar</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p className="text-muted" style={{ fontWeight: 600 }}>Hoje ({todayRecords.length})</p>
        {todayRecords.length === 0 && (
          <p className="text-muted" style={{ textAlign: 'center', padding: 24 }}>
            Nenhum sono registrado hoje
          </p>
        )}
        {todayRecords.map(r => (
          <div key={r.id} className="card" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            opacity: !r.endTime ? 0.6 : 1,
          }}>
            <span style={{ fontSize: '1.5rem' }}>{!r.endTime ? '⏳' : '😴'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>
                {r.location ?? 'Sono'}
                {r.quality && ' · ' + '⭐'.repeat(r.quality)}
              </div>
              <div className="text-muted">
                {formatTime(r.startTime)}
                {r.endTime && ` → ${formatTime(r.endTime)}`}
                {r.endTime && ` · ${formatDuration(calcDuration(r.startTime, r.endTime))}`}
                {!r.endTime && ' · em andamento'}
              </div>
            </div>
            <button
              onClick={() => { if (confirm('Remover?')) deleteRecord(r.id) }}
              style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--lilac-100)', fontSize: '0.9rem' }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
