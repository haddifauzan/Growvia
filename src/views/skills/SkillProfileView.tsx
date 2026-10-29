'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'

import Link from 'next/link'
import { clientCache, CACHE_KEYS } from '@/libs/clientCache'

import {
  Sparkles,
  Plus,
  LayoutGrid,
  Network,
  ShieldCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Check,
  RefreshCw,
  Loader2
} from 'lucide-react'

import SkillCategoryRow from './SkillCategoryRow'
import CompetencyBanner from './CompetencyBanner'
import SkillCard from './SkillCard'
import SkillMapGraph from './SkillMapGraph'
import EvidenceView from './EvidenceView'
import AddSkillModal from './AddSkillModal'
import EditSkillModal from './EditSkillModal'
import DeleteSkillModal from './DeleteSkillModal'
import BenchmarkModal from './BenchmarkModal'
import type { SkillItem, SkillCategoryType, SkillCategorySummary, SkillMapNode, SkillMapEdge, EvidenceDetail } from '@/types/skills'

const CATEGORY_CONFIGS: { category: SkillCategoryType; label: string; color: string; bgLight: string; iconName: string }[] = [
  { category: 'soft_skill', label: 'Soft Skills', color: '#2563EB', bgLight: '#EFF6FF', iconName: 'Users' },
  { category: 'hard_skill', label: 'Hard Skills', color: '#6366F1', bgLight: '#EEF2FF', iconName: 'Target' },
  { category: 'technical', label: 'Technical', color: '#10B981', bgLight: '#ECFDF5', iconName: 'Code' },
  { category: 'leadership', label: 'Leadership', color: '#F59E0B', bgLight: '#FEF3C7', iconName: 'Trophy' }
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

// Canonical organic positions matching reference design
const CANONICAL_SKILL_POSITIONS: { match: string; x: number; y: number }[] = [
  { match: 'python', x: 215, y: 135 },
  { match: 'tailwind', x: 470, y: 110 },
  { match: 'figma systems', x: 640, y: 95 },
  { match: 'typescript', x: 795, y: 165 },
  { match: 'wireframing', x: 900, y: 260 },
  { match: 'executive', x: 155, y: 285 },
  { match: 'financial', x: 470, y: 280 },
  { match: 'postgres', x: 710, y: 320 },
  { match: 'cross-functional', x: 335, y: 395 },
  { match: 'problem solving', x: 530, y: 425 },
  { match: 'corporate', x: 790, y: 455 },
  { match: 'react', x: 95, y: 440 },
  { match: 'prisma', x: 205, y: 575 },
  { match: 'auto-layout', x: 420, y: 580 },
  { match: 'next.js', x: 660, y: 530 },
  { match: 'data processing', x: 650, y: 650 },
  { match: 'team leadership', x: 890, y: 575 },
  { match: 'leadership', x: 890, y: 575 }
]

const ORGANIC_FALLBACK_SLOTS = [
  { x: 310, y: 210 },
  { x: 590, y: 220 },
  { x: 840, y: 360 },
  { x: 280, y: 490 },
  { x: 510, y: 630 },
  { x: 760, y: 590 },
  { x: 140, y: 170 },
  { x: 380, y: 110 },
  { x: 720, y: 120 },
  { x: 860, y: 190 },
  { x: 230, y: 340 },
  { x: 620, y: 370 },
  { x: 920, y: 420 },
  { x: 130, y: 580 },
  { x: 360, y: 650 },
  { x: 820, y: 660 }
]

const CANONICAL_EDGE_PAIRS: [string, string][] = [
  ['python', 'executive'],
  ['python', 'tailwind'],
  ['python', 'cross-functional'],
  ['python', 'corporate'],
  ['react', 'executive'],
  ['react', 'prisma'],
  ['prisma', 'cross-functional'],
  ['prisma', 'auto-layout'],
  ['executive', 'cross-functional'],
  ['cross-functional', 'tailwind'],
  ['cross-functional', 'problem solving'],
  ['tailwind', 'financial'],
  ['tailwind', 'figma systems'],
  ['figma systems', 'typescript'],
  ['figma systems', 'next.js'],
  ['typescript', 'wireframing'],
  ['typescript', 'financial'],
  ['typescript', 'postgres'],
  ['wireframing', 'corporate'],
  ['financial', 'problem solving'],
  ['problem solving', 'postgres'],
  ['problem solving', 'next.js'],
  ['postgres', 'corporate'],
  ['auto-layout', 'next.js'],
  ['auto-layout', 'data processing'],
  ['next.js', 'data processing'],
  ['next.js', 'team leadership'],
  ['corporate', 'team leadership']
]

export default function SkillProfileView() {
  // Navigation tab state: 'overview' | 'skill_map' | 'evidence'
  const [activeTab, setActiveTab] = useState<'overview' | 'skill_map' | 'evidence'>('overview')

  // Live Skills & Evidences State from Supabase
  const [skills, setSkills] = useState<SkillItem[]>(() => {
    const cached = clientCache.get<{ skills: SkillItem[]; evidences: EvidenceDetail[] }>(CACHE_KEYS.SKILLS)
    return cached?.skills || []
  })
  const [evidences, setEvidences] = useState<EvidenceDetail[]>(() => {
    const cached = clientCache.get<{ skills: SkillItem[]; evidences: EvidenceDetail[] }>(CACHE_KEYS.SKILLS)
    return cached?.evidences || []
  })
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return !clientCache.has(CACHE_KEYS.SKILLS)
  })
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<SkillCategoryType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedSkillForEdit, setSelectedSkillForEdit] = useState<SkillItem | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedSkillForDelete, setSelectedSkillForDelete] = useState<SkillItem | null>(null)
  const [isBenchmarkModalOpen, setIsBenchmarkModalOpen] = useState(false)

  // Highlight state for navigating from SkillCard to EvidenceView
  const [highlightedSkillName, setHighlightedSkillName] = useState<string | null>(null)
  const [highlightedExperienceKey, setHighlightedExperienceKey] = useState<string | null>(null)

  // Pagination State (9 items on desktop, 6 items on mobile)
  const [currentPage, setCurrentPage] = useState(1)
  const [isMobile, setIsMobile] = useState(false)
  const skillsGridRef = React.useRef<HTMLDivElement>(null)

  // Responsive itemsPerPage detector
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Reset page when search or category filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, activeCategoryFilter])

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Fetch skills & evidences from Supabase database via /api/skills
  const fetchSkills = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true)
      const res = await fetch('/api/skills')

      if (!res.ok) {
        if (res.status === 401) {
          return
        }

        return
      }

      const json = await res.json()

      if (json.success && json.data) {
        const skillList = json.data.skills || []
        const evidenceList = json.data.evidences || []
        setSkills(skillList)
        setEvidences(evidenceList)
        clientCache.set(CACHE_KEYS.SKILLS, { skills: skillList, evidences: evidenceList })
      }
    } catch (err) {
      console.error('Gagal mengambil data skill dari database Supabase:', err)
      if (!silent) showToast('Gagal memuat data skill dari Supabase.')
    } finally {
      if (!silent) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const cached = clientCache.get<{ skills: SkillItem[]; evidences: EvidenceDetail[] }>(CACHE_KEYS.SKILLS)
    if (cached) {
      setSkills(cached.skills)
      setEvidences(cached.evidences)
      setIsLoading(false)
      if (clientCache.isStale(CACHE_KEYS.SKILLS)) {
        fetchSkills(true)
      }
    } else {
      fetchSkills(false)
    }
  }, [fetchSkills])


