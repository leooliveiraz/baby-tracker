import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useBabyContext } from '../context/BabyContext'
import { useRecords, getBabyRecords } from '../context/RecordsContext'
import { useToast } from '../context/ToastContext'
import Growth from '../pages/Growth'

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
  vi.mocked(useRecords).mockReturnValue({
    records: [], addRecord: mockAddRecord, updateRecord: vi.fn(), deleteRecord: mockDeleteRecord,
    loadRecords: vi.fn(), deleteRecordsByBaby: vi.fn(),
  })
  vi.mocked(getBabyRecords).mockReturnValue([])
  vi.mocked(useToast).mockReturnValue({ toasts: [], showToast: mockShowToast })
}

describe('Growth', () => {
  beforeEach(() => { vi.clearAllMocks(); setup() })

  it('shows empty state when no baby', () => {
    vi.mocked(useBabyContext).mockReturnValue({
      state: { babies: [], selectedBabyId: null, deletedIds: [] }, selectedBaby: null,
      addBaby: vi.fn(), selectBaby: vi.fn(), removeBaby: vi.fn(), updateBaby: vi.fn(), loadBabies: vi.fn(), clearDeletedIds: vi.fn(),
    })
    render(<Growth />)
    expect(screen.getByText(/cadastre e selecione/i)).toBeInTheDocument()
  })

  it('renders form fields', () => {
    render(<Growth />)
    expect(screen.getByText('Salvar Medição')).toBeInTheDocument()
    expect(screen.getByText('Peso (kg)')).toBeInTheDocument()
    expect(screen.getByText('Altura (cm)')).toBeInTheDocument()
    expect(screen.getByText('PC (cm)')).toBeInTheDocument()
  })

  it('renders metric tabs', () => {
    render(<Growth />)
    expect(screen.getByText('Peso')).toBeInTheDocument()
    expect(screen.getByText('Altura')).toBeInTheDocument()
  })

  it('saves measurement', () => {
    render(<Growth />)
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[0], { target: { value: '7.5' } })
    fireEvent.click(screen.getByText('Salvar Medição'))
    expect(mockAddRecord).toHaveBeenCalledTimes(1)
    const r = mockAddRecord.mock.calls[0][0]
    expect(r.type).toBe('growth')
    expect(r.weight).toBe(7.5)
  })

  it('saves measurement with all fields', () => {
    render(<Growth />)
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[0], { target: { value: '7.5' } })
    fireEvent.change(inputs[1], { target: { value: '65' } })
    fireEvent.change(inputs[2], { target: { value: '43' } })
    fireEvent.click(screen.getByText('Salvar Medição'))
    const r = mockAddRecord.mock.calls[0][0]
    expect(r.weight).toBe(7.5)
    expect(r.height).toBe(65)
    expect(r.headCircumference).toBe(43)
  })

  it('shows history list', () => {
    const growthRecords = [{
      id: 'g1', babyId: '1', type: 'growth' as const, timestamp: '2026-05-01T10:00:00',
      weight: 7.5, height: 65, headCircumference: 43,
    }]
    vi.mocked(getBabyRecords).mockReturnValue(growthRecords)
    vi.mocked(useRecords).mockReturnValue({
      records: growthRecords, addRecord: mockAddRecord, updateRecord: vi.fn(), deleteRecord: mockDeleteRecord,
      loadRecords: vi.fn(), deleteRecordsByBaby: vi.fn(),
    })
    render(<Growth />)
    expect(screen.getByText(/01\/05\/2026/)).toBeInTheDocument()
  })

  it('deletes a measurement', () => {
    const growthRecords = [{
      id: 'g1', babyId: '1', type: 'growth' as const, timestamp: '2026-05-01T10:00:00',
      weight: 7.5,
    }]
    vi.mocked(getBabyRecords).mockReturnValue(growthRecords)
    vi.mocked(useRecords).mockReturnValue({
      records: growthRecords, addRecord: mockAddRecord, updateRecord: vi.fn(), deleteRecord: mockDeleteRecord,
      loadRecords: vi.fn(), deleteRecordsByBaby: vi.fn(),
    })
    render(<Growth />)
    window.confirm = vi.fn(() => true)
    fireEvent.click(screen.getAllByText('✕')[0])
    expect(mockDeleteRecord).toHaveBeenCalledWith('g1')
  })
})
