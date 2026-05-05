import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'

export interface FeedingRecord {
  id: string
  babyId: string
  type: 'feeding'
  timestamp: string
  method: 'breast' | 'bottle'
  side?: 'left' | 'right' | 'both'
  duration?: number
  volume?: number
  notes?: string
}

export interface DiaperRecord {
  id: string
  babyId: string
  type: 'diaper'
  timestamp: string
  diaperType: 'wet' | 'dirty' | 'both'
  consistency?: 'normal' | 'soft' | 'liquid'
  notes?: string
}

export interface SleepRecord {
  id: string
  babyId: string
  type: 'sleep'
  startTime: string
  endTime?: string
  location?: string
  quality?: number
  notes?: string
}

export interface ActivityRecord {
  id: string
  babyId: string
  type: 'activity'
  timestamp: string
  activityType: 'tummy_time' | 'bath' | 'reading' | 'screen_time'
  duration?: number
  notes?: string
}

export interface GrowthRecord {
  id: string
  babyId: string
  type: 'growth'
  timestamp: string
  weight?: number
  height?: number
  headCircumference?: number
  notes?: string
}

export interface VaccineRecord {
  id: string
  babyId: string
  type: 'vaccine'
  vaccineName: string
  dose: string
  date: string
  lot?: string
  status: 'taken' | 'scheduled' | 'skipped'
  notes?: string
}

export interface MedicationRecord {
  id: string
  babyId: string
  type: 'medication'
  medicationName: string
  dose: string
  timestamp: string
  notes?: string
}

export interface FeverRecord {
  id: string
  babyId: string
  type: 'fever'
  timestamp: string
  temperature: number
  notes?: string
}

export interface AppointmentRecord {
  id: string
  babyId: string
  type: 'appointment'
  timestamp: string
  doctor: string
  specialty: string
  appointmentDate: string
  location?: string
  notes?: string
}

export type BabyRecord = FeedingRecord | DiaperRecord | SleepRecord | ActivityRecord | GrowthRecord | VaccineRecord | MedicationRecord | FeverRecord | AppointmentRecord

type RecordAction =
  | { type: 'ADD_RECORD'; payload: BabyRecord }
  | { type: 'UPDATE_RECORD'; payload: BabyRecord }
  | { type: 'DELETE_RECORD'; payload: string }
  | { type: 'LOAD_RECORDS'; payload: BabyRecord[] }

const STORAGE_KEY = 'baby-tracker-records'

function loadRecordsFromStorage(): BabyRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

function recordsReducer(state: BabyRecord[], action: RecordAction): BabyRecord[] {
  switch (action.type) {
    case 'ADD_RECORD':
      return [action.payload, ...state]
    case 'UPDATE_RECORD':
      return state.map(r => r.id === action.payload.id ? action.payload : r)
    case 'DELETE_RECORD':
      return state.filter(r => r.id !== action.payload)
    case 'LOAD_RECORDS':
      return action.payload
    default:
      return state
  }
}

interface RecordsContextType {
  records: BabyRecord[]
  addRecord: (record: BabyRecord) => void
  updateRecord: (record: BabyRecord) => void
  deleteRecord: (id: string) => void
  loadRecords: (records: BabyRecord[]) => void
}

const RecordsContext = createContext<RecordsContextType | null>(null)

export function RecordsProvider({ children }: { children: ReactNode }) {
  const [records, dispatch] = useReducer(recordsReducer, null, loadRecordsFromStorage)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)) }
    catch { /* ignore */ }
  }, [records])

  const addRecord = (record: BabyRecord) => dispatch({ type: 'ADD_RECORD', payload: record })
  const updateRecord = (record: BabyRecord) => dispatch({ type: 'UPDATE_RECORD', payload: record })
  const deleteRecord = (id: string) => dispatch({ type: 'DELETE_RECORD', payload: id })
  const loadRecords = (newRecords: BabyRecord[]) => dispatch({ type: 'LOAD_RECORDS', payload: newRecords })

  return (
    <RecordsContext.Provider value={{ records, addRecord, updateRecord, deleteRecord, loadRecords }}>
      {children}
    </RecordsContext.Provider>
  )
}

export function useRecords() {
  const ctx = useContext(RecordsContext)
  if (!ctx) throw new Error('useRecords must be used within RecordsProvider')
  return ctx
}

export function getBabyRecords<T extends BabyRecord>(records: BabyRecord[], babyId: string, type: T['type']): T[] {
  return records.filter(r => r.babyId === babyId && r.type === type) as T[]
}

export function getActiveSleep(records: BabyRecord[], babyId: string): SleepRecord | undefined {
  return records.find(r => r.babyId === babyId && r.type === 'sleep' && !(r as SleepRecord).endTime) as SleepRecord | undefined
}
