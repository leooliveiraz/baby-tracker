import { describe, it, expect } from 'vitest'
import { calcDuration, formatDuration, formatTime, formatDate, calculateAge, isToday } from '../utils/time'

describe('calcDuration', () => {
  it('calculates minutes between two dates', () => {
    const start = '2024-01-01T10:00:00'
    const end = '2024-01-01T11:30:00'
    expect(calcDuration(start, end)).toBe(90)
  })

  it('returns 0 for same time', () => {
    const t = '2024-01-01T10:00:00'
    expect(calcDuration(t, t)).toBe(0)
  })

  it('handles sub-minute durations', () => {
    const start = '2024-01-01T10:00:00'
    const end = '2024-01-01T10:00:20'
    const result = calcDuration(start, end)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThan(1)
  })

  it('works without end (uses Date.now)', () => {
    const start = new Date(Date.now() - 3600000).toISOString()
    expect(calcDuration(start)).toBeGreaterThanOrEqual(59)
  })
})

describe('formatDuration', () => {
  it('shows < 1min for zero', () => {
    expect(formatDuration(0)).toBe('< 1min')
  })

  it('shows minutes for < 60', () => {
    expect(formatDuration(5)).toBe('5min')
    expect(formatDuration(45)).toBe('45min')
  })

  it('shows hours and minutes', () => {
    expect(formatDuration(90)).toBe('1h 30min')
    expect(formatDuration(150)).toBe('2h 30min')
  })

  it('shows only hours for exact hours', () => {
    expect(formatDuration(120)).toBe('2h')
    expect(formatDuration(60)).toBe('1h')
  })
})

describe('formatTime', () => {
  it('formats ISO time to HH:MM', () => {
    const d = new Date('2024-01-01T14:30:00').toISOString()
    expect(formatTime(d)).toMatch(/^\d{2}:\d{2}$/)
  })
})

describe('formatDate', () => {
  it('formats ISO date to DD/MM/YYYY', () => {
    const d = '2024-03-15T10:00:00'
    expect(formatDate(d)).toBe('15/03/2024')
  })
})

describe('calculateAge', () => {
  it('shows days for babies under 1 month', () => {
    const birth = new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0]
    expect(calculateAge(birth)).toMatch(/\d+ dias/)
  })

  it('shows months for babies under 2 years', () => {
    const birth = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0]
    expect(calculateAge(birth)).toMatch(/\d+m \d+d|\d+ meses/)
  })

  it('shows years for toddlers', () => {
    const birth = new Date(Date.now() - 730 * 86400000).toISOString().split('T')[0]
    expect(calculateAge(birth)).toMatch(/\d+a \d+m/)
  })
})

describe('isToday', () => {
  it('returns true for current timestamp', () => {
    expect(isToday(new Date().toISOString())).toBe(true)
  })

  it('returns false for yesterday', () => {
    const d = new Date(Date.now() - 86400000).toISOString()
    expect(isToday(d)).toBe(false)
  })
})
