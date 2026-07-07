import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useBabyContext } from '../context/BabyContext'
import { useRecords } from '../context/RecordsContext'
import { useSync } from '../context/useSync'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { isSoundEnabled, toggleSound } from '../utils/sounds'
import { version } from '../../package.json'

interface PendingInvite {
  id: string
  baby_id: string
  baby_name?: string
  invited_by: string
  status: string
  created_at: string
}

export default function Profile() {
  const { user, signOut } = useAuth()
  const { state } = useBabyContext()
  const { records } = useRecords()
  const { pushToCloud, pullFromCloud, isConfigured, lastSync } = useSync()
  const navigate = useNavigate()
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState('')
  const [caregiverEmail, setCaregiverEmail] = useState('')
  const [soundOn, setSoundOn] = useState(isSoundEnabled())
  const [invites, setInvites] = useState<PendingInvite[]>([])

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  useEffect(() => {
    if (!supabase || !user) return
    loadPendingInvites()
  }, [user])

  const loadPendingInvites = async () => {
    if (!supabase || !user) return
    try {
      const { data } = await supabase
        .from('pending_invites')
        .select('*, babies(name)')
        .eq('invited_email', user.email)
        .eq('status', 'pending')

      if (data) {
        setInvites(data.map((i: Record<string, unknown>) => ({
          id: i.id as string,
          baby_id: i.baby_id as string,
          baby_name: (i.babies as { name?: string } | null)?.name ?? 'Bebê',
          invited_by: i.invited_by as string,
          status: i.status as string,
          created_at: i.created_at as string,
        })))
      }
    } catch { /* ignore */ }
  }

  const sendInvite = async () => {
    if (!supabase || !caregiverEmail.trim()) return
    if (state.babies.length === 0) {
      setSyncResult('❌ Nenhum bebê para compartilhar')
      return
    }

    setSyncing(true)
    setSyncResult('')

    try {
      const { error } = await supabase.from('pending_invites').insert(
        state.babies.map(b => ({
          baby_id: b.id,
          invited_email: caregiverEmail.trim(),
          invited_by: user!.id,
        }))
      )
      if (error) throw error
      setSyncResult(`✅ Convite enviado para ${caregiverEmail.trim()}!`)
      setCaregiverEmail('')
    } catch (err) {
      setSyncResult(`❌ Erro: ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
    } finally {
      setSyncing(false)
    }
  }

  const acceptInvite = async (invite: PendingInvite) => {
    if (!supabase) return
    try {
      const { error } = await supabase.rpc('accept_invite', {
        invite_id: invite.id,
        user_id: user!.id,
      })

      if (error) throw error

      loadPendingInvites()
      await pullFromCloud()
      setSyncResult(`✅ Agora você é cuidador de ${invite.baby_name}!`)
    } catch (err) {
      setSyncResult(`❌ Erro: ${err instanceof Error ? err.message : 'Erro'}`)
    }
  }

  const declineInvite = async (id: string) => {
    if (!supabase) return
    await supabase.from('pending_invites').update({ status: 'declined' }).eq('id', id)
    loadPendingInvites()
  }

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

  return (
    <div className="container" style={{ maxWidth: 400, margin: '0 auto' }}>
      <h1 className="page-title" style={{ marginBottom: 8 }}>👤 Perfil</h1>
      <p className="text-muted" style={{ marginBottom: 20 }}>{user.email}</p>

      {/* Pending invites */}
      {invites.length > 0 && (
        <div className="card" style={{ marginBottom: 16, border: '2px solid var(--lilac-500)' }}>
          <p style={{ fontWeight: 600, color: 'var(--lilac-900)', marginBottom: 8 }}>
            📨 Convites pendentes
          </p>
          {invites.map(inv => (
            <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: '1.3rem' }}>👶</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{inv.baby_name}</div>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                  Convidado em {new Date(inv.created_at).toLocaleDateString(undefined)}
                </div>
              </div>
              <button onClick={() => acceptInvite(inv)} className="btn btn-primary btn-sm">✅ Aceitar</button>
              <button onClick={() => declineInvite(inv.id)} className="btn btn-outline btn-sm">✕</button>
            </div>
          ))}
        </div>
      )}

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
          Adicione outro cuidador para acompanhar o bebê em tempo real. A pessoa precisa ter uma conta no app.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="email" placeholder="Email do cuidador"
            value={caregiverEmail} onChange={e => setCaregiverEmail(e.target.value)}
            style={{ flex: 1, padding: '10px 14px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)', fontSize: '0.9rem' }}
          />
          <button onClick={sendInvite} disabled={syncing || !caregiverEmail.trim()} className="btn btn-primary btn-sm">
            Convidar
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <p style={{ fontWeight: 600, color: 'var(--lilac-900)', marginBottom: 12 }}>
          🔊 Som
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>
            Sons ao registrar (fralda, sono, etc.)
          </span>
          <button
            onClick={() => { const v = !soundOn; setSoundOn(v); toggleSound(v) }}
            style={{
              width: 52, height: 28, borderRadius: 14,
              background: soundOn ? 'var(--lilac-500)' : 'var(--lilac-100)',
              border: 'none', cursor: 'pointer', position: 'relative',
              transition: 'background 0.2s',
            }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: 'white', position: 'absolute', top: 3,
              left: soundOn ? 27 : 3, transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <p style={{ fontWeight: 600, color: 'var(--lilac-900)', marginBottom: 8 }}>
          🔄 Atualização (iOS)
        </p>
        <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 8, lineHeight: 1.5 }}>
          No iPhone/iPad, o PWA não atualiza automaticamente. Para forçar a atualização:
        </p>
        <ol className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 12, paddingLeft: 20, lineHeight: 1.8 }}>
          <li>Abra o <strong>Safari</strong> e acesse o app</li>
          <li>Espere carregar completamente</li>
          <li>Feche o Safari (remova do multitarefa)</li>
          <li>Abra o app pela <strong>Tela Inicial</strong></li>
        </ol>
        <button onClick={() => window.location.reload()} className="btn btn-outline btn-sm" style={{ width: '100%' }}>
          🔄 Verificar atualização
        </button>
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
          <p>🕐 Última sincronia: {lastSync ? new Date(lastSync).toLocaleString(undefined) : 'Nunca'}</p>
          <p>📦 Versão: {version}</p>
        </div>
      </div>

      <button onClick={() => { signOut(); navigate('/') }} className="btn btn-outline" style={{ width: '100%', marginTop: 16 }}>
        🚪 Sair da Conta
      </button>
    </div>
  )
}
