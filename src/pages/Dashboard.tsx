import { useBabyContext } from '../context/BabyContext'
import { useRecords, getBabyRecords, type FeedingRecord, type DiaperRecord, type SleepRecord, type ActivityRecord, type GrowthRecord, type VaccineRecord, type AppointmentRecord } from '../context/RecordsContext'
import { calculateAge, isToday, calcDuration } from '../utils/time'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useNavigate } from 'react-router-dom'
import PhotoAvatar from '../components/ui/PhotoAvatar'

export default function Dashboard() {
  const { selectedBaby, state } = useBabyContext()
  const { records } = useRecords()
  const navigate = useNavigate()

  if (state.babies.length === 0) {
    return (
      <div className="container" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <span style={{ fontSize: 60, marginBottom: 16 }}>👶</span>
        <h1 className="page-title" style={{ marginBottom: 8 }}>Bem-vindo!</h1>
        <p className="text-muted" style={{ marginBottom: 24 }}>
          Adicione seu primeiro bebê para começar a acompanhar
        </p>
      </div>
    )
  }

  if (!selectedBaby) {
    return (
      <div className="container" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <p className="text-muted">Selecione um bebê no menu superior</p>
      </div>
    )
  }

  const feedingRecords = getBabyRecords<FeedingRecord>(records, selectedBaby.id, 'feeding').filter(r => isToday(r.timestamp))
  const diaperRecords = getBabyRecords<DiaperRecord>(records, selectedBaby.id, 'diaper').filter(r => isToday(r.timestamp))
  const sleepRecords = getBabyRecords<SleepRecord>(records, selectedBaby.id, 'sleep').filter(r => isToday(r.startTime))
  const activityRecords = getBabyRecords<ActivityRecord>(records, selectedBaby.id, 'activity').filter(r => isToday(r.timestamp))
  const growthRecords = getBabyRecords<GrowthRecord>(records, selectedBaby.id, 'growth')
  const vaccineRecords = getBabyRecords<VaccineRecord>(records, selectedBaby.id, 'vaccine')
  const pendingVaccines = vaccineRecords.filter(v => v.status !== 'taken').length
  const appointmentRecords = getBabyRecords<AppointmentRecord>(records, selectedBaby.id, 'appointment')
  const upcomingAppointments = appointmentRecords.filter(r => new Date(r.appointmentDate) >= new Date()).length

  const completedSleep = sleepRecords.filter(r => r.endTime)
  const sleepMinutes = completedSleep.reduce((acc, r) => acc + calcDuration(r.startTime, r.endTime), 0)
  const activeSleep = sleepRecords.find(r => !r.endTime)
  const activeSleepMinutes = activeSleep ? calcDuration(activeSleep.startTime) : 0

  const chartData = [
    { label: '🥛', value: feedingRecords.length, name: 'Mamadas' },
    { label: '👶', value: diaperRecords.length, name: 'Fraldas' },
    { label: '😴', value: Math.round((sleepMinutes + activeSleepMinutes) / 60), name: 'Sono (h)' },
    { label: '🧸', value: activityRecords.length, name: 'Atividades' },
  ]

  return (
    <div className="container">
      <button className="card" onClick={() => navigate('/babies')} style={{
        display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', textAlign: 'left', width: '100%',
      }}>
        <PhotoAvatar photo={selectedBaby.photo} size={56} name={selectedBaby.name} />
        <div style={{ flex: 1 }}>
          <h1 className="page-title">{selectedBaby.name}</h1>
          <p className="text-muted">{calculateAge(selectedBaby.birthDate)}</p>
        </div>
        <span style={{ fontSize: '1.2rem', color: 'var(--lilac-300)' }}>›</span>
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        <DashboardCard icon="🥛" label="Mamadas" value={feedingRecords.length} onClick={() => navigate('/feed')} />
        <DashboardCard icon="👶" label="Fraldas" value={diaperRecords.length} onClick={() => navigate('/diaper')} />
        <DashboardCard icon="😴" label="Sono" value={`${Math.round((sleepMinutes + activeSleepMinutes) / 60)}h`} onClick={() => navigate('/sleep')} />
        <DashboardCard icon="🧸" label="Atividades" value={activityRecords.length} onClick={() => navigate('/activities')} />
      </div>

      <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        <button onClick={() => navigate('/growth')} className="btn btn-outline" style={{ flexDirection: 'column', gap: 2, padding: 12 }}>
          <span style={{ fontSize: '1.3rem' }}>📈</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Crescimento</span>
          <span className="text-muted" style={{ fontSize: '0.7rem' }}>{growthRecords.length} medições</span>
        </button>
        <button onClick={() => navigate('/health')} className="btn btn-outline" style={{ flexDirection: 'column', gap: 2, padding: 12 }}>
          <span style={{ fontSize: '1.3rem' }}>💉</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Saúde</span>
          <span className="text-muted" style={{ fontSize: '0.7rem' }}>{pendingVaccines} vacinas pendentes</span>
        </button>
        <button onClick={() => navigate('/reports')} className="btn btn-outline" style={{ flexDirection: 'column', gap: 2, padding: 12 }}>
          <span style={{ fontSize: '1.3rem' }}>📊</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Relatórios</span>
          <span className="text-muted" style={{ fontSize: '0.7rem' }}>Exportar dados</span>
        </button>
        <button onClick={() => navigate('/appointments')} className="btn btn-outline" style={{ flexDirection: 'column', gap: 2, padding: 12 }}>
          <span style={{ fontSize: '1.3rem' }}>🏥</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Consultas</span>
          <span className="text-muted" style={{ fontSize: '0.7rem' }}>{upcomingAppointments} próximas</span>
        </button>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '0.95rem', color: 'var(--lilac-900)', marginBottom: 12 }}>
          Resumo do Dia
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <XAxis dataKey="label" />
            <YAxis allowDecimals={false} />
            <Tooltip formatter={(value: number, _name: string, entry: { payload?: { name: string } }) => [value, entry.payload?.name ?? '']} />
            <Bar dataKey="value" fill="#C39BD3" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function DashboardCard({ icon, label, value, onClick }: {
  icon: string
  label: string
  value: number | string
  onClick: () => void
}) {
  return (
    <button className="card" onClick={onClick} style={{
      textAlign: 'center', padding: 16, cursor: 'pointer',
      transition: 'transform 0.15s',
    }}>
      <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </button>
  )
}
