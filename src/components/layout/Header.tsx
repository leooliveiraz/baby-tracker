import { useBabyContext } from '../../context/BabyContext'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  onAddBaby: () => void
}

export default function Header({ onAddBaby }: HeaderProps) {
  const { state, selectBaby, selectedBaby } = useBabyContext()
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <header style={{
      background: 'var(--header-bg)',
      borderBottom: '1px solid var(--border)',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '1.2rem' }}>🍼</span>
        <span style={{ fontWeight: 700, color: 'var(--lilac-900)', fontSize: '1.05rem' }}>
          Baby Tracker
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {state.babies.length > 0 && (
          <select
            value={selectedBaby?.id ?? ''}
            onChange={e => selectBaby(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius)',
              border: '2px solid var(--lilac-100)',
              background: 'var(--lilac-50)',
              color: 'var(--lilac-900)',
              fontWeight: 600,
              fontSize: '0.85rem',
              maxWidth: 140,
            }}
          >
            {state.babies.map(baby => (
              <option key={baby.id} value={baby.id}>{baby.name}</option>
            ))}
          </select>
        )}

        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={onAddBaby}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'var(--lilac-500)',
              color: 'var(--white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              fontWeight: 400,
              lineHeight: 1,
              border: '2px solid var(--lilac-500)',
              boxShadow: 'var(--shadow)',
            }}
            aria-label="Adicionar bebê"
          >
            ＋
          </button>

          <button
            onClick={toggleTheme}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'var(--select-bg)',
              border: '2px solid var(--lilac-300)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
            }}
            aria-label={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <button
            onClick={() => navigate(user ? '/profile' : '/login')}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: user ? 'var(--lilac-100)' : 'var(--surface)',
              border: '2px solid var(--lilac-300)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.95rem',
            }}
            aria-label={user ? 'Perfil' : 'Entrar'}
          >
            {user ? '👤' : '🔐'}
          </button>
        </div>
      </div>
    </header>
  )
}
