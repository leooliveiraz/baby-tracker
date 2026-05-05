import { useBabyContext } from '../../context/BabyContext'

interface HeaderProps {
  onAddBaby: () => void
}

export default function Header({ onAddBaby }: HeaderProps) {
  const { state, selectBaby, selectedBaby } = useBabyContext()

  return (
    <header style={{
      background: 'var(--white)',
      borderBottom: '1px solid var(--lilac-100)',
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
            fontSize: '1.3rem',
            fontWeight: 700,
            boxShadow: 'var(--shadow)',
          }}
          aria-label="Adicionar bebê"
        >
          +
        </button>
      </div>
    </header>
  )
}
