'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'

import {
  CheckCircle2,
  RotateCcw,
  Search,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

import LearningHeader from './LearningHeader'
import { clientCache, CACHE_KEYS } from '@/libs/clientCache'
import FeaturedRecommendationCard from './FeaturedRecommendationCard'
import LearningFilterBar from './LearningFilterBar'
import LearningCard from './LearningCard'
import ImpactSimulationBanner from './ImpactSimulationBanner'
import SavedModulesModal from './SavedModulesModal'
import type {
  LearningCategory,
  DifficultyLevel,
  SortOption,
  LearningCardItem
} from '@/types/learning'

interface LearningApiResponse {
  featuredResource: LearningCardItem | null
  resources: LearningCardItem[]
  bookmarkedIds: string[]
  header: {
    careerTarget: string
    selectedModulesCount: number
    priorityGapsCount: number
  }
  impact: {
    currentScore: number
    potentialScore: number
    improvement: number
    targetScore: number
  }
}

export default function LearningRecommendationsView() {
  // Remote Data State from Supabase
  const [featuredResource, setFeaturedResource] = useState<LearningCardItem | null>(null)
  const [resources, setResources] = useState<LearningCardItem[]>([])
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([])

  const [headerData, setHeaderData] = useState({
    careerTarget: 'Karier Impian',
    selectedModulesCount: 0,
    priorityGapsCount: 0
  })

  const [impactData, setImpactData] = useState({
    currentScore: 25,
    potentialScore: 50,
    improvement: 25,
    targetScore: 80
  })

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<LearningCategory>('semua')
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('all')
  const [selectedSort, setSelectedSort] = useState<SortOption>('match')

  // Pagination State (Max 6 cards per page)
  const ITEMS_PER_PAGE = 6
  const [currentPage, setCurrentPage] = useState(1)

  // Filter change handlers that reset page to 1
  const handleSelectCategory = (cat: LearningCategory) => {
    setSelectedCategory(cat)
    setCurrentPage(1)
  }

  const handleSelectDifficulty = (diff: DifficultyLevel) => {
    setSelectedDifficulty(diff)
    setCurrentPage(1)
  }

  const handleSelectSort = (sort: SortOption) => {
    setSelectedSort(sort)
    setCurrentPage(1)
  }

  // Saved Modules Modal State
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false)

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Fetch learning data from Supabase
  const fetchLearningData = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true)
      setError(null)

      const res = await fetch('/api/learning')
      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Gagal memuat rekomendasi belajar dari Supabase.')
      }

      const data: LearningApiResponse = json.data

      setFeaturedResource(data.featuredResource)
      setResources(data.resources || [])
      setBookmarkedIds(data.bookmarkedIds || [])
      if (data.header) setHeaderData(data.header)
      if (data.impact) setImpactData(data.impact)
      clientCache.set(CACHE_KEYS.LEARNING, data)
    } catch (err: unknown) {
      console.error('Failed to load learning data from Supabase:', err)
      if (!silent) setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data.')
    } finally {
      if (!silent) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const cached = clientCache.get<LearningApiResponse>(CACHE_KEYS.LEARNING)
    if (cached) {
      setFeaturedResource(cached.featuredResource)
      setResources(cached.resources || [])
      setBookmarkedIds(cached.bookmarkedIds || [])
      if (cached.header) setHeaderData(cached.header)
      if (cached.impact) setImpactData(cached.impact)
      setIsLoading(false)
      if (clientCache.isStale(CACHE_KEYS.LEARNING)) {
        fetchLearningData(true)
      }
    } else {
      fetchLearningData(false)
    }
  }, [fetchLearningData])

  // Handle Bookmark Toggle with optimistic update & Supabase sync
  const handleToggleBookmark = async (id: string) => {
    const isCurrentlyBookmarked = bookmarkedIds.includes(id)

    const nextBookmarked = isCurrentlyBookmarked
      ? bookmarkedIds.filter(item => item !== id)
      : [...bookmarkedIds, id]

    setBookmarkedIds(nextBookmarked)
    setHeaderData(prev => ({
      ...prev,
      selectedModulesCount: nextBookmarked.length
    }))
    const cached = clientCache.get<LearningApiResponse>(CACHE_KEYS.LEARNING)
    if (cached) {
      clientCache.set(CACHE_KEYS.LEARNING, {
        ...cached,
        bookmarkedIds: nextBookmarked,
        header: cached.header ? { ...cached.header, selectedModulesCount: nextBookmarked.length } : cached.header
      })
    }

    try {
      const res = await fetch('/api/learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_bookmark',
          resourceId: id
        })
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Gagal menyimpan perubahan ke Supabase.')
      }

      showToast(json.data?.message || (isCurrentlyBookmarked ? 'Modul dihapus dari daftar tersimpan.' : 'Modul berhasil disimpan ke daftar belajar!'))

      if (Array.isArray(json.data?.bookmarkedIds)) {
        setBookmarkedIds(json.data.bookmarkedIds)
      }
    } catch (err) {
      // Revert state on error
      setBookmarkedIds(bookmarkedIds)
      setHeaderData(prev => ({
        ...prev,
        selectedModulesCount: bookmarkedIds.length
      }))
      showToast('Gagal mengubah status bookmark. Silakan coba lagi.')
      console.error(err)
    }
  }

  // Handle Access Learning Resource directly via URL
  const handleStartLearning = (item: LearningCardItem) => {
    if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer')
      showToast(`Membuka ${item.title} di platform ${item.platform}...`)
    }
  }

  // Combine featured and regular resources for category counts
  const allResources = useMemo(() => {
    return [
      ...(featuredResource ? [featuredResource] : []),
      ...resources
    ]
  }, [featuredResource, resources])

  // Calculate dynamic category counts from Supabase
  const counts = useMemo(() => {
    return {
      semua: allResources.length,
      course: allResources.filter(r => r.category === 'course').length,
      artikel: allResources.filter(r => r.category === 'artikel').length,
      video: allResources.filter(r => r.category === 'video').length,
      bootcamp: allResources.filter(r => r.category === 'bootcamp').length
    }
  }, [allResources])

  // Filter & Sort Logic for regular resources
  const filteredAndSortedResources = useMemo(() => {
    const result = resources.filter(item => {
      // Category Filter
      const matchCat = selectedCategory === 'semua' || item.category === selectedCategory

      // Difficulty Filter
      const matchDiff = selectedDifficulty === 'all' || item.difficulty === selectedDifficulty

      return matchCat && matchDiff
    })

    // Sort Logic
    result.sort((a, b) => {
      if (selectedSort === 'match') {
        return b.matchPercent - a.matchPercent
      }

      if (selectedSort === 'rating') {
        return b.rating - a.rating
      }

      if (selectedSort === 'duration') {
        const numA = parseFloat(a.duration) || 99
        const numB = parseFloat(b.duration) || 99

        return numA - numB
      }

      return 0
    })

    return result
  }, [resources, selectedCategory, selectedDifficulty, selectedSort])

  // Saved resources for the modal
  const savedResources = useMemo(() => {
    return allResources.filter(item => bookmarkedIds.includes(item.id))
  }, [allResources, bookmarkedIds])

  // Pagination calculation
  const totalPages = Math.ceil(filteredAndSortedResources.length / ITEMS_PER_PAGE)

  const paginatedResources = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE

    return filteredAndSortedResources.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredAndSortedResources, currentPage])

  return (
    <div
      style={{ fontFamily: "'Poppins', sans-serif" }}
      className='flex flex-col gap-6 w-full max-w-[1440px] mx-auto pb-16 font-["Poppins",sans-serif]'
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className='fixed bottom-6 right-6 z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-300'>
          <div className='flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-700 text-xs sm:text-sm font-medium'>
            <div className='w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0'>
              <CheckCircle2 className='w-3.5 h-3.5 stroke-[2.8]' />
            </div>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 1. PAGE HEADER */}
      <LearningHeader
        careerTarget={headerData.careerTarget}
        savedModulesCount={bookmarkedIds.length}
        priorityGapsCount={headerData.priorityGapsCount}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
      />

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className='flex flex-col gap-6 w-full animate-pulse'>
          {/* Featured Card Skeleton */}
          <div className='w-full h-72 rounded-2xl bg-indigo-50/70 dark:bg-slate-800/50 border border-indigo-100 dark:border-slate-800' />

          {/* Filter Bar Skeleton */}
          <div className='w-full h-12 rounded-xl bg-slate-100 dark:bg-slate-800' />

          {/* Grid Cards Skeleton */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6'>
            {[1, 2, 3, 4, 5, 6].map(idx => (
              <div
                key={idx}
                className='h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700'
              />
            ))}
          </div>
        </div>
      ) : error ? (

        /* Error State */
        <div className='flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/50 text-center gap-3'>
          <div className='w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center'>
            <AlertCircle className='w-6 h-6' />
          </div>
          <h4 className='text-base font-bold text-slate-900 dark:text-white'>
            Gagal Memuat Rekomendasi
          </h4>
          <p className='text-xs text-slate-500 dark:text-slate-400 max-w-sm'>
            {error}
          </p>
          <button
            type='button'
            onClick={() => fetchLearningData()}
            className='inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer mt-1'
          >
            <RotateCcw className='w-3.5 h-3.5' />
            <span>Coba Lagi</span>
          </button>
        </div>
      ) : (
        <>
          {/* 2. PINNED TOP SECTION: AI Recommendation Highlight Card */}
          {featuredResource && (
            <FeaturedRecommendationCard
              item={featuredResource}
              isBookmarked={bookmarkedIds.includes(featuredResource.id)}
              onToggleBookmark={handleToggleBookmark}
              onStartLearning={handleStartLearning}
            />
          )}

          {/* 3. FILTER BAR */}
          <LearningFilterBar
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            selectedDifficulty={selectedDifficulty}
            onSelectDifficulty={handleSelectDifficulty}
            selectedSort={selectedSort}
            onSelectSort={handleSelectSort}
            counts={counts}
          />

          {/* 4. RESOURCE LIST (3 COLUMNS ON DESKTOP - MAX 6 CARDS PER PAGE) */}
          {filteredAndSortedResources.length > 0 ? (
            <div className='flex flex-col gap-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6'>
                {paginatedResources.map(resource => (
                  <LearningCard
                    key={resource.id}
                    item={resource}
                    isBookmarked={bookmarkedIds.includes(resource.id)}
                    onToggleBookmark={handleToggleBookmark}
                    onStartLearning={handleStartLearning}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className='flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/80'>
                  <div className='text-xs text-slate-500 dark:text-slate-400'>
                    Menampilkan{' '}
                    <span className='font-semibold text-slate-800 dark:text-slate-200'>
                      {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                      {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedResources.length)}
                    </span>{' '}
                    dari{' '}
                    <span className='font-semibold text-slate-800 dark:text-slate-200'>
                      {filteredAndSortedResources.length}
                    </span>{' '}
                    modul belajar
                  </div>

                  <div className='flex items-center gap-1.5'>
                    <button
                      type='button'
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className='inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer'
                    >
                      <ChevronLeft className='w-4 h-4' />
                      <span>Sebelumnya</span>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        type='button'
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentPage === page
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      type='button'
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className='inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer'
                    >
                      <span>Selanjutnya</span>
                      <ChevronRight className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (

            /* Empty State */
            <div className='flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center gap-3'>
              <div className='w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400'>
                <Search className='w-6 h-6' />
              </div>
              <h4 className='text-base font-bold text-slate-900 dark:text-white'>
                Tidak ada materi yang sesuai
              </h4>
              <p className='text-xs text-slate-500 dark:text-slate-400 max-w-sm'>
                Coba ubah kata kunci pencarian atau sesuaikan pilihan filter kategori dan tingkat kesulitan.
              </p>
              <button
                type='button'
                onClick={() => {
                  handleSelectCategory('semua')
                  handleSelectDifficulty('all')
                }}
                className='inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 transition-colors cursor-pointer mt-1'
              >
                <RotateCcw className='w-3.5 h-3.5' />
                <span>Reset Semua Filter</span>
              </button>
            </div>
          )}

          {/* 5. BOTTOM SECTION: SIMULASI DAMPAK BELAJAR & SYNC NOTICE */}
          <ImpactSimulationBanner
            currentScore={impactData.currentScore}
            potentialScore={impactData.potentialScore}
            improvement={impactData.improvement}
            targetScore={impactData.targetScore}
            moduleCount={bookmarkedIds.length > 0 ? bookmarkedIds.length : (headerData.priorityGapsCount || 4)}
          />

          {/* Saved Modules Modal */}
          <SavedModulesModal
            isOpen={isSavedModalOpen}
            onClose={() => setIsSavedModalOpen(false)}
            savedItems={savedResources}
            onToggleBookmark={handleToggleBookmark}
            onStartLearning={handleStartLearning}
          />
        </>
      )}
    </div>
  )
}
