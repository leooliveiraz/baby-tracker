import { useRef, useState } from 'react'
import { useBabyContext } from '../context/BabyContext'
import { useRecords, type BabyRecord } from '../context/RecordsContext'
import { useToast } from '../context/ToastContext'
import type { Baby } from '../context/BabyContext'

interface BackupData {
  version: number
  exportedAt: string
  babies: Baby[]
  records: BabyRecord[]
}

export default function Backup() {
  const { state, loadBabies } = useBabyContext()
  const { records, loadRecords } = useRecords()
  const { showToast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)

  const handleExport = () => {
    const data: BackupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      babies: state.babies,
      records,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `baby-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('📦 Backup exportado!', 'success')
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text) as BackupData

      if (!data.version || !Array.isArray(data.babies) || !Array.isArray(data.records)) {
        showToast('❌ Arquivo inválido', 'error')
        return
      }

      // Merge babies: existing kept, new added
      const existingIds = new Set(state.babies.map(b => b.id))
      const mergedBabies = [...state.babies]

      for (const b of data.babies) {
        if (!existingIds.has(b.id)) {
          mergedBabies.push(b)
          existingIds.add(b.id)
        }
      }

      // Merge records: existing kept, new added
      const existingRecordIds = new Set(records.map(r => r.id))
      const mergedRecords = [...records]

      for (const r of data.records) {
        if (!existingRecordIds.has(r.id)) {
          mergedRecords.push(r)
          existingRecordIds.add(r.id)
        }
      }

      loadBabies(mergedBabies, state.selectedBabyId)
      loadRecords(mergedRecords)

      showToast(
        `✅ Importado: ${data.babies.length} bebês, ${data.records.length} registros`,
        'success',
      )
    } catch {
      showToast('❌ Erro ao ler arquivo', 'error')
    } finally {
      setImporting(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="container" style={{ maxWidth: 400, margin: '0 auto' }}>
      <h1 className="page-title" style={{ marginBottom: 8 }}>💾 Backup</h1>
      <p className="text-muted" style={{ marginBottom: 20 }}>
        Exporte seus dados como arquivo JSON ou importe de outro dispositivo.
      </p>

      <div className="card" style={{ marginBottom: 16 }}>
        <p style={{ fontWeight: 600, color: 'var(--lilac-900)', marginBottom: 8 }}>
          📤 Exportar
        </p>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 12 }}>
          Salva todos os bebês e registros em um arquivo .json
        </p>
        <button onClick={handleExport} className="btn btn-primary" style={{ width: '100%' }}>
          📦 Exportar Backup
        </button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <p style={{ fontWeight: 600, color: 'var(--lilac-900)', marginBottom: 8 }}>
          📥 Importar
        </p>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 12 }}>
          Adiciona dados de um arquivo .json ao que já existe. Registros com IDs duplicados são ignorados.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={importing}
          className="btn btn-outline"
          style={{ width: '100%' }}
        >
          {importing ? '🔄 Importando...' : '📂 Selecionar Arquivo'}
        </button>
      </div>

      <div className="card">
        <p style={{ fontWeight: 600, color: 'var(--lilac-900)', marginBottom: 8 }}>
          📊 Status
        </p>
        <div className="text-muted" style={{ fontSize: '0.85rem' }}>
          <p>👶 Bebês: {state.babies.length}</p>
          <p>📝 Registros: {records.length}</p>
        </div>
      </div>
    </div>
  )
}
