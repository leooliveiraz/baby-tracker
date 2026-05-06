import { useState, useRef, useEffect } from 'react'
import { useBabyContext, type Baby } from '../context/BabyContext'
import { supabase } from '../lib/supabase'
import { uploadBabyPhoto, fileToBase64 } from '../lib/storage'

interface Props {
  onClose: () => void
  baby?: Baby
}

export default function BabyFormModal({ onClose, baby }: Props) {
  const { addBaby, updateBaby } = useBabyContext()
  const fileRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(baby?.name ?? '')
  const [birthDate, setBirthDate] = useState(baby?.birthDate ?? '')
  const [motherName, setMotherName] = useState(baby?.motherName ?? '')
  const [fatherName, setFatherName] = useState(baby?.fatherName ?? '')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [removePhoto, setRemovePhoto] = useState(false)

  const isEdit = !!baby

  useEffect(() => {
    if (baby?.photo) setPreview(baby.photo)
  }, [baby?.photo])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
    setRemovePhoto(false)
  }

  const handleRemovePhoto = () => {
    setSelectedFile(null)
    setPreview(null)
    setRemovePhoto(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !birthDate) return

    setUploading(true)

    if (isEdit && baby) {
      let photo = removePhoto ? undefined : (selectedFile ? undefined : baby.photo)

      if (selectedFile) {
        try {
          if (supabase) {
            photo = await uploadBabyPhoto(baby.id, selectedFile)
          } else {
            photo = await fileToBase64(selectedFile)
          }
        } catch {
          photo = await fileToBase64(selectedFile)
        }
      }

      updateBaby({ ...baby, name: name.trim(), birthDate, photo, motherName: motherName.trim() || undefined, fatherName: fatherName.trim() || undefined })
    } else {
      let photoUrl: string | undefined

      if (selectedFile) {
        const babyId = crypto.randomUUID()
        try {
          if (supabase) {
            photoUrl = await uploadBabyPhoto(babyId, selectedFile)
          } else {
            photoUrl = await fileToBase64(selectedFile)
          }
        } catch {
          photoUrl = await fileToBase64(selectedFile)
        }
        addBaby(babyId, name.trim(), birthDate, photoUrl, motherName.trim() || undefined, fatherName.trim() || undefined)
      } else {
        addBaby(crypto.randomUUID(), name.trim(), birthDate, undefined, motherName.trim() || undefined, fatherName.trim() || undefined)
      }
    }

    setUploading(false)
    onClose()
  }

  const currentPreview = preview
    ? (selectedFile ? preview : preview)
    : null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(74, 26, 92, 0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, padding: 16,
      }}
    >
      <form
        onSubmit={handleSubmit}
        onClick={e => e.stopPropagation()}
        className="card"
        style={{
          width: '100%', maxWidth: 360,
          display: 'flex', flexDirection: 'column', gap: 16,
        }}
      >
        <h2 style={{ fontSize: '1.2rem', color: 'var(--lilac-900)' }}>
          {isEdit ? '✏️ Editar Bebê' : '👶 Novo Bebê'}
        </h2>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          style={{ display: 'none' }}
        />

        <div style={{ alignSelf: 'center', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
          >
            {currentPreview ? (
              <img
                src={currentPreview}
                alt="Preview"
                style={{
                  width: 100, height: 100, borderRadius: '50%', objectFit: 'cover',
                  border: '3px solid var(--lilac-300)',
                }}
              />
            ) : (
              <div
                style={{
                  width: 100, height: 100, borderRadius: '50%',
                  background: 'var(--lilac-100)', border: '3px dashed var(--lilac-300)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem',
                }}
              >
                📷
              </div>
            )}
          </button>
          <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: 4 }}>
            {currentPreview ? 'Clique para trocar' : 'Adicionar foto'}
          </p>
          {isEdit && currentPreview && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              style={{ fontSize: '0.75rem', color: '#E74C3C', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Remover foto
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Nome
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nome do bebê"
            style={{
              padding: '10px 14px', borderRadius: 'var(--radius)',
              border: '2px solid var(--lilac-100)', fontSize: '1rem',
            }}
            autoFocus
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Data de Nascimento
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={e => setBirthDate(e.target.value)}
            style={{
              padding: '10px 14px', borderRadius: 'var(--radius)',
              border: '2px solid var(--lilac-100)', fontSize: '1rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Nome da Mãe
          </label>
          <input
            value={motherName}
            onChange={e => setMotherName(e.target.value)}
            placeholder="Opcional"
            style={{
              padding: '10px 14px', borderRadius: 'var(--radius)',
              border: '2px solid var(--lilac-100)', fontSize: '1rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Nome do Pai
          </label>
          <input
            value={fatherName}
            onChange={e => setFatherName(e.target.value)}
            placeholder="Opcional"
            style={{
              padding: '10px 14px', borderRadius: 'var(--radius)',
              border: '2px solid var(--lilac-100)', fontSize: '1rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} className="btn btn-outline btn-sm" disabled={uploading}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={uploading}>
            {uploading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}
