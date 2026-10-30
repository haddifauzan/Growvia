'use client'

/* eslint-disable @next/next/no-img-element */

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'

import Link from 'next/link'
import { Poppins } from 'next/font/google'

import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Briefcase,
  Calculator,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Code2,
  FileText,
  Layers,
  Library,
  Menu,
  MinusCircle,
  Moon,
  Plus,
  Sparkles,
  Sun,
  Target,
  Trophy,
  TrendingUp,
  UserCheck,
  Users,
  X
} from 'lucide-react'

import type { SystemMode } from '@core/types'

// Poppins dimuat di sini, jadi tidak bergantung class Tailwind lain.
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600'], display: 'swap' })

// =============================================================================
// GAMBAR PLACEHOLDER: ganti URL di sini dengan aset kamu nanti
// =============================================================================
const IMG = {
  ctaPerson: 'https://media.istockphoto.com/id/1444077739/photo/college-study-and-education-student-man-portrait-with-back-to-school-backpack-and-portfolio.jpg?s=612x612&w=0&k=20&c=PAQmqKzYd3OiKhlfrT1DVMQNkGu-drX4rtJ5p6y7D8c=', // foto orang untuk CTA akhir
  portfolioAvatar: 'https://i.pravatar.cc/160?img=12', // avatar di mockup portofolio
  portfolioCover: 'https://picsum.photos/seed/growvia-portfolio/900/360' // cover mockup portofolio
}

// =============================================================================
// DATA & RUMUS (PRD F04 + F06.4)
// =============================================================================
type Level = 1 | 2 | 3
type Category = 'Hard Skill' | 'Soft Skill' | 'Technical' | 'Leadership'

interface ExtractedSkill {
  id: string
  name: string
  category: Category
  relevance: number
  level: Level
}

interface RequiredSkill {
  name: string
  weight: 1 | 2 | 3
  minLevel: Level
}

const SAMPLE_SKILLS: ExtractedSkill[] = [
  { id: 's1', name: 'Leadership', category: 'Leadership', relevance: 92, level: 2 },
  { id: 's2', name: 'Event Management', category: 'Hard Skill', relevance: 88, level: 3 },
  { id: 's3', name: 'Team Coordination', category: 'Soft Skill', relevance: 85, level: 2 },
  { id: 's4', name: 'Budgeting', category: 'Hard Skill', relevance: 81, level: 2 },
  { id: 's5', name: 'Negotiation', category: 'Soft Skill', relevance: 77, level: 2 },
  { id: 's6', name: 'Stakeholder Communication', category: 'Soft Skill', relevance: 71, level: 2 },
  { id: 's7', name: 'Project Planning', category: 'Hard Skill', relevance: 64, level: 2 },
  { id: 's8', name: 'Data Analysis', category: 'Technical', relevance: 32, level: 1 }
]

const PRODUCT_MANAGER_REQ: RequiredSkill[] = [
  { name: 'Stakeholder Communication', weight: 3, minLevel: 2 },
  { name: 'Project Planning', weight: 3, minLevel: 2 },
  { name: 'Product Discovery', weight: 3, minLevel: 2 },
  { name: 'Leadership', weight: 2, minLevel: 2 },
  { name: 'Data Analysis', weight: 2, minLevel: 2 },
  { name: 'Team Coordination', weight: 1, minLevel: 1 }
]

const DEFAULT_ACCEPTED = () => new Set(SAMPLE_SKILLS.filter(s => s.relevance > 75).map(s => s.id))

function calculateReadiness(accepted: ExtractedSkill[], req: RequiredSkill[]) {
  const total = req.reduce((sum, r) => sum + r.weight, 0)
  const byName = new Map(accepted.map(s => [s.name, s]))
  let matched = 0
  const strong: string[] = []
  const develop: string[] = []
  const missing: string[] = []

  for (const r of req) {
    const s = byName.get(r.name)

    if (!s) {
      missing.push(r.name)
      continue
    }

    matched += r.weight
    if (s.level >= r.minLevel) strong.push(r.name)
    else develop.push(`${r.name} (target Lv ${r.minLevel})`)
  }

  const score = Math.round((matched / total) * 100)
  const label = score >= 90 ? 'Top Candidate' : score >= 70 ? 'Ready' : score >= 40 ? 'Developing' : 'Starter'

  return { score, label, strong, develop, missing }
}

const NAV_ITEMS = [
  { id: 'hero', label: 'Beranda' },
  { id: 'features', label: 'Fitur' },
  { id: 'demo', label: 'Demo' },
  { id: 'kendali', label: 'Kendali AI' },
  { id: 'faq', label: 'FAQ' }
]

const FAQ_ITEMS = [
  { q: 'Growvia gratis?', a: 'Ya, gratis di versi awal ini.' },
  {
    q: 'Apa yang perlu saya tulis?',
    a: 'Judul, tipe (organisasi, kepanitiaan, magang, freelance, proyek, kompetisi), peran, tanggal, dan deskripsi 50–1000 karakter. Semakin spesifik, semakin tepat skill yang diusulkan.'
  },
  {
    q: 'Apakah AI yang menentukan skill saya?',
    a: 'Tidak. AI hanya mengusulkan. Kamu bisa menerima, mengubah, atau menolak setiap saran.'
  },
  {
    q: 'Bisa melamar kerja langsung lewat Growvia?',
    a: 'Belum. Tombol Apply mengarahkan ke platform asal lowongan, dan kamu bisa menyimpan peluang untuk nanti.'
  },
  {
    q: 'Siapa yang bisa melihat portofolio saya?',
    a: 'Hanya yang kamu izinkan. Kamu mengatur privasinya dan bisa menarik portofolio kapan saja.'
  },
  {
    q: 'Bagaimana keamanan data saya?',
    a: 'Koneksi memakai HTTPS dan password disimpan dalam bentuk hash. Jika kamu menghapus akun, data disimpan 30 hari sebelum dihapus.'
  }
]

// =============================================================================
// STYLE CONSTANTS
// =============================================================================
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lp-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lp-page)]'

const btnPrimary = `inline-flex items-center justify-center gap-2 rounded-full bg-[var(--lp-btn)] px-6 py-3 text-sm font-medium text-white transition hover:brightness-110 active:translate-y-px ${focusRing}`

const btnOutline = `inline-flex items-center justify-center gap-2 rounded-full border border-[var(--lp-border-strong)] bg-transparent px-6 py-3 text-sm font-medium text-[var(--lp-heading)] transition hover:bg-[var(--lp-panel)] active:translate-y-px ${focusRing}`