// Calculate dynamic category summaries from live skills
  const categorySummaries: SkillCategorySummary[] = useMemo(() => {
    const total = skills.length

    const counts: Record<SkillCategoryType, number> = {
      soft_skill: 0,
      hard_skill: 0,
      technical: 0,
      leadership: 0
    }

    skills.forEach(s => {
      if (counts[s.category] !== undefined) {
        counts[s.category]++
      }
    })

    return CATEGORY_CONFIGS.map(cfg => ({
      category: cfg.category,
      label: cfg.label,
      count: counts[cfg.category] || 0,
      percentage: total > 0 ? Math.round(((counts[cfg.category] || 0) / total) * 100) : 0,
      color: cfg.color,
      bgLight: cfg.bgLight,
      iconName: cfg.iconName
    }))
  }, [skills])

  // Unique experience count for Bukti Pengalaman tab badge
  const uniqueExperiencesCount = useMemo(() => {
    const set = new Set(
      evidences.map(
        e =>
          e.experienceId ||
          `${e.experienceTitle.trim().toLowerCase()}__${e.institutionName.trim().toLowerCase()}`
      )
    )

    return set.size
  }, [evidences])

  // Dynamically compute SkillMapNodes from live skills with organic scattered positions
  const skillMapNodes: SkillMapNode[] = useMemo(() => {
    const total = skills.length

    if (total === 0) return []

    return skills.map((s, idx) => {
      let colorType: SkillMapNode['colorType'] = 'orange'

      if (s.score >= 85) colorType = 'green'
      else if (s.category === 'hard_skill') colorType = 'blue'
      else if (s.source === 'ai_extracted') colorType = 'indigo'

      const norm = s.name.toLowerCase().trim()
      const matchedCanonical = CANONICAL_SKILL_POSITIONS.find(c => norm.includes(c.match))
      const fallback = ORGANIC_FALLBACK_SLOTS[idx % ORGANIC_FALLBACK_SLOTS.length]

      const x = matchedCanonical ? matchedCanonical.x : fallback.x
      const y = matchedCanonical ? matchedCanonical.y : fallback.y

      return {
        id: s.id,
        name: s.name,
        category: s.category,
        colorType,
        level: s.level,
        score: s.score,
        evidenceCount: s.evidenceCount,
        evidenceTags: s.evidenceTags,
        x,
        y
      }
    })
  }, [skills])

  // Dynamically compute SkillMapEdges matching the reference organic network
  const skillMapEdges: SkillMapEdge[] = useMemo(() => {
    if (skills.length < 2) return []

    const edges: SkillMapEdge[] = []
    const added = new Set<string>()

    // 1. Connect canonical pairs first
    for (let i = 0; i < skills.length; i++) {
      for (let j = i + 1; j < skills.length; j++) {
        const s1 = skills[i]
        const s2 = skills[j]
        const norm1 = s1.name.toLowerCase().trim()
        const norm2 = s2.name.toLowerCase().trim()
        const pairKey = [s1.id, s2.id].sort().join('--')

        const isCanonical = CANONICAL_EDGE_PAIRS.some(
          ([k1, k2]) =>
            (norm1.includes(k1) && norm2.includes(k2)) ||
            (norm1.includes(k2) && norm2.includes(k1))
        )

        if (isCanonical && !added.has(pairKey)) {
          edges.push({
            source: s1.id,
            target: s2.id,
            relation: 'Korelasi Kompetensi'
          })
          added.add(pairKey)
        }
      }
    }

    // 2. Connect based on shared evidence tags or category domains
    for (let i = 0; i < skills.length; i++) {
      for (let j = i + 1; j < skills.length; j++) {
        const s1 = skills[i]
        const s2 = skills[j]
        const pairKey = [s1.id, s2.id].sort().join('--')

        if (added.has(pairKey)) continue

        const commonTag = s1.evidenceTags?.find(t => s2.evidenceTags?.includes(t))

        if (commonTag && edges.length < 35) {
          edges.push({
            source: s1.id,
            target: s2.id,
            relation: `Korelasi ${commonTag}`
          })
          added.add(pairKey)
        } else if (s1.category === s2.category && edges.length < 25) {
          edges.push({
            source: s1.id,
            target: s2.id,
            relation: `Domain ${s1.category}`
          })
          added.add(pairKey)
        }
      }
    }

    // 3. Fallback chain if no edges found
    if (edges.length === 0 && skills.length > 1) {
      for (let i = 0; i < skills.length; i++) {
        const next = (i + 1) % skills.length

        edges.push({
          source: skills[i].id,
          target: skills[next].id,
          relation: 'Jalur Kompetensi'
        })
      }
    }

    return edges
  }, [skills])

  // Filter skills based on search & category
  const filteredSkills = useMemo(() => {
    return skills.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.subCategory && item.subCategory.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.evidenceTags && item.evidenceTags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))

      const matchesCategory =
        activeCategoryFilter === 'all' || item.category === activeCategoryFilter

      return matchesSearch && matchesCategory
    })
  }, [skills, searchQuery, activeCategoryFilter])

  const itemsPerPage = isMobile ? 6 : 9
  const totalPages = Math.max(1, Math.ceil(filteredSkills.length / itemsPerPage))

  // Clamp page if item count shrinks
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedSkills = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage

    return filteredSkills.slice(startIdx, startIdx + itemsPerPage)
  }, [filteredSkills, currentPage, itemsPerPage])

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)

    if (skillsGridRef.current) {
      skillsGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }

  // Handler: Add Skill (Saves to Supabase)
  const handleAddSkill = async (newSkillData: Omit<SkillItem, 'id'>) => {
    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSkillData)
      })

      const json = await res.json()

      if (json.success && json.data) {
        clientCache.invalidate([CACHE_KEYS.SKILLS, CACHE_KEYS.DASHBOARD_SUMMARY, CACHE_KEYS.CAREER_ACTIVE])
        setSkills(prev => [json.data, ...prev])
        showToast(`🎉 Berhasil menyimpan skill "${json.data.name}"!`)
      } else {
        showToast(`❌ ${json.message || 'Gagal menambahkan skill'}`)
      }
    } catch (err) {
      console.error('Error adding skill:', err)
      showToast('❌ Terjadi kesalahan saat menyimpan skill.')
    }
  }

  // Handler: Edit Skill Modal Open
  const handleOpenEdit = (skill: SkillItem) => {
    setSelectedSkillForEdit(skill)
    setIsEditModalOpen(true)
  }

  // Handler: Navigate to Evidence View and highlight related experience card
  const handleViewEvidenceForSkill = (skill: SkillItem) => {
    const matchedEvidence = evidences.find(
      e => e.skillId === skill.id || e.skillName.toLowerCase() === skill.name.toLowerCase()
    )

    const expKey = matchedEvidence
      ? matchedEvidence.experienceId ||
        `${matchedEvidence.experienceTitle.trim().toLowerCase()}__${matchedEvidence.institutionName.trim().toLowerCase()}__${matchedEvidence.experienceRole.trim().toLowerCase()}`
      : null

    setHighlightedSkillName(skill.name)
    setHighlightedExperienceKey(expKey)
    setActiveTab('evidence')
  }

  // Handler: Update Skill (Updates in Supabase)
  const handleUpdateSkill = async (updated: SkillItem) => {
    try {
      const res = await fetch('/api/skills', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      })

      const json = await res.json()

      if (json.success && json.data) {
        clientCache.invalidate([CACHE_KEYS.SKILLS, CACHE_KEYS.DASHBOARD_SUMMARY, CACHE_KEYS.CAREER_ACTIVE])
        setSkills(prev => prev.map(s => (s.id === updated.id ? json.data : s)))
        showToast(`✅ Skill "${updated.name}" berhasil diperbarui di Supabase.`)
      } else {
        showToast(`❌ ${json.message || 'Gagal memperbarui skill'}`)
      }
    } catch (err) {
      console.error('Error updating skill:', err)
      showToast('❌ Terjadi kesalahan saat memperbarui skill.')
    }
  }

  // Handler: Open Delete Confirmation Modal
  const handleOpenDelete = (skill: SkillItem) => {
    setIsEditModalOpen(false)
    setSelectedSkillForDelete(skill)
    setIsDeleteModalOpen(true)
  }

  // Handler: Successfully deleted from modal
  const handleDeleteSuccess = (deletedId: string, skillName: string) => {
    clientCache.invalidate([CACHE_KEYS.SKILLS, CACHE_KEYS.DASHBOARD_SUMMARY, CACHE_KEYS.CAREER_ACTIVE])
    setSkills(prev => prev.filter(s => s.id !== deletedId))
    setEvidences(prev => prev.filter(e => e.skillId !== deletedId))
    showToast(`🗑️ Skill "${skillName}" berhasil dihapus dari profil.`)
  }

  // Handler: Delete Skill (Deletes from Supabase)
  const handleDeleteSkill = async (skillId: string) => {
    try {
      const res = await fetch(`/api/skills?id=${skillId}`, {
        method: 'DELETE'
      })

      const json = await res.json()

      if (json.success) {
        clientCache.invalidate([CACHE_KEYS.SKILLS, CACHE_KEYS.DASHBOARD_SUMMARY, CACHE_KEYS.CAREER_ACTIVE])
        setSkills(prev => prev.filter(s => s.id !== skillId))
        setEvidences(prev => prev.filter(e => e.skillId !== skillId))
        showToast('🗑️ Skill berhasil dihapus dari Supabase.')
      } else {
        showToast(`❌ ${json.message || 'Gagal menghapus skill'}`)
      }
    } catch (err) {
      console.error('Error deleting skill:', err)
      showToast('❌ Terjadi kesalahan saat menghapus skill.')
    }
  }

  return (
    <div
      className="w-full font-['Poppins',sans-serif] flex flex-col gap-6 text-slate-800 dark:text-slate-100 pb-12"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className='fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-800 text-xs sm:text-sm animate-in slide-in-from-bottom-3 duration-200'>
          <Check className='w-4 h-4 text-emerald-400 shrink-0' />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. PAGE HEADER */}
      <header className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1'>
        <div>
          <div className='flex items-center gap-2.5'>
            <h1 className='text-2xl sm:text-3xl font-bold tracking-tight text-[#1E3A8A] dark:text-blue-400'>
              Skill Profile
            </h1>
          </div>
          <p className='text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mt-1'>
            {isLoading
              ? 'Memuat data skill dari database Supabase...'
              : `${skills.length} skill terverifikasi dari portofolio Anda dengan analisis distribusi kompetensi.`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className='flex items-center gap-2.5 shrink-0'>
          <button
            type='button'
            onClick={() => fetchSkills()}
            disabled={isLoading}
            className='inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50'
            title='Muat Ulang dari Supabase'
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className='hidden sm:inline'>Refresh</span>
          </button>

          <button
            type='button'
            onClick={() => setIsAddModalOpen(true)}
            className='inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs hover:shadow-md cursor-pointer'
          >
            <Plus className='w-4 h-4' />
            <span>Tambah Skill</span>
          </button>
        </div>
      </header>

      {/* 2. SUB-NAVIGATION TABS */}
      <nav className='flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-fit text-xs sm:text-sm font-semibold border border-slate-200/80 dark:border-slate-700'>
        <button
          type='button'
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-white dark:bg-slate-900 text-[#1E3A8A] dark:text-blue-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <LayoutGrid className='w-4 h-4' />
          <span>Matriks Skill</span>
        </button>

        <button
          type='button'
          onClick={() => setActiveTab('skill_map')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'skill_map'
              ? 'bg-white dark:bg-slate-900 text-[#1E3A8A] dark:text-blue-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Network className='w-4 h-4' />
          <span>Skill Map (Graf)</span>
        </button>

        <button
          type='button'
          onClick={() => setActiveTab('evidence')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'evidence'
              ? 'bg-white dark:bg-slate-900 text-[#1E3A8A] dark:text-blue-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className='w-4 h-4' />
          <span>
            Bukti Pengalaman ({uniqueExperiencesCount > 0 ? uniqueExperiencesCount : evidences.length})
          </span>
        </button>
      </nav>

      {/* 3. TAB CONTENT */}
      {/* OVERVIEW / MATRIX */}
      {activeTab === 'overview' && (
        <div className='flex flex-col gap-6 animate-in fade-in duration-200'>
          {/* Top 4 Category Cards */}
          <SkillCategoryRow
            summaries={categorySummaries}
            activeCategory={activeCategoryFilter}
            onSelectCategory={cat => setActiveCategoryFilter(cat)}
          />

          {/* Competency Benchmark Highlight Banner */}
          <CompetencyBanner
            skills={skills}
            onOpenBenchmark={() => setIsBenchmarkModalOpen(true)}
          />

          {/* Search & Category Filter Toolbar */}
          <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs'>
            {/* Search Input */}
            <div className='relative flex-1 max-w-md'>
              <Search className='w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2' />
              <input
                type='text'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder='Cari skill atau tag portofolio...'
                className='w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
              />
            </div>

            {/* Filter Pills */}
            <div className='flex items-center gap-1.5 overflow-x-auto text-xs font-medium'>
              <button
                type='button'
                onClick={() => setActiveCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeCategoryFilter === 'all'
                    ? 'bg-[#1E3A8A] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Semua ({skills.length})
              </button>

              <button
                type='button'
                onClick={() => setActiveCategoryFilter('soft_skill')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeCategoryFilter === 'soft_skill'
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-blue-50 text-[#2563EB] dark:bg-blue-950/40 dark:text-blue-300 hover:bg-blue-100'
                }`}
              >
                Soft Skills
              </button>

              <button
                type='button'
                onClick={() => setActiveCategoryFilter('hard_skill')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeCategoryFilter === 'hard_skill'
                    ? 'bg-[#6366F1] text-white'
                    : 'bg-indigo-50 text-[#6366F1] dark:bg-indigo-950/40 dark:text-indigo-300 hover:bg-indigo-100'
                }`}
              >
                Hard Skills
              </button>

              <button
                type='button'
                onClick={() => setActiveCategoryFilter('technical')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeCategoryFilter === 'technical'
                    ? 'bg-[#10B981] text-white'
                    : 'bg-emerald-50 text-[#10B981] dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100'
                }`}
              >
                Technical
              </button>

              <button
                type='button'
                onClick={() => setActiveCategoryFilter('leadership')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeCategoryFilter === 'leadership'
                    ? 'bg-[#F59E0B] text-white'
                    : 'bg-amber-50 text-[#D97706] dark:bg-amber-950/40 dark:text-amber-300 hover:bg-amber-100'
                }`}
              >
                Leadership
              </button>
            </div>
          </div>

          {/* Loading State Skeleton */}
          {isLoading ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div
                  key={n}
                  className='p-5 rounded-[16px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-3 animate-pulse'
                >
                  <div className='flex items-center justify-between'>
                    <div className='h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-32' />
                    <div className='h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-16' />
                  </div>
                  <div className='h-3 bg-slate-100 dark:bg-slate-800/60 rounded-md w-24' />
                  <div className='h-2 bg-slate-100 dark:bg-slate-800 rounded-full w-full mt-2' />
                  <div className='flex gap-2 mt-2'>
                    <div className='h-5 bg-slate-100 dark:bg-slate-800 rounded-full w-14' />
                    <div className='h-5 bg-slate-100 dark:bg-slate-800 rounded-full w-14' />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredSkills.length === 0 ? (

            /* Empty State */
            <div className='flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 shadow-xs'>
              <div className='w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4'>
                <Sparkles className='w-7 h-7' />
              </div>
              <h3 className='font-bold text-base sm:text-lg text-slate-900 dark:text-white'>
                {searchQuery || activeCategoryFilter !== 'all'
                  ? 'Tidak Ada Skill yang Cocok'
                  : 'Belum Ada Skill di Profil Anda'}
              </h3>
              <p className='text-xs sm:text-sm text-slate-500 max-w-md mt-1 mb-6'>
                {searchQuery || activeCategoryFilter !== 'all'
                  ? 'Coba sesuaikan kata kunci pencarian atau ubah filter kategori skill Anda.'
                  : 'Data profil skill Anda di Supabase masih kosong. Tambahkan skill manual atau ekstrak otomatis dari pengalaman Anda menggunakan AI.'}
              </p>
              <div className='flex items-center gap-3'>
                <button
                  type='button'
                  onClick={() => setIsAddModalOpen(true)}
                  className='px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-xs'
                >
                  <Plus className='w-4 h-4' />
                  Tambah Skill
                </button>
                <Link
                  href='/experience'
                  className='px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all'
                >
                  <Sparkles className='w-4 h-4 text-amber-500' />
                  Ekstrak via Pengalaman
                </Link>
              </div>
            </div>
          ) : (

            /* Skills Grid & Pagination */
            <div ref={skillsGridRef} className='flex flex-col gap-4 scroll-mt-20'>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                {paginatedSkills.map(skill => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    onEdit={handleOpenEdit}
                    onDelete={handleOpenDelete}
                    onViewEvidence={handleViewEvidenceForSkill}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {filteredSkills.length > 0 && (
                <div className='flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200/80 dark:border-slate-800'>
                  {/* Results Count Text */}
                  <div className='text-xs text-slate-500 dark:text-slate-400 font-medium'>
                    Menampilkan{' '}
                    <span className='font-bold text-slate-800 dark:text-slate-200'>
                      {Math.min((currentPage - 1) * itemsPerPage + 1, filteredSkills.length)}
                    </span>
                    {' - '}
                    <span className='font-bold text-slate-800 dark:text-slate-200'>
                      {Math.min(currentPage * itemsPerPage, filteredSkills.length)}
                    </span>{' '}
                    dari{' '}
                    <span className='font-bold text-slate-800 dark:text-slate-200'>
                      {filteredSkills.length}
                    </span>{' '}
                    skill
                  </div>

                  {/* Page Navigation Buttons */}
                  {totalPages > 1 && (
                    <div className='flex items-center gap-1.5'>
                      {/* Previous Page Button */}
                      <button
                        type='button'
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        aria-label='Halaman Sebelumnya'
                        className='inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium cursor-pointer shadow-2xs text-xs'
                      >
                        <ChevronLeft className='w-4 h-4' />
                        <span className='hidden sm:inline'>Sebelumnya</span>
                      </button>

                      {/* Numbered Page Buttons */}
                      <div className='flex items-center gap-1'>
                        {getPaginationRange(currentPage, totalPages).map((p, idx) => {
                          if (p === '...') {
                            return (
                              <span
                                key={`ellipsis-${idx}`}
                                className='w-8 h-8 flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs select-none'
                              >
                                ...
                              </span>
                            )
                          }

                          const pageNum = Number(p)
                          const isActive = pageNum === currentPage

                          return (
                            <button
                              key={pageNum}
                              type='button'
                              onClick={() => handlePageChange(pageNum)}
                              aria-label={`Ke halaman ${pageNum}`}
                              aria-current={isActive ? 'page' : undefined}
                              className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center ${
                                isActive
                                  ? 'bg-[#2563EB] text-white shadow-xs'
                                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                              }`}
                            >
                              {pageNum}
                            </button>
                          )
                        })}
                      </div>

                      {/* Next Page Button */}
                      <button
                        type='button'
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        aria-label='Halaman Selanjutnya'
                        className='inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium cursor-pointer shadow-2xs text-xs'
                      >
                        <span className='hidden sm:inline'>Selanjutnya</span>
                        <ChevronRight className='w-4 h-4' />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Bottom Career Upskilling Recommendation Card */}
          <section className='p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
            <div className='flex items-center gap-3.5'>
              <div className='w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-[#2563EB] shrink-0 font-bold'>
                <TrendingUp className='w-5 h-5' />
              </div>
              <div>
                <h4 className='font-bold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight'>
                  Eksplorasi Gap Kompetensi & Rekomendasi Modul
                </h4>
                <p className='text-xs sm:text-[13px] text-[#64748B] dark:text-slate-400 mt-0.5 leading-relaxed'>
                  Bandingkan profil skill ini dengan target karier impian Anda untuk menemukan rekomendasi belajar yang presisi.
                </p>
              </div>
            </div>

            <Link
              href='/career'
              className='inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#2563EB] dark:text-blue-300 border border-[#DBEAFE] dark:border-blue-900/60 text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer'
            >
              <span>Analisis Career Gap</span>
              <ChevronRight className='w-4 h-4' />
            </Link>
          </section>
        </div>
      )}

      {/* SKILL MAP TAB */}
      {activeTab === 'skill_map' && (
        <div className='flex flex-col gap-5 animate-in fade-in duration-200'>
          <div className='flex flex-col gap-1'>
            <h3 className='text-lg font-bold text-[#1E3A8A] dark:text-blue-400 tracking-tight'>
              Skill Map Visualizer
            </h3>
            <p className='text-xs text-[#64748B] dark:text-slate-400'>
              Peta visualisasi interaktif korelasi dan keterhubungan kompetensi dari rekam jejak portofolio Anda
            </p>
          </div>

          {isLoading ? (
            <div className='h-[450px] flex items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800'>
              <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
            </div>
          ) : skillMapNodes.length === 0 ? (
            <div className='h-[350px] flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800'>
              <Network className='w-12 h-12 text-slate-300 dark:text-slate-700 mb-3' />
              <h4 className='font-bold text-slate-800 dark:text-slate-200 text-sm'>
                Belum Ada Node Graf Skill
              </h4>
              <p className='text-xs text-slate-500 mt-1 max-w-sm'>
                Tambahkan skill ke profil Anda untuk melihat visualisasi relasi jaringan kompetensi secara otomatis.
              </p>
            </div>
          ) : (
            <SkillMapGraph
              nodes={skillMapNodes}
              edges={skillMapEdges}
              onSelectSkill={skillId => {
                const matched = skills.find(
                  s => s.id === skillId || s.name.toLowerCase() === skillId.toLowerCase()
                )

                if (matched) {
                  handleOpenEdit(matched)
                }
              }}
            />
          )}
        </div>
      )}

      {/* EVIDENCE TAB */}
      {activeTab === 'evidence' && (
        <div className='flex flex-col gap-5 animate-in fade-in duration-200'>
          <div className='flex flex-col gap-1'>
            <h3 className='text-lg font-bold text-[#1E3A8A] dark:text-blue-400 tracking-tight'>
              Katalog Bukti Empiris & Rekam Jejak
            </h3>
            <p className='text-xs text-[#64748B] dark:text-slate-400'>
              Daftar bukti autentik dari data pengalaman yang tercatat di Supabase
            </p>
          </div>

          {isLoading ? (
            <div className='h-[300px] flex items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800'>
              <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
            </div>
          ) : (
            <EvidenceView
              evidences={evidences}
              onOpenAddSkill={() => setIsAddModalOpen(true)}
              highlightedSkillName={highlightedSkillName || undefined}
              highlightedExperienceKey={highlightedExperienceKey || undefined}
              onClearHighlight={() => {
                setHighlightedSkillName(null)
                setHighlightedExperienceKey(null)
              }}
            />
          )}
        </div>
      )}

      {/* 4. INTERACTIVE MODALS */}
      <AddSkillModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSkill={handleAddSkill}
      />

      <EditSkillModal
        isOpen={isEditModalOpen}
        skill={selectedSkillForEdit}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedSkillForEdit(null)
        }}
        onUpdateSkill={handleUpdateSkill}
        onRequestDelete={handleOpenDelete}
      />

      <DeleteSkillModal
        isOpen={isDeleteModalOpen}
        skill={selectedSkillForDelete}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedSkillForDelete(null)
        }}
        onSuccess={handleDeleteSuccess}
      />

      <BenchmarkModal
        isOpen={isBenchmarkModalOpen}
        skills={skills}
        onClose={() => setIsBenchmarkModalOpen(false)}
      />
    </div>
  )
}
