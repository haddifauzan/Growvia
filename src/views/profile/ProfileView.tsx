'use client'

import React, { useState, useEffect, useRef } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import {
  User,
  GraduationCap,
  Camera,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  FileText,
  UploadCloud,
  Trash2
} from 'lucide-react'

import { useAuth } from '@/contexts/AuthContext'
import { clientCache, CACHE_KEYS } from '@/libs/clientCache'
import { INDONESIAN_UNIVERSITIES, INDONESIAN_MAJORS } from '@/data/indonesianEducation'
import SearchableSelect from '@/components/ui/SearchableSelect'



export default function ProfileView() {
  const { user, profile, refreshUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form states
  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [headline, setHeadline] = useState('')
  const [institution, setInstitution] = useState('')
  const [major, setMajor] = useState('')
  const [graduationYear, setGraduationYear] = useState<number | ''>('')
  const [bio, setBio] = useState('')

  // UI status states
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Populate initial values from auth context
  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setAvatarUrl(user.avatarUrl || '')
    }

    if (profile) {
      setHeadline(profile.headline || '')
      setInstitution(profile.institution || '')
      setMajor(profile.major || '')
      setGraduationYear(profile.graduationYear || '')
      setBio(profile.bio || '')
    }
  }, [user, profile])

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev))
    }, 4000)
  }

  const handleUploadFile = async (file: File) => {
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif']

    if (!validMimes.includes(file.type)) {
      showToast('error', 'Format file tidak didukung. Harap gunakan format JPEG, PNG, atau WebP.')

      return
    }

    const MAX_SIZE = 5 * 1024 * 1024

    if (file.size > MAX_SIZE) {
      showToast('error', 'Ukuran foto terlalu besar. Maksimal 5MB.')

      return
    }

    try {
      setIsUploadingAvatar(true)

      const formData = new FormData()

      formData.append('file', file)

      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Gagal mengunggah foto profil')
      }

      setAvatarUrl(json.data.avatarUrl)
      clientCache.invalidate([CACHE_KEYS.DASHBOARD_SUMMARY, CACHE_KEYS.PORTFOLIO])
      await refreshUser()
      showToast('success', 'Foto profil berhasil diunggah!')
    } catch (err: any) {
      console.error('Error uploading avatar:', err)
      showToast('error', err.message || 'Terjadi kesalahan saat mengunggah foto.')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleRemoveAvatar = async () => {
    try {
      setIsUploadingAvatar(true)

      const res = await fetch('/api/profile/avatar', {
        method: 'DELETE'
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Gagal menghapus foto profil')
      }

      setAvatarUrl('')
      clientCache.invalidate([CACHE_KEYS.DASHBOARD_SUMMARY, CACHE_KEYS.PORTFOLIO])
      await refreshUser()
      showToast('success', 'Foto profil berhasil dihapus, kembali menggunakan inisial.')
    } catch (err: any) {
      console.error('Error removing avatar:', err)
      showToast('error', err.message || 'Gagal menghapus foto profil.')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFile(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      showToast('error', 'Nama lengkap tidak boleh kosong.')
      
return
    }

    try {
      setIsLoading(true)

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          avatarUrl: avatarUrl ? avatarUrl.trim() : null,
          headline: headline.trim(),
          institution: institution.trim(),
          major: major.trim(),
          graduationYear: graduationYear ? Number(graduationYear) : null,
          bio: bio.trim()
        })
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Gagal menyimpan profil')
      }

      clientCache.invalidate([CACHE_KEYS.DASHBOARD_SUMMARY, CACHE_KEYS.PORTFOLIO])
      await refreshUser()
      showToast('success', 'Profil Anda berhasil diperbarui!')
    } catch (err: any) {
      console.error('Error saving profile:', err)
      showToast('error', err.message || 'Terjadi kesalahan saat menyimpan profil.')
    } finally {
      setIsLoading(false)
    }
  }

  const initials = (name || user?.name || 'G')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()

  const universityOptions = INDONESIAN_UNIVERSITIES.map(u => ({
    id: u.name,
    label: u.name,
    subtext: `${u.shortName || u.type} • ${u.city || ''}`
  }))

  const majorOptions = INDONESIAN_MAJORS.map(m => ({
    id: m.name,
    label: m.name,
    subtext: m.facultyGroup
  }))

  // Generate graduation year choices
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 12 }, (_, i) => currentYear - 4 + i)

  return (
    <div className='flex flex-col gap-6 max-w-4xl mx-auto pb-12 w-full'>
      {/* Toast Alert Notification */}
      {toast && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 shadow-lg border animate-in fade-in slide-in-from-top-3 duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          <div className='flex items-center gap-2.5 text-xs sm:text-sm font-semibold'>
            {toast.type === 'success' ? (
              <CheckCircle2 className='w-4 h-4 text-emerald-600 shrink-0' />
            ) : (
              <AlertCircle className='w-4 h-4 text-rose-600 shrink-0' />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            type='button'
            onClick={() => setToast(null)}
            className='text-xs font-bold opacity-70 hover:opacity-100 cursor-pointer'
          >
            ✕
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5'>
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <h1 className='text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight'>
              Profil & Identitas Diri
            </h1>
          </div>
          <p className='text-xs sm:text-sm text-slate-500 dark:text-slate-400'>
            Kelola data biodata, headline, kampus, dan foto profil Anda yang ditampilkan di seluruh ekosistem Growvia.
          </p>
        </div>

        {profile?.portfolioSlug && (
          <Link
            href={`/u/${profile.portfolioSlug}`}
            target='_blank'
            className='inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/70 dark:border-blue-800 transition-all self-start sm:self-auto cursor-pointer'
          >
            <ExternalLink className='w-3.5 h-3.5' />
            <span>Portfolio</span>
          </Link>
        )}
      </div>

      <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
        {/* Card 1: Avatar & Foto Profil */}
        <div className='p-5 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-5'>
          <div className='flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3'>
            <Camera className='w-4 h-4 text-blue-600 dark:text-blue-400' />
            <h2 className='text-sm sm:text-base font-bold text-slate-900 dark:text-white'>
              Foto Profil & Avatar
            </h2>
          </div>

          <div className='flex flex-col sm:flex-row items-center sm:items-start gap-6'>
            {/* Avatar Preview & Direct Click */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className='relative shrink-0 group cursor-pointer'
              title='Klik untuk memilih foto dari perangkat'
            >
              {avatarUrl ? (
                <div className='w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden ring-4 ring-blue-500/20 shadow-lg relative bg-slate-100 dark:bg-slate-800'>
                  <Image
                    src={avatarUrl}
                    alt={name || 'Avatar'}
                    fill
                    unoptimized
                    className='object-cover group-hover:scale-105 transition-transform'
                  />
                  <div className='absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity'>
                    <Camera className='w-5 h-5 mb-1' />
                    <span className='text-[10px] font-bold'>Ganti Foto</span>
                  </div>
                </div>
              ) : (
                <div className='w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white font-extrabold text-2xl sm:text-3xl flex flex-col items-center justify-center ring-4 ring-blue-500/20 shadow-lg relative overflow-hidden group'>
                  <span>{initials}</span>
                  <div className='absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity'>
                    <Camera className='w-5 h-5 mb-1' />
                    <span className='text-[10px] font-bold'>Unggah</span>
                  </div>
                </div>
              )}

              {isUploadingAvatar ? (
                <span className='absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs'>
                  <RefreshCw className='w-3.5 h-3.5 animate-spin' />
                </span>
              ) : (
                <span
                  className='absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-600 group-hover:bg-blue-700 text-white border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-xs transition-colors'
                  title='Unggah foto dari perangkat'
                >
                  <Camera className='w-3.5 h-3.5' />
                </span>
              )}
            </div>

            {/* Drag & Drop File Upload Area */}
            <div className='flex flex-col gap-3 flex-1 w-full'>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/jpeg,image/png,image/webp,image/jpg'
                className='hidden'
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    handleUploadFile(e.target.files[0])
                  }
                }}
              />

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 scale-[1.01]'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-850 hover:border-blue-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className='w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900 shadow-2xs'>
                  {isUploadingAvatar ? (
                    <RefreshCw className='w-5 h-5 animate-spin' />
                  ) : (
                    <UploadCloud className='w-5 h-5' />
                  )}
                </div>

                <div className='flex flex-col items-center text-center'>
                  <span className='text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200'>
                    {isUploadingAvatar ? 'Mengunggah foto profil...' : 'Klik untuk memilih foto atau seret file ke sini'}
                  </span>
                  <span className='text-[11px] text-slate-400 dark:text-slate-500 mt-0.5'>
                    Unggah langsung dari perangkat Anda (JPG, PNG, atau WebP, maks. 5MB)
                  </span>
                </div>
              </div>

              {/* Action Buttons: Upload or Remove */}
              <div className='flex flex-wrap items-center justify-between gap-2 pt-0.5'>
                <div className='flex items-center gap-2'>
                  <button
                    type='button'
                    disabled={isUploadingAvatar}
                    onClick={() => fileInputRef.current?.click()}
                    className='inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-60'
                  >
                    <UploadCloud className='w-3.5 h-3.5' />
                    <span>Pilih Foto dari Perangkat</span>
                  </button>

                  {avatarUrl && (
                    <button
                      type='button'
                      disabled={isUploadingAvatar}
                      onClick={handleRemoveAvatar}
                      className='inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 text-xs font-semibold border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer disabled:opacity-60'
                    >
                      <Trash2 className='w-3.5 h-3.5' />
                      <span>Hapus Foto</span>
                    </button>
                  )}
                </div>

                <span className='text-[11px] text-slate-400 dark:text-slate-500 font-medium'>
                  Rasio 1:1 persegi direkomendasikan
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Informasi Dasar & Kontak */}
        <div className='p-5 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4'>
          <div className='flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3'>
            <User className='w-4 h-4 text-blue-600 dark:text-blue-400' />
            <h2 className='text-sm sm:text-base font-bold text-slate-900 dark:text-white'>
              Biodata & Kontak Utama
            </h2>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {/* Nama Lengkap */}
            <div className='flex flex-col gap-1.5'>
              <label className='text-xs font-bold text-slate-700 dark:text-slate-300'>
                Nama Lengkap <span className='text-rose-500'>*</span>
              </label>
              <input
                type='text'
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder='Contoh: Budi Pratama'
                className='px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
              />
            </div>

            {/* Alamat Email (Read-only) */}
            <div className='flex flex-col gap-1.5'>
              <div className='flex items-center justify-between'>
                <label className='text-xs font-bold text-slate-700 dark:text-slate-300'>
                  Alamat Email Akun
                </label>
                <span className='inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold'>
                  <ShieldCheck className='w-3 h-3' />
                  <span>Terverifikasi</span>
                </span>
              </div>
              <div className='relative'>
                <input
                  type='email'
                  disabled
                  value={user?.email || ''}
                  className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-850 text-xs sm:text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed'
                />
              </div>
              <span className='text-[10px] text-slate-400 dark:text-slate-500'>
                Untuk keamanan, ubah password atau email dilakukan di menu Pengaturan.
              </span>
            </div>

            {/* Headline Profesional */}
            <div className='flex flex-col gap-1.5 sm:col-span-2'>
              <label className='text-xs font-bold text-slate-700 dark:text-slate-300'>
                Headline Profesional
              </label>
              <input
                type='text'
                value={headline}
                onChange={e => setHeadline(e.target.value)}
                placeholder='Contoh: Informatics Student | Aspiring Fullstack AI Engineer'
                className='px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
              />
              <span className='text-[10px] text-slate-400 dark:text-slate-500'>
                Muncul di bawah nama Anda pada kartu profil dashboard dan halaman portofolio recruiter.
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Pendidikan & Institusi */}
        <div className='p-5 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4'>
          <div className='flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3'>
            <GraduationCap className='w-4 h-4 text-blue-600 dark:text-blue-400' />
            <h2 className='text-sm sm:text-base font-bold text-slate-900 dark:text-white'>
              Latar Belakang Pendidikan
            </h2>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {/* Institusi Pendidikan */}
            <div className='flex flex-col gap-1.5'>
              <label className='text-xs font-bold text-slate-700 dark:text-slate-300'>
                Institusi Pendidikan / Universitas
              </label>
              <SearchableSelect
                placeholder='Cari universitas Anda...'
                options={universityOptions}
                value={institution}
                onChange={val => setInstitution(val)}
                allowCustom
              />
            </div>

            {/* Program Studi / Jurusan */}
            <div className='flex flex-col gap-1.5'>
              <label className='text-xs font-bold text-slate-700 dark:text-slate-300'>
                Program Studi / Jurusan
              </label>
              <SearchableSelect
                placeholder='Cari program studi...'
                options={majorOptions}
                value={major}
                onChange={val => setMajor(val)}
                allowCustom
              />
            </div>

            {/* Tahun Kelulusan / Angkatan */}
            <div className='flex flex-col gap-1.5'>
              <label className='text-xs font-bold text-slate-700 dark:text-slate-300'>
                Tahun Kelulusan (Estimasi / Riil)
              </label>
              <select
                value={graduationYear}
                onChange={e => setGraduationYear(e.target.value ? Number(e.target.value) : '')}
                className='px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer'
              >
                <option value=''>Pilih Tahun Kelulusan</option>
                {yearOptions.map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Card 4: Biografi Naratif (Bio) */}
        <div className='p-5 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4'>
          <div className='flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3'>
            <div className='flex items-center gap-2'>
              <FileText className='w-4 h-4 text-blue-600 dark:text-blue-400' />
              <h2 className='text-sm sm:text-base font-bold text-slate-900 dark:text-white'>
                Biografi Singkat
              </h2>
            </div>
            <span className='text-[11px] font-semibold text-slate-400'>
              {bio.length}/500 Karakter
            </span>
          </div>

          <div className='flex flex-col gap-1.5'>
            <textarea
              rows={4}
              maxLength={500}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder='Tulis ringkasan singkat tentang minat karier, latar belakang keahlian, atau proyek yang sedang Anda tekuni...'
              className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y'
            />
            <span className='text-[10px] text-slate-400 dark:text-slate-500'>
              Biografi ini akan dibaca oleh recruiter dan rekan kolaborator di profil portofolio Anda.
            </span>
          </div>
        </div>

        {/* Submit Action Bar */}
        <div className='flex items-center justify-end gap-3 pt-2'>
          <button
            type='submit'
            disabled={isLoading}
            className='inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60'
          >
            {isLoading ? (
              <>
                <RefreshCw className='w-4 h-4 animate-spin' />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className='w-4 h-4' />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
