import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const { signUp, signIn, signOut, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [success, setSuccess] = useState('')

  if (user) {
    return (
      <div className="container" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: 40 }}>
        <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>👤</span>
        <h2 className="page-title" style={{ marginBottom: 8 }}>{user.email}</h2>
        <p className="text-muted" style={{ marginBottom: 24 }}>Conta conectada ao Supabase</p>
        <button onClick={() => { signOut(); navigate('/') }} className="btn btn-outline">
          Sair da conta
        </button>
        <button onClick={() => navigate('/profile')} className="btn btn-primary" style={{ marginLeft: 8 }}>
          Gerenciar Sincronia
        </button>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const fn = mode === 'login' ? signIn : signUp
    const { error } = await fn(email, password)
    if (error) {
      setError(error.message)
    } else if (mode === 'signup') {
      setSuccess('Conta criada! Verifique seu email para confirmar.')
    }
  }

  return (
    <div className="container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: 360, padding: 24 }}>
        <h2 className="page-title" style={{ textAlign: 'center', marginBottom: 20 }}>
          {mode === 'login' ? '🔐 Entrar' : '📝 Criar Conta'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)', fontSize: '1rem' }}
              required autoFocus
            />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Senha</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)', fontSize: '1rem' }}
              required minLength={6}
            />
          </div>

          {error && <p style={{ color: '#E74C3C', fontSize: '0.85rem' }}>{error}</p>}
          {success && <p style={{ color: '#2ECC71', fontSize: '0.85rem' }}>{success}</p>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            {mode === 'login' ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {mode === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            style={{ color: 'var(--lilac-500)', fontWeight: 600, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            {mode === 'login' ? 'Criar' : 'Entrar'}
          </button>
        </p>
      </div>
    </div>
  )
}
