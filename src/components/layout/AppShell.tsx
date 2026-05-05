import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'
import BabyFormModal from '../../pages/BabyFormModal'

export default function AppShell() {
  const [showAddBaby, setShowAddBaby] = useState(false)

  return (
    <>
      <Header onAddBaby={() => setShowAddBaby(true)} />
      <main className="main-content">
        <Outlet />
      </main>
      <BottomNav />
      {showAddBaby && <BabyFormModal onClose={() => setShowAddBaby(false)} />}
    </>
  )
}
