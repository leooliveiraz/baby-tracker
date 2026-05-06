import { useState } from 'react'
import { useBabyContext } from '../context/BabyContext'
import { useRecords, getBabyRecords, type VaccineRecord, type MedicationRecord, type FeverRecord } from '../context/RecordsContext'
import { formatDate, formatTime } from '../utils/time'
import { useToast } from '../context/ToastContext'

type Tab = 'vaccines' | 'medications' | 'fever'

const vaccineSchedule: { name: string; doses: { label: string; age: string }[] }[] = [
  { name: 'BCG', doses: [{ label: 'Única', age: 'Ao nascer' }] },
  { name: 'Hepatite B', doses: [{ label: '1ª dose', age: 'Ao nascer' }, { label: '2ª dose', age: '1 mês' }, { label: '3ª dose', age: '6 meses' }] },
  { name: 'Pentavalente', doses: [{ label: '1ª dose', age: '2 meses' }, { label: '2ª dose', age: '4 meses' }, { label: '3ª dose', age: '6 meses' }] },
  { name: 'VIP', doses: [{ label: '1ª dose', age: '2 meses' }, { label: '2ª dose', age: '4 meses' }, { label: '3ª dose', age: '6 meses' }, { label: 'Reforço', age: '15 meses' }] },
  { name: 'VORH', doses: [{ label: '1ª dose', age: '2 meses' }, { label: '2ª dose', age: '4 meses' }] },
  { name: 'Pneumocócica 10', doses: [{ label: '1ª dose', age: '2 meses' }, { label: '2ª dose', age: '4 meses' }, { label: 'Reforço', age: '12 meses' }] },
  { name: 'Meningocócica C', doses: [{ label: '1ª dose', age: '3 meses' }, { label: '2ª dose', age: '5 meses' }, { label: 'Reforço', age: '12 meses' }] },
  { name: 'Febre Amarela', doses: [{ label: 'Única', age: '9 meses' }] },
  { name: 'Tríplice Viral', doses: [{ label: '1ª dose', age: '12 meses' }, { label: '2ª dose', age: '15 meses' }] },
  { name: 'Hepatite A', doses: [{ label: 'Única', age: '15 meses' }] },
  { name: 'Varicela', doses: [{ label: 'Única', age: '15 meses' }] },
  { name: 'DTP', doses: [{ label: '1º reforço', age: '15 meses' }, { label: '2º reforço', age: '4 anos' }] },
]

