'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { clientCache, CACHE_KEYS } from '@/libs/clientCache'

import {
  Briefcase,
  Plus,
  Search,
  Clock,
  Award,
  Layers,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  X,
  Users,
  Calendar,
  Laptop,
  FolderGit2,
  Trophy,
  Bookmark,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

import ExperienceCard from './ExperienceCard'
import ExperienceFormModal from './ExperienceFormModal'
import ExperienceDetailModal from './ExperienceDetailModal'
import DeleteExperienceModal from './DeleteExperienceModal'
import AiSmartExtractorPreview from './AiSmartExtractorPreview'
import AISkillReviewModal from './AISkillReviewModal'
import type {
  ExperienceItem,
  ExperienceStats} from './experienceUtils';
import {
  EXPERIENCE_TYPE_CONFIG
} from './experienceUtils'

const FILTER_TABS = [
  { key: 'all', label: 'Semua', icon: Layers },
  { key: 'organisation', label: 'Organisasi', icon: Users },
  { key: 'committee', label: 'Kepanitiaan', icon: Calendar },
  { key: 'internship', label: 'Magang', icon: Laptop },
  { key: 'freelance', label: 'Freelance', icon: Briefcase },
  { key: 'project', label: 'Proyek', icon: FolderGit2 },
  { key: 'competition', label: 'Kompetisi', icon: Trophy },
  { key: 'other', label: 'Lainnya', icon: Bookmark }
]

function getPaginationRange(currentPage: number, totalPages: number): (number | string)[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, '...', totalPages]
  }

  if (currentPage >= totalPages - 2) {
    return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }

  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages]
}

export default function ExperienceView() {
  const [experiences, setExperiences] = useState<ExperienceItem[]>(() => {
    const cached = clientCache.get<{ experiences: ExperienceItem[]; stats: ExperienceStats | null }>(CACHE_KEYS.EXPERIENCES)
    return cached?.experiences || []
  })
  const [stats, setStats] = useState<ExperienceStats | null>(() => {
    const cached = clientCache.get<{ experiences: ExperienceItem[]; stats: ExperienceStats | null }>(CACHE_KEYS.EXPERIENCES)
    return cached?.stats || null
  })
  const [loading, setLoading] = useState<boolean>(() => {
    return !clientCache.has(CACHE_KEYS.EXPERIENCES)
  })
  const [error, setError] = useState<string | null>(null)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formInitialData, setFormInitialData] = useState<ExperienceItem | null>(null)

  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [detailExperience, setDetailExperience] = useState<ExperienceItem | null>(null)

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleteTargetExperience, setDeleteTargetExperience] = useState<ExperienceItem | null>(null)

  // AI Skill Review Modal State
  const [isAiReviewOpen, setIsAiReviewOpen] = useState(false)
  const [aiReviewExperience, setAiReviewExperience] = useState<ExperienceItem | null>(null)
  const [aiCustomText, setAiCustomText] = useState<string | null>(null)

  // Reference for scrolling to grid on page change
  const gridAnchorRef = useRef<HTMLDivElement>(null)

  // Responsive Breakpoint Detection (Desktop: 6 cards/page, Mobile/Tablet: 4 cards/page)
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    
return () => window.removeEventListener('resize', handleResize)
  }, [])

  const itemsPerPage = isDesktop ? 6 : 4

  const handleOpenAiReview = (exp: ExperienceItem) => {
    setAiReviewExperience(exp)
    setAiCustomText(null)
    setIsAiReviewOpen(true)
  }

  const handleOpenAiReviewCustomText = (text: string) => {
    setAiReviewExperience(null)
    setAiCustomText(text)
    setIsAiReviewOpen(true)
  }

  const handleAiReviewSuccess = (savedCount: number) => {
    clientCache.invalidate([
      CACHE_KEYS.EXPERIENCES,
      CACHE_KEYS.SKILLS,
      CACHE_KEYS.DASHBOARD_SUMMARY,
      CACHE_KEYS.CAREER_ACTIVE
    ])
    fetchExperiences(true)
    setToastMessage(`🎉 Berhasil memvalidasi ${savedCount} skill baru ke profil Anda!`)
  }

  // Fetch experiences from API
  const fetchExperiences = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/experiences')
      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Gagal memuat daftar pengalaman')
      }

      const expList = json.data.experiences || []
      const expStats = json.data.stats || null
      setExperiences(expList)
      setStats(expStats)
      clientCache.set(CACHE_KEYS.EXPERIENCES, { experiences: expList, stats: expStats })
    } catch (err: any) {
      console.error('Fetch experiences error:', err)
      if (!silent) {
        setError(err.message || 'Terjadi kesalahan saat mengambil data pengalaman')
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const cached = clientCache.get<{ experiences: ExperienceItem[]; stats: ExperienceStats | null }>(CACHE_KEYS.EXPERIENCES)
    if (cached) {
      setExperiences(cached.experiences)
      setStats(cached.stats)
      setLoading(false)
      if (clientCache.isStale(CACHE_KEYS.EXPERIENCES)) {
        fetchExperiences(true)
      }
    } else {
      fetchExperiences(false)
    }
  }, [fetchExperiences])

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null)
      }, 4000)

      
