import { useState } from 'react'

const STORAGE_KEY = 'baby-tracker-disclaimer'

export function isDisclaimerAccepted(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === 'accepted' } catch { return false }
}

export function acceptDisclaimer() {
  try { localStorage.setItem(STORAGE_KEY, 'accepted') } catch { /* ignore */ }
}

export default function DisclaimerModal() {
  const [open, setOpen] = useState(!isDisclaimerAccepted())

  const handleAccept = () => {
    acceptDisclaimer()
    setOpen(false)
  }

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        className="card"
        style={{
          width: '100%', maxWidth: 400,
          display: 'flex', flexDirection: 'column', gap: 16,
          padding: 24,
        }}
      >
        <span style={{ fontSize: '2.5rem', textAlign: 'center' }}>👶</span>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--lilac-900)', textAlign: 'center' }}>
          Baby Tracker
        </h2>

        <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text)' }}>
          <p style={{ marginBottom: 12 }}>
            Este aplicativo foi desenvolvido para <strong>auxiliar</strong> no acompanhamento
            do crescimento e da rotina do seu bebê, servindo como ferramenta de registro
            e organização de informações.
          </p>
          <p style={{ marginBottom: 12, fontWeight: 600, color: 'var(--danger)' }}>
            ⚠️ Ele <strong>não substitui</strong> consultas médicas, orientação profissional
            ou qualquer autoridade de saúde.
          </p>
          <p>
            Sempre consulte um pediatra ou profissional de saúde qualificado para avaliações,
            diagnósticos ou decisões sobre a saúde do seu bebê.
          </p>
        </div>

        <button onClick={handleAccept} className="btn btn-primary" style={{ width: '100%' }}>
          ✅ Entendi, continuar
        </button>
      </div>
    </div>
  )
}
