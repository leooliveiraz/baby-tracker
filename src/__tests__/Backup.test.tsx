import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useBabyContext } from '../context/BabyContext'
import { useRecords } from '../context/RecordsContext'
import { useToast } from '../context/ToastContext'
import Backup from '../pages/Backup'

vi.mock('../context/BabyContext')
vi.mock('../context/RecordsContext')
vi.mock('../context/ToastContext')

const mockShowToast = vi.fn()

function setup() {
  vi.mocked(useBabyContext).mockReturnValue({
    state: { babies: [{ id: '1', name: 'Maria', birthDate: '2024-01-01' }], selectedBabyId: '1', deletedIds: [] },
    selectedBaby: { id: '1', name: 'Maria', birthDate: '2024-01-01' },
    addBaby: vi.fn(), selectBaby: vi.fn(), removeBaby: vi.fn(), updateBaby: vi.fn(), loadBabies: vi.fn(), clearDeletedIds: vi.fn(),
  })
  vi.mocked(useRecords).mockReturnValue({
    records: [], addRecord: vi.fn(), updateRecord: vi.fn(), deleteRecord: vi.fn(),
    loadRecords: vi.fn(), deleteRecordsByBaby: vi.fn(),
  })
  vi.mocked(useToast).mockReturnValue({ toasts: [], showToast: mockShowToast })
}

describe('Backup', () => {
  beforeEach(() => { vi.clearAllMocks(); setup() })

  it('renders export button', () => {
    render(<Backup />)
    expect(screen.getByText('📦 Exportar Backup')).toBeInTheDocument()
  })

  it('renders import button', () => {
    render(<Backup />)
    expect(screen.getByText('📂 Selecionar Arquivo')).toBeInTheDocument()
  })

  it('shows baby count in status', () => {
    render(<Backup />)
    expect(screen.getByText(/👶 Bebês: 1/)).toBeInTheDocument()
  })

  it('shows record count in status', () => {
    render(<Backup />)
    expect(screen.getByText(/📝 Registros: 0/)).toBeInTheDocument()
  })

  it('triggers export on button click', () => {
    const createSpy = vi.spyOn(document, 'createElement')
    render(<Backup />)
    fireEvent.click(screen.getByText('📦 Exportar Backup'))
    expect(createSpy).toHaveBeenCalledWith('a')
    createSpy.mockRestore()
  })
})
