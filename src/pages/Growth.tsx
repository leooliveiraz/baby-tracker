import { useState } from 'react'
import { useBabyContext } from '../context/BabyContext'
import { useRecords, getBabyRecords, type GrowthRecord } from '../context/RecordsContext'
import { formatDate, calculateAge } from '../utils/time'
import { getOMSAtMonth, monthsBetween, formatAgeMonths } from '../data/oms'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, CartesianGrid, Legend,
} from 'recharts'

type Metric = 'weight' | 'height' | 'hc'

const metricConfig: Record<Metric, { label: string; unit: string; color: string; omsKey: 'weightP50' | 'heightP50' | 'hcP50'; p3Key: 'weightP3' | 'heightP3'; p97Key: 'weightP97' | 'heightP97' }> = {
  weight: { label: 'Peso', unit: 'kg', color: '#9B59B6', omsKey: 'weightP50', p3Key: 'weightP3', p97Key: 'weightP97' },
  height: { label: 'Altura', unit: 'cm', color: '#E67E22', omsKey: 'heightP50', p3Key: 'heightP3', p97Key: 'heightP97' },
  hc: { label: 'Perímetro Cefálico', unit: 'cm', color: '#2ECC71', omsKey: 'hcP50', p3Key: 'weightP3', p97Key: 'weightP97' },
}

export default function Growth() {
  const { selectedBaby, state } = useBabyContext()
  const { records, addRecord, deleteRecord } = useRecords()
  const [metric, setMetric] = useState<Metric>('weight')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [hc, setHc] = useState('')

  const babyRecords = selectedBaby
    ? getBabyRecords<GrowthRecord>(records, selectedBaby.id, 'growth').sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    : []

  if (state.babies.length === 0 || !selectedBaby) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: 40 }}>
        <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>📈</span>
        <p className="text-muted">Cadastre e selecione um bebê para acompanhar o crescimento</p>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!weight && !height && !hc) return
    const record: GrowthRecord = {
      id: crypto.randomUUID(),
      babyId: selectedBaby.id,
      type: 'growth',
      timestamp: new Date(date).toISOString(),
      weight: weight ? Number(weight) : undefined,
      height: height ? Number(height) : undefined,
      headCircumference: hc ? Number(hc) : undefined,
    }
    addRecord(record)
    setWeight('')
    setHeight('')
    setHc('')
  }

  const sortedByDate = [...babyRecords].reverse()
  const cfg = metricConfig[metric]

  const chartData = sortedByDate.map(r => {
    const months = monthsBetween(selectedBaby.birthDate, r.timestamp)
    const oms = getOMSAtMonth(months)
    const value = metric === 'weight' ? r.weight : metric === 'height' ? r.height : r.headCircumference
    return {
      months: Math.round(months * 10) / 10,
      value,
      omsP50: oms?.[cfg.omsKey],
      omsP3: oms?.[cfg.p3Key],
      omsP97: oms?.[cfg.p97Key],
      label: formatDate(r.timestamp),
    }
  }).filter(d => d.value != null)

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">📈 Crescimento</h1>
        <span className="card" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
          {calculateAge(selectedBaby.birthDate)}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Data</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Peso (kg)</label>
            <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)' }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Altura (cm)</label>
            <input type="number" step="0.1" value={height} onChange={e => setHeight(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>PC (cm)</label>
            <input type="number" step="0.1" value={hc} onChange={e => setHc(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)' }}
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary">Salvar Medição</button>
      </form>

      <div style={{ display: 'flex', gap: 4 }}>
        {(['weight', 'height', 'hc'] as Metric[]).map(m => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            className={`btn ${metric === m ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1, padding: '6px 8px', fontSize: '0.8rem' }}
          >
            {metricConfig[m].label}
          </button>
        ))}
      </div>

      {chartData.length > 0 && (
        <div className="card" style={{ padding: 12 }}>
          <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--lilac-900)', marginBottom: 8 }}>
            {cfg.label} - {selectedBaby.name}
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--lilac-100)" />
              <XAxis dataKey="months" label={{ value: 'meses', position: 'insideBottom', offset: -4 }} fontSize={12} />
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} fontSize={12} />
              <Tooltip labelFormatter={v => `${v} meses`} />
              <Legend />
              <ReferenceLine y={chartData[0]?.omsP50} stroke="#C39BD3" strokeDasharray="4 4" label="OMS P50" />
              <ReferenceLine y={chartData[0]?.omsP3} stroke="#E8D5F0" strokeDasharray="2 2" label="OMS P3" />
              <ReferenceLine y={chartData[0]?.omsP97} stroke="#E8D5F0" strokeDasharray="2 2" label="OMS P97" />
              <Line type="monotone" dataKey="value" stroke={cfg.color} strokeWidth={2} dot={{ r: 4 }} name={cfg.label} />
              <Line type="monotone" dataKey="omsP50" stroke="#C39BD3" strokeWidth={1} strokeDasharray="4 4" dot={false} name="OMS P50" />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: 4 }}>
            Linhas tracejadas: referência OMS (P3, P50, P97)
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p className="text-muted" style={{ fontWeight: 600 }}>
          Histórico ({babyRecords.length})
        </p>
        {babyRecords.length === 0 && (
          <p className="text-muted" style={{ textAlign: 'center', padding: 24 }}>
            Nenhuma medição registrada
          </p>
        )}
        {babyRecords.map(r => {
          const months = monthsBetween(selectedBaby.birthDate, r.timestamp)
          const oms = getOMSAtMonth(months)
          return (
            <div key={r.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.3rem' }}>📏</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{formatDate(r.timestamp)}</div>
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                  {formatAgeMonths(months)}
                  {r.weight != null && ` · ${r.weight}kg${oms ? ` (P50: ${oms.weightP50}kg)` : ''}`}
                  {r.height != null && ` · ${r.height}cm${oms ? ` (P50: ${oms.heightP50}cm)` : ''}`}
                  {r.headCircumference != null && ` · PC ${r.headCircumference}cm`}
                </div>
              </div>
              <button
                onClick={() => { if (confirm('Remover?')) deleteRecord(r.id) }}
                style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--lilac-100)', fontSize: '0.9rem' }}
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
