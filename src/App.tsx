import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import Dashboard from './pages/Dashboard'
import Babies from './pages/Babies'
import Feeding from './pages/Feeding'
import Diaper from './pages/Diaper'
import Sleep from './pages/Sleep'
import Activities from './pages/Activities'
import Growth from './pages/Growth'
import Health from './pages/Health'
import Reports from './pages/Reports'
import Appointments from './pages/Appointments'
import Login from './pages/Login'
import Profile from './pages/Profile'

export default function App() {
  return (
    <BrowserRouter>
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
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