const h2Class =
  'text-3xl font-medium leading-[1.15] tracking-[-0.025em] text-[var(--lp-heading)] sm:text-4xl lg:text-[2.75rem]'

const container = 'mx-auto w-full max-w-[1120px] px-5 sm:px-8'
const panel = 'rounded-[2rem] bg-[var(--lp-panel)] border border-[var(--lp-border)]/60 lp-card-hover'
const innerCard = 'rounded-3xl bg-[var(--lp-card)] shadow-[var(--lp-shadow-card)] border border-[var(--lp-border)]/60 lp-card-interactive'

// =============================================================================
// KOMPONEN KECIL
// =============================================================================
function Reveal({
  children,
  className = '',
  animation = 'fade-up',
  delay = 0
}: {
  children: React.ReactNode
  className?: string
  animation?: 'fade-up' | 'fade-down' | 'zoom-in' | 'fade-right' | 'fade-left'
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current

    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      setShown(true)

      return
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    io.observe(el)

    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`aos-init aos-${animation} ${shown ? 'aos-animate' : ''} ${className}`}
    >
      {children}
    </div>
  )
}



function CategoryIcon({ category }: { category: Category }) {
  const cls = 'h-3.5 w-3.5 shrink-0'

  if (category === 'Leadership') return <Users className={cls} />
  if (category === 'Hard Skill') return <Briefcase className={cls} />
  if (category === 'Technical') return <Code2 className={cls} />

  return <Sparkles className={cls} />
}

function ScoreRing({ score, size = 128, stroke = 10 }: { score: number; size?: number; stroke?: number }) {
  const r = 60 - stroke / 2
  const c = 2 * Math.PI * r
  const tone = score >= 70 ? 'var(--lp-success)' : score >= 40 ? 'var(--lp-accent)' : 'var(--lp-warning)'

  return (
    <div
      role='progressbar'
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label='Career Readiness Score'
      className='relative shrink-0'
      style={{ width: size, height: size }}
    >
      <svg viewBox='0 0 120 120' className='h-full w-full -rotate-90' aria-hidden='true'>
        <circle cx='60' cy='60' r={r} fill='none' stroke='var(--lp-border)' strokeWidth={stroke} />
        <circle
          cx='60'
          cy='60'
          r={r}
          fill='none'
          stroke={tone}
          strokeWidth={stroke}
          strokeLinecap='round'
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          className='lp-ring'
        />
      </svg>
      <div className='absolute inset-0 flex items-center justify-center'>
        <span className='font-medium tabular-nums text-[var(--lp-heading)]' style={{ fontSize: size * 0.24 }}>
          {score}%
        </span>
      </div>
    </div>
  )
}

function labelTone(label: string) {
  if (label === 'Ready' || label === 'Top Candidate')
    return 'bg-[var(--lp-success-soft)] text-[var(--lp-success-text)]'
  if (label === 'Developing') return 'bg-[var(--lp-accent-soft)] text-[var(--lp-link)]'

  return 'bg-[var(--lp-warning-soft)] text-[var(--lp-warning-text)]'
}

function SkillChip({
  skill,
  accepted,
  index,
  onToggle
}: {
  skill: ExtractedSkill
  accepted: boolean
  index: number
  onToggle: (id: string) => void
}) {
  return (
    <button
      type='button'
      onClick={() => onToggle(skill.id)}
      aria-pressed={accepted}
      style={{ '--i': index } as React.CSSProperties}
      className={`chip-in inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${focusRing} ${
        accepted
          ? 'border-[var(--lp-ai-line)] bg-[var(--lp-ai-bg)] text-[var(--lp-ai-text)]'
          : 'border-dashed border-[var(--lp-border-strong)] bg-transparent text-[var(--lp-text-sec)] hover:border-[var(--lp-ai-line)] hover:text-[var(--lp-text)]'
      }`}
    >
      <CategoryIcon category={skill.category} />
      <span>{skill.name}</span>
      <span className='tabular-nums opacity-70'>{skill.relevance}%</span>
      {accepted ? <Check className='h-3.5 w-3.5' /> : <Plus className='h-3.5 w-3.5' />}
    </button>
  )
}

/** Blok teks fitur: pill, judul, paragraf, garis putus-putus, tombol (seperti referensi) */
function FeatureText({
  title,
  text,
  children,
  cta
}: {
  pill?: string
  title: string
  text: string
  children?: React.ReactNode
  cta: React.ReactNode
}) {
  return (
    <div>
      <h2 className={`${h2Class} mt-5 max-w-[16ch]`}>{title}</h2>
      <p className='mt-5 max-w-[48ch] text-sm leading-[1.75] text-[var(--lp-text-sec)] sm:text-base'>{text}</p>
      {children}
      <div className='my-8 border-t border-dashed border-[var(--lp-border-strong)]' />
      {cta}
    </div>
  )
}

function Split({
  panelContent,
  text,
  reverse
}: {
  panelContent: React.ReactNode
  text: React.ReactNode
  reverse?: boolean
}) {
  return (
    <div className='grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16'>
      <Reveal animation={reverse ? 'fade-left' : 'fade-right'} className={reverse ? 'lg:order-2' : ''}>
        {panelContent}
      </Reveal>
      <Reveal animation={reverse ? 'fade-right' : 'fade-left'} delay={150} className={reverse ? 'lg:order-1' : ''}>
        {text}
      </Reveal>
    </div>
  )
}

// =============================================================================
// HALAMAN
// =============================================================================
interface LandingPageProps {
  mode?: SystemMode
}

