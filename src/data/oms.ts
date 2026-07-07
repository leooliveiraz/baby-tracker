export interface OMSReference {
  months: number
  weightP50: number
  heightP50: number
  hcP50: number
  weightP3: number
  weightP97: number
  heightP3: number
  heightP97: number
}

const data: OMSReference[] = [
  { months: 0,  weightP50: 3.3,  heightP50: 49.9, hcP50: 34.5, weightP3: 2.5,  weightP97: 4.3,  heightP3: 46.3, heightP97: 53.4 },
  { months: 1,  weightP50: 4.3,  heightP50: 54.7, hcP50: 37.3, weightP3: 3.4,  weightP97: 5.6,  heightP3: 51.1, heightP97: 58.4 },
  { months: 2,  weightP50: 5.2,  heightP50: 58.4, hcP50: 39.1, weightP3: 4.3,  weightP97: 6.6,  heightP3: 54.7, heightP97: 62.2 },
  { months: 3,  weightP50: 6.0,  heightP50: 61.4, hcP50: 40.5, weightP3: 5.0,  weightP97: 7.5,  heightP3: 57.6, heightP97: 65.3 },
  { months: 4,  weightP50: 6.7,  heightP50: 63.9, hcP50: 41.6, weightP3: 5.6,  weightP97: 8.2,  heightP3: 60.0, heightP97: 67.8 },
  { months: 5,  weightP50: 7.3,  heightP50: 65.9, hcP50: 42.6, weightP3: 6.1,  weightP97: 8.8,  heightP3: 62.0, heightP97: 69.9 },
  { months: 6,  weightP50: 7.9,  heightP50: 67.6, hcP50: 43.3, weightP3: 6.6,  weightP97: 9.4,  heightP3: 63.7, heightP97: 71.5 },
  { months: 7,  weightP50: 8.3,  heightP50: 69.2, hcP50: 44.0, weightP3: 7.0,  weightP97: 9.8,  heightP3: 65.3, heightP97: 73.1 },
  { months: 8,  weightP50: 8.6,  heightP50: 70.6, hcP50: 44.5, weightP3: 7.3,  weightP97: 10.2, heightP3: 66.6, heightP97: 74.5 },
  { months: 9,  weightP50: 8.9,  heightP50: 72.0, hcP50: 44.9, weightP3: 7.6,  weightP97: 10.5, heightP3: 67.9, heightP97: 76.0 },
  { months: 10, weightP50: 9.2,  heightP50: 73.3, hcP50: 45.3, weightP3: 7.8,  weightP97: 10.8, heightP3: 69.1, heightP97: 77.4 },
  { months: 11, weightP50: 9.4,  heightP50: 74.5, hcP50: 45.5, weightP3: 8.0,  weightP97: 11.1, heightP3: 70.2, heightP97: 78.7 },
  { months: 12, weightP50: 9.6,  heightP50: 75.7, hcP50: 45.8, weightP3: 8.2,  weightP97: 11.4, heightP3: 71.3, heightP97: 80.1 },
  { months: 15, weightP50: 10.3, heightP50: 79.1, hcP50: 46.3, weightP3: 8.8,  weightP97: 12.2, heightP3: 74.6, heightP97: 83.6 },
  { months: 18, weightP50: 10.9, heightP50: 82.3, hcP50: 46.6, weightP3: 9.3,  weightP97: 13.0, heightP3: 77.6, heightP97: 87.0 },
  { months: 21, weightP50: 11.5, heightP50: 85.2, hcP50: 46.8, weightP3: 9.7,  weightP97: 13.7, heightP3: 80.3, heightP97: 90.0 },
  { months: 24, weightP50: 12.0, heightP50: 87.8, hcP50: 47.0, weightP3: 10.1, weightP97: 14.4, heightP3: 82.7, heightP97: 92.8 },
]

export function getOMSAtMonth(months: number): OMSReference | null {
  const sorted = [...data].sort((a, b) => a.months - b.months)
  if (months <= sorted[0].months) return sorted[0]
  if (months >= sorted[sorted.length - 1].months) return sorted[sorted.length - 1]

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i]
    const b = sorted[i + 1]
    if (months >= a.months && months <= b.months) {
      const t = (months - a.months) / (b.months - a.months)
      return {
        months,
        weightP50: lerp(a.weightP50, b.weightP50, t),
        heightP50: lerp(a.heightP50, b.heightP50, t),
        hcP50: lerp(a.hcP50, b.hcP50, t),
        weightP3: lerp(a.weightP3, b.weightP3, t),
        weightP97: lerp(a.weightP97, b.weightP97, t),
        heightP3: lerp(a.heightP3, b.heightP3, t),
        heightP97: lerp(a.heightP97, b.heightP97, t),
      }
    }
  }
  return null
}

function lerp(a: number, b: number, t: number): number {
  return Math.round((a + (b - a) * t) * 10) / 10
}

function parseDateOnly(dateStr: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  return new Date(dateStr)
}

export function monthsSinceBirth(birthDate: string): number {
  const diff = Date.now() - parseDateOnly(birthDate).getTime()
  return Math.max(0, diff / (30.44 * 86400000))
}

export function monthsBetween(birthDate: string, date: string): number {
  const diff = parseDateOnly(date).getTime() - parseDateOnly(birthDate).getTime()
  return Math.max(0, diff / (30.44 * 86400000))
}

export function formatAgeMonths(months: number): string {
  const m = Math.floor(months)
  const d = Math.round((months - m) * 30)
  if (m < 1) return `${d} dias`
  if (d === 0) return `${m} meses`
  return `${m}m ${d}d`
}
