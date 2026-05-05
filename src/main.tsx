import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { BabyProvider } from './context/BabyContext'
import { RecordsProvider } from './context/RecordsContext'
import { AuthProvider } from './context/AuthContext'
import './styles/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BabyProvider>
        <RecordsProvider>
          <App />
        </RecordsProvider>
      </BabyProvider>
    </AuthProvider>
  </StrictMode>,
)