export default function LandingPage({ mode }: LandingPageProps = {}) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const [experienceText, setExperienceText] = useState('')
  const [experienceTab, setExperienceTab] = useState<'organisasi' | 'kompetisi'>('organisasi')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [runId, setRunId] = useState(0)
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(DEFAULT_ACCEPTED)
  const [announced, setAnnounced] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const textareaId = useId()
  const faqId = useId()
  const isDark = theme === 'dark'

  // ---- OAuth Callback Safety Net (jika mendarat di root dengan ?code=...) ----
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')

      if (code) {
        window.location.replace(`/api/auth/callback?code=${encodeURIComponent(code)}`)
      }
    }
  }, [])

  // ---- tema: simpan di localStorage, default ikut sistem --------------------
  useEffect(() => {
    try {
      const saved = localStorage.getItem('growvia-theme')

      if (saved === 'light' || saved === 'dark') {
        setTheme(saved)

        return
      }
    } catch {}

    if (mode) {
      setTheme(mode === 'dark' ? 'dark' : 'light')

      return
    }

    setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  }, [mode])

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark'

    setTheme(next)

    try {
      localStorage.setItem('growvia-theme', next)
    } catch {}
  }

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12)

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    []
  )

  const scrollToAnchor = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.history.pushState(null, '', `#${id}`)
  }, [])

  // ---- demo ----------------------------------------------------------------
  const textTooShort = experienceText.trim().length < 50

  const handleExtract = () => {
    if (textTooShort || isAnalyzing) return

    setIsAnalyzing(true)
    setAnnounced('Menganalisis pengalaman…')

    timerRef.current = setTimeout(() => {
      setAcceptedIds(DEFAULT_ACCEPTED())
      setRunId(n => n + 1)
      setIsAnalyzing(false)
      setAnnounced('8 skill diusulkan AI. 5 skill dengan relevansi tinggi sudah terpilih.')
    }, 1200)
  }

  const toggleSkill = (id: string) => {
    const skill = SAMPLE_SKILLS.find(s => s.id === id)

    setAcceptedIds(prev => {
      const next = new Set(prev)

      if (next.has(id)) next.delete(id)
      else next.add(id)

      return next
    })

    if (skill) setAnnounced(`Skill ${skill.name} ${acceptedIds.has(id) ? 'ditolak' : 'diterima'}.`)
  }

  const acceptAll = () => {
    setAcceptedIds(new Set(SAMPLE_SKILLS.map(s => s.id)))
    setAnnounced('Semua skill diterima.')
  }

  const readiness = useMemo(
    () => calculateReadiness(SAMPLE_SKILLS.filter(s => acceptedIds.has(s.id)), PRODUCT_MANAGER_REQ),
    [acceptedIds]
  )

  const primarySkills = SAMPLE_SKILLS.filter(s => s.relevance >= 40)
  const lowSkills = SAMPLE_SKILLS.filter(s => s.relevance < 40)

  // ===========================================================================
  return (
    <div
      className={`landing-page ${poppins.className} min-h-screen bg-[var(--lp-page)] text-[var(--lp-text)] antialiased transition-colors duration-200 selection:bg-[var(--lp-accent)] selection:text-white ${
        isDark ? 'dark' : ''
      }`}
    >
      <a
        href='#main-content'
        className='sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[var(--lp-btn)] focus:px-4 focus:py-2 focus:text-white'
      >
        Lewati ke konten
      </a>
      <div className='sr-only' aria-live='polite' aria-atomic='true'>
        {announced}
      </div>

      {/* ============================ NAVBAR ============================ */}
      <header
        className={`sticky top-0 z-40 h-16 w-full transition-colors duration-200 ${
          isScrolled
            ? 'border-b border-[var(--lp-border)] bg-[var(--lp-nav)] backdrop-blur-md'
            : 'border-b border-transparent bg-[var(--lp-page)]'
        }`}
      >
        <div className={`${container} flex h-full items-center justify-between`}>
          <Link href='/' className={`flex items-center gap-2.5 rounded-lg ${focusRing}`}>
            <img
              src='/images/growvia-logo.png'
              alt='Growvia Logo'
              width={32}
              height={32}
              className='h-8 w-8 shrink-0 object-contain'
            />
            <span className='text-lg font-semibold tracking-tight text-[var(--lp-heading)]'>Growvia</span>
          </Link>

          <nav aria-label='Navigasi utama' className='hidden items-center gap-7 lg:gap-8 md:flex'>
            {NAV_ITEMS.map(item => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={e => scrollToAnchor(e, item.id)}
                className={`rounded text-sm font-medium text-[var(--lp-text)] transition-colors hover:text-[var(--lp-link)] ${focusRing}`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={toggleTheme}
              aria-label='Ganti tema'
              aria-pressed={isDark}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-[var(--lp-text-sec)] transition-colors hover:bg-[var(--lp-panel)] hover:text-[var(--lp-text)] ${focusRing} cursor-pointer`}
            >
              {isDark ? <Sun className='h-[18px] w-[18px]' /> : <Moon className='h-[18px] w-[18px]' />}
            </button>
            <Link
              href='/login'
              className={`hidden rounded-full px-3 py-2 text-sm font-medium text-[var(--lp-text)] hover:text-[var(--lp-link)] md:block ${focusRing}`}
            >
              Masuk
            </Link>
            <Link
              href='/register'
              className={`hidden md:inline-flex items-center justify-center gap-2 rounded-full border border-[var(--lp-border-strong)] bg-transparent !px-5 !py-2 text-sm font-medium text-[var(--lp-heading)] transition hover:bg-[var(--lp-panel)] active:translate-y-px ${focusRing}`}
            >
              Daftar gratis
            </Link>
            <button
              type='button'
              onClick={() => setMobileMenuOpen(p => !p)}
              aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={mobileMenuOpen}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-[var(--lp-text-sec)] hover:bg-[var(--lp-panel)] md:hidden ${focusRing}`}
            >
              {mobileMenuOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className='menu-in fixed inset-x-0 top-16 flex flex-col gap-1 border-b border-[var(--lp-border)] bg-[var(--lp-page)] p-5 md:hidden'>
            {NAV_ITEMS.map(item => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={e => scrollToAnchor(e, item.id)}
                className='rounded-xl px-3 py-3 text-base font-medium hover:bg-[var(--lp-panel)]'
              >
                {item.label}
              </a>
            ))}
            <div className='mt-3 grid grid-cols-2 gap-3'>
              <Link href='/login' className={btnOutline} onClick={() => setMobileMenuOpen(false)}>
                Masuk
              </Link>
              <Link href='/register' className={btnPrimary} onClick={() => setMobileMenuOpen(false)}>
                Daftar gratis
              </Link>
            </div>
          </div>
        )}
      </header>

      <main id='main-content'>
        {/* ============================ HERO ============================ */}
        <section id='hero' className='scroll-mt-20 pb-10 pt-14 text-center md:pt-20'>
          <div className={container}>
            <h1 className='mx-auto max-w-[20ch] text-[2.25rem] font-medium leading-[1.12] tracking-[-0.03em] text-[var(--lp-heading)] sm:text-5xl lg:text-[3.75rem]'>
              Ubah pengalamanmu jadi skill yang bisa dibuktikan.
            </h1>
            <p className='mx-auto mt-6 max-w-[54ch] text-sm leading-[1.75] text-[var(--lp-text-sec)] sm:text-base'>
              Tulis pengalaman organisasi, kepanitiaan, magang, atau proyekmu. Growvia mengusulkan skill-nya,
              menunjukkan gap ke karier yang kamu tuju, lalu merangkum semuanya jadi portofolio.
            </p>

            <div className='mt-9 flex flex-wrap items-center justify-center gap-3'>
              <Link href='/register' className={btnPrimary}>
                Daftar gratis
                <ArrowRight className='h-4 w-4' />
              </Link>
              <a href='#demo' onClick={e => scrollToAnchor(e, 'demo')} className={btnOutline}>
                Coba demo
              </a>
            </div>
          </div>
        </section>

        {/* ---------- baris 3 mockup (seperti referensi) ---------- */}
        <section className='pb-6'>
          <div className={`${container} grid grid-cols-1 gap-5 md:grid-cols-3`}>
            {/* Pengalaman */}
            <Reveal animation='fade-up' delay={0}>
              <div className={`${panel} p-5 h-full`}>
                <p className='text-sm font-medium text-[var(--lp-heading)]'>Pengalaman</p>
                <div className='mt-3 flex gap-4 border-b border-[var(--lp-border)] text-xs'>
                  <button
                    type='button'
                    onClick={() => setExperienceTab('organisasi')}
                    className={`pb-2 font-medium transition-colors cursor-pointer ${
                      experienceTab === 'organisasi'
                        ? 'border-b-2 border-[var(--lp-accent)] text-[var(--lp-heading)]'
                        : 'text-[var(--lp-text-sec)] hover:text-[var(--lp-text)]'
                    }`}
                  >
                    Organisasi
                  </button>
                  <button
                    type='button'
                    onClick={() => setExperienceTab('kompetisi')}
                    className={`pb-2 font-medium transition-colors cursor-pointer ${
                      experienceTab === 'kompetisi'
                        ? 'border-b-2 border-[var(--lp-accent)] text-[var(--lp-heading)]'
                        : 'text-[var(--lp-text-sec)] hover:text-[var(--lp-text)]'
                    }`}
                  >
                    Kompetisi
                  </button>
                </div>
                <div className='mt-4 flex flex-col gap-2.5'>
                  {(experienceTab === 'organisasi'
                    ? [
                        ['KD', 'Ketua Divisi Acara', 'Bincang Karir 2026', 4],
                        ['SM', 'Staf Magang Marketing', 'Startup edukasi', 3],
                        ['TP', 'Anggota Tim Proyek', 'Aplikasi donasi', 5]
                      ]
                    : [
                        ['JK', 'Juara 1 UI/UX Design', 'National Hackathon 2025', 5],
                        ['FB', 'Finalis Business Case', 'Management Challenge', 4],
                        ['TD', 'Top 5 Data Science', 'Tech Olympiad 2026', 4]
                      ]
                  ).map(([ini, t, s, n]) => (
                    <div key={t as string} className={`${innerCard} flex items-center gap-3 p-3 transition-all animate-in fade-in duration-150`}>
                      <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--lp-ai-bg)] text-xs font-medium text-[var(--lp-ai-text)]'>
                        {ini}
                      </span>
                      <div className='min-w-0 flex-1'>
                        <p className='truncate text-xs font-medium text-[var(--lp-heading)]'>{t}</p>
                        <p className='truncate text-[11px] text-[var(--lp-text-sec)]'>{s}</p>
                      </div>
                      <span className='shrink-0 rounded-full bg-[var(--lp-accent-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--lp-link)]'>
                        +{n} skill
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Laporan skill */}
            <Reveal animation='fade-up' delay={150}>
              <div className={`${panel} flex flex-col p-5 h-full`}>
                <p className='text-sm font-medium text-[var(--lp-heading)]'>Skill Report</p>
                <div className='mt-5 flex flex-1 items-end justify-between gap-2'>
                  {[
                    ['Sen', 10, 45],
                    ['Sel', 30, 55],
                    ['Rab', 5, 35],
                    ['Kam', 40, 60],
                    ['Jum', 15, 50],
                    ['Sab', 25, 40],
                    ['Min', 20, 65]
                  ].map(([d, bottom, h], i) => (
                    <div key={d as string} className='flex flex-col items-center gap-2'>
                      <div className='relative h-28 w-3.5 rounded-full bg-[var(--lp-card)]'>
                        <div
                          className={`absolute inset-x-0 rounded-full ${
                            i % 2 === 0 ? 'bg-[var(--lp-accent)]' : 'bg-[var(--lp-ai)]'
                          }`}
                          style={{ bottom: `${bottom}%`, height: `${h}%` }}
                        />
                      </div>
                      <span className='text-[10px] text-[var(--lp-text-sec)]'>{d}</span>
                    </div>
                  ))}
                </div>
                <div className='mt-5 flex items-end justify-between'>
                  <div>
                    <p className='text-[11px] text-[var(--lp-text-sec)]'>Total skill</p>
                    <p className='text-xl font-medium text-[var(--lp-heading)]'>8</p>
                  </div>
                  <div className='text-right'>
                    <p className='text-[11px] text-[var(--lp-text-sec)]'>Relevansi rata-rata</p>
                    <p className='text-xl font-medium text-[var(--lp-heading)]'>74%</p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Readiness */}
            <Reveal animation='fade-up' delay={300}>
              <div className={`${panel} flex flex-col gap-3 p-5 h-full`}>
                {[
                  ['Product Manager', 'Target karier', 79, 'bg-[var(--lp-success)]', 'Ready'],
                  ['UI/UX Designer', 'Target karier', 50, 'bg-[var(--lp-accent)]', 'Developing']
                ].map(([t, s, v, bar, lab]) => (
                  <div key={t as string} className={`${innerCard} flex-1 p-4`}>
                    <div className='flex items-center gap-3'>
                      <span className='flex h-10 w-10 items-center justify-center rounded-full bg-[var(--lp-accent-soft)] text-[var(--lp-link)]'>
                        <Target className='h-[18px] w-[18px]' />
                      </span>
                      <div>
                        <p className='text-sm font-medium text-[var(--lp-heading)]'>{t}</p>
                        <p className='text-[11px] text-[var(--lp-text-sec)]'>{s}</p>
                      </div>
                    </div>
                    <div className='mt-4 flex items-center justify-between text-xs'>
                      <span className='text-[var(--lp-text-sec)]'>Career Readiness · {lab}</span>
                      <span className='font-medium tabular-nums text-[var(--lp-heading)]'>{v}%</span>
                    </div>
                    <div className='mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--lp-panel)]'>
                      <div className={`h-full rounded-full ${bar}`} style={{ width: `${v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- strip jenis pengalaman ---------- */}
        <section className='pb-24 pt-5 md:pb-28'>
          <div className={container}>
            <Reveal animation='zoom-in'>
              <div className={`${panel} px-6 py-10 text-center sm:px-10`}>
                <p className='text-lg font-medium text-[var(--lp-heading)] sm:text-xl'>
                  Semua jenis pengalaman bisa jadi skill
                </p>
                <div className='mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-5'>
                  {[
                    [<Users key='a' className='h-5 w-5' />, 'Organisasi'],
                    [<CalendarDays key='b' className='h-5 w-5' />, 'Kepanitiaan'],
                    [<Briefcase key='c' className='h-5 w-5' />, 'Magang'],
                    [<Layers key='d' className='h-5 w-5' />, 'Proyek'],
                    [<Trophy key='e' className='h-5 w-5' />, 'Kompetisi']
                  ].map(([icon, label]) => (
                    <span
                      key={label as string}
                      className='flex items-center gap-2.5 text-base font-medium text-[var(--lp-text-sec)] transition-transform hover:scale-105'
                    >
                      {icon}
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============================ FITUR (grid 3x2) ============================ */}
        <section id='features' className='scroll-mt-20 pb-24 md:pb-32'>
          <div className={container}>
            <Reveal animation='fade-up'>
              <h2 className={`${h2Class} mx-auto max-w-[20ch] text-center`}>
                Dari pengalaman ke karier, dalam satu alur
              </h2>
            </Reveal>

            <div className='mt-14 grid grid-cols-1 gap-5 md:grid-cols-3'>
              {[
                {
                  i: <Sparkles className='h-5 w-5' />,
                  t: 'Ekstraksi skill',
                  d: 'AI mengidentifikasi, menormalkan, dan mengelompokkan skill dari pengalamanmu.',
                  soon: false
                },
                {
                  i: <Target className='h-5 w-5' />,
                  t: 'Skill Profile',
                  d: 'Semua skill beserta bukti pengalamannya, dengan peta skill yang saling terhubung.',
                  soon: false
                },
                {
                  i: <TrendingUp className='h-5 w-5' />,
                  t: 'Career Readiness Score',
                  d: 'Lihat skill yang sudah kuat, perlu dikembangkan, dan belum kamu punya.',
                  soon: false
                },
                {
                  i: <BookOpen className='h-5 w-5' />,
                  t: 'Rekomendasi belajar',
                  d: 'Course, artikel, dan video dari skill gap-mu, lengkap dengan alasannya.',
                  soon: true
                },
                {
                  i: <Briefcase className='h-5 w-5' />,
                  t: 'Peluang karier',
                  d: 'Magang, kerja, freelance, dan kompetisi dengan persentase kecocokan skill.',
                  soon: true
                },
                {
                  i: <FileText className='h-5 w-5' />,
                  t: 'Portofolio',
                  d: 'Terisi otomatis dari profil, skill, dan pengalamanmu. Siap dibagikan lewat link.',
                  soon: true
                }
              ].map((f, idx) => (
                <Reveal key={f.t} animation='fade-up' delay={idx * 80}>
                  <div className={`${panel} p-6 h-full sm:p-7`}>
                    <div className='flex items-start justify-between'>
                      <span className='lp-icon-box flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--lp-card)] text-[var(--lp-link)] shadow-[var(--lp-shadow-card)]'>
                        {f.i}
                      </span>
                      {f.soon && (
                        <span className='rounded-full bg-[var(--lp-card)] px-2.5 py-1 text-xs font-medium text-[var(--lp-text-sec)]'>
                          Segera hadir
                        </span>
                      )}
                    </div>
                    <h3 className='mt-8 text-lg font-medium text-[var(--lp-heading)]'>{f.t}</h3>
                    <p className='mt-2 text-sm leading-[1.7] text-[var(--lp-text-sec)]'>{f.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============================ DEMO ============================ */}
        <section id='demo' className='scroll-mt-20 pb-24 md:pb-32'>
          <div className={container}>
            <Reveal animation='fade-up'>
              <h2 className={`${h2Class} mx-auto max-w-[20ch] text-center`}>Coba ekstrak skill dari pengalamanmu</h2>
              <p className='mx-auto mt-5 max-w-[52ch] text-center text-sm leading-[1.75] text-[var(--lp-text-sec)] sm:text-base'>
                Tulis pengalaman, tinjau skill yang diusulkan AI, lalu lihat skormu bergerak. Tanpa daftar.
              </p>
            </Reveal>

            <Reveal animation='zoom-in' delay={120}>
              <div className={`${panel} mt-12 p-3 sm:p-5`}>
              <div className={`${innerCard} overflow-hidden`}>
                <div className='grid grid-cols-1 lg:grid-cols-5'>
                  {/* kiri: input + skill */}
                  <div className='p-6 sm:p-8 lg:col-span-3'>
                    <label htmlFor={textareaId} className='text-sm font-medium text-[var(--lp-heading)]'>
                      Pengalaman kamu
                    </label>
                    <textarea
                      id={textareaId}
                      rows={4}
                      maxLength={1000}
                      value={experienceText}
                      onChange={e => setExperienceText(e.target.value)}
                      placeholder='Contoh: Ketua divisi acara, mengoordinasi 12 panitia...'
                      className='mt-2 w-full resize-none rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-900/60 p-4 text-sm leading-relaxed text-[var(--lp-text)] placeholder:text-[var(--lp-text-muted)] transition-all focus:bg-white dark:focus:bg-slate-900 focus:border-[var(--lp-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--lp-accent)]/20 shadow-2xs'
                    />
                    <div className='mt-3 flex flex-wrap items-center justify-between gap-3'>
                      <span
                        className={`text-xs ${
                          experienceText.trim().length > 0 && textTooShort
                            ? 'text-[var(--lp-warning-text)]'
                            : 'text-[var(--lp-text-sec)]'
                        }`}
                      >
                        {experienceText.trim().length === 0
                          ? 'Minimal 50 karakter'
                          : textTooShort
                          ? `Tambah ${50 - experienceText.trim().length} karakter lagi (minimal 50)`
                          : `${experienceText.length} / 1000 karakter`}
                      </span>
                      <button
                        type='button'
                        onClick={handleExtract}
                        disabled={isAnalyzing || textTooShort}
                        className={`${btnPrimary} !px-5 !py-2 disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <Sparkles className='h-4 w-4' />
                        {isAnalyzing ? 'Menganalisis…' : 'Ekstrak skill'}
                      </button>
                    </div>

                    <div className='mt-7 flex items-center justify-between gap-3'>
                      <p className='text-sm font-medium text-[var(--lp-heading)]'>
                        Skill yang diusulkan AI
                        <span className='ml-2 text-xs font-normal text-[var(--lp-text-sec)]'>
                          {acceptedIds.size} dari {SAMPLE_SKILLS.length} diterima
                        </span>
                      </p>
                      <button
                        type='button'
                        onClick={acceptAll}
                        className={`rounded text-xs font-medium text-[var(--lp-link)] hover:underline ${focusRing}`}
                      >
                        Terima semua
                      </button>
                    </div>

                    {isAnalyzing ? (
                      <div className='mt-3 flex flex-wrap gap-2' aria-hidden='true'>
                        {[112, 144, 96, 128, 104, 120].map((w, i) => (
                          <div key={i} className='lp-shimmer h-8 rounded-full' style={{ width: w }} />
                        ))}
                      </div>
                    ) : (
                      <div key={runId}>
                        <div className='mt-3 flex flex-wrap gap-2'>
                          {primarySkills.map((s, i) => (
                            <SkillChip
                              key={s.id}
                              skill={s}
                              index={i}
                              accepted={acceptedIds.has(s.id)}
                              onToggle={toggleSkill}
                            />
                          ))}
                        </div>
                        {lowSkills.length > 0 && (
                          <div className='mt-5 border-t border-dashed border-[var(--lp-border-strong)] pt-4'>
                            <p className='text-xs font-medium text-[var(--lp-text-sec)]'>
                              Perlu konfirmasi, relevansinya rendah
                            </p>
                            <div className='mt-2 flex flex-wrap gap-2'>
                              {lowSkills.map((s, i) => (
                                <SkillChip
                                  key={s.id}
                                  skill={s}
                                  index={primarySkills.length + i}
                                  accepted={acceptedIds.has(s.id)}
                                  onToggle={toggleSkill}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* kanan: skor */}
                  <div className='border-t lg:border-t-0 lg:border-l border-[var(--lp-border)] bg-[var(--lp-card)] p-6 sm:p-8 lg:col-span-2'>
                    <p className='text-sm text-[var(--lp-text-sec)]'>Target karier contoh</p>
                    <p className='text-base font-medium text-[var(--lp-heading)]'>Product Manager</p>

                    <div className='mt-5 flex items-center gap-5'>
                      <ScoreRing score={readiness.score} />
                      <div>
                        <p className='text-xs text-[var(--lp-text-sec)]'>Career Readiness Score</p>
                        <span
                          className={`mt-1.5 inline-block rounded-full px-3 py-1 text-sm font-medium ${labelTone(
                            readiness.label
                          )}`}
                        >
                          {readiness.label}
                        </span>
                      </div>
                    </div>

                    <div className='mt-6 flex flex-col gap-3.5 text-sm'>
                      {readiness.strong.length > 0 && (
                        <div className='flex items-start gap-2.5'>
                          <CheckCircle2 className='mt-0.5 h-4 w-4 shrink-0 text-[var(--lp-success)]' />
                          <p>
                            <span className='font-medium text-[var(--lp-success-text)]'>Sudah kuat</span>
                            <br />
                            <span className='text-[var(--lp-text-sec)]'>{readiness.strong.join(', ')}</span>
                          </p>
                        </div>
                      )}
                      {readiness.develop.length > 0 && (
                        <div className='flex items-start gap-2.5'>
                          <AlertCircle className='mt-0.5 h-4 w-4 shrink-0 text-[var(--lp-warning)]' />
                          <p>
                            <span className='font-medium text-[var(--lp-warning-text)]'>Perlu dikembangkan</span>
                            <br />
                            <span className='text-[var(--lp-text-sec)]'>{readiness.develop.join(', ')}</span>
                          </p>
                        </div>
                      )}
                      {readiness.missing.length > 0 && (
                        <div className='flex items-start gap-2.5'>
                          <MinusCircle className='mt-0.5 h-4 w-4 shrink-0 text-[var(--lp-error)]' />
                          <p>
                            <span className='font-medium text-[var(--lp-error)]'>Belum ada</span>
                            <br />
                            <span className='text-[var(--lp-text-sec)]'>{readiness.missing.join(', ')}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <p className='px-3 pb-1 pt-4 text-center text-xs text-[var(--lp-text-sec)]'>
                Ini simulasi dengan contoh data. Di Growvia, kamu memasukkan pengalamanmu sendiri.
              </p>
            </div>
            </Reveal>
          </div>
        </section>

        {/* ============================ FITUR KIRI-KANAN ============================ */}
        <div id='kendali' className={`${container} scroll-mt-20 flex flex-col gap-24 pb-24 md:gap-32 md:pb-32`}>
          {/* 1. Kendali AI: panel kiri, teks kanan */}
          <Split
            panelContent={
              <div className={`${panel} flex flex-col gap-4 p-5 sm:p-8`}>
                <div className={`${innerCard} p-5`}>
                  <div className='flex items-center gap-3'>
                    <span className='flex h-11 w-11 items-center justify-center rounded-full bg-[var(--lp-ai-bg)] text-[var(--lp-ai-text)]'>
                      <Sparkles className='h-5 w-5' />
                    </span>
                    <div>
                      <p className='text-base font-medium text-[var(--lp-heading)]'>Event Management</p>
                      <p className='text-xs text-[var(--lp-text-sec)]'>Diusulkan AI · relevansi 88%</p>
                    </div>
                  </div>
                  <div className='mt-5 flex items-center justify-between text-xs'>
                    <span className='text-[var(--lp-text-sec)]'>Bukti: Ketua Divisi Acara 2026</span>
                    <span className='rounded-full bg-[var(--lp-success-soft)] px-2.5 py-1 font-medium text-[var(--lp-success-text)]'>
                      Diterima
                    </span>
                  </div>
                </div>
                <div className={`${innerCard} p-5`}>
                  <div className='flex items-center gap-3'>
                    <span className='flex h-11 w-11 items-center justify-center rounded-full bg-[var(--lp-warning-soft)] text-[var(--lp-warning-text)]'>
                      <Code2 className='h-5 w-5' />
                    </span>
                    <div>
                      <p className='text-base font-medium text-[var(--lp-heading)]'>Data Analysis</p>
                      <p className='text-xs text-[var(--lp-text-sec)]'>Perlu konfirmasi · relevansi 32%</p>
                    </div>
                  </div>
                  <div className='mt-5 flex items-center justify-end gap-2 text-xs font-medium'>
                    <span className='rounded-full border border-[var(--lp-border-strong)] px-3 py-1 text-[var(--lp-text-sec)]'>
                      Tolak
                    </span>
                    <span className='rounded-full bg-[var(--lp-btn)] px-3 py-1 text-white'>Terima</span>
                  </div>
                </div>
              </div>
            }
            text={
              <FeatureText
                pill='Kamu yang memutuskan'
                title='AI mengusulkan, kamu yang memutuskan.'
                text='Growvia memakai AI untuk menghemat waktumu, bukan untuk menggantikan penilaianmu.'
                cta={
                  <a href='#demo' onClick={e => scrollToAnchor(e, 'demo')} className={btnPrimary}>
                    Coba demo
                    <ArrowRight className='h-4 w-4' />
                  </a>
                }
              >
                <ul className='mt-6 flex flex-col gap-3.5'>
                  {[
                    [<UserCheck key='a' className='h-4 w-4' />, 'Semua saran AI bisa kamu terima, ubah, atau tolak.'],
                    [<Sparkles key='b' className='h-4 w-4' />, 'Skill hasil AI diberi badge AI, skill manual tidak.'],
                    [
                      <Library key='c' className='h-4 w-4' />,
                      'Rekomendasi belajar diurutkan AI dari katalog kurasi tim Growvia. AI tidak mengarang materi.'
                    ],
                    [
                      <Calculator key='d' className='h-4 w-4' />,
                      'Persentase kecocokan peluang dihitung sistem dari profil skill-mu, bukan ditebak AI.'
                    ]
                  ].map(([icon, t], i) => (
                    <li key={i} className='flex items-start gap-3 text-sm leading-[1.65] text-[var(--lp-text)]'>
                      <span className='mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--lp-ai-bg)] text-[var(--lp-ai-text)]'>
                        {icon}
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </FeatureText>
            }
          />

          {/* 2. Readiness: teks kiri, panel kanan */}
          <Split
            reverse
            panelContent={
              <div className={`${panel} p-5 sm:p-8`}>
                <div className={`${innerCard} p-6`}>
                  <p className='text-lg font-medium text-[var(--lp-heading)]'>Career Readiness</p>
                  <div className='mt-5 flex items-center gap-5'>
                    <ScoreRing score={79} size={108} />
                    <div>
                      <p className='text-xs text-[var(--lp-text-sec)]'>Target karier</p>
                      <p className='text-base font-medium text-[var(--lp-heading)]'>Product Manager</p>
                      <span
                        className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${labelTone('Ready')}`}
                      >
                        Ready
                      </span>
                    </div>
                  </div>
                  <div className='mt-6 flex flex-col gap-3 border-t border-dashed border-[var(--lp-border-strong)] pt-5 text-sm'>
                    <p className='flex items-center gap-2.5 text-[var(--lp-text)]'>
                      <CheckCircle2 className='h-4 w-4 text-[var(--lp-success)]' /> 4 skill sudah kuat
                    </p>
                    <p className='flex items-center gap-2.5 text-[var(--lp-text)]'>
                      <AlertCircle className='h-4 w-4 text-[var(--lp-warning)]' /> 1 skill perlu dikembangkan
                    </p>
                    <p className='flex items-center gap-2.5 text-[var(--lp-text)]'>
                      <MinusCircle className='h-4 w-4 text-[var(--lp-error)]' /> 1 skill belum ada
                    </p>
                  </div>
                </div>
              </div>
            }
            text={
              <FeatureText
                pill='Career Readiness Score'
                title='Tahu persis skill mana yang perlu ditambah.'
                text='Pilih target karier, lalu lihat skill mana yang sudah kuat, perlu dikembangkan, dan belum kamu punya. Skornya ikut berubah setiap kali skill-mu berubah.'
                cta={
                  <Link href='/register' className={btnOutline}>
                    Daftar gratis
                    <ArrowRight className='h-4 w-4' />
                  </Link>
                }
              />
            }
          />

          {/* 3. Portofolio: panel kiri (placeholder gambar), teks kanan */}
          <Split
            panelContent={
              <div className='rounded-[2rem] bg-[var(--lp-ai-bg)] p-5 sm:p-8'>
                <div className={`${innerCard} overflow-hidden`}>
                  <div className='flex items-center gap-2 border-b border-[var(--lp-border)] px-4 py-3'>
                    <span className='h-2.5 w-2.5 rounded-full bg-[var(--lp-border-strong)]' />
                    <span className='h-2.5 w-2.5 rounded-full bg-[var(--lp-border-strong)]' />
                    <span className='ml-2 truncate text-xs text-[var(--lp-text-sec)]'>growvia.app/u/namamu</span>
                  </div>
                  {/* PLACEHOLDER: ganti IMG.portfolioCover */}
                  <img
                    src={IMG.portfolioCover}
                    alt='Contoh sampul portofolio'
                    width={900}
                    height={360}
                    loading='lazy'
                    className='h-32 w-full object-cover sm:h-40'
                  />
                  <div className='flex items-center gap-4 p-5'>
                    {/* PLACEHOLDER: ganti IMG.portfolioAvatar */}
                    <img
                      src={IMG.portfolioAvatar}
                      alt='Contoh foto profil'
                      width={56}
                      height={56}
                      loading='lazy'
                      className='-mt-10 h-14 w-14 rounded-full border-4 border-[var(--lp-card)] object-cover'
                    />
                    <div className='flex flex-wrap gap-1.5'>
                      {['Leadership', 'Budgeting', 'Event Management'].map(n => (
                        <span
                          key={n}
                          className='rounded-full bg-[var(--lp-panel)] px-2.5 py-1 text-[11px] text-[var(--lp-text-sec)]'
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            }
            text={
              <FeatureText
                title='Portofolio siap dibagikan.'
                text='Terisi otomatis dari profil, skill, dan pengalamanmu. Publikasikan ke growvia.app/u/namamu dan batalkan kapan saja.'
                cta={
                  <Link href='/register' className={btnOutline}>
                    Daftar gratis
                    <ArrowRight className='h-4 w-4' />
                  </Link>
                }
              />
            }
          />
        </div>

        {/* ============================ UNTUK SIAPA ============================ */}
        <section id='untuk-siapa' className='scroll-mt-20 pb-24 md:pb-32'>
          <div className={container}>
            <Reveal animation='fade-up'>
              <h2 className={`${h2Class} mx-auto max-w-[22ch] text-center`}>
                Dibuat untuk yang sedang menyiapkan langkah pertama
              </h2>
            </Reveal>
            <div className='mt-14 grid grid-cols-1 gap-5 md:grid-cols-3'>
              {[
                ['Mahasiswa aktif (semester 4–8)', 'Kamu aktif di organisasi atau kepanitiaan, tapi bingung menuliskannya di CV.'],
                ['Fresh graduate', 'Pengalamanmu masih 0–2 tahun dan kamu ingin tahu skill apa yang perlu ditambah.'],
                ['Career switcher', 'Kamu ingin memetakan ulang skill yang sudah ada untuk bidang baru.']
              ].map(([t, d], idx) => (
                <Reveal key={t} animation='fade-up' delay={idx * 120}>
                  <div className={`${panel} p-6 sm:p-7 h-full`}>
                    <h3 className='text-lg font-medium text-[var(--lp-heading)]'>{t}</h3>
                    <p className='mt-2 text-sm leading-[1.7] text-[var(--lp-text-sec)]'>{d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============================ FAQ ============================ */}
        <section id='faq' className='scroll-mt-20 pb-24 md:pb-32'>
          <div className={`${container} grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16`}>
            <Reveal animation='fade-right' className='lg:col-span-4'>
              <h2 className={`${h2Class} max-w-[12ch]`}>Pertanyaan yang sering muncul</h2>
            </Reveal>

            <div className='flex flex-col gap-3 lg:col-span-8'>
              {FAQ_ITEMS.map((item, idx) => {
                const open = openFaq === idx

                return (
                  <Reveal key={item.q} animation='fade-up' delay={idx * 60}>
                    <div className={`${panel} px-6`}>
                      <h3>
                        <button
                          type='button'
                          onClick={() => setOpenFaq(open ? null : idx)}
                          aria-expanded={open}
                          aria-controls={`${faqId}-${idx}`}
                          className={`flex w-full items-center justify-between gap-4 py-5 text-left text-base font-medium text-[var(--lp-heading)] ${focusRing}`}
                        >
                          {item.q}
                          <ChevronDown
                            className={`h-5 w-5 shrink-0 text-[var(--lp-text-sec)] transition-transform duration-200 ${
                              open ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      </h3>
                      <div
                        id={`${faqId}-${idx}`}
                        role='region'
                        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                        }`}
                      >
                        <div className='overflow-hidden'>
                          <p className='max-w-[62ch] pb-5 text-sm leading-[1.7] text-[var(--lp-text-sec)]'>{item.a}</p>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        {/* ============================ CTA AKHIR ============================ */}
        <section className='pb-20 md:pb-28'>
          <div className={container}>
            <Reveal animation='zoom-in'>
              <div className='relative overflow-hidden rounded-[2rem] bg-[var(--lp-navy)] px-6 py-12 sm:px-12 md:py-16 shadow-xl'>
                <div className='grid grid-cols-1 items-center gap-10 md:grid-cols-2'>
                  <div>
                    <h2 className='max-w-[14ch] text-3xl font-medium leading-[1.15] tracking-[-0.025em] text-white sm:text-4xl lg:text-[2.75rem]'>
                      Mulai dari satu pengalaman.
                    </h2>
                    <p className='mt-5 max-w-[42ch] text-sm leading-[1.75] text-[var(--lp-on-navy)] sm:text-base'>
                      Kamu bisa melihat skill pertamamu dalam waktu kurang dari 5 menit.
                    </p>
                    <div className='mt-8 flex flex-wrap items-center gap-4'>
                      <Link
                        href='/register'
                        className='inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-medium text-[var(--lp-navy)] transition hover:bg-slate-100 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lp-navy)]'
                      >
                        Daftar gratis
                        <ArrowRight className='h-4 w-4' />
                      </Link>
                    </div>
                  </div>

                  <div className='relative mx-auto w-full max-w-[320px] md:ml-auto'>
                    {/* PLACEHOLDER: ganti IMG.ctaPerson */}
                    <img
                      src={IMG.ctaPerson}
                      alt='Contoh foto pengguna Growvia'
                      width={640}
                      height={640}
                      loading='lazy'
                      className='aspect-square w-full rounded-3xl object-cover'
                    />
                    <div className='lp-float absolute -bottom-4 -left-4 flex items-center gap-3 rounded-2xl bg-[var(--lp-card)] p-3 pr-5 shadow-[var(--lp-shadow-float)] sm:-left-8'>
                      <span className='flex h-10 w-10 items-center justify-center rounded-full bg-[var(--lp-success-soft)] text-[var(--lp-success-text)]'>
                        <CheckCircle2 className='h-5 w-5' />
                      </span>
                      <div>
                        <p className='text-xs font-medium text-[var(--lp-heading)]'>Skill pertama siap</p>
                        <p className='text-[11px] text-[var(--lp-text-sec)]'>Dari satu pengalaman</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ============================ FOOTER ============================ */}
      <footer className='border-t border-[var(--lp-border)] py-10 text-sm text-[var(--lp-text-sec)]'>
        <div className={`${container} flex flex-col items-center justify-between gap-6 md:flex-row`}>
          <div className='flex items-center gap-2.5'>
            <img
              src='/images/growvia-logo.png'
              alt='Growvia Logo'
              width={28}
              height={28}
              className='h-7 w-7 shrink-0 object-contain'
            />
            <span className='font-semibold text-[var(--lp-heading)]'>Growvia</span>
            <span className='hidden text-[var(--lp-text-muted)] sm:inline'>·</span>
            <span className='hidden sm:inline'>Dari pengalaman ke skill ke karier.</span>
          </div>
          <nav aria-label='Navigasi footer' className='flex items-center gap-6'>
            {NAV_ITEMS.map(item => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={e => scrollToAnchor(e, item.id)}
                className='transition-colors hover:text-[var(--lp-text)]'
              >
                {item.label}
              </a>
            ))}
          </nav>
          <p>© {new Date().getFullYear()} Growvia</p>
        </div>
      </footer>
    </div>
  )
}
