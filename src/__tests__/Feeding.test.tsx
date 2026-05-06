import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useBabyContext } from '../context/BabyContext'
import { useRecords, getBabyRecords } from '../context/RecordsContext'
import { useToast } from '../context/ToastContext'
import Feeding from '../pages/Feeding'

vi.mock('../context/BabyContext')
vi.mock('../context/RecordsContext')
vi.mock('../context/ToastContext')

const mockAddRecord = vi.fn()
const mockUpdateRecord = vi.fn()
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
    records: [], addRecord: mockAddRecord, updateRecord: mockUpdateRecord, deleteRecord: mockDeleteRecord,
    loadRecords: vi.fn(), deleteRecordsByBaby: vi.fn(),
  })
  vi.mocked(useToast).mockReturnValue({ toasts: [], showToast: mockShowToast })
}

describe('Feeding', () => {
  beforeEach(() => { vi.clearAllMocks(); setup() })

  it('shows empty state when no baby', () => {
    vi.mocked(useBabyContext).mockReturnValue({
      state: { babies: [], selectedBabyId: null, deletedIds: [] }, selectedBaby: null,
      addBaby: vi.fn(), selectBaby: vi.fn(), removeBaby: vi.fn(), updateBaby: vi.fn(), loadBabies: vi.fn(), clearDeletedIds: vi.fn(),
    })
    render(<Feeding />)
    expect(screen.getByText(/cadastre e selecione/i)).toBeInTheDocument()
  })

  it('renders buttons for breast and bottle', () => {
    render(<Feeding />)
    expect(screen.getByText('⬅ Peito E')).toBeInTheDocument()
    expect(screen.getByText('➡ Peito D')).toBeInTheDocument()
    expect(screen.getByText('🍼 Mamadeira')).toBeInTheDocument()
  })

  it('starts breast feeding timer on click', () => {
    render(<Feeding />)
    fireEvent.click(screen.getByText('⬅ Peito E'))
    expect(mockAddRecord).toHaveBeenCalledTimes(1)
    const r = mockAddRecord.mock.calls[0][0]
    expect(r.type).toBe('feeding')
    expect(r.method).toBe('breast')
    expect(r.side).toBe('left')
  })

  it('starts right breast feeding', () => {
    render(<Feeding />)
    fireEvent.click(screen.getByText('➡ Peito D'))
    expect(mockAddRecord).toHaveBeenCalledTimes(1)
    expect(mockAddRecord.mock.calls[0][0].side).toBe('right')
  })

  it('shows bottle form and saves volume', async () => {
    render(<Feeding />)
    fireEvent.click(screen.getByText('🍼 Mamadeira'))
    const input = screen.getByPlaceholderText('Volume (ml)')
    await userEvent.type(input, '120')
    fireEvent.click(screen.getByText('Salvar'))
    expect(mockAddRecord).toHaveBeenCalledTimes(1)
    const r = mockAddRecord.mock.calls[0][0]
    expect(r.method).toBe('bottle')
    expect(r.volume).toBe(120)
  })

  it('deletes a feeding record', () => {
    vi.mocked(getBabyRecords).mockReturnValue([{
      id: 'f1', babyId: '1', type: 'feeding' as const, timestamp: new Date().toISOString(),
      method: 'breast' as const, side: 'left' as const, duration: 15,
    }])
    render(<Feeding />)
    window.confirm = vi.fn(() => true)
    fireEvent.click(screen.getAllByText('✕')[0])
    expect(mockDeleteRecord).toHaveBeenCalledWith('f1')
  })

  it('edits a feeding record', () => {
    vi.mocked(getBabyRecords).mockReturnValue([{
      id: 'f1', babyId: '1', type: 'feeding' as const, timestamp: new Date().toISOString(),
      method: 'bottle' as const, volume: 100,
    }])
    render(<Feeding />)
    fireEvent.click(screen.getAllByText('✏️')[0])
    const durationInput = screen.getByPlaceholderText('Duração (min)')
    expect(durationInput).toBeInTheDocument()
  })
})
