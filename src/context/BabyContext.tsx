import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'

export interface Baby {
  id: string
  name: string
  birthDate: string
  createdAt: string
  photo?: string
  motherName?: string
  fatherName?: string
}

interface BabyState {
  babies: Baby[]
  selectedBabyId: string | null
}

type BabyAction =
  | { type: 'ADD_BABY'; payload: Baby }
  | { type: 'SELECT_BABY'; payload: string }
  | { type: 'REMOVE_BABY'; payload: string }
  | { type: 'UPDATE_BABY'; payload: Baby }
  | { type: 'LOAD_BABIES'; payload: { babies: Baby[]; selectedBabyId: string | null } }

const STORAGE_KEY = 'baby-tracker-state'

function loadState(): BabyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { babies: [], selectedBabyId: null }
}

function saveState(state: BabyState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* ignore */ }
}

function babyReducer(state: BabyState, action: BabyAction): BabyState {
  switch (action.type) {
    case 'ADD_BABY':
      return { ...state, babies: [...state.babies, action.payload] }
    case 'SELECT_BABY':
      return { ...state, selectedBabyId: action.payload }
    case 'REMOVE_BABY':
      return {
        ...state,
        babies: state.babies.filter(b => b.id !== action.payload),
        selectedBabyId: state.selectedBabyId === action.payload ? null : state.selectedBabyId,
      }
    case 'UPDATE_BABY':
      return {
        ...state,
        babies: state.babies.map(b => b.id === action.payload.id ? action.payload : b),
      }
    case 'LOAD_BABIES':
      return action.payload
    default:
      return state
  }
}

interface BabyContextType {
  state: BabyState
  addBaby: (id: string, name: string, birthDate: string, photo?: string, motherName?: string, fatherName?: string) => void
  selectBaby: (id: string) => void
  removeBaby: (id: string) => void
  updateBaby: (baby: Baby) => void
  loadBabies: (babies: Baby[], selectedBabyId: string | null) => void
  selectedBaby: Baby | null
}

const BabyContext = createContext<BabyContextType | null>(null)

export function BabyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(babyReducer, null, loadState)

  useEffect(() => { saveState(state) }, [state])

  const addBaby = (id: string, name: string, birthDate: string, photo?: string, motherName?: string, fatherName?: string) => {
    const baby: Baby = {
      id,
      name,
      birthDate,
      createdAt: new Date().toISOString(),
      photo,
      motherName,
      fatherName,
    }
    dispatch({ type: 'ADD_BABY', payload: baby })
    dispatch({ type: 'SELECT_BABY', payload: baby.id })
  }

  const selectBaby = (id: string) => dispatch({ type: 'SELECT_BABY', payload: id })
  const removeBaby = (id: string) => dispatch({ type: 'REMOVE_BABY', payload: id })
  const updateBaby = (baby: Baby) => dispatch({ type: 'UPDATE_BABY', payload: baby })
  const loadBabies = (babies: Baby[], selectedBabyId: string | null) =>
    dispatch({ type: 'LOAD_BABIES', payload: { babies, selectedBabyId } })

  const selectedBaby = state.babies.find(b => b.id === state.selectedBabyId) ?? null

  return (
    <BabyContext.Provider value={{ state, addBaby, selectBaby, removeBaby, updateBaby, loadBabies, selectedBaby }}>
      {children}
    </BabyContext.Provider>
  )
}

export function useBabyContext() {
  const ctx = useContext(BabyContext)
  if (!ctx) throw new Error('useBabyContext must be used within BabyProvider')
  return ctx
}
