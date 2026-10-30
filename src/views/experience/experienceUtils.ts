import type {
  LucideIcon
} from 'lucide-react';
import {
  Users,
  Calendar,
  Briefcase,
  Laptop,
  FolderGit2,
  Trophy,
  Bookmark
} from 'lucide-react'

export interface SkillEvidenceItem {
  id: string
  userSkillId: string
  note?: string | null
  userSkill: {
    skill: {
      id: string
      name: string
      category: string
    }
  }
}

export interface AiAnalysisJobItem {
  id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  createdAt: string
  completedAt?: string | null
}

export interface ExperienceItem {
  id: string
  userId: string
  title: string
  type: 'organisation' | 'committee' | 'internship' | 'freelance' | 'project' | 'competition' | 'other'
  role: string
  institutionName: string
  startDate: string
  endDate: string | null
  isOngoing: boolean
  description: string | null
  proofUrl: string | null
  createdAt: string
  updatedAt: string
  skillEvidences?: SkillEvidenceItem[]
  aiAnalysisJobs?: AiAnalysisJobItem[]
}

export interface ExperienceStats {
  total: number
  ongoing: number
  skillsExtracted: number
  typeBreakdown: Record<string, number>
}

export interface TypeConfig {
  label: string
  icon: LucideIcon
  colorClass: string
  bgClass: string
  borderClass: string
  badgeClass: string
}

export const EXPERIENCE_TYPE_CONFIG: Record<string, TypeConfig> = {
  organisation: {
    label: 'Organisasi',
    icon: Users,
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-950/40',
    borderClass: 'border-blue-200 dark:border-blue-800',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40'
  },
  committee: {
    label: 'Kepanitiaan',
    icon: Calendar,
    colorClass: 'text-purple-600 dark:text-purple-400',
    bgClass: 'bg-purple-50 dark:bg-purple-950/40',
    borderClass: 'border-purple-200 dark:border-purple-800',
    badgeClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/40'
  },
  internship: {
    label: 'Magang',
    icon: Laptop,
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderClass: 'border-emerald-200 dark:border-emerald-800',
    badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40'
  },
  freelance: {
    label: 'Freelance',
    icon: Briefcase,
    colorClass: 'text-cyan-600 dark:text-cyan-400',
    bgClass: 'bg-cyan-50 dark:bg-cyan-950/40',
    borderClass: 'border-cyan-200 dark:border-cyan-800',
    badgeClass: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-900/40'
  },
  project: {
    label: 'Proyek',
    icon: FolderGit2,
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-950/40',
    borderClass: 'border-amber-200 dark:border-amber-800',
    badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40'
  },
  competition: {
    label: 'Kompetisi',
    icon: Trophy,
    colorClass: 'text-rose-600 dark:text-rose-400',
    bgClass: 'bg-rose-50 dark:bg-rose-950/40',
    borderClass: 'border-rose-200 dark:border-rose-800',
    badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40'
  },
  other: {
    label: 'Lainnya',
    icon: Bookmark,
    colorClass: 'text-slate-600 dark:text-slate-400',
    bgClass: 'bg-slate-50 dark:bg-slate-800/50',
    borderClass: 'border-slate-200 dark:border-slate-700',
    badgeClass: 'bg-slate-50 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
  }
}

const INDO_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
]

export function formatMonthYear(dateString: string | null | undefined): string {
  if (!dateString) return ''

  // If formatted as YYYY-MM-DD or ISO string, extract YYYY and MM directly to prevent timezone shift
  const match = String(dateString).match(/^(\d{4})-(\d{2})/)
  if (match) {
    const year = parseInt(match[1], 10)
    const monthIdx = parseInt(match[2], 10) - 1
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${INDO_MONTHS[monthIdx]} ${year}`
    }
  }

  const d = new Date(dateString)
  if (isNaN(d.getTime())) return dateString

  return `${INDO_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

export function formatExperiencePeriod(
  startDateStr: string,
  endDateStr: string | null,
  isOngoing: boolean
): string {
  const start = formatMonthYear(startDateStr)

  if (isOngoing) {
    return `${start} - Sekarang • Sedang Berlangsung`
  }

  if (!endDateStr) {
    return start
  }

  const end = formatMonthYear(endDateStr)

  // Hitung durasi bulan
  const dStart = new Date(startDateStr)
  const dEnd = new Date(endDateStr)

  if (!isNaN(dStart.getTime()) && !isNaN(dEnd.getTime())) {
    const diffMonths =
      (dEnd.getFullYear() - dStart.getFullYear()) * 12 +
      (dEnd.getMonth() - dStart.getMonth()) + 1

    if (diffMonths > 0) {
      if (diffMonths >= 12) {
        const years = Math.floor(diffMonths / 12)
        const remMonths = diffMonths % 12
        const yearStr = `${years} thn`
        const monthStr = remMonths > 0 ? ` ${remMonths} bln` : ''

        
return `${start} - ${end} • ${yearStr}${monthStr}`
      }

      
return `${start} - ${end} • ${diffMonths} bln`
    }
  }

  return `${start} - ${end}`
}
