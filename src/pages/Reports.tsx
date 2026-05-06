import { useState } from 'react'
import { useBabyContext } from '../context/BabyContext'
import { useRecords, type FeedingRecord, type DiaperRecord, type SleepRecord, type GrowthRecord, type VaccineRecord, type BabyRecord } from '../context/RecordsContext'
import { downloadPDF, exportCategoryCSV } from '../utils/export'
import { calcDuration } from '../utils/time'

function getDate(r: BabyRecord): string {
  switch (r.type) {
    case 'sleep': return r.startTime
    case 'vaccine': return r.date
    default: return r.timestamp
  }
}

const categories = [
  { key: 'feeding', icon: '🥛', label: 'Mamadas' },
  { key: 'diaper', icon: '👶', label: 'Fraldas' },
  { key: 'sleep', icon: '😴', label: 'Sono' },
  { key: 'growth', icon: '📈', label: 'Crescimento' },
  { key: 'health', icon: '💉', label: 'Saúde' },
]

export default function Reports() {
  const { selectedBaby, state } = useBabyContext()
  const { records } = useRecords()
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['feeding', 'diaper', 'sleep', 'growth', 'health'])
  const [range, setRange] = useState('7')
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 7)
    return d.toISOString().split('T')[0]
  })
  const [customEnd, setCustomEnd] = useState(() => new Date().toISOString().split('T')[0])

  if (state.babies.length === 0 || !selectedBaby) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: 40 }}>
        <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>📊</span>
        <p className="text-muted">Cadastre e selecione um bebê para gerar relatórios</p>
      </div>
    )
  }

  const toggleCategory = (key: string) => {
    setSelectedCategories(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  const getDateRange = () => {
    if (range === 'custom') return { start: new Date(customStart), end: new Date(customEnd + 'T23:59:59') }
    const end = new Date()
    const start = new Date()
    if (range === '7') start.setDate(end.getDate() - 7)
    else if (range === '30') start.setDate(end.getDate() - 30)
    else if (range === '90') start.setDate(end.getDate() - 90)
    return { start, end }
  }

  const { start, end } = getDateRange()
  const babyRecords = records.filter(r => r.babyId === selectedBaby.id)
  const filtered = babyRecords.filter(r => {
    const d = new Date(getDate(r))
    return d >= start && d <= end
  })

  const feedings = filtered.filter(r => r.type === 'feeding') as FeedingRecord[]
  const diapers = filtered.filter(r => r.type === 'diaper') as DiaperRecord[]
  const sleeps = filtered.filter(r => r.type === 'sleep') as SleepRecord[]
  const growths = filtered.filter(r => r.type === 'growth') as GrowthRecord[]
  const vaccines = filtered.filter(r => r.type === 'vaccine') as VaccineRecord[]

  const sleepMinutes = sleeps.reduce((a, s) => a + calcDuration(s.startTime, s.endTime), 0)
  const averageSleep = sleeps.length > 0 ? Math.round(sleepMinutes / sleeps.length) : 0

  const handlePDF = () => {
    downloadPDF(records, selectedBaby, getDateRange(), selectedCategories)
  }

  const handleCSVAll = () => {
    selectedCategories.forEach(cat => {
      exportCategoryCSV(records, selectedBaby.id, cat)
    })
  }

  return (
    <div className="container">
      <h1 className="page-title">📊 Relatórios</h1>

      <div className="card">
        <p style={{ fontWeight: 600, marginBottom: 8, color: 'var(--lilac-900)' }}>Período</p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { key: '7', label: '7 dias' },
            { key: '30', label: '30 dias' },
            { key: '90', label: '3 meses' },
            { key: 'custom', label: '📆 Custom' },
          ].map(r => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`btn ${range === r.key ? 'btn-primary' : 'btn-outline'}`}
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem', minWidth: 70 }}
            >
              {r.label}
            </button>
          ))}
        </div>
        {range === 'custom' && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>De</label>
              <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Até</label>
              <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)' }} />
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <p style={{ fontWeight: 600, marginBottom: 8, color: 'var(--lilac-900)' }}>Categorias</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {categories.map(c => (
            <button
              key={c.key}
              onClick={() => toggleCategory(c.key)}
              className={`btn ${selectedCategories.includes(c.key) ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '6px 14px', fontSize: '0.85rem' }}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <p style={{ fontWeight: 600, marginBottom: 12, color: 'var(--lilac-900)' }}>
          Resumo — {selectedBaby.name}
        </p>
        <p className="text-muted" style={{ marginBottom: 12 }}>
          {start.toLocaleDateString('pt-BR')} — {end.toLocaleDateString('pt-BR')}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          <SummaryCard icon="🥛" label="Mamadas" value={feedings.length} detail={`${feedings.filter(f => f.method === 'breast').length} peito · ${feedings.filter(f => f.method === 'bottle').length} mamadeira`} />
          <SummaryCard icon="👶" label="Fraldas" value={diapers.length} detail={`${diapers.filter(d => d.diaperType === 'wet' || d.diaperType === 'both').length}x xixi · ${diapers.filter(d => d.diaperType === 'dirty' || d.diaperType === 'both').length}x cocô`} />
          <SummaryCard icon="😴" label="Sono" value={`${sleeps.length}`} detail={`${Math.round(sleepMinutes / 60)}h total · ${averageSleep}min média`} />
          <SummaryCard icon="📈" label="Medições" value={growths.length} detail="" />
          <SummaryCard icon="💉" label="Vacinas" value={vaccines.length} detail={`${vaccines.filter(v => v.status === 'taken').length} tomadas`} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handlePDF} className="btn btn-primary" style={{ flex: 1 }}>
          📄 Exportar PDF
        </button>
        <button onClick={handleCSVAll} className="btn btn-outline" style={{ flex: 1 }}>
          📋 Exportar CSV
        </button>
      </div>

      {selectedCategories.includes('feeding') && feedings.length > 0 && (
        <SectionPreview icon="🥛" title="Mamadas" count={feedings.length}>
          {feedings.slice(0, 10).map(r => (
            <PreviewRow key={r.id} icon={r.method === 'breast' ? (r.side === 'left' ? '⬅' : '➡') : '🍼'}>
              {r.method === 'breast' ? `Peito ${r.side === 'left' ? 'Esquerdo' : 'Direito'}` : 'Mamadeira'}
              <span className="text-muted" style={{ marginLeft: 8, fontSize: '0.8rem' }}>
                {new Date(r.timestamp).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                {r.duration ? ` · ${r.duration}min` : ''}
                {r.volume ? ` · ${r.volume}ml` : ''}
              </span>
            </PreviewRow>
          ))}
          {feedings.length > 10 && <p className="text-muted" style={{ textAlign: 'center', padding: 8 }}>... e mais {feedings.length - 10} registros (veja o PDF completo)</p>}
        </SectionPreview>
      )}

      {selectedCategories.includes('diaper') && diapers.length > 0 && (
        <SectionPreview icon="👶" title="Fraldas" count={diapers.length}>
          {diapers.slice(0, 10).map(r => (
            <PreviewRow key={r.id} icon={r.diaperType === 'wet' ? '💦' : r.diaperType === 'dirty' ? '💩' : '💦💩'}>
              {r.diaperType === 'wet' ? 'Xixi' : r.diaperType === 'dirty' ? 'Cocô' : 'Ambos'}
              <span className="text-muted" style={{ marginLeft: 8, fontSize: '0.8rem' }}>
                {new Date(r.timestamp).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                {r.consistency ? ` · ${r.consistency}` : ''}
              </span>
            </PreviewRow>
          ))}
        </SectionPreview>
      )}

      {selectedCategories.includes('sleep') && sleeps.length > 0 && (
        <SectionPreview icon="😴" title="Sono" count={sleeps.length}>
          {sleeps.slice(0, 10).map(r => (
            <PreviewRow key={r.id} icon={r.endTime ? '😴' : '⏳'}>
              {new Date(r.startTime).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
              <span className="text-muted" style={{ marginLeft: 8, fontSize: '0.8rem' }}>
                {r.endTime ? `→ ${new Date(r.endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · ${calcDuration(r.startTime, r.endTime)}min` : 'em andamento'}
                {r.location ? ` · ${r.location}` : ''}
              </span>
            </PreviewRow>
          ))}
        </SectionPreview>
      )}
    </div>
  )
}

function SummaryCard({ icon, label, value, detail }: { icon: string; label: string; value: number | string; detail: string }) {
  return (
    <div className="card" style={{ padding: 12, textAlign: 'center' }}>
      <div style={{ fontSize: '1.2rem', marginBottom: 2 }}>{icon}</div>
      <div className="stat-value" style={{ fontSize: '1.2rem' }}>{value}</div>
      <div className="stat-label" style={{ fontSize: '0.75rem' }}>{label}</div>
      {detail && <div className="text-muted" style={{ fontSize: '0.65rem', marginTop: 2 }}>{detail}</div>}
    </div>
  )
}

function SectionPreview({ icon, title, count, children }: { icon: string; title: string; count: number; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: 12 }}>
      <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--lilac-900)', marginBottom: 8 }}>
        {icon} {title} ({count})
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {children}
      </div>
    </div>
  )
}

function PreviewRow({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
      <span>{icon}</span>
      <span>{children}</span>
    </div>
  )
}
