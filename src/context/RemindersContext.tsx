import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react'

export interface Reminder {
  id: string
  babyId: string
  type: 'feeding' | 'diaper' | 'vaccine' | 'custom'
  title: string
  hour: number
  minute: number
  days: number[]
  active: boolean
}

type ReminderAction =
  | { type: 'ADD'; payload: Reminder }
  | { type: 'UPDATE'; payload: Reminder }
  | { type: 'DELETE'; payload: string }

const STORAGE_KEY = 'baby-tracker-reminders'

function loadReminders(): Reminder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

function saveReminders(r: Reminder[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(r)) } catch { /* ignore */ }
}

function reducer(state: Reminder[], action: ReminderAction): Reminder[] {
  switch (action.type) {
    case 'ADD': return [...state, action.payload]
    case 'UPDATE': return state.map(r => r.id === action.payload.id ? action.payload : r)
    case 'DELETE': return state.filter(r => r.id !== action.payload)
    default: return state
  }
}

interface RemindersContextType {
  reminders: Reminder[]
  addReminder: (r: Reminder) => void
  updateReminder: (r: Reminder) => void
  deleteReminder: (id: string) => void
}

const RemindersContext = createContext<RemindersContextType | null>(null)

export function RemindersProvider({ children }: { children: ReactNode }) {
  const [reminders, dispatch] = useReducer(reducer, null, loadReminders)

  useEffect(() => { saveReminders(reminders) }, [reminders])

  const addReminder = useCallback((r: Reminder) => dispatch({ type: 'ADD', payload: r }), [])
  const updateReminder = useCallback((r: Reminder) => dispatch({ type: 'UPDATE', payload: r }), [])
  const deleteReminder = useCallback((id: string) => dispatch({ type: 'DELETE', payload: id }), [])

  return (
    <RemindersContext.Provider value={{ reminders, addReminder, updateReminder, deleteReminder }}>
      {children}
    </RemindersContext.Provider>
  )
}

export function useReminders() {
  const ctx = useContext(RemindersContext)
  if (!ctx) throw new Error('useReminders must be used within RemindersProvider')
  return ctx
}
