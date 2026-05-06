import { lazy, useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import ToastContainer from './components/ui/ToastContainer'
import ErrorBoundary from './components/ui/ErrorBoundary'
import DisclaimerModal from './components/ui/DisclaimerModal'
import { useToast } from './context/ToastContext'
import Dashboard from './pages/Dashboard'
import Babies from './pages/Babies'
import Feeding from './pages/Feeding'
import Diaper from './pages/Diaper'
import Sleep from './pages/Sleep'
import Activities from './pages/Activities'
import Appointments from './pages/Appointments'
import Backup from './pages/Backup'
import Timeline from './pages/Timeline'
import Babysitter from './pages/Babysitter'
import Diary from './pages/Diary'
import Login from './pages/Login'
import Profile from './pages/Profile'

const Growth = lazy(() => import('./pages/Growth'))
const Health = lazy(() => import('./pages/Health'))
const Reports = lazy(() => import('./pages/Reports'))

export default function App() {
  const { showToast } = useToast()

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        showToast('🆕 App atualizado para nova versão!', 'success')
      })
    }
  }, [])

  return (
    <>
      <ToastContainer />
      <DisclaimerModal />
      <ErrorBoundary>
        <HashRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/babies" element={<Babies />} />
              <Route path="/feed" element={<Feeding />} />
              <Route path="/diaper" element={<Diaper />} />
              <Route path="/sleep" element={<Sleep />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="/growth" element={<Growth />} />
              <Route path="/health" element={<Health />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/backup" element={<Backup />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/babysitter" element={<Babysitter />} />
              <Route path="/diary" element={<Diary />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </HashRouter>
      </ErrorBoundary>
    </>
  )
}
