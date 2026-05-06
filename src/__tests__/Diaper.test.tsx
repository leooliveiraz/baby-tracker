import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useBabyContext } from '../context/BabyContext'
import { useRecords, getBabyRecords } from '../context/RecordsContext'
import { useToast } from '../context/ToastContext'
import Diaper from '../pages/Diaper'

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

describe('Diaper', () => {
  beforeEach(() => { vi.clearAllMocks(); setup() })

  it('shows empty state when no baby', () => {
    vi.mocked(useBabyContext).mockReturnValue({
      state: { babies: [], selectedBabyId: null, deletedIds: [] }, selectedBaby: null,
      addBaby: vi.fn(), selectBaby: vi.fn(), removeBaby: vi.fn(), updateBaby: vi.fn(), loadBabies: vi.fn(), clearDeletedIds: vi.fn(),
    })
    render(<Diaper />)
    expect(screen.getByText(/cadastre e selecione/i)).toBeInTheDocument()
  })

  it('renders quick action buttons', () => {
    render(<Diaper />)
    expect(screen.getByText('💦 Xixi')).toBeInTheDocument()
    expect(screen.getByText('💩 Cocô')).toBeInTheDocument()
    expect(screen.getByText('💦💩 Ambos')).toBeInTheDocument()
  })

  it('registers wet diaper', () => {
    render(<Diaper />)
    fireEvent.click(screen.getByText('💦 Xixi'))
    expect(mockAddRecord).toHaveBeenCalledTimes(1)
    expect(mockAddRecord.mock.calls[0][0].diaperType).toBe('wet')
  })

  it('registers dirty diaper', () => {
    render(<Diaper />)
    fireEvent.click(screen.getByText('💩 Cocô'))
    expect(mockAddRecord).toHaveBeenCalledTimes(1)
    expect(mockAddRecord.mock.calls[0][0].diaperType).toBe('dirty')
  })

  it('registers both', () => {
    render(<Diaper />)
    fireEvent.click(screen.getByText('💦💩 Ambos'))
    expect(mockAddRecord).toHaveBeenCalledTimes(1)
    expect(mockAddRecord.mock.calls[0][0].diaperType).toBe('both')
  })

  it('deletes a diaper record', () => {
    vi.mocked(getBabyRecords).mockReturnValue([{
      id: 'd1', babyId: '1', type: 'diaper' as const, timestamp: new Date().toISOString(), diaperType: 'wet' as const,
    }])
    render(<Diaper />)
    window.confirm = vi.fn(() => true)
    const deleteBtn = screen.getByText('✕')
    fireEvent.click(deleteBtn)
    expect(mockDeleteRecord).toHaveBeenCalledWith('d1')
  })

  it('shows today list', () => {
    vi.mocked(getBabyRecords).mockReturnValue([{
      id: 'd1', babyId: '1', type: 'diaper' as const, timestamp: new Date().toISOString(), diaperType: 'wet' as const,
    }])
    render(<Diaper />)
    expect(screen.getByText('Xixi')).toBeInTheDocument()
  })
})
