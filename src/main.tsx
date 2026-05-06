import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { RemindersProvider } from './context/RemindersContext'
import { AuthProvider } from './context/AuthContext'
import { BabyProvider } from './context/BabyContext'
import { RecordsProvider } from './context/RecordsContext'
import './styles/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <RemindersProvider>
          <AuthProvider>
          <BabyProvider>
            <RecordsProvider>
              <App />
            </RecordsProvider>
          </BabyProvider>
          </AuthProvider>
        </RemindersProvider>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
)
