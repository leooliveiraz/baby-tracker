export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR')
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export function calcDuration(start: string, end?: string): number {
  return Math.round((new Date(end ?? Date.now()).getTime() - new Date(start).getTime()) / 60000)
}

export function isToday(iso: string): boolean {
  const d = new Date(iso)
  const t = new Date()
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear()
}

export function todayRange(): { start: string; end: string } {
  const s = new Date(); s.setHours(0, 0, 0, 0)
  const e = new Date(); e.setHours(23, 59, 59, 999)
  return { start: s.toISOString(), end: e.toISOString() }
}

export function calculateAge(birthDate: string): string {
  const diff = Date.now() - new Date(birthDate).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 30) return `${days} dias`
  const months = Math.floor(days / 30)
  const remainingDays = days % 30
  if (months < 24) return `${months}m ${remainingDays}d`
  const years = Math.floor(months / 12)
  return `${years}a ${months % 12}m`
}
