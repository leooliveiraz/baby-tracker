import { useState } from 'react'
import { useBabyContext } from '../context/BabyContext'
import { useReminders, type Reminder } from '../context/RemindersContext'
import { useToast } from '../context/ToastContext'

const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const reminderTypes = [
  { key: 'feeding' as const, icon: '🥛', label: 'Mamada' },
  { key: 'diaper' as const, icon: '👶', label: 'Fralda' },
  { key: 'vaccine' as const, icon: '💉', label: 'Vacina' },
  { key: 'custom' as const, icon: '🔔', label: 'Personalizado' },
]

export default function RemindersPage() {
  const { selectedBaby, state } = useBabyContext()
  const { reminders, addReminder, updateReminder, deleteReminder } = useReminders()
  const { showToast } = useToast()
  const [showForm, setShowForm] = useState(false)

  const [title, setTitle] = useState('')
  const [type, setType] = useState<Reminder['type']>('feeding')
  const [hour, setHour] = useState('08')
  const [minute, setMinute] = useState('00')
  const [days, setDays] = useState<number[]>([])

  if (state.babies.length === 0 || !selectedBaby) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: 40 }}>
        <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>🔔</span>
        <p className="text-muted">Cadastre e selecione um bebê para configurar lembretes</p>
      </div>
    )
  }

  const babyReminders = reminders.filter(r => r.babyId === selectedBaby.id)
    .sort((a, b) => a.hour * 60 + a.minute - b.hour * 60 - b.minute)

  const toggleDay = (d: number) => {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }

  const requestPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  const handleSubmit = () => {
    if (days.length === 0) { showToast('Selecione pelo menos um dia', 'error'); return }
    if (!title.trim() && type === 'custom') { showToast('Digite um título', 'error'); return }

    const r: Reminder = {
      id: crypto.randomUUID(),
      babyId: selectedBaby.id,
      type,
      title: type === 'custom' ? title.trim() : reminderTypes.find(t => t.key === type)?.label ?? title.trim(),
      hour: Number(hour),
      minute: Number(minute),
      days: [...days].sort(),
      active: true,
    }
    addReminder(r)
    requestPermission()
    showToast('🔔 Lembrete criado!', 'success')
    setShowForm(false)
    setDays([])
    setHour('08')
    setMinute('00')
    setTitle('')
  }

  const notificationGranted = 'Notification' in window && Notification.permission === 'granted'

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">🔔 Lembretes</h1>
        <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm">+ Novo</button>
      </div>

      {!notificationGranted && 'Notification' in window && Notification.permission !== 'denied' && (
        <div className="card" style={{ background: 'var(--lilac-100)', border: '2px solid var(--lilac-300)' }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}>🔕 Notificações desativadas</p>
          <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 8 }}>
            Ative as notificações para receber lembretes mesmo com o app fechado.
          </p>
          <button onClick={requestPermission} className="btn btn-primary btn-sm">🔔 Ativar</button>
        </div>
      )}

      {showForm && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontWeight: 600, color: 'var(--lilac-900)' }}>Novo Lembrete</p>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {reminderTypes.map(t => (
              <button key={t.key} onClick={() => setType(t.key)}
                className={`btn ${type === t.key ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {type === 'custom' && (
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título do lembrete"
              style={{ padding: '8px 12px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)', fontSize: '0.95rem' }} />
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Hora</label>
              <select value={hour} onChange={e => setHour(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)' }}>
                {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => (
                  <option key={h} value={h}>{h}h</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Minuto</label>
              <select value={minute} onChange={e => setMinute(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)' }}>
                {Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0')).map(m => (
                  <option key={m} value={m}>{m}min</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Dias</label>
            <div style={{ display: 'flex', gap: 4 }}>
              {dayLabels.map((label, i) => (
                <button key={i} onClick={() => toggleDay(i)}
                  className={`btn ${days.includes(i) ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '6px 8px', fontSize: '0.75rem', flex: 1 }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => setShowForm(false)} className="btn btn-outline btn-sm">Cancelar</button>
            <button onClick={handleSubmit} className="btn btn-primary btn-sm">Salvar</button>
          </div>
        </div>
      )}

      {babyReminders.length === 0 && !showForm && (
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <span style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>🔔</span>
          <p className="text-muted">Nenhum lembrete configurado</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {babyReminders.map(r => (
          <div key={r.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '1.3rem' }}>{reminderTypes.find(t => t.key === r.type)?.icon ?? '🔔'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{r.title}</div>
              <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                {String(r.hour).padStart(2, '0')}h{String(r.minute).padStart(2, '0')} · {r.days.map(d => dayLabels[d]).join(', ')}
              </div>
            </div>
            <button onClick={() => {
              updateReminder({ ...r, active: !r.active })
              showToast(r.active ? '🔕 Lembrete pausado' : '🔔 Lembrete ativado', 'info')
            }} style={{
              width: 36, height: 36, borderRadius: '50%',
              background: r.active ? 'var(--lilac-100)' : 'var(--surface)',
              border: '2px solid var(--lilac-300)',
              fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {r.active ? '🔔' : '🔕'}
            </button>
            <button onClick={() => { deleteReminder(r.id); showToast('🗑 Lembrete removido', 'success') }}
              style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--lilac-100)', fontSize: '0.9rem' }}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
