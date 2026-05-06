import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { BabyProvider } from './context/BabyContext'
import { RecordsProvider } from './context/RecordsContext'
import './styles/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BabyProvider>
          <RecordsProvider>
            <App />
          </RecordsProvider>
        </BabyProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
