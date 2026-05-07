import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useBabyContext } from '../context/BabyContext'
import { useRecords, getBabyRecords } from '../context/RecordsContext'
import { useToast } from '../context/ToastContext'
import Health from '../pages/Health'

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

describe('Health', () => {
  beforeEach(() => { vi.clearAllMocks(); setup() })

  it('shows empty state when no baby', () => {
    vi.mocked(useBabyContext).mockReturnValue({
      state: { babies: [], selectedBabyId: null, deletedIds: [] }, selectedBaby: null,
      addBaby: vi.fn(), selectBaby: vi.fn(), removeBaby: vi.fn(), updateBaby: vi.fn(), loadBabies: vi.fn(), clearDeletedIds: vi.fn(),
    })
    render(<Health />)
    expect(screen.getByText(/cadastre e selecione/i)).toBeInTheDocument()
  })

  it('renders tab buttons', () => {
    render(<Health />)
    expect(screen.getByText('💉 Vacinas')).toBeInTheDocument()
    expect(screen.getByText('💊 Medicações')).toBeInTheDocument()
    expect(screen.getByText('🌡 Febre')).toBeInTheDocument()
  })

  it('shows vaccine schedule by default', () => {
    render(<Health />)
    expect(screen.getByText('Calendário de Vacinação')).toBeInTheDocument()
    expect(screen.getByText('BCG')).toBeInTheDocument()
    expect(screen.getByText('Hepatite B')).toBeInTheDocument()
  })

  it('shows multiple vaccines in schedule', () => {
    render(<Health />)
    expect(screen.getByText('BCG')).toBeInTheDocument()
    expect(screen.getByText('Hepatite B')).toBeInTheDocument()
    const unicaElements = screen.getAllByText('Única')
    expect(unicaElements.length).toBeGreaterThanOrEqual(3)
  })

  it('switches to medications tab', () => {
    render(<Health />)
    fireEvent.click(screen.getByText('💊 Medicações'))
    expect(screen.getByPlaceholderText('Medicamento')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Dose')).toBeInTheDocument()
  })

  it('registers a medication', async () => {
    render(<Health />)
    fireEvent.click(screen.getByText('💊 Medicações'))

    await userEvent.type(screen.getByPlaceholderText('Medicamento'), 'Dipirona')
    await userEvent.type(screen.getByPlaceholderText('Dose'), '5ml')

    fireEvent.click(screen.getByText('Salvar'))

    expect(mockAddRecord).toHaveBeenCalledTimes(1)
    const r = mockAddRecord.mock.calls[0][0]
    expect(r.type).toBe('medication')
    expect(r.medicationName).toBe('Dipirona')
    expect(r.dose).toBe('5ml')
  })

  it('switches to fever tab', () => {
    render(<Health />)
    fireEvent.click(screen.getByText('🌡 Febre'))
    expect(screen.getByPlaceholderText('Temperatura (°C)')).toBeInTheDocument()
  })

  it('registers a fever', async () => {
    render(<Health />)
    fireEvent.click(screen.getByText('🌡 Febre'))

    const tempInput = screen.getByPlaceholderText('Temperatura (°C)')
    await userEvent.type(tempInput, '38.5')

    fireEvent.click(screen.getByText('Salvar'))

    expect(mockAddRecord).toHaveBeenCalledTimes(1)
    const r = mockAddRecord.mock.calls[0][0]
    expect(r.type).toBe('fever')
    expect(r.temperature).toBe(38.5)
  })

  it('marks vaccine as taken', () => {
    render(<Health />)
    const takenButtons = screen.getAllByText('Tomar')
    fireEvent.click(takenButtons[0])

    expect(mockAddRecord).toHaveBeenCalledTimes(1)
    const r = mockAddRecord.mock.calls[0][0]
    expect(r.type).toBe('vaccine')
    expect(r.status).toBe('taken')
  })

  it('shows medication history list', () => {
    vi.mocked(getBabyRecords).mockReturnValue([{
      id: 'm1', babyId: '1', type: 'medication' as const,
      timestamp: '2026-05-06T10:00:00', medicationName: 'Dipirona', dose: '5ml',
    }])
    render(<Health />)
    fireEvent.click(screen.getByText('💊 Medicações'))
    expect(screen.getByText('Dipirona - 5ml')).toBeInTheDocument()
  })

  it('deletes a medication', () => {
    vi.mocked(getBabyRecords).mockReturnValue([{
      id: 'm1', babyId: '1', type: 'medication' as const,
      timestamp: '2026-05-06T10:00:00', medicationName: 'Dipirona', dose: '5ml',
    }])
    render(<Health />)
    fireEvent.click(screen.getByText('💊 Medicações'))

    window.confirm = vi.fn(() => true)
    fireEvent.click(screen.getByText('✕'))

    expect(mockDeleteRecord).toHaveBeenCalledWith('m1')
  })
})
