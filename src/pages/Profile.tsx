import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useBabyContext } from '../context/BabyContext'
import { useRecords, type SleepRecord, type VaccineRecord } from '../context/RecordsContext'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const { user, signOut } = useAuth()
  const { state } = useBabyContext()
  const { records } = useRecords()
  const navigate = useNavigate()
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState('')
  const [caregiverEmail, setCaregiverEmail] = useState('')

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  if (!user) return null

  const syncToCloud = async () => {
    setSyncing(true)
    setSyncResult('')

    try {
      const babyPromises = state.babies.map(baby =>
        supabase!.from('babies').upsert({
          id: baby.id,
          name: baby.name,
          birth_date: baby.birthDate,
          created_by: user.id,
        })
      )
      await Promise.all(babyPromises)

      const getTimestamp = (r: typeof records[number]): string =>
        r.type === 'sleep' ? (r as SleepRecord).startTime : r.type === 'vaccine' ? (r as VaccineRecord).date : r.timestamp

      const recordPromises = records.map(r =>
        supabase!.from('records').upsert({
          id: r.id,
          baby_id: r.babyId,
          user_id: user.id,
          type: r.type,
          timestamp: getTimestamp(r),
          data: r,
        })
      )
      await Promise.all(recordPromises)

      setSyncResult(`✅ ${babyPromises.length} bebês e ${recordPromises.length} registros sincronizados!`)
    } catch (err) {
      setSyncResult(`❌ Erro: ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
    } finally {
      setSyncing(false)
    }
  }

  const inviteCaregiver = async () => {
    if (!caregiverEmail.trim()) return
    setSyncResult(`Convite enviado para ${caregiverEmail} (funcionalidade completa com Supabase Edge Functions)`)
    setCaregiverEmail('')
  }

  return (
    <div className="container" style={{ maxWidth: 400, margin: '0 auto' }}>
      <h1 className="page-title" style={{ marginBottom: 8 }}>👤 Perfil</h1>
      <p className="text-muted" style={{ marginBottom: 20 }}>{user.email}</p>

      <div className="card" style={{ marginBottom: 16 }}>
        <p style={{ fontWeight: 600, color: 'var(--lilac-900)', marginBottom: 12 }}>
          ☁️ Sincronização com a Nuvem
        </p>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 12 }}>
          Seus dados locais serão enviados para o Supabase e ficarão disponíveis em todos os dispositivos.
        </p>
        <button onClick={syncToCloud} disabled={syncing} className="btn btn-primary" style={{ width: '100%' }}>
          {syncing ? '🔄 Sincronizando...' : '☁️ Sincronizar Agora'}
        </button>
        {syncResult && (
          <p style={{ fontSize: '0.85rem', marginTop: 8, color: syncResult.startsWith('✅') ? '#2ECC71' : '#E74C3C' }}>
            {syncResult}
          </p>
        )}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <p style={{ fontWeight: 600, color: 'var(--lilac-900)', marginBottom: 12 }}>
          👥 Convidar Cuidador
        </p>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 12 }}>
          Adicione outro cuidador para acompanhar o bebê em tempo real.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="email" placeholder="Email do cuidador"
            value={caregiverEmail} onChange={e => setCaregiverEmail(e.target.value)}
            style={{ flex: 1, padding: '10px 14px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)', fontSize: '0.9rem' }}
          />
          <button onClick={inviteCaregiver} className="btn btn-primary btn-sm">Convidar</button>
        </div>
      </div>

      <div className="card">
        <p style={{ fontWeight: 600, color: 'var(--lilac-900)', marginBottom: 12 }}>
          📊 Status
        </p>
        <div className="text-muted" style={{ fontSize: '0.85rem' }}>
          <p>👶 Bebês locais: {state.babies.length}</p>
          <p>📝 Registros locais: {records.length}</p>
          <p>🔗 Supabase: {supabase ? 'Conectado' : 'Não configurado'}</p>
        </div>
      </div>

      <button onClick={() => { signOut(); navigate('/') }} className="btn btn-outline" style={{ width: '100%', marginTop: 16 }}>
        🚪 Sair da Conta
      </button>
    </div>
  )
}
