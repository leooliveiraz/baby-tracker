import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useBabyContext } from '../context/BabyContext'
import { useRecords, getBabyRecords } from '../context/RecordsContext'
import { useToast } from '../context/ToastContext'
import Appointments from '../pages/Appointments'

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

describe('Appointments', () => {
  beforeEach(() => { vi.clearAllMocks(); setup() })

  it('shows empty state when no baby', () => {
    vi.mocked(useBabyContext).mockReturnValue({
      state: { babies: [], selectedBabyId: null, deletedIds: [] }, selectedBaby: null,
      addBaby: vi.fn(), selectBaby: vi.fn(), removeBaby: vi.fn(), updateBaby: vi.fn(), loadBabies: vi.fn(), clearDeletedIds: vi.fn(),
    })
    render(<Appointments />)
    expect(screen.getByText(/cadastre e selecione/i)).toBeInTheDocument()
  })

  it('shows empty state when no appointments', () => {
    render(<Appointments />)
    expect(screen.getByText(/nenhuma consulta registrada/i)).toBeInTheDocument()
  })

  it('renders add button', () => {
    render(<Appointments />)
    expect(screen.getByText('+ Nova')).toBeInTheDocument()
  })

  it('opens form on click', () => {
    render(<Appointments />)
    fireEvent.click(screen.getByText('+ Nova'))
    expect(screen.getByPlaceholderText('Nome do médico')).toBeInTheDocument()
  })

  it('shows specialty select', () => {
    render(<Appointments />)
    fireEvent.click(screen.getByText('+ Nova'))
    expect(screen.getByText('Pediatra')).toBeInTheDocument()
    expect(screen.getByText('Neonatologista')).toBeInTheDocument()
  })

  it('creates an appointment', async () => {
    render(<Appointments />)
    fireEvent.click(screen.getByText('+ Nova'))

    await userEvent.type(screen.getByPlaceholderText('Nome do médico'), 'Dr. João')

    // Set date on the first date input in the form
    const allInputs = screen.getAllByRole('textbox')
    const inputs = document.querySelectorAll('input[type="date"]')
    if (inputs.length > 0) fireEvent.change(inputs[0], { target: { value: '2026-06-01' } })

    fireEvent.click(screen.getByText('Salvar'))

    expect(mockAddRecord).toHaveBeenCalledTimes(1)
    const r = mockAddRecord.mock.calls[0][0]
    expect(r.type).toBe('appointment')
    expect(r.doctor).toBe('Dr. João')
  })

  it('shows upcoming appointments', () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString()
    vi.mocked(getBabyRecords).mockReturnValue([{
      id: 'a1', babyId: '1', type: 'appointment' as const,
      timestamp: futureDate, doctor: 'Dr. João', specialty: 'Pediatra',
      appointmentDate: futureDate,
    }])
    render(<Appointments />)
    expect(screen.getByText('🟢 Próximas (1)')).toBeInTheDocument()
  })

  it('shows past appointments', () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString()
    vi.mocked(getBabyRecords).mockReturnValue([{
      id: 'a2', babyId: '1', type: 'appointment' as const,
      timestamp: pastDate, doctor: 'Dr. Pedro', specialty: 'Neurologista',
      appointmentDate: pastDate,
    }])
    render(<Appointments />)
    expect(screen.getByText('⚪ Realizadas (1)')).toBeInTheDocument()
  })

  it('deletes an appointment', () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString()
    vi.mocked(getBabyRecords).mockReturnValue([{
      id: 'a1', babyId: '1', type: 'appointment' as const,
      timestamp: futureDate, doctor: 'Dr. João', specialty: 'Pediatra',
      appointmentDate: futureDate, location: 'Hospital',
    }])
    render(<Appointments />)
    window.confirm = vi.fn(() => true)
    const deleteButtons = screen.getAllByText('✕')
    fireEvent.click(deleteButtons[0])
    expect(mockDeleteRecord).toHaveBeenCalledWith('a1')
  })
})
