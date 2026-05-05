import { useCallback, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'
import { useBabyContext } from './BabyContext'
import { useRecords, type BabyRecord, type SleepRecord, type VaccineRecord } from './RecordsContext'
import { supabase } from '../lib/supabase'
import { ensurePhotoUrl } from '../lib/storage'
import type { User } from '@supabase/supabase-js'
import type { Baby } from './BabyContext'

function getTimestamp(record: BabyRecord): string {
  switch (record.type) {
    case 'sleep': return (record as SleepRecord).startTime
    case 'vaccine': return (record as VaccineRecord).date
    default: return record.timestamp
  }
}

export function useSync() {
  const { user } = useAuth()
  const { state, loadBabies, updateBaby } = useBabyContext()
  const { records, loadRecords } = useRecords()
  const channelRef = useRef<ReturnType<NonNullable<typeof supabase>['channel']> | null>(null)

  const pushToCloud = useCallback(async (u: User) => {
    if (!supabase) throw new Error('Supabase não configurado')

    const babiesWithUrls = await Promise.all(
      state.babies.map(async b => ({
        ...b,
        photo: await ensurePhotoUrl(b.id, b.photo),
      }))
    )

    babiesWithUrls.forEach(b => {
      if (b.photo !== state.babies.find(x => x.id === b.id)?.photo) {
        updateBaby(b)
      }
    })

    const { error: babyError } = await supabase.from('babies').upsert(
      babiesWithUrls.map(b => ({
        id: b.id,
        name: b.name,
        birth_date: b.birthDate,
        photo: b.photo,
        created_by: u.id,
      }))
    )
    if (babyError) throw babyError

    if (records.length === 0) return { babies: state.babies.length, records: 0 }

    const { error: recordError } = await supabase.from('records').upsert(
      records.map(r => ({
        id: r.id,
        baby_id: r.babyId,
        user_id: u.id,
        type: r.type,
        timestamp: getTimestamp(r),
        data: r,
      })),
      { onConflict: 'id' }
    )
    if (recordError) throw recordError

    return { babies: state.babies.length, records: records.length }
  }, [state.babies, records])

  const pullFromCloud = useCallback(async () => {
    if (!supabase) throw new Error('Supabase não configurado')

    const { data: cloudBabies, error: babyError } = await supabase
      .from('babies')
      .select('*')

    if (babyError) throw babyError

    const babies: Baby[] = (cloudBabies ?? []).map(b => ({
      id: b.id,
      name: b.name,
      birthDate: b.birth_date,
      createdAt: b.created_at,
    }))

    const babyIds = babies.map(b => b.id)
    if (babyIds.length === 0) {
      loadBabies([], null)
      loadRecords([])
      return { babies: 0, records: 0 }
    }

    const { data: cloudRecords, error: recordError } = await supabase
      .from('records')
      .select('*')
      .in('baby_id', babyIds)

    if (recordError) throw recordError

    const parsedRecords: BabyRecord[] = (cloudRecords ?? []).map(r => r.data as BabyRecord)
    const selectedId = babies.length > 0 ? babies[0].id : null

    loadBabies(babies, selectedId)
    loadRecords(parsedRecords)

    return { babies: babies.length, records: parsedRecords.length }
  }, [loadBabies, loadRecords])

  const subscribeToChanges = useCallback(() => {
    if (!supabase) return

    channelRef.current = supabase
      .channel('records-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'records' },
        async () => { pullFromCloud() }
      )
      .subscribe()
  }, [pullFromCloud])

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      supabase?.removeChannel(channelRef.current)
      channelRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!supabase || !user) {
      unsubscribe()
      return
    }

    pullFromCloud().catch(() => {})
    subscribeToChanges()

    return () => unsubscribe()
  }, [user?.id])

  return { pushToCloud, pullFromCloud, isConfigured: supabase !== null }
}