export default function Health() {
  const { selectedBaby, state } = useBabyContext()
  const { records, addRecord, deleteRecord } = useRecords()
  const { showToast } = useToast()
  const [tab, setTab] = useState<Tab>('vaccines')

  const [medName, setMedName] = useState('')
  const [medDose, setMedDose] = useState('')
  const [medTime, setMedTime] = useState(new Date().toISOString().slice(0, 16))

  const [feverTemp, setFeverTemp] = useState('')
  const [feverTime, setFeverTime] = useState(new Date().toISOString().slice(0, 16))

  const [notifPermission, setNotifPermission] = useState<NotificationPermission | null>(null)

  if (state.babies.length === 0 || !selectedBaby) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: 40 }}>
        <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>💉</span>
        <p className="text-muted">Cadastre e selecione um bebê para registrar saúde</p>
      </div>
    )
  }

  const vaccineRecords = getBabyRecords<VaccineRecord>(records, selectedBaby.id, 'vaccine')
  const medicationRecords = getBabyRecords<MedicationRecord>(records, selectedBaby.id, 'medication').sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
  const feverRecords = getBabyRecords<FeverRecord>(records, selectedBaby.id, 'fever').sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  const isVaccineTaken = (vaccineName: string, doseLabel: string) =>
    vaccineRecords.some(v => v.vaccineName === vaccineName && v.dose === doseLabel && v.status === 'taken')

  const markVaccine = (vaccineName: string, doseLabel: string, date: string, status: VaccineRecord['status']) => {
    const record: VaccineRecord = {
      id: crypto.randomUUID(),
      babyId: selectedBaby.id,
      type: 'vaccine',
      vaccineName,
      dose: doseLabel,
      date,
      status,
    }
    addRecord(record)
    showToast(`💉 ${vaccineName} - ${doseLabel} registrada!`, 'success')
  }

  const addMedication = () => {
    if (!medName || !medDose) return
    const record: MedicationRecord = {
      id: crypto.randomUUID(),
      babyId: selectedBaby.id,
      type: 'medication',
      medicationName: medName,
      dose: medDose,
      timestamp: new Date(medTime).toISOString(),
    }
    addRecord(record)
    showToast('💊 Medicamento registrado!', 'success')
    setMedName('')
    setMedDose('')
  }

  const addFever = () => {
    if (!feverTemp) return
    const record: FeverRecord = {
      id: crypto.randomUUID(),
      babyId: selectedBaby.id,
      type: 'fever',
      timestamp: new Date(feverTime).toISOString(),
      temperature: Number(feverTemp),
    }
    addRecord(record)
    showToast(`🌡 ${feverTemp}°C registrado!`, 'success')
    setFeverTemp('')
  }

  const requestNotif = async () => {
    const perm = await Notification.requestPermission()
    setNotifPermission(perm)
    if (perm === 'granted') {
      new Notification('Baby Tracker', {
        body: 'Notificações ativadas! Você receberá lembretes de vacinas.',
        icon: '/pwa-192x192.png',
      })
    }
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">💉 Saúde</h1>
        {notifPermission === null && Notification.permission === 'default' && (
          <button onClick={requestNotif} className="btn btn-outline btn-sm">
            🔔 Ativar Lembretes
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 4 }}>
        {(['vaccines', 'medications', 'fever'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`btn ${tab === t ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1, padding: '6px 8px', fontSize: '0.8rem' }}
          >
            {t === 'vaccines' ? '💉 Vacinas' : t === 'medications' ? '💊 Medicações' : '🌡 Febre'}
          </button>
        ))}
      </div>

      {tab === 'vaccines' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p className="text-muted" style={{ fontWeight: 600 }}>Calendário de Vacinação</p>
          {vaccineSchedule.map(v => (
            <div key={v.name} className="card" style={{ padding: 12 }}>
              <p style={{ fontWeight: 700, color: 'var(--lilac-900)', marginBottom: 8 }}>{v.name}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {v.doses.map(d => {
                  const taken = isVaccineTaken(v.name, d.label)
                  const today = new Date().toISOString().split('T')[0]
                  return (
                    <div key={d.label} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      opacity: taken ? 0.6 : 1,
                    }}>
                      <span style={{ fontSize: taken ? '✅ ' : '⬜ ', minWidth: 24 }}>{taken ? '✅' : '⬜'}</span>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{d.label}</span>
                        <span className="text-muted" style={{ fontSize: '0.8rem', marginLeft: 8 }}>{d.age}</span>
                      </div>
                      {!taken && (
                        <button
                          onClick={() => markVaccine(v.name, d.label, today, 'taken')}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        >
                          Tomar
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'medications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text" placeholder="Medicamento"
                value={medName} onChange={e => setMedName(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)' }}
              />
              <input
                type="text" placeholder="Dose"
                value={medDose} onChange={e => setMedDose(e.target.value)}
                style={{ width: 100, padding: '8px 12px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="datetime-local"
                value={medTime} onChange={e => setMedTime(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)' }}
              />
              <button onClick={addMedication} className="btn btn-primary btn-sm">Salvar</button>
            </div>
          </div>

          <p className="text-muted" style={{ fontWeight: 600 }}>Histórico ({medicationRecords.length})</p>
          {medicationRecords.length === 0 && (
            <p className="text-muted" style={{ textAlign: 'center', padding: 24 }}>Nenhum medicamento registrado</p>
          )}
          {medicationRecords.map(r => (
            <div key={r.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.3rem' }}>💊</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{r.medicationName} - {r.dose}</div>
                <div className="text-muted">{formatDate(r.timestamp)} às {formatTime(r.timestamp)}</div>
              </div>
              <button onClick={() => { if (confirm('Remover?')) { deleteRecord(r.id); showToast('Removido!', 'success') } }}
                style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--lilac-100)', fontSize: '0.9rem' }}
              >✕</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'fever' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="card" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '1.5rem' }}>🌡</span>
            <input
              type="number" step="0.1" placeholder="Temperatura (°C)"
              value={feverTemp} onChange={e => setFeverTemp(e.target.value)}
              style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)' }}
            />
            <input type="datetime-local" value={feverTime} onChange={e => setFeverTime(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)' }}
            />
            <button onClick={addFever} className="btn btn-primary btn-sm">Salvar</button>
          </div>

          <p className="text-muted" style={{ fontWeight: 600 }}>Histórico ({feverRecords.length})</p>
          {feverRecords.length === 0 && (
            <p className="text-muted" style={{ textAlign: 'center', padding: 24 }}>Nenhum registro de febre</p>
          )}
          {feverRecords.map(r => (
            <div key={r.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.3rem', color: r.temperature >= 38 ? '#E74C3C' : '#F39C12' }}>
                🌡
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>
                  {r.temperature}°C
                  <span className="text-muted" style={{ fontWeight: 400, marginLeft: 8 }}>
                    {r.temperature >= 39 ? 'Febre alta' : r.temperature >= 38 ? 'Febre' : 'Subfebril'}
                  </span>
                </div>
                <div className="text-muted">{formatDate(r.timestamp)} às {formatTime(r.timestamp)}</div>
              </div>
              <button onClick={() => { if (confirm('Remover?')) deleteRecord(r.id) }}
                style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--lilac-100)', fontSize: '0.9rem' }}
              >✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
