import { useState } from 'react'
import { useBabyContext } from '../context/BabyContext'
import { useRecords, getBabyRecords, type DiaryRecord } from '../context/RecordsContext'
import { formatDate } from '../utils/time'
import { useToast } from '../context/ToastContext'

export default function Diary() {
  const { selectedBaby, state } = useBabyContext()
  const { records, addRecord, updateRecord, deleteRecord } = useRecords()
  const { showToast } = useToast()
  const [content, setContent] = useState('')
  const [diaryDate, setDiaryDate] = useState(new Date().toISOString().split('T')[0])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  if (state.babies.length === 0 || !selectedBaby) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: 40 }}>
        <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>📖</span>
        <p className="text-muted">Cadastre e selecione um bebê para escrever no diário</p>
      </div>
    )
  }

  const allEntries = getBabyRecords<DiaryRecord>(records, selectedBaby.id, 'diary')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const todayEntries = allEntries.filter(e => e.date === diaryDate)
  const otherDays = allEntries.filter(e => e.date !== diaryDate)

  // Group other days
  const grouped: Record<string, DiaryRecord[]> = {}
  for (const e of otherDays) {
    if (!grouped[e.date]) grouped[e.date] = []
    grouped[e.date].push(e)
  }

  const handleSubmit = () => {
    if (!content.trim()) return
    const existing = todayEntries[0]
    if (existing) {
      updateRecord({ ...existing, content: content.trim() })
      showToast('✏️ Diário atualizado!', 'success')
    } else {
      const record: DiaryRecord = {
        id: crypto.randomUUID(),
        babyId: selectedBaby.id,
        type: 'diary',
        timestamp: new Date().toISOString(),
        date: diaryDate,
        content: content.trim(),
      }
      addRecord(record)
      showToast('📖 Registrado no diário!', 'success')
    }
    setContent('')
  }

  const startEdit = (entry: DiaryRecord) => {
    setEditingId(entry.id)
    setEditContent(entry.content)
  }

  const saveEdit = () => {
    if (!editingId || !editContent.trim()) return
    updateRecord({ ...allEntries.find(e => e.id === editingId)!, content: editContent.trim() })
    setEditingId(null)
    showToast('✏️ Atualizado!', 'success')
  }

  return (
    <div className="container">
      <h1 className="page-title">📖 Diário do Bebê</h1>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Data</label>
            <input type="date" value={diaryDate} onChange={e => { setDiaryDate(e.target.value); setContent(todayEntries.find(te => te.date === e.target.value)?.content ?? '') }}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)' }} />
          </div>
        </div>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Como foi o dia do bebê? 😊"
          rows={4}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)', fontSize: '1rem', resize: 'vertical', fontFamily: 'inherit' }}
        />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={handleSubmit} className="btn btn-primary btn-sm">
            {todayEntries.length > 0 ? '✏️ Atualizar' : '💾 Salvar'}
          </button>
        </div>
      </div>

      {todayEntries.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <p className="text-muted" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
            📅 Hoje ({formatDate(diaryDate)})
          </p>
          {todayEntries.map(e => (
            <div key={e.id} className="card" style={{ padding: 12 }}>
              <div style={{ fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{e.content}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={() => startEdit(e)} className="btn btn-outline btn-sm" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>✏️ Editar</button>
                <button onClick={() => { if (confirm('Remover?')) { deleteRecord(e.id); showToast('Removido!', 'success') } }} className="btn btn-outline btn-sm" style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: '#E74C3C', color: '#E74C3C' }}>🗑 Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingId && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={3}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '2px solid var(--lilac-100)', fontSize: '1rem', resize: 'vertical', fontFamily: 'inherit' }} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={saveEdit} className="btn btn-primary btn-sm">OK</button>
            <button onClick={() => setEditingId(null)} className="btn btn-outline btn-sm">Cancelar</button>
          </div>
        </div>
      )}

      {Object.entries(grouped).map(([date, entries]) => (
        <div key={date}>
          <p className="text-muted" style={{ fontWeight: 600, marginBottom: 4, fontSize: '0.85rem' }}>
            📅 {formatDate(date)}
          </p>
          {entries.map(e => (
            <div key={e.id} className="card" style={{ padding: 12, marginBottom: 4 }}>
              <div style={{ fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{e.content}</div>
              <button onClick={() => { if (confirm('Remover?')) { deleteRecord(e.id); showToast('Removido!', 'success') } }} className="btn btn-outline btn-sm" style={{ padding: '4px 10px', fontSize: '0.75rem', marginTop: 8, borderColor: '#E74C3C', color: '#E74C3C' }}>🗑 Excluir</button>
            </div>
          ))}
        </div>
      ))}

      {allEntries.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <span style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>📖</span>
          <p className="text-muted">Nenhum registro no diário ainda</p>
        </div>
      )}
    </div>
  )
}
