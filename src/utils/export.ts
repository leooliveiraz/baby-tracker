import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { BabyRecord, FeedingRecord, DiaperRecord, SleepRecord, GrowthRecord, VaccineRecord, MedicationRecord, FeverRecord } from '../context/RecordsContext'
import { type Baby } from '../context/BabyContext'
import { calculateAge, calcDuration } from './time'

function fmt(d: Date): string {
  return d.toLocaleDateString(undefined)
}

function fmtISO(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
}

function escapeCSV(val: unknown): string {
  const s = String(val ?? '')
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function downloadCSV(rows: Record<string, unknown>[], filename: string) {
  if (rows.length === 0) return
  const headers = Object.keys(rows[0])
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => escapeCSV(r[h])).join(',')),
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadPDF(
  records: BabyRecord[],
  baby: Baby,
  dateRange: { start: Date; end: Date },
  categories: string[],
) {
  const doc = new jsPDF()
  const babyRecords = records.filter(r => r.babyId === baby.id)
  const filtered = babyRecords.filter(r => {
    const d = new Date('startTime' in r ? (r as SleepRecord).startTime : 'date' in r ? (r as VaccineRecord).date : r.timestamp)
    return d >= dateRange.start && d <= dateRange.end
  })

  const pageW = doc.internal.pageSize.getWidth()
  const margin = 20
  let y = margin

  doc.setFontSize(18)
  doc.setTextColor(155, 89, 182)
  doc.text('Baby Tracker - Relatório', pageW / 2, y, { align: 'center' })
  y += 10

  doc.setFontSize(11)
  doc.setTextColor(45, 27, 54)
  doc.text(`Bebê: ${baby.name}`, margin, y)
  y += 6
  doc.text(`Idade: ${calculateAge(baby.birthDate)}`, margin, y)
  y += 6
  doc.text(`Período: ${fmt(dateRange.start)} — ${fmt(dateRange.end)}`, margin, y)
  y += 12

  if (categories.includes('feeding')) {
    const feedings = filtered.filter(r => r.type === 'feeding') as FeedingRecord[]
    if (feedings.length > 0) {
      doc.setFontSize(14)
      doc.setTextColor(155, 89, 182)
      doc.text('🥛 Mamadas', margin, y)
      y += 8

      const totalBreast = feedings.filter(f => f.method === 'breast').length
      const totalBottle = feedings.filter(f => f.method === 'bottle').length
      const totalDuration = feedings.reduce((a, f) => a + (f.duration ?? 0), 0)

      doc.setFontSize(10)
      doc.setTextColor(45, 27, 54)
      doc.text(`Total: ${feedings.length} (${totalBreast} peito, ${totalBottle} mamadeira)`, margin + 4, y)
      y += 5
      if (totalDuration > 0) doc.text(`Duração total: ${totalDuration}min`, margin + 4, y)
      y += 5

      autoTable(doc, {
        startY: y,
        head: [['Horário', 'Tipo', 'Detalhes']],
        body: feedings.slice(0, 50).map(f => [
          fmtISO(f.timestamp),
          f.method === 'breast' ? `Peito ${f.side === 'left' ? 'E' : 'D'}` : 'Mamadeira',
          [f.duration ? `${f.duration}min` : '', f.volume ? `${f.volume}ml` : ''].filter(Boolean).join(' · '),
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [155, 89, 182] },
      })
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8
    }
  }

  if (categories.includes('diaper')) {
    const diapers = filtered.filter(r => r.type === 'diaper') as DiaperRecord[]
    if (diapers.length > 0) {
      if (y > 240) { doc.addPage(); y = margin }
      doc.setFontSize(14)
      doc.setTextColor(155, 89, 182)
      doc.text('👶 Fraldas', margin, y)
      y += 8

      const wet = diapers.filter(d => d.diaperType === 'wet' || d.diaperType === 'both').length
      const dirty = diapers.filter(d => d.diaperType === 'dirty' || d.diaperType === 'both').length

      doc.setFontSize(10)
      doc.setTextColor(45, 27, 54)
      doc.text(`Total: ${diapers.length} (${wet} xixi, ${dirty} cocô)`, margin + 4, y)
      y += 5

      autoTable(doc, {
        startY: y,
        head: [['Horário', 'Tipo', 'Consistência']],
        body: diapers.slice(0, 50).map(d => [
          fmtISO(d.timestamp),
          d.diaperType === 'wet' ? 'Xixi' : d.diaperType === 'dirty' ? 'Cocô' : 'Ambos',
          d.consistency ?? '-',
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [155, 89, 182] },
      })
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8
    }
  }

  if (categories.includes('sleep')) {
    const sleeps = filtered.filter(r => r.type === 'sleep') as SleepRecord[]
    if (sleeps.length > 0) {
      if (y > 240) { doc.addPage(); y = margin }
      doc.setFontSize(14)
      doc.setTextColor(155, 89, 182)
      doc.text('😴 Sono', margin, y)
      y += 8

      const totalSleepMin = sleeps.reduce((a, s) => a + calcDuration(s.startTime, s.endTime), 0)

      doc.setFontSize(10)
      doc.setTextColor(45, 27, 54)
      doc.text(`Total de sonecas: ${sleeps.length}`, margin + 4, y); y += 5
      doc.text(`Total de sono: ${Math.round(totalSleepMin / 60)}h ${totalSleepMin % 60}min`, margin + 4, y); y += 5
      doc.text(`Média: ${sleeps.length > 0 ? Math.round(totalSleepMin / sleeps.length) : 0}min por soneca`, margin + 4, y); y += 5

      autoTable(doc, {
        startY: y,
        head: [['Início', 'Fim', 'Duração', 'Local']],
        body: sleeps.slice(0, 50).map(s => [
          fmtISO(s.startTime),
          s.endTime ? fmtISO(s.endTime) : 'Em andamento',
          s.endTime ? `${calcDuration(s.startTime, s.endTime)}min` : '-',
          s.location ?? '-',
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [155, 89, 182] },
      })
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8
    }
  }

  if (categories.includes('growth')) {
    const growths = filtered.filter(r => r.type === 'growth') as GrowthRecord[]
    if (growths.length > 0) {
      if (y > 240) { doc.addPage(); y = margin }
      doc.setFontSize(14)
      doc.setTextColor(155, 89, 182)
      doc.text('📈 Crescimento', margin, y)
      y += 8

      autoTable(doc, {
        startY: y,
        head: [['Data', 'Peso', 'Altura', 'PC']],
        body: growths.map(g => [
          fmtISO(g.timestamp),
          g.weight ? `${g.weight}kg` : '-',
          g.height ? `${g.height}cm` : '-',
          g.headCircumference ? `${g.headCircumference}cm` : '-',
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [155, 89, 182] },
      })
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8
    }
  }

  if (categories.includes('health')) {
    const vaccines = filtered.filter(r => r.type === 'vaccine') as VaccineRecord[]
    const medications = filtered.filter(r => r.type === 'medication') as MedicationRecord[]
    const fevers = filtered.filter(r => r.type === 'fever') as FeverRecord[]

    if (vaccines.length > 0) {
      if (y > 240) { doc.addPage(); y = margin }
      doc.setFontSize(14)
      doc.setTextColor(155, 89, 182)
      doc.text('💉 Vacinas', margin, y)
      y += 8

      autoTable(doc, {
        startY: y,
        head: [['Vacina', 'Dose', 'Data', 'Status']],
        body: vaccines.map(v => [
          v.vaccineName,
          v.dose,
          fmtISO(v.date),
          v.status === 'taken' ? 'Tomada' : v.status === 'skipped' ? 'Pulada' : 'Agendada',
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [155, 89, 182] },
      })
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8
    }

    if (medications.length > 0) {
      if (y > 240) { doc.addPage(); y = margin }
      doc.setFontSize(14)
      doc.setTextColor(155, 89, 182)
      doc.text('💊 Medicações', margin, y)
      y += 8

      autoTable(doc, {
        startY: y,
        head: [['Data/Hora', 'Medicamento', 'Dose']],
        body: medications.map(m => [
          fmtISO(m.timestamp),
          m.medicationName,
          m.dose,
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [155, 89, 182] },
      })
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8
    }

    if (fevers.length > 0) {
      if (y > 240) { doc.addPage(); y = margin }
      doc.setFontSize(14)
      doc.setTextColor(155, 89, 182)
      doc.text('🌡 Febre', margin, y)
      y += 8

      autoTable(doc, {
        startY: y,
        head: [['Data/Hora', 'Temperatura', 'Classificação']],
        body: fevers.map(f => [
          fmtISO(f.timestamp),
          `${f.temperature}°C`,
          f.temperature >= 39 ? 'Febre alta' : f.temperature >= 38 ? 'Febre' : 'Subfebril',
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [155, 89, 182] },
      })
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8
    }
  }

  doc.save(`baby-tracker-${baby.name}-${fmt(dateRange.start)}-${fmt(dateRange.end)}.pdf`)
}

export function exportCategoryCSV(records: BabyRecord[], babyId: string, category: string) {
  const filtered = records.filter(r => r.babyId === babyId)

  switch (category) {
    case 'feeding': {
      const r = filtered.filter(f => f.type === 'feeding') as FeedingRecord[]
      downloadCSV(r.map(f => ({
        Data: fmtISO(f.timestamp),
        Tipo: f.method === 'breast' ? `Peito ${f.side === 'left' ? 'E' : 'D'}` : 'Mamadeira',
        Duração: f.duration ?? '',
        Volume: f.volume ?? '',
        Observações: f.notes ?? '',
      })), 'mamadas')
      break
    }
    case 'diaper': {
      const r = filtered.filter(d => d.type === 'diaper') as DiaperRecord[]
      downloadCSV(r.map(d => ({
        Data: fmtISO(d.timestamp),
        Tipo: d.diaperType === 'wet' ? 'Xixi' : d.diaperType === 'dirty' ? 'Cocô' : 'Ambos',
        Consistência: d.consistency ?? '',
        Observações: d.notes ?? '',
      })), 'fraldas')
      break
    }
    case 'sleep': {
      const r = filtered.filter(s => s.type === 'sleep') as SleepRecord[]
      downloadCSV(r.map(s => ({
        Início: fmtISO(s.startTime),
        Fim: s.endTime ? fmtISO(s.endTime) : '',
        Duração: s.endTime ? `${calcDuration(s.startTime, s.endTime)}min` : '',
        Local: s.location ?? '',
        Qualidade: s.quality ?? '',
      })), 'sono')
      break
    }
    case 'growth': {
      const r = filtered.filter(g => g.type === 'growth') as GrowthRecord[]
      downloadCSV(r.map(g => ({
        Data: fmtISO(g.timestamp),
        Peso: g.weight ?? '',
        Altura: g.height ?? '',
        'PC (cm)': g.headCircumference ?? '',
      })), 'crescimento')
      break
    }
    case 'vaccines': {
      const r = filtered.filter(v => v.type === 'vaccine') as VaccineRecord[]
      downloadCSV(r.map(v => ({
        Vacina: v.vaccineName,
        Dose: v.dose,
        Data: fmtISO(v.date),
        Status: v.status === 'taken' ? 'Tomada' : v.status === 'skipped' ? 'Pulada' : 'Agendada',
        Lote: v.lot ?? '',
      })), 'vacinas')
      break
    }
    case 'health': {
      const meds = filtered.filter(m => m.type === 'medication') as MedicationRecord[]
      const fevers = filtered.filter(f => f.type === 'fever') as FeverRecord[]
      if (meds.length > 0) downloadCSV(meds.map(m => ({
        Data: fmtISO(m.timestamp),
        Medicamento: m.medicationName,
        Dose: m.dose,
        Observações: m.notes ?? '',
      })), 'medicamentos')
      if (fevers.length > 0) downloadCSV(fevers.map(f => ({
        Data: fmtISO(f.timestamp),
        Temperatura: `${f.temperature}°C`,
        Observações: f.notes ?? '',
      })), 'febre')
      break
    }
  }
}