return () => clearTimeout(timer)
    }
  }, [toastMessage])

  // Client-side filtering for fast, snappy search
  const filteredExperiences = useMemo(() => {
    return experiences.filter(exp => {
      // Filter by type tab
      if (activeTab !== 'all' && exp.type !== activeTab) {
        return false
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchTitle = exp.title?.toLowerCase().includes(q)
        const matchRole = exp.role?.toLowerCase().includes(q)
        const matchInst = exp.institutionName?.toLowerCase().includes(q)
        const matchDesc = exp.description?.toLowerCase().includes(q)

        
return matchTitle || matchRole || matchInst || matchDesc
      }

      return true
    })
  }, [experiences, activeTab, searchQuery])

  // Pagination states & clamping
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(filteredExperiences.length / itemsPerPage))

  // Clamp current page if total pages decrease
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  // Reset to page 1 on filter or search change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, activeTab])

  // Only render cards for the active page
  const paginatedExperiences = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage

    
return filteredExperiences.slice(start, start + itemsPerPage)
  }, [filteredExperiences, currentPage, itemsPerPage])

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return
    setCurrentPage(newPage)

    if (gridAnchorRef.current) {
      gridAnchorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Handlers for Modals
  const handleOpenAdd = () => {
    setFormInitialData(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (exp: ExperienceItem) => {
    setFormInitialData(exp)
    setIsFormOpen(true)
  }

  const handleOpenDetail = (exp: ExperienceItem) => {
    setDetailExperience(exp)
    setIsDetailOpen(true)
  }

  const handleOpenDelete = (exp: ExperienceItem) => {
    setDeleteTargetExperience(exp)
    setIsDeleteOpen(true)
  }

  const handleFormSuccess = (savedExp: ExperienceItem, isEdit: boolean) => {
    clientCache.invalidate([
      CACHE_KEYS.EXPERIENCES,
      CACHE_KEYS.DASHBOARD_SUMMARY,
      CACHE_KEYS.SKILLS,
      CACHE_KEYS.CAREER_ACTIVE
    ])
    fetchExperiences(true)
    setToastMessage(
      isEdit
        ? `Pengalaman "${savedExp.title}" berhasil diperbarui.`
        : `Pengalaman "${savedExp.title}" berhasil ditambahkan.`
    )

    if (!isEdit && savedExp.description && savedExp.description.trim().length >= 30) {
      setTimeout(() => {
        handleOpenAiReview(savedExp)
      }, 500)
    }
  }

  const handleDeleteSuccess = () => {
    clientCache.invalidate([
      CACHE_KEYS.EXPERIENCES,
      CACHE_KEYS.DASHBOARD_SUMMARY,
      CACHE_KEYS.SKILLS,
      CACHE_KEYS.CAREER_ACTIVE
    ])
    fetchExperiences(true)
    setToastMessage('Pengalaman berhasil dihapus.')
  }

  // Find dominant experience type for stat
  const dominantType = useMemo(() => {
    if (!stats?.typeBreakdown) return null
    let maxCount = 0
    let dominantKey = ''

    for (const [key, count] of Object.entries(stats.typeBreakdown)) {
      if (key !== 'all' && count > maxCount) {
        maxCount = count
        dominantKey = key
      }
    }

    
return dominantKey ? EXPERIENCE_TYPE_CONFIG[dominantKey]?.label : '-'
  }, [stats])

  return (
    <div className='experience-page min-h-screen font-poppins space-y-6 pb-12' style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className='fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300'>
          <div className='flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl border border-slate-700 dark:border-slate-200 text-xs sm:text-sm font-semibold'>
            <CheckCircle2 className='w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0' />
            <span>{toastMessage}</span>
            <button
              type='button'
              onClick={() => setToastMessage(null)}
              className='ml-2 p-1 hover:opacity-75 transition-opacity cursor-pointer'
            >
              <X className='w-3.5 h-3.5' />
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight'>
            Manajemen Pengalaman
          </h1>
          <p className='text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed'>
            Kelola rekam jejak kepanitiaan, organisasi, magang, dan proyek Anda untuk diekstrak menjadi skill tervalidasi oleh AI.
          </p>
        </div>

        {/* CTA Button */}
        <div className='shrink-0'>
          <button
            type='button'
            onClick={handleOpenAdd}
            className='inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
          >
            <Plus className='w-4 h-4' />
            <span>Tambah Pengalaman</span>
          </button>
        </div>
      </div>

      {/* Metrics Stat Cards */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
        {/* Card 1: Total Pengalaman */}
        <div className='bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>
              Total Pengalaman
            </span>
            <div className='w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center'>
              <Briefcase className='w-4 h-4' />
            </div>
          </div>
          <div className='mt-3'>
            <span className='text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight'>
              {stats?.total ?? 0}
            </span>
            <p className='text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal'>
              Riwayat aktivitas terdata
            </p>
          </div>
        </div>

        {/* Card 2: Sedang Aktif */}
        <div className='bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>
              Sedang Aktif
            </span>
            <div className='w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center'>
              <Clock className='w-4 h-4' />
            </div>
          </div>
          <div className='mt-3'>
            <span className='text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight'>
              {stats?.ongoing ?? 0}
            </span>
            <p className='text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal'>
              Aktivitas saat ini ditekuni
            </p>
          </div>
        </div>

        {/* Card 3: Validasi Skill */}
        <div className='bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>
              Validasi Skill
            </span>
            <div className='w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center'>
              <Award className='w-4 h-4' />
            </div>
          </div>
          <div className='mt-3'>
            <span className='text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight'>
              {stats?.skillsExtracted ?? 0}
            </span>
            <p className='text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal'>
              Terhubung bukti kegiatan
            </p>
          </div>
        </div>

        {/* Card 4: Fokus Utama */}
        <div className='bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>
              Fokus Utama
            </span>
            <div className='w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center'>
              <TrendingUp className='w-4 h-4' />
            </div>
          </div>
          <div className='mt-3'>
            <span className='text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate block'>
              {dominantType || '-'}
            </span>
            <p className='text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal'>
              Kategori paling dominan
            </p>
          </div>
        </div>
      </div>

      {/* AI Skill Booster Card */}
      <AiSmartExtractorPreview
        onOpenLiveAiModal={handleOpenAiReviewCustomText}
        onConfirmSkills={(count) => {
          setToastMessage(`🎉 ${count} rekomendasi skill AI berhasil dikonfirmasi ke profil!`)
          fetchExperiences()
        }}
      />

      {/* Unified Search & Filter Card */}
      <div ref={gridAnchorRef} className='bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4 scroll-mt-24'>
        {/* Top Row: Search Input + Range Counter */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
          <div className='relative w-full sm:max-w-md'>
            <Search className='w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none' />
            <input
              type='text'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder='Cari judul, peran, institusi, atau kata kunci...'
              className='w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900/60 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
            />
            {searchQuery && (
              <button
                type='button'
                onClick={() => setSearchQuery('')}
                className='absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer'
              >
                <X className='w-3.5 h-3.5' />
              </button>
            )}
          </div>

          <div className='text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0 flex items-center gap-1.5'>
            {filteredExperiences.length > 0 ? (
              <>
                <span>Menampilkan</span>
                <span className='font-bold text-slate-900 dark:text-white'>
                  {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredExperiences.length)}
                </span>
                <span>dari</span>
                <span className='font-bold text-slate-900 dark:text-white'>{filteredExperiences.length}</span>
                <span>pengalaman</span>
              </>
            ) : (
              <span>0 pengalaman ditemukan</span>
            )}
          </div>
        </div>

        {/* Separator Line */}
        <div className='border-t border-slate-100 dark:border-slate-800/80' />

        {/* Bottom Row: Type Filter Tabs */}
        <div className='flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar'>
          {FILTER_TABS.map(tab => {
            const isActive = activeTab === tab.key
            const TabIcon = tab.icon
            const count = stats?.typeBreakdown?.[tab.key] ?? 0

            return (
              <button
                key={tab.key}
                type='button'
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800'
                }`}
              >
                <TabIcon className='w-3.5 h-3.5 shrink-0' />
                <span>{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'>
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div
              key={n}
              className='p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 animate-pulse space-y-3'
            >
              <div className='w-20 h-5 bg-slate-200 dark:bg-slate-800 rounded-full' />
              <div className='w-3/4 h-5 bg-slate-200 dark:bg-slate-800 rounded-lg' />
              <div className='w-1/2 h-4 bg-slate-200 dark:bg-slate-800 rounded-lg' />
              <div className='w-full h-12 bg-slate-100 dark:bg-slate-800/50 rounded-lg mt-3' />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className='p-8 rounded-3xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-center space-y-3'>
          <AlertCircle className='w-8 h-8 text-rose-500 mx-auto' />
          <h3 className='text-base font-bold text-rose-800 dark:text-rose-300'>
            Gagal Memuat Pengalaman
          </h3>
          <p className='text-xs text-rose-600 dark:text-rose-400 max-w-md mx-auto'>
            {error}
          </p>
          <button
            type='button'
            onClick={() => fetchExperiences()}
            className='inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer'
          >
            <RotateCcw className='w-3.5 h-3.5' />
            <span>Coba Lagi</span>
          </button>
        </div>
      ) : experiences.length === 0 ? (

        /* Empty State: 0 Experiences in DB */
        <div className='p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-center space-y-4'>
          <div className='w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-center mx-auto shadow-xs'>
            <Briefcase className='w-7 h-7' />
          </div>
          <div className='max-w-md mx-auto'>
            <h3 className='text-lg font-bold text-slate-900 dark:text-white'>
              Belum Ada Pengalaman yang Ditambahkan
            </h3>
            <p className='text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed'>
              Dokumentasikan kepanitiaan kampus, organisasi mahasiswa, magang industri,
              atau proyek kuliah pertama Anda. AI kami akan mengekstrak skill secara
              otomatis!
            </p>
          </div>
          <button
            type='button'
            onClick={handleOpenAdd}
            className='inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
          >
            <Plus className='w-4 h-4' />
            <span>Tambah Pengalaman Pertama</span>
          </button>
        </div>
      ) : filteredExperiences.length === 0 ? (

        /* Empty State: Search / Filter yields 0 results */
        <div className='p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-center space-y-3'>
          <Search className='w-8 h-8 text-slate-400 mx-auto' />
          <h3 className='text-base font-bold text-slate-900 dark:text-white'>
            Tidak Ada Pengalaman yang Cocok
          </h3>
          <p className='text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto'>
            Tidak ditemukan pengalaman dengan kata kunci &quot;{searchQuery}&quot; pada filter
            tipe &quot;{activeTab}&quot;.
          </p>
          <button
            type='button'
            onClick={() => {
              setSearchQuery('')
              setActiveTab('all')
            }}
            className='inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer'
          >
            <RotateCcw className='w-3.5 h-3.5' />
            <span>Reset Pencarian & Filter</span>
          </button>
        </div>
      ) : (

        /* Experiences Card Grid: Desktop max 3 cols, Tablet max 2 cols, Mobile 1 col */
        <div className='space-y-6'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'>
            {paginatedExperiences.map(exp => (
              <ExperienceCard
                key={exp.id}
                experience={exp}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
                onViewDetail={handleOpenDetail}
                onTriggerAI={handleOpenAiReview}
              />
            ))}
          </div>

          {/* Pagination Navigation */}
          {totalPages > 1 && (
            <div className='flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 pb-2'>
              <p className='text-xs text-slate-500 dark:text-slate-400 order-2 sm:order-1'>
                Halaman <span className='font-bold text-slate-900 dark:text-white'>{currentPage}</span> dari{' '}
                <span className='font-bold text-slate-900 dark:text-white'>{totalPages}</span>
              </p>

              <div className='flex items-center gap-1.5 order-1 sm:order-2'>
                {/* Previous Button */}
                <button
                  type='button'
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  aria-label='Halaman sebelumnya'
                  className='inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer'
                >
                  <ChevronLeft className='w-3.5 h-3.5' />
                  <span className='hidden sm:inline'>Sebelumnya</span>
                </button>

                {/* Page Numbers */}
                <div className='flex items-center gap-1'>
                  {getPaginationRange(currentPage, totalPages).map((p, idx) => {
                    if (p === '...') {
                      return (
                        <span
                          key={`ellipsis-${idx}`}
                          className='w-8 h-8 flex items-center justify-center text-xs text-slate-400 select-none'
                        >
                          ...
                        </span>
                      )
                    }

                    const pageNum = Number(p)
                    const isActive = pageNum === currentPage

                    return (
                      <button
                        key={`page-${pageNum}`}
                        type='button'
                        onClick={() => handlePageChange(pageNum)}
                        aria-label={`Halaman ${pageNum}`}
                        aria-current={isActive ? 'page' : undefined}
                        className={`w-8 h-8 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                {/* Next Button */}
                <button
                  type='button'
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  aria-label='Halaman berikutnya'
                  className='inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer'
                >
                  <span className='hidden sm:inline'>Selanjutnya</span>
                  <ChevronRight className='w-3.5 h-3.5' />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form Modal (Add & Edit) */}
      <ExperienceFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        initialData={formInitialData}
      />

      {/* Detail Modal */}
      <ExperienceDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        experience={detailExperience}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onTriggerAI={handleOpenAiReview}
      />

      {/* Delete Confirmation Modal */}
      <DeleteExperienceModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onSuccess={handleDeleteSuccess}
        experience={deleteTargetExperience}
      />

      {/* AI Skill Review Modal */}
      <AISkillReviewModal
        isOpen={isAiReviewOpen}
        onClose={() => {
          setIsAiReviewOpen(false)
          fetchExperiences()
        }}
        onSuccess={handleAiReviewSuccess}
        experienceId={aiReviewExperience?.id || null}
        experienceData={aiReviewExperience}
        customText={aiCustomText}
      />
    </div>
  )
}
