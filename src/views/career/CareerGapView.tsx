'use client'

import React, { useState, useEffect, useCallback } from 'react'

import {
  Briefcase,
  ChevronDown,
  CheckCircle2,
  RefreshCw,
  Loader2
} from 'lucide-react'

import HeroMatchCard from './HeroMatchCard'
import DetailedSkillMatrix from './DetailedSkillMatrix'
import GrowthRoadmap from './GrowthRoadmap'
import ChangeTargetModal, { type CareerRoleOption } from './ChangeTargetModal'
import LearningResourcesModal from './LearningResourcesModal'
import SkillDetailModal from './SkillDetailModal'
import CareerGapSkeleton from './CareerGapSkeleton'
import { clientCache, CACHE_KEYS } from '@/libs/clientCache'
import type { CareerTargetProfile, SkillChipItem, LearningResourceItem } from '@/types/career'

interface CareerCacheData {
  career: CareerTargetProfile | null
  availableRoles: CareerRoleOption[]
  learningResources: LearningResourceItem[]
}

export default function CareerGapView() {
  // Current active career profile from Supabase
  const [career, setCareer] = useState<CareerTargetProfile | null>(() => {
    const cached = clientCache.get<CareerCacheData>(CACHE_KEYS.CAREER_ACTIVE)
    return cached?.career || null
  })
  const [availableRoles, setAvailableRoles] = useState<CareerRoleOption[]>(() => {
    const cached = clientCache.get<CareerCacheData>(CACHE_KEYS.CAREER_ACTIVE)
    return cached?.availableRoles || []
  })
  const [learningResources, setLearningResources] = useState<LearningResourceItem[]>(() => {
    const cached = clientCache.get<CareerCacheData>(CACHE_KEYS.CAREER_ACTIVE)
    return cached?.learningResources || []
  })
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return !clientCache.has(CACHE_KEYS.CAREER_ACTIVE)
  })

  // Modals state
  const [isChangeTargetOpen, setIsChangeTargetOpen] = useState(false)
  const [isLearningModalOpen, setIsLearningModalOpen] = useState(false)
  const [selectedSkillForDetail, setSelectedSkillForDetail] = useState<SkillChipItem | null>(null)
  const [learningSkillFilter, setLearningSkillFilter] = useState<string | undefined>(undefined)

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Fetch career gap data from Supabase backend via /api/career
  const fetchCareerData = useCallback(async (roleId?: string, silent = false) => {
    try {
      if (!silent) setIsLoading(true)
      const url = roleId ? `/api/career?roleId=${encodeURIComponent(roleId)}` : '/api/career'
      const res = await fetch(url)

      if (!res.ok) {
        if (res.status === 401) {
          return
        }

        return
      }

      const json = await res.json()

      if (json.success && json.data) {
        const cacheData: CareerCacheData = {
          career: json.data.career,
          availableRoles: json.data.availableRoles || [],
          learningResources: json.data.learningResources || []
        }
        setCareer(cacheData.career)
        setAvailableRoles(cacheData.availableRoles)
        setLearningResources(cacheData.learningResources)
        if (!roleId) {
          clientCache.set(CACHE_KEYS.CAREER_ACTIVE, cacheData)
        }
      }
    } catch (err) {
      console.error('Gagal mengambil data analisis karier dari Database:', err)
      if (!silent) showToast('Gagal memuat analisis karier dari Database.')
    } finally {
      if (!silent) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const cached = clientCache.get<CareerCacheData>(CACHE_KEYS.CAREER_ACTIVE)
    if (cached) {
      setCareer(cached.career)
      setAvailableRoles(cached.availableRoles)
      setLearningResources(cached.learningResources)
      setIsLoading(false)
      if (clientCache.isStale(CACHE_KEYS.CAREER_ACTIVE)) {
        fetchCareerData(undefined, true)
      }
    } else {
      fetchCareerData(undefined, false)
    }
  }, [fetchCareerData])

  // Handle career target switch via Supabase
  const handleSelectRole = async (roleId: string) => {
    try {
      setIsLoading(true)

      const res = await fetch('/api/career', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change_target', careerRoleId: roleId })
      })

      const json = await res.json()

      if (json.success && json.data?.career) {
        clientCache.invalidate([CACHE_KEYS.CAREER_ACTIVE, CACHE_KEYS.DASHBOARD_SUMMARY, CACHE_KEYS.LEARNING])
        setCareer(json.data.career)
        showToast(`🎉 Target karier dialihkan ke ${json.data.career.title}!`);
        fetchCareerData(undefined, true)
      } else {
        showToast(`❌ ${json.message || 'Gagal mengubah target karier'}`)
      }
    } catch (err) {
      console.error('Error changing target:', err)
      showToast('❌ Terjadi kesalahan saat mengubah target karier di Database.')
    } finally {
      setIsLoading(false)
    }
  }


  // Open learning modal with specific skill
  const handleOpenLearningWithSkill = (skillName?: string) => {
    setLearningSkillFilter(skillName)
    setIsLearningModalOpen(true)
  }

  if (isLoading && !career) {
    return <CareerGapSkeleton />
  }

  if (!career) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] w-full gap-4 text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800'>
        <Briefcase className='w-12 h-12 text-slate-400' />
        <h3 className='text-base font-bold text-slate-800 dark:text-white'>
          Data Target Karier Belum Tersedia
        </h3>
        <p className='text-xs text-slate-500 max-w-md'>
          Belum dapat memuat target karier aktif dari Database. Silakan coba muat ulang halaman.
        </p>
        <button
          type='button'
          onClick={() => fetchCareerData()}
          className='px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700'
        >
          Muat Ulang
        </button>
      </div>
    )
  }

  return (
    <div
      style={{ fontFamily: "'Poppins', sans-serif" }}
      className='flex flex-col gap-6 w-full max-w-[1440px] mx-auto pb-12 font-["Poppins",sans-serif]'
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
      <section className='flex flex-col md:flex-row md:items-start md:justify-between gap-4 pt-1'>
        <div className='flex flex-col gap-1'>
          {/* Title (H1): Karier & Analisis Skill Gap */}
          <h1 className='text-2xl sm:text-3xl font-extrabold text-[#1E293B] dark:text-white tracking-tight mt-0.5'>
            Karier & Analisis Skill Gap
          </h1>

          {/* Subtitle */}
          <p className='text-xs sm:text-sm text-[#64748B] dark:text-slate-400 max-w-2xl leading-relaxed'>
            Bandingkan skill portofolio Anda dengan standar industri untuk posisi impian Anda.
          </p>
        </div>

        {/* Right side: Target Posisi selector card & Refresh Button */}
        <div className='flex items-center gap-3 shrink-0 self-start md:self-auto'>
          {/* Target Position Dropdown Card */}
          <button
            type='button'
            onClick={() => setIsChangeTargetOpen(true)}
            className='inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 transition-all text-left shadow-xs cursor-pointer group'
          >
            <div className='w-7 h-7 rounded-lg bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shrink-0'>
              <Briefcase className='w-4 h-4' />
            </div>
            <div className='flex flex-col pr-1'>
              <span className='text-[10px] text-slate-400 uppercase font-medium'>
                Target Posisi
              </span>
              <span className='text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight group-hover:text-blue-600 transition-colors'>
                {career.title}
              </span>
            </div>
            <ChevronDown className='w-3.5 h-3.5 text-slate-400 group-hover:translate-y-0.5 transition-transform' />
          </button>

          <button
            type='button'
            onClick={() => fetchCareerData()}
            className='p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all shadow-xs cursor-pointer'
            title='Perbarui dari Database'
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </section>

      {/* 3. HERO MATCH SECTION */}
      <HeroMatchCard career={career} />

      {/* 4. DETAIL PEMETAAN SKILL MATRIX */}
      <DetailedSkillMatrix
        career={career}
        onOpenLearning={skillName => handleOpenLearningWithSkill(skillName)}
      />

      {/* 5. RUTE PERTUMBUHAN 30 HARI */}
      <GrowthRoadmap
        career={career}
        onOpenLearning={skillName => handleOpenLearningWithSkill(skillName)}
      />

      {/* Modals */}
      <ChangeTargetModal
        isOpen={isChangeTargetOpen}
        currentCareerId={career.id}
        roles={availableRoles}
        onClose={() => setIsChangeTargetOpen(false)}
        onSelectRole={handleSelectRole}
      />

      <LearningResourcesModal
        isOpen={isLearningModalOpen}
        initialSkillFilter={learningSkillFilter}
        resources={learningResources}
        onClose={() => setIsLearningModalOpen(false)}
      />

      <SkillDetailModal
        skill={selectedSkillForDetail}
        onClose={() => setSelectedSkillForDetail(null)}
        onOpenLearningForSkill={skillName => handleOpenLearningWithSkill(skillName)}
      />
    </div>
  )
}
