import { useState } from 'react'
import { useBabyContext } from '../context/BabyContext'
import { useRecords, getBabyRecords, type AppointmentRecord } from '../context/RecordsContext'
import { formatDate, formatTime } from '../utils/time'

const specialties = [
  'Pediatra', 'Neonatologista', 'Neurologista', 'Oftalmologista',
  'Ortopedista', 'Dermatologista', 'Alergologista', 'Nutricionista',
  'Fonoaudiólogo', 'Fisioterapeuta', 'Outro',
]

export default function Appointments() {
  const { selectedBaby, state } = useBabyContext()
  const { records, addRecord, deleteRecord } = useRecords()
  const [showForm, setShowForm] = useState(false)
  const [doctor, setDoctor] = useState('')
  const [specialty, setSpecialty] = useState('Pediatra')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [appointmentTime, setAppointmentTime] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')

  const babyRecords = selectedBaby
    ? getBabyRecords<AppointmentRecord>(records, selectedBaby.id, 'appointment')
    : []

  const sorted = [...babyRecords].sort((a, b) =>
    new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
  )

  const upcoming = sorted.filter(r => new Date(r.appointmentDate) >= new Date())
  const past = sorted.filter(r => new Date(r.appointmentDate) < new Date())

  if (state.babies.length === 0 || !selectedBaby) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: 40 }}>
        <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>🏥</span>
        <p className="text-muted">Cadastre e selecione um bebê para registrar consultas</p>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!doctor || !appointmentDate) return

    const dateTime = appointmentTime
      ? `${appointmentDate}T${appointmentTime}`
      : `${appointmentDate}T00:00`

    const record: AppointmentRecord = {
      id: crypto.randomUUID(),
      babyId: selectedBaby.id,
      type: 'appointment',
      timestamp: new Date().toISOString(),
      doctor: doctor.trim(),
      specialty,
      appointmentDate: new Date(dateTime).toISOString(),
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
    }
    addRecord(record)
    setDoctor('')
    setSpecialty('Pediatra')
    setAppointmentDate('')
    setAppointmentTime('')
    setLocation('')
    setNotes('')
    setShowForm(false)
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">🏥 Consultas</h1>
        <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm">
          + Nova
        </button>
      </div>

      {!showForm && sorted.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <span style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>🏥</span>
          <p className="text-muted">Nenhuma consulta registrada</p>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Médico</label>
              <input value={doctor} onChange={e => setDoctor(e.target.value)} placeholder="Nome do médico"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)' }} autoFocus />
            </div>
            <div style={{ width: 130 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Especialidade</label>
              <select value={specialty} onChange={e => setSpecialty(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)' }}>
                {specialties.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Data</label>
              <input type="date" value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)' }} />
            </div>
            <div style={{ width: 120 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Horário</label>
              <input type="time" value={appointmentTime} onChange={e => setAppointmentTime(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Local</label>
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Ex: Hospital São Lucas"
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Observações</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Motivo da consulta..."
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)', resize: 'none' }} />
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline btn-sm">Cancelar</button>
            <button type="submit" className="btn btn-primary btn-sm">Salvar</button>
          </div>
        </form>
      )}

      {upcoming.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p className="text-muted" style={{ fontWeight: 600 }}>🟢 Próximas ({upcoming.length})</p>
          {upcoming.map(r => (
            <AppointmentCard key={r.id} record={r} onDelete={deleteRecord} />
          ))}
        </div>
      )}

      {past.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p className="text-muted" style={{ fontWeight: 600 }}>⚪ Realizadas ({past.length})</p>
          {past.map(r => (
            <AppointmentCard key={r.id} record={r} onDelete={deleteRecord} />
          ))}
        </div>
      )}
    </div>
  )
}

function AppointmentCard({ record, onDelete }: { record: AppointmentRecord; onDelete: (id: string) => void }) {
  const isUpcoming = new Date(record.appointmentDate) >= new Date()
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: '1.3rem' }}>{isUpcoming ? '🟢' : '⚪'}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600 }}>{record.doctor}</div>
        <div className="text-muted" style={{ fontSize: '0.85rem' }}>
          {record.specialty}
          {record.location && ` · ${record.location}`}
        </div>
        <div className="text-muted" style={{ fontSize: '0.8rem' }}>
          {formatDate(record.appointmentDate)} às {formatTime(record.appointmentDate)}
        </div>
        {record.notes && (
          <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: 2, fontStyle: 'italic' }}>
            {record.notes}
          </div>
        )}
      </div>
      <button onClick={() => { if (confirm('Remover consulta?')) onDelete(record.id) }}
        style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--lilac-100)', fontSize: '0.9rem' }}
      >✕</button>
    </div>
  )
}
