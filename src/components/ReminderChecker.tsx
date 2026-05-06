import { useEffect, useRef } from 'react'
import { useReminders } from '../context/RemindersContext'
import { useBabyContext } from '../context/BabyContext'

export default function ReminderChecker() {
  const { reminders } = useReminders()
  const { state } = useBabyContext()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!('Notification' in window)) return
    if (Notification.permission !== 'granted') return

    intervalRef.current = setInterval(() => {
      const now = new Date()
      const currentMin = now.getHours() * 60 + now.getMinutes()
      const today = now.getDay()

      for (const r of reminders) {
        if (!r.active) continue
        if (!r.days.includes(today)) continue
        const remindMin = r.hour * 60 + r.minute
        if (remindMin !== currentMin) continue

        const baby = state.babies.find(b => b.id === r.babyId)
        const babyName = baby?.name ?? 'Bebê'

        try {
          new Notification('🍼 Baby Tracker', {
            body: `${r.title} — ${babyName}`,
            icon: '/baby-tracker/pwa-192x192.png',
            tag: r.id,
          })
        } catch { /* ignore */ }
      }
    }, 30000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [reminders, state.babies])

  return null
}
