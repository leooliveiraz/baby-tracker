import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useBabyContext } from '../context/BabyContext'
import { useRecords, getBabyRecords, type DiaryRecord } from '../context/RecordsContext'
import { useToast } from '../context/ToastContext'
import Diary from '../pages/Diary'

vi.mock('../context/BabyContext')
vi.mock('../context/RecordsContext')
vi.mock('../context/ToastContext')

const mockAddRecord = vi.fn()
const mockUpdateRecord = vi.fn()
const mockDeleteRecord = vi.fn()
const mockShowToast = vi.fn()

function setupRecords(diaryRecords: DiaryRecord[]) {
  vi.mocked(getBabyRecords).mockReturnValue(diaryRecords)
  vi.mocked(useRecords).mockReturnValue({
    records: diaryRecords,
    addRecord: mockAddRecord,
    updateRecord: mockUpdateRecord,
    deleteRecord: mockDeleteRecord,
    loadRecords: vi.fn(),
    deleteRecordsByBaby: vi.fn(),
  })
}

function setupBaby(babies: { id: string; name: string; birthDate: string }[], selectedId: string | null) {
  vi.mocked(useBabyContext).mockReturnValue({
    state: { babies, selectedBabyId: selectedId, deletedIds: [] },
    selectedBaby: babies.find(b => b.id === selectedId) ?? null,
    addBaby: vi.fn(),
    selectBaby: vi.fn(),
    removeBaby: vi.fn(),
    updateBaby: vi.fn(),
    loadBabies: vi.fn(),
    clearDeletedIds: vi.fn(),
  })
}

function renderDiary() {
  vi.mocked(useToast).mockReturnValue({
    toasts: [],
    showToast: mockShowToast,
  })
  return render(<Diary />)
}

describe('Diary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows empty state when no baby is selected', () => {
    setupBaby([], null)
    setupRecords([])
    renderDiary()
    expect(screen.getByText(/cadastre e selecione um bebê/i)).toBeInTheDocument()
  })

  it('shows empty state when no diary entries exist', () => {
    setupBaby([{ id: '1', name: 'Maria', birthDate: '2024-01-01' }], '1')
    setupRecords([])
    renderDiary()
    expect(screen.getByText(/nenhum registro no diário/i)).toBeInTheDocument()
  })

  it('renders the form with date and textarea', () => {
    setupBaby([{ id: '1', name: 'Maria', birthDate: '2024-01-01' }], '1')
    setupRecords([])
    renderDiary()
    expect(screen.getByPlaceholderText(/como foi o dia/i)).toBeInTheDocument()
    expect(screen.getByText('💾 Salvar')).toBeInTheDocument()
  })

  it('creates a new diary entry', async () => {
    setupBaby([{ id: '1', name: 'Maria', birthDate: '2024-01-01' }], '1')
    setupRecords([])
    renderDiary()

    const textarea = screen.getByPlaceholderText(/como foi o dia/i)
    await userEvent.type(textarea, 'Hoje o bebê chorou muito!')

    fireEvent.click(screen.getByText('💾 Salvar'))

    expect(mockAddRecord).toHaveBeenCalledTimes(1)
    const record = mockAddRecord.mock.calls[0][0]
    expect(record.type).toBe('diary')
    expect(record.babyId).toBe('1')
    expect(record.content).toBe('Hoje o bebê chorou muito!')
    expect(mockShowToast).toHaveBeenCalledWith('📖 Registrado no diário!', 'success')
  })

  it('updates existing entry for the same day', async () => {
    const existingId = 'diary-1'
    const today = new Date().toISOString().split('T')[0]
    setupBaby([{ id: '1', name: 'Maria', birthDate: '2024-01-01' }], '1')
    setupRecords([{
      id: existingId,
      babyId: '1',
      type: 'diary',
      timestamp: '2026-05-06T10:00:00',
      date: today,
      content: 'Nota antiga',
    }])
    renderDiary()

    const textarea = screen.getByPlaceholderText(/como foi o dia/i)
    await userEvent.clear(textarea)
    await userEvent.type(textarea, 'Nota atualizada')

    fireEvent.click(screen.getByText('✏️ Atualizar'))

    expect(mockUpdateRecord).toHaveBeenCalledTimes(1)
    expect(mockUpdateRecord).toHaveBeenCalledWith(
      expect.objectContaining({ id: existingId, content: 'Nota atualizada' })
    )
    expect(mockShowToast).toHaveBeenCalledWith('✏️ Diário atualizado!', 'success')
  })

  it('shows previous entries grouped by date', () => {
    setupBaby([{ id: '1', name: 'Maria', birthDate: '2024-01-01' }], '1')
    setupRecords([
      { id: 'd1', babyId: '1', type: 'diary', timestamp: '', date: '2026-05-05', content: 'Nota de ontem' },
      { id: 'd2', babyId: '1', type: 'diary', timestamp: '', date: '2026-05-04', content: 'Nota de anteontem' },
    ])
    renderDiary()

    expect(screen.getByText('Nota de ontem')).toBeInTheDocument()
    expect(screen.getByText('Nota de anteontem')).toBeInTheDocument()
  })

  it('deletes a diary entry', () => {
    setupBaby([{ id: '1', name: 'Maria', birthDate: '2024-01-01' }], '1')
    setupRecords([{
      id: 'delete-me',
      babyId: '1',
      type: 'diary',
      timestamp: '',
      date: '2026-05-01',
      content: 'Nota para deletar',
    }])
    renderDiary()

    const deleteButtons = screen.getAllByText('🗑 Excluir')
    expect(deleteButtons.length).toBeGreaterThan(0)

    window.confirm = vi.fn(() => true)
    fireEvent.click(deleteButtons[0])

    expect(mockDeleteRecord).toHaveBeenCalledWith('delete-me')
    expect(mockShowToast).toHaveBeenCalledWith('Removido!', 'success')
  })
})
