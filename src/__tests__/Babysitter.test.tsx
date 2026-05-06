import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useBabyContext } from '../context/BabyContext'
import { useRecords, getBabyRecords } from '../context/RecordsContext'
import { useToast } from '../context/ToastContext'
import Babysitter from '../pages/Babysitter'
import { useNavigate } from 'react-router-dom'

vi.mock('../context/BabyContext')
vi.mock('../context/RecordsContext')
vi.mock('../context/ToastContext')
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}))

const mockAddRecord = vi.fn()
const mockUpdateRecord = vi.fn()
const mockShowToast = vi.fn()
const mockNavigate = vi.fn()

function setup() {
  vi.mocked(useBabyContext).mockReturnValue({
    state: { babies: [{ id: '1', name: 'Maria', birthDate: '2024-01-01' }], selectedBabyId: '1', deletedIds: [] },
    selectedBaby: { id: '1', name: 'Maria', birthDate: '2024-01-01' },
    addBaby: vi.fn(), selectBaby: vi.fn(), removeBaby: vi.fn(), updateBaby: vi.fn(), loadBabies: vi.fn(), clearDeletedIds: vi.fn(),
  })
  vi.mocked(getBabyRecords).mockReturnValue([])
  vi.mocked(useRecords).mockReturnValue({
    records: [], addRecord: mockAddRecord, updateRecord: mockUpdateRecord, deleteRecord: vi.fn(),
    loadRecords: vi.fn(), deleteRecordsByBaby: vi.fn(),
  })
  vi.mocked(useToast).mockReturnValue({ toasts: [], showToast: mockShowToast })
  vi.mocked(useNavigate).mockReturnValue(mockNavigate)
}

describe('Babysitter', () => {
  beforeEach(() => { vi.clearAllMocks(); setup() })

  it('shows empty state when no baby', () => {
    vi.mocked(useBabyContext).mockReturnValue({
      state: { babies: [], selectedBabyId: null, deletedIds: [] }, selectedBaby: null,
      addBaby: vi.fn(), selectBaby: vi.fn(), removeBaby: vi.fn(), updateBaby: vi.fn(), loadBabies: vi.fn(), clearDeletedIds: vi.fn(),
    })
    render(<Babysitter />)
    expect(screen.getByText(/Modo Babá/)).toBeInTheDocument()
  })

  it('renders baby name', () => {
    render(<Babysitter />)
    expect(screen.getByText('Maria')).toBeInTheDocument()
  })

  it('renders all action buttons', () => {
    render(<Babysitter />)
    expect(screen.getByText('⬅️')).toBeInTheDocument()
    expect(screen.getByText('➡️')).toBeInTheDocument()
    expect(screen.getByText('🍼')).toBeInTheDocument()
    expect(screen.getByText('😴')).toBeInTheDocument()
    expect(screen.getByText('💦')).toBeInTheDocument()
    expect(screen.getByText('💩')).toBeInTheDocument()
  })

  it('registers left breast feeding', () => {
    render(<Babysitter />)
    fireEvent.click(screen.getByText('⬅️'))
    expect(mockAddRecord).toHaveBeenCalledTimes(1)
    expect(mockAddRecord.mock.calls[0][0].side).toBe('left')
  })

  it('registers right breast feeding', () => {
    render(<Babysitter />)
    fireEvent.click(screen.getByText('➡️'))
    expect(mockAddRecord).toHaveBeenCalledTimes(1)
    expect(mockAddRecord.mock.calls[0][0].side).toBe('right')
  })

  it('starts sleep', () => {
    render(<Babysitter />)
    fireEvent.click(screen.getByText('😴'))
    const record = mockAddRecord.mock.calls[0][0]
    expect(record.type).toBe('sleep')
    expect(record.endTime).toBeUndefined()
  })

  it('has a navigate back button', () => {
    render(<Babysitter />)
    fireEvent.click(screen.getByText('Sair'))
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })
})
