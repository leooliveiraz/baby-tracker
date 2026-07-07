import { lazy, Suspense, useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import ToastContainer from './components/ui/ToastContainer'
import ErrorBoundary from './components/ui/ErrorBoundary'
import DisclaimerModal from './components/ui/DisclaimerModal'
import ReminderChecker from './components/ReminderChecker'
import { useToast } from './context/ToastContext'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Babies = lazy(() => import('./pages/Babies'))
const Feeding = lazy(() => import('./pages/Feeding'))
const Diaper = lazy(() => import('./pages/Diaper'))
const Sleep = lazy(() => import('./pages/Sleep'))
const Activities = lazy(() => import('./pages/Activities'))
const Growth = lazy(() => import('./pages/Growth'))
const Health = lazy(() => import('./pages/Health'))
const Appointments = lazy(() => import('./pages/Appointments'))
const Backup = lazy(() => import('./pages/Backup'))
const Timeline = lazy(() => import('./pages/Timeline'))
const Babysitter = lazy(() => import('./pages/Babysitter'))
const Diary = lazy(() => import('./pages/Diary'))
const Reminders = lazy(() => import('./pages/Reminders'))
const Milestones = lazy(() => import('./pages/Milestones'))
const Login = lazy(() => import('./pages/Login'))
const Profile = lazy(() => import('./pages/Profile'))
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
      <ReminderChecker />
      <ErrorBoundary>
        <HashRouter>
          <Suspense fallback={null}>
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
                <Route path="/reminders" element={<Reminders />} />
                <Route path="/milestones" element={<Milestones />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Routes>
          </Suspense>
        </HashRouter>
      </ErrorBoundary>
    </>
  )
}
