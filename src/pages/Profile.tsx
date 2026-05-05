import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useBabyContext } from '../context/BabyContext'
import { useRecords } from '../context/RecordsContext'
import { useSync } from '../context/useSync'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const { user, signOut } = useAuth()
  const { state } = useBabyContext()
  const { records } = useRecords()
  const { pushToCloud, pullFromCloud, isConfigured } = useSync()
  const navigate = useNavigate()
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState('')
  const [caregiverEmail, setCaregiverEmail] = useState('')

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  if (!user) return null

  const syncPush = async () => {
    setSyncing(true)
    setSyncResult('')
    try {
      const result = await pushToCloud(user)
      setSyncResult(`✅ ${result.babies} bebês e ${result.records} registros enviados!`)
    } catch (err) {
      setSyncResult(`❌ Erro: ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
    } finally {
      setSyncing(false)
    }
  }

  const syncPull = async () => {
    setSyncing(true)
    setSyncResult('')
    try {
      const result = await pullFromCloud()
      setSyncResult(`✅ ${result.babies} bebês e ${result.records} registros baixados!`)
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
          ☁️ Sincronização
        </p>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 12 }}>
          Dados são sincronizados automaticamente ao logar. Use os botões para forçar manualmente.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={syncPush} disabled={syncing} className="btn btn-primary" style={{ flex: 1 }}>
            {syncing ? '🔄' : '📤'} Enviar
          </button>
          <button onClick={syncPull} disabled={syncing} className="btn btn-outline" style={{ flex: 1 }}>
            {syncing ? '🔄' : '📥'} Baixar
          </button>
        </div>
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
          <p>🔗 Supabase: {isConfigured ? 'Conectado' : 'Não configurado'}</p>
          <p>🔄 Sync automática: {user ? 'Ativa' : 'Inativa'}</p>
        </div>
      </div>

      <button onClick={() => { signOut(); navigate('/') }} className="btn btn-outline" style={{ width: '100%', marginTop: 16 }}>
        🚪 Sair da Conta
      </button>
    </div>
  )
}
