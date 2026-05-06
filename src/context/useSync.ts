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
  const { state, loadBabies, updateBaby, clearDeletedIds } = useBabyContext()
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

    const localBabyIds = new Set(state.babies.map(b => b.id))
    const localRecordIds = new Set(records.map(r => r.id))

    // ── Sync babies ──────────────────────────

    const { error: babyError } = await supabase.from('babies').upsert(
      babiesWithUrls.map(b => {
        const payload: Record<string, unknown> = {
          id: b.id,
          name: b.name,
          birth_date: b.birthDate,
          mother_name: b.motherName ?? null,
          father_name: b.fatherName ?? null,
          created_by: u.id,
        }
        if (b.photo !== undefined && b.photo !== null) {
          payload.photo = b.photo
        }
        return payload
      })
    )
    if (babyError) throw babyError

    // Delete from cloud babies removed locally (only if created by this user)
    const { data: cloudBabeys } = await supabase
      .from('babies')
      .select('id')
      .eq('created_by', u.id)

    const cloudBabyIds = (cloudBabeys ?? []).map(b => b.id)
    const babiesToDelete = cloudBabyIds.filter(id => !localBabyIds.has(id))

    if (babiesToDelete.length > 0) {
      // Delete records for deleted babies
      const { error: recordDelError } = await supabase
        .from('records')
        .delete()
        .in('baby_id', babiesToDelete)
      if (recordDelError) throw recordDelError

      const { error: babyDelError } = await supabase
        .from('babies')
        .delete()
        .in('id', babiesToDelete)
      if (babyDelError) throw babyDelError
      // Confirmed deleted from cloud, remove from local tracking
      clearDeletedIds(state.deletedIds.filter(id => !babiesToDelete.includes(id)))
    }

    // ── Sync records ─────────────────────────

    if (localBabyIds.size > 0) {
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

      // Delete from cloud records removed locally (only this user's records)
      const { data: cloudRecords } = await supabase
        .from('records')
        .select('id')
        .eq('user_id', u.id)
        .in('baby_id', [...localBabyIds])

      const cloudRecordIds = (cloudRecords ?? []).map(r => r.id)
      const recordsToDelete = cloudRecordIds.filter(id => !localRecordIds.has(id))

      if (recordsToDelete.length > 0) {
        const { error } = await supabase
          .from('records')
          .delete()
          .in('id', recordsToDelete)
        if (error) throw error
      }
    }

    return { babies: state.babies.length, records: records.length }
  }, [state.babies, records, updateBaby])

  const pullFromCloud = useCallback(async () => {
    if (!supabase) throw new Error('Supabase não configurado')

    const { data: cloudBabies, error: babyError } = await supabase
      .from('babies')
      .select('*')

    if (babyError) throw babyError

    const mergedBabies: Baby[] = []
    const mergedIds = new Set<string>()

    for (const b of cloudBabies ?? []) {
      if (state.deletedIds.includes(b.id)) continue
      const localBaby = state.babies.find(lb => lb.id === b.id)
      mergedBabies.push({
        id: b.id,
        name: b.name,
        birthDate: b.birth_date,
        createdAt: b.created_at,
        photo: b.photo ?? localBaby?.photo,
        motherName: b.mother_name ?? localBaby?.motherName,
        fatherName: b.father_name ?? localBaby?.fatherName,
      })
      mergedIds.add(b.id)
    }

    for (const b of state.babies) {
      if (!mergedIds.has(b.id)) {
        mergedBabies.push(b)
      }
      mergedIds.add(b.id)
    }

    for (const b of state.babies) {
      if (!mergedIds.has(b.id)) {
        mergedBabies.push(b)
      }
      mergedIds.add(b.id)
    }

    const babyIds = mergedBabies.map(b => b.id)
    let cloudRecords: { id: string; data: BabyRecord; user_id: string }[] = []

    if (babyIds.length > 0) {
      const { data, error: recordError } = await supabase
        .from('records')
        .select('*')
        .in('baby_id', babyIds)

      if (recordError) throw recordError
      cloudRecords = data ?? []
    }

    const mergedRecords = new Map<string, BabyRecord>()

    for (const r of cloudRecords) {
      if (r.data) mergedRecords.set(r.id, r.data as BabyRecord)
    }

    for (const r of records) {
      if (!mergedRecords.has(r.id)) {
        mergedRecords.set(r.id, r)
      }
    }

    const selectedId = mergedBabies.length > 0
      ? (state.selectedBabyId && mergedBabies.find(b => b.id === state.selectedBabyId) ? state.selectedBabyId : mergedBabies[0].id)
      : null

    loadBabies(mergedBabies, selectedId)
    loadRecords(Array.from(mergedRecords.values()))

    return { babies: mergedBabies.length, records: mergedRecords.size }
  }, [loadBabies, loadRecords, state.babies, state.selectedBabyId, records])

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
