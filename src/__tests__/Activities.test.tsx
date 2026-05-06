import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useBabyContext } from '../context/BabyContext'
import { useRecords, getBabyRecords } from '../context/RecordsContext'
import { useToast } from '../context/ToastContext'
import Activities from '../pages/Activities'

vi.mock('../context/BabyContext')
vi.mock('../context/RecordsContext')
vi.mock('../context/ToastContext')

const mockAddRecord = vi.fn()
const mockDeleteRecord = vi.fn()
const mockShowToast = vi.fn()

function setup() {
  vi.mocked(useBabyContext).mockReturnValue({
    state: { babies: [{ id: '1', name: 'Maria', birthDate: '2024-01-01' }], selectedBabyId: '1', deletedIds: [] },
    selectedBaby: { id: '1', name: 'Maria', birthDate: '2024-01-01' },
    addBaby: vi.fn(), selectBaby: vi.fn(), removeBaby: vi.fn(), updateBaby: vi.fn(), loadBabies: vi.fn(), clearDeletedIds: vi.fn(),
  })
  vi.mocked(getBabyRecords).mockReturnValue([])
  vi.mocked(useRecords).mockReturnValue({
    records: [], addRecord: mockAddRecord, updateRecord: vi.fn(), deleteRecord: mockDeleteRecord,
    loadRecords: vi.fn(), deleteRecordsByBaby: vi.fn(),
  })
  vi.mocked(useToast).mockReturnValue({ toasts: [], showToast: mockShowToast })
}

describe('Activities', () => {
  beforeEach(() => { vi.clearAllMocks(); setup() })

  it('shows empty state when no baby', () => {
    vi.mocked(useBabyContext).mockReturnValue({
      state: { babies: [], selectedBabyId: null, deletedIds: [] }, selectedBaby: null,
      addBaby: vi.fn(), selectBaby: vi.fn(), removeBaby: vi.fn(), updateBaby: vi.fn(), loadBabies: vi.fn(), clearDeletedIds: vi.fn(),
    })
    render(<Activities />)
    expect(screen.getByText(/cadastre e selecione/i)).toBeInTheDocument()
  })

  it('renders activity grid', () => {
    render(<Activities />)
    expect(screen.getByText('Tummy Time')).toBeInTheDocument()
    expect(screen.getByText('Banho')).toBeInTheDocument()
    expect(screen.getByText('Leitura')).toBeInTheDocument()
    expect(screen.getByText('Tela')).toBeInTheDocument()
  })

  it('shows form when activity is clicked', () => {
    render(<Activities />)
    fireEvent.click(screen.getByText('Tummy Time'))
    expect(screen.getByPlaceholderText('Duração (minutos)')).toBeInTheDocument()
    expect(screen.getByText('Salvar')).toBeInTheDocument()
  })

  it('saves activity with duration', async () => {
    render(<Activities />)
    fireEvent.click(screen.getByText('Banho'))
    const input = screen.getByPlaceholderText('Duração (minutos)')
    await userEvent.type(input, '20')
    fireEvent.click(screen.getByText('Salvar'))
    expect(mockAddRecord).toHaveBeenCalledTimes(1)
    const r = mockAddRecord.mock.calls[0][0]
    expect(r.activityType).toBe('bath')
    expect(r.duration).toBe(20)
  })

  it('deletes an activity', () => {
    vi.mocked(getBabyRecords).mockReturnValue([{
      id: 'a1', babyId: '1', type: 'activity' as const, timestamp: new Date().toISOString(),
      activityType: 'tummy_time' as const, duration: 10,
    }])
    render(<Activities />)
    window.confirm = vi.fn(() => true)
    fireEvent.click(screen.getAllByText('✕')[0])
    expect(mockDeleteRecord).toHaveBeenCalledWith('a1')
  })
})
