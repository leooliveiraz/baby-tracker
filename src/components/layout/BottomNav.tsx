import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: 'Início', icon: '🏠' },
  { to: '/feed', label: 'Mamadas', icon: '🥛' },
  { to: '/diaper', label: 'Fraldas', icon: '👶' },
  { to: '/sleep', label: 'Sono', icon: '😴' },
  { to: '/activities', label: 'Atividades', icon: '🧸' },
]

const linkStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 1,
  padding: '4px 0',
  fontSize: '0.65rem',
  fontWeight: 600,
  color: 'var(--text-muted)',
  transition: 'color 0.2s',
  flex: 1,
}

const activeStyle: React.CSSProperties = {
  ...linkStyle,
  color: 'var(--lilac-500)',
}

const iconStyle: React.CSSProperties = {
  fontSize: '1.2rem',
  lineHeight: 1,
}

export default function BottomNav() {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      padding: '4px 0',
      paddingBottom: 'max(4px, env(safe-area-inset-bottom))',
      zIndex: 100,
      boxShadow: '0 -2px 8px rgba(155, 89, 182, 0.08)',
    }}>
      {items.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          style={({ isActive }) => isActive ? activeStyle : linkStyle}
        >
          <span style={iconStyle}>{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
