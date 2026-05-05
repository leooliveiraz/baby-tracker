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
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
