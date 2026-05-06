import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useBabyContext } from '../context/BabyContext'
import { useRecords, getBabyRecords } from '../context/RecordsContext'
import { useToast } from '../context/ToastContext'
import Sleep from '../pages/Sleep'

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

describe('Sleep', () => {
  beforeEach(() => { vi.clearAllMocks(); setup() })

  it('shows empty state when no baby', () => {
    vi.mocked(useBabyContext).mockReturnValue({
      state: { babies: [], selectedBabyId: null, deletedIds: [] }, selectedBaby: null,
      addBaby: vi.fn(), selectBaby: vi.fn(), removeBaby: vi.fn(), updateBaby: vi.fn(), loadBabies: vi.fn(), clearDeletedIds: vi.fn(),
    })
    render(<Sleep />)
    expect(screen.getByText(/cadastre e selecione/i)).toBeInTheDocument()
  })

  it('shows start sleep button when no active sleep', () => {
    render(<Sleep />)
    expect(screen.getByText('😴 Iniciar Sono')).toBeInTheDocument()
  })

  it('starts sleep on click', () => {
    render(<Sleep />)
    fireEvent.click(screen.getByText('😴 Iniciar Sono'))
    expect(mockAddRecord).toHaveBeenCalledTimes(1)
    expect(mockAddRecord.mock.calls[0][0].type).toBe('sleep')
    expect(mockAddRecord.mock.calls[0][0].endTime).toBeUndefined()
  })

  it('shows stop button when active sleep exists', () => {
    const start = new Date(Date.now() - 3600000).toISOString()
    vi.mocked(getBabyRecords).mockReturnValue([{
      id: 's1', babyId: '1', type: 'sleep' as const, startTime: start,
    }])
    render(<Sleep />)
    expect(screen.getByText('⏹ Acordou!')).toBeInTheDocument()
  })

  it('stops sleep and shows toast', () => {
    const start = new Date(Date.now() - 3600000).toISOString()
    vi.mocked(getBabyRecords).mockReturnValue([{
      id: 's1', babyId: '1', type: 'sleep' as const, startTime: start,
    }])
    render(<Sleep />)
    fireEvent.click(screen.getByText('⏹ Acordou!'))
    expect(mockUpdateRecord).toHaveBeenCalledTimes(1)
    expect(mockUpdateRecord.mock.calls[0][0].endTime).toBeDefined()
  })

  it('shows manual entry form', () => {
    render(<Sleep />)
    fireEvent.click(screen.getByText('📝 Registrar Manual'))
    expect(screen.getByText(/^Início$/)).toBeInTheDocument()
    expect(screen.getByText(/^Fim$/)).toBeInTheDocument()
  })

  it('deletes a sleep record', () => {
    vi.mocked(getBabyRecords).mockReturnValue([{
      id: 's1', babyId: '1', type: 'sleep' as const, startTime: new Date().toISOString(), endTime: new Date().toISOString(),
    }])
    render(<Sleep />)
    window.confirm = vi.fn(() => true)
    fireEvent.click(screen.getAllByText('✕')[0])
    expect(mockDeleteRecord).toHaveBeenCalledWith('s1')
  })
})
