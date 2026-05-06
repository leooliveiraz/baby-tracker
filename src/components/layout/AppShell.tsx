import { useState, Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'
import BabyFormModal from '../../pages/BabyFormModal'
import Spinner from '../ui/Spinner'

export default function AppShell() {
  const [showAddBaby, setShowAddBaby] = useState(false)

  return (
    <>
      <Header onAddBaby={() => setShowAddBaby(true)} />
      <main className="main-content">
        <Suspense fallback={<Spinner size={40} fullPage />}>
          <Outlet />
        </Suspense>
      </main>
      <BottomNav />
      {showAddBaby && <BabyFormModal onClose={() => setShowAddBaby(false)} />}
    </>
  )
}
