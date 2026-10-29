'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'

import { CheckCircle2, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'

import type {
  OpportunityItem,
  OpportunitiesResponse,
  OpportunitiesFilterState
} from '@/types/opportunities'

import OpportunitiesHeader from './OpportunitiesHeader'
import OpportunitiesFilterBar from './OpportunitiesFilterBar'
import OpportunityCard from './OpportunityCard'
import OpportunityDetailModal from './OpportunityDetailModal'
import SavedOpportunitiesModal from './SavedOpportunitiesModal'
import OpportunitiesEmptyState from './OpportunitiesEmptyState'
import { clientCache, CACHE_KEYS } from '@/libs/clientCache'

const ITEMS_PER_PAGE = 6

export default function OpportunitiesView() {
  const defaultKey = `${CACHE_KEYS.OPPORTUNITIES}_all__match_desc`
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>(() => {
    return clientCache.get<OpportunityItem[]>(defaultKey) || []
  })
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return !clientCache.has(defaultKey)
  })
  const [error, setError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // State pagination
  const [currentPage, setCurrentPage] = useState<number>(1)

  // Filter & Urutan
  const [filters, setFilters] = useState<OpportunitiesFilterState>({
    search: '',
    type: 'all',
    quickFilter: 'all',
    location: '',
    sort: 'match_desc'
  })

  // State modal detail & modal tersimpan
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isSavedModalOpen, setIsSavedModalOpen] = useState<boolean>(false)

  // State loading bookmark per item
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set())

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev))
    }, 3500)
  }, [])

  // Fetch opportunities from API
  const fetchOpportunities = useCallback(async (silent = false) => {
    const currentKey = `${CACHE_KEYS.OPPORTUNITIES}_${filters.type}_${filters.location}_${filters.sort}`
    try {
      if (!silent) setIsLoading(true)
      setError(null)

      const queryParams = new URLSearchParams()

      if (filters.type !== 'all') {
        queryParams.set('type', filters.type)
      }

      if (filters.location) {
        queryParams.set('location', filters.location)
      }

      if (filters.sort) {
        queryParams.set('sort', filters.sort)
      }

      const res = await fetch(`/api/opportunities?${queryParams.toString()}`)
      const data: OpportunitiesResponse = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal memuat daftar peluang karier')
      }

      const list = data.data || []
      setOpportunities(list)
      clientCache.set(currentKey, list)
    } catch (err: any) {
      console.error('Error fetching opportunities:', err)
      if (!silent) setError(err.message || 'Terjadi kesalahan pada sistem saat memuat data')
    } finally {
      if (!silent) setIsLoading(false)
    }
  }, [filters.type, filters.location, filters.sort])

  useEffect(() => {
    const currentKey = `${CACHE_KEYS.OPPORTUNITIES}_${filters.type}_${filters.location}_${filters.sort}`
    const cached = clientCache.get<OpportunityItem[]>(currentKey)
    if (cached) {
      setOpportunities(cached)
      setIsLoading(false)
      if (clientCache.isStale(currentKey)) {
        fetchOpportunities(true)
      }
    } else {
      fetchOpportunities(false)
    }
  }, [fetchOpportunities, filters.type, filters.location, filters.sort])

  // Reset pagination ke halaman 1 saat filter atau pencarian berubah
  useEffect(() => {
    setCurrentPage(1)
  }, [filters.search, filters.type, filters.quickFilter, filters.location, filters.sort])

  // Filter di sisi klien untuk search & quick filters agar responsif instan
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      // 1. Search text filter
      if (filters.search) {
        const query = filters.search.toLowerCase()
        const matchTitle = opp.title.toLowerCase().includes(query)
        const matchCompany = opp.company.toLowerCase().includes(query)
        const matchLoc = opp.location?.toLowerCase().includes(query) ?? false
        const matchSkill = opp.allSkills.some(s => s.name.toLowerCase().includes(query))

        if (!matchTitle && !matchCompany && !matchLoc && !matchSkill) {
          return false
        }
      }

      // 2. Quick filters: Sesuai arah karier
      if (filters.quickFilter === 'career_target') {
        if (!opp.isCareerTargetMatch) {
          return false
        }
      }

      return true
    })
  }, [opportunities, filters.search, filters.quickFilter])

  // Hitung jumlah untuk chip badge
  const counts = useMemo(() => {
    return {
      all: opportunities.length,
      internship: opportunities.filter(o => o.type === 'internship').length,
      full_time: opportunities.filter(o => o.type === 'full_time').length,
      part_time: opportunities.filter(o => o.type === 'part_time').length,
      freelance: opportunities.filter(o => o.type === 'freelance').length,
      competition: opportunities.filter(o => o.type === 'competition').length,
      careerTarget: opportunities.filter(o => o.isCareerTargetMatch).length,
      saved: opportunities.filter(o => o.isSaved).length
    }
  }, [opportunities])

  // Daftar lowongan yang tersimpan
  const savedOpportunities = useMemo(() => {
    return opportunities.filter(o => o.isSaved)
  }, [opportunities])

  // Data terpaginasi (maksimal 6 card per halaman)
  const totalPages = Math.max(1, Math.ceil(filteredOpportunities.length / ITEMS_PER_PAGE))

  const paginatedOpportunities = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE

    return filteredOpportunities.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredOpportunities, currentPage])

  // Handler toggle save bookmark secara optimistik
  const handleToggleSave = async (item: OpportunityItem) => {
    const oppId = item.id
    const prevSaved = item.isSaved
    const newSaved = !prevSaved

    // Optimistic UI update
    setOpportunities(prev =>
      prev.map(opp => (opp.id === oppId ? { ...opp, isSaved: newSaved } : opp))
    )

    if (selectedOpportunity && selectedOpportunity.id === oppId) {
      setSelectedOpportunity(prev => (prev ? { ...prev, isSaved: newSaved } : null))
    }

    setSavingIds(prev => new Set(prev).add(oppId))

    try {
      const res = await fetch(`/api/opportunities/${oppId}/save`, {
        method: 'POST'
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Gagal mengubah status bookmark')
      }

      showToast(
        newSaved
          ? `⭐ Disimpan! "${item.title}" ditambahkan ke daftar tersimpan.`
          : `Dihapus dari daftar lowongan tersimpan.`
      )
    } catch (err: any) {
      console.error('Bookmark error:', err)

      // Rollback jika request gagal
      setOpportunities(prev =>
        prev.map(opp => (opp.id === oppId ? { ...opp, isSaved: prevSaved } : opp))
      )

      if (selectedOpportunity && selectedOpportunity.id === oppId) {
        setSelectedOpportunity(prev => (prev ? { ...prev, isSaved: prevSaved } : null))
      }

      showToast('❌ Gagal menyimpan perubahan bookmark. Coba lagi.')
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev)

        next.delete(oppId)
        
return next
      })
    }
  }

  // Handler apply external
  const handleApply = (item: OpportunityItem) => {
    if (item.sourceUrl) {
      showToast(`Membuka situs resmi ${item.company}...`)
      window.open(item.sourceUrl, '_blank', 'noopener,noreferrer')
    } else {
      showToast(`Tautan pendaftaran belum tersedia untuk ${item.company}`)
    }
  }

  // Handler open modal detail
  const handleOpenDetail = (item: OpportunityItem) => {
    setSelectedOpportunity(item)
    setIsModalOpen(true)
  }

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      quickFilter: 'all',
      location: '',
      sort: 'match_desc'
    })
  }

  return (
    <div
      style={{ fontFamily: "'Poppins', sans-serif" }}
      className='flex flex-col gap-6 w-full max-w-[1440px] mx-auto pb-16 font-["Poppins",sans-serif]'
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className='fixed bottom-6 right-6 z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-300'>
          <div className='flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 text-xs sm:text-sm font-medium'>
            <div className='w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0'>
              <CheckCircle2 className='w-3.5 h-3.5 stroke-[2.8]' />
            </div>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 1. Header Section */}
      <OpportunitiesHeader
        savedOpportunitiesCount={counts.saved}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
      />

      {/* 2. Filter & Controls Bar */}
      <OpportunitiesFilterBar
        filterState={filters}
        onSearchChange={val => setFilters(prev => ({ ...prev, search: val }))}
        onTypeChange={val => setFilters(prev => ({ ...prev, type: val }))}
        onQuickFilterChange={val => setFilters(prev => ({ ...prev, quickFilter: val }))}
        onLocationChange={val => setFilters(prev => ({ ...prev, location: val }))}
        onSortChange={val => setFilters(prev => ({ ...prev, sort: val }))}
        onResetFilters={handleResetFilters}
        counts={counts}
      />

      {/* 3. Error Banner if any */}
      {error && (
        <div className='p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-between text-xs sm:text-sm text-rose-700 dark:text-rose-300'>
          <div className='flex items-center gap-2'>
            <AlertTriangle className='w-4 h-4 text-rose-600' />
            <span>{error}</span>
          </div>
          <button
            type='button'
            onClick={() => fetchOpportunities()}
            className='underline font-semibold cursor-pointer'
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* 4. Opportunity Cards Grid or Skeleton */}
      {isLoading ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className='p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 animate-pulse'
            >
              <div className='space-y-2 flex-1'>
                <div className='h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4' />
                <div className='h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4' />
              </div>
              <div className='h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-full' />
              <div className='h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-2/3' />
              <div className='h-8 bg-slate-100 dark:bg-slate-800/60 rounded-xl w-full' />
            </div>
          ))}
        </div>
      ) : filteredOpportunities.length === 0 ? (
        <OpportunitiesEmptyState
          hasFilters={
            Boolean(filters.search) ||
            filters.type !== 'all' ||
            filters.quickFilter !== 'all' ||
            Boolean(filters.location)
          }
          onResetFilters={handleResetFilters}
        />
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
          {paginatedOpportunities.map(opp => (
            <OpportunityCard
              key={opp.id}
              item={opp}
              onSelect={handleOpenDetail}
              onToggleSave={handleToggleSave}
              onApply={handleApply}
              isSaving={savingIds.has(opp.id)}
            />
          ))}
        </div>
      )}

      {/* 5. Pagination Controls (Maksimal 6 card per page) */}
      {!isLoading && filteredOpportunities.length > 0 && totalPages > 1 && (
        <div className='flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200/80 dark:border-slate-800'>
          <p className='text-xs sm:text-sm text-slate-500 dark:text-slate-400'>
            Menampilkan <span className='font-semibold text-slate-700 dark:text-slate-200'>{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> -{' '}
            <span className='font-semibold text-slate-700 dark:text-slate-200'>
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredOpportunities.length)}
            </span>{' '}
            dari{' '}
            <span className='font-semibold text-slate-700 dark:text-slate-200'>{filteredOpportunities.length}</span> peluang
          </p>

          <div className='flex items-center gap-1.5'>
            <button
              type='button'
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className='inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer'
            >
              <ChevronLeft className='w-4 h-4' />
              <span>Sebelumnya</span>
            </button>

            <div className='flex items-center gap-1'>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  type='button'
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              type='button'
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className='inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer'
            >
              <span>Selanjutnya</span>
              <ChevronRight className='w-4 h-4' />
            </button>
          </div>
        </div>
      )}

      {/* 6. Detail Modal */}
      <OpportunityDetailModal
        item={selectedOpportunity}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onToggleSave={handleToggleSave}
        onApply={handleApply}
        isSaving={selectedOpportunity ? savingIds.has(selectedOpportunity.id) : false}
      />

      {/* 7. Saved Opportunities Modal */}
      <SavedOpportunitiesModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedItems={savedOpportunities}
        onSelect={handleOpenDetail}
        onToggleSave={handleToggleSave}
        onApply={handleApply}
      />
    </div>
  )
}
