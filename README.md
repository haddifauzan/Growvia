<p align="center">
  <img src="public/images/growvia-logo.png" alt="Growvia Logo" width="96" height="96" />
</p>

<h1 align="center">Growvia</h1>

<p align="center">
  <strong>Turn Experience Into Opportunity.</strong><br>
  AI-Powered Interconnected Skill Ecosystem & Career Readiness Platform untuk Mengoptimalkan Kapabilitas Talenta Digital Indonesia Menuju SDGs 2030.
</p>

<p align="center">
  <a href="https://growvia-hub.vercel.app" target="_blank"><strong>🌐 Coba Live Demo &raquo;</strong></a>
  &nbsp;|&nbsp;
  <a href="https://github.com/Kokoirham47/Growvia"><strong>💻 GitHub Repository &raquo;</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?style=flat-square&logo=supabase" alt="Supabase PostgreSQL" />
  <img src="https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=flat-square&logo=google" alt="Google Gemini AI" />
  <img src="https://img.shields.io/badge/UINIC_8.0-2026-1E3A8A?style=flat-square" alt="UINIC 8.0" />
</p>

---

## Tentang Growvia

Indonesia menghadapi puncak bonus demografi (2030–2045) dengan lebih dari 64% populasi usia produktif. Namun, data BPS menunjukkan tingkat pengangguran terbuka lulusan universitas dan diploma masih tinggi, dipicu oleh **skill mismatch kronis** dan ketidakmampuan mahasiswa menerjemahkan pengalaman riil (organisasi, kepanitiaan, capstone, magang) menjadi bahasa kompetensi industri yang terukur.

**Growvia** hadir sebagai solusi berbasis *evidence-based AI extraction*:
1. **Mengubah narasi pengalaman bebas** menjadi taksonomi skill tervalidasi.
2. **Mendiagnosis kesenjangan (*skill gap*)** terhadap target karier impian secara transparan.
3. **Mengakselerasi kesiapan kerja** melalui rekomendasi materi belajar terkurasi, pencocokan lowongan berbobot persentase, dan portofolio publik instan.

Platform ini diajukan dalam ajang **Web Development Competition UINIC 8.0 (UIN Sunan Kalijaga Yogyakarta 2026)** di bawah tema cabang *"Engineering Interconnected Web Solutions to Empower Digital Ecosystems"*, secara aktif mendukung pencapaian:
- **SDG No. 4: Quality Education** (Peningkatan keterampilan relevan untuk pekerjaan layak dan kewirausahaan).
- **SDG No. 8: Decent Work and Economic Growth** (Akselerasi kesiapan kerja generasi muda produktif).

---

## Fitur Utama (Core Features)

```
[Pengalaman Nyata] ➔ [AI Smart Extractor] ➔ [Skill Profile & Evidence]
                                                    │
        ┌───────────────────────────────────────────┴───────────────────────────────────────────┐
        ▼                                           ▼                                           ▼
[Career Target & Gap]                    [Rekomendasi Belajar]                         [Peluang Karier]
(Strong, Develop, Missing)               (Kursus, Artikel, Video)                      (Match % Transparan)
        │
        └───────────────────────────────────────────┬───────────────────────────────────────────┘
                                                    ▼
                                    [Public Shareable Portfolio]
                                        (/u/:portfolioSlug)
```

### 1. AI Smart Skill Extractor (Evidence-Based)
- Pengguna menuliskan pengalaman (organisasi, kepanitiaan, magang, proyek riset/capstone).
- Mesin AI (Google Gemini) mengekstraksi keterampilan spesifik lengkap dengan kategori (*Technical, Soft, Tools, Methodologies*), tingkat penguasaan, dan skor relevansi.
- Pengguna memiliki kendali penuh (*human-in-the-loop*): menerima, menolak, atau mengoreksi usulan AI.

### 2. Visual Skill Map & Evidence Ledger
- Visualisasi profil kompetensi interaktif dengan radar chart dan pengelompokan taksonomi.
- Setiap skill memiliki tautan bukti (*evidence ledger*) langsung ke pengalaman yang melatarbelakanginya, mengeliminasi fenomena *resume inflation*.

### 3. Career Readiness Engine & Gap Analysis
- Pemilihan target profesi (misal: *Frontend Engineer, Product Manager, Data Scientist*).
- Sistem menghitung **Career Readiness Score (0–100%)** dan memetakan gap menjadi 3 status jelas:
  - 🟢 **Sudah Kuat (*Strong*)**
  - 🟡 **Perlu Dikembangkan (*Need Development*)**
  - 🔴 **Belum Ada (*Missing*)**

### 4. Kurasi Rekomendasi Belajar Personal
- Modul pembelajaran (kursus, video, dokumentasi resmi, artikel) direkomendasikan secara tepat sasaran untuk menutup celah skill yang hilang (*missing skills*).
- Simulasi dampak: melihat langsung kenaikan skor kesiapan karier sebelum dan sesudah modul diselesaikan.

### 5. AI-Matched Career & Opportunity Hub
- Lowongan magang, kerja penuh waktu, freelance, dan kompetisi disajikan dengan persentase kecocokan (*match score*) transparan yang dihitung dari profil skill pengguna.

### 6. Instant Public Portfolio Builder (`/u/:slug`)
- Pembuatan laman portofolio profesional satu klik yang terhubung langsung ke profil skill dan pengalaman pengguna.
- Dilengkapi pengaturan privasi publik/privat serta tombol salin link instan.

### 7. Role-Based Admin & Governance Dashboard
- Panel administrasi untuk mengelola pengguna, kurasi peluang karier, moderasi katalog pembelajaran, audit sistem, dan fitur keamanan *soft-delete*.

---

## 🛠️ Tech Stack & Arsitektur

| Lapisan | Teknologi | Deskripsi |
|---|---|---|
| **Frontend Framework** | Next.js 16 (App Router) | Server & Client Components, Fast Refresh, Streaming SSR |
| **Bahasa Pemrograman** | TypeScript 5 | Static type safety end-to-end |
| **Styling & Theme** | Tailwind CSS 3.4 & MUI 6 | Design System terstruktur dengan Dark/Light Mode otomatis |
| **Animasi & Interaksi** | Vanilla CSS + IntersectionObserver | Zero-dependency scroll animations (AOS-style) & micro-interactions |
| **Basis Data** | PostgreSQL (Supabase) | Relational database dengan connection pooling (Prisma Accelerate / Supabase Pooler) |
| **ORM** | Prisma ORM | Type-safe schema, migrations, and seeding |
| **Kecerdasan Buatan (AI)** | Google Gemini API (`@google/genai`) | Ekstraksi kompetensi cerdas, pemetaan taksonomi, dan analisis relevansi |
| **Autentikasi** | NextAuth.js / JWT Session | Enkripsi password bcryptjs, sesi aman berbasis cookie HTTP-only |
| **Validasi & Keamanan** | Zod, DOMPurify, Rate Limiter | Validasi skema input ketat, sanitasi anti-XSS & anti-CSRF |
| **Deployment** | Vercel Platform | Edge-ready serverless environment dengan CDN global |

---

## Struktur Direktori Proyek

```
Growvia/
├── public/                 # Static assets, logos, avatars, illustrations
├── prisma/
│   ├── schema.prisma       # Skema basis data relasional
│   ├── seed.ts             # Main database seeder
│   └── seed_*.ts           # Seeder katalog (karier, peluang, pembelajaran)
├── src/
│   ├── app/                # Next.js App Router (Halaman & Endpoint API)
│   │   ├── (blank-layout-pages)/  # Auth & Onboarding pages
│   │   ├── (dashboard)/           # Dashboard, Skill, Career, Portfolio, Admin
│   │   ├── api/                   # RESTful API route handlers
│   │   ├── u/[slug]/              # Public shareable portfolio
│   │   └── globals.css            # Desain token, tema, & sistem animasi
│   ├── components/         # Komponen UI modular (Admin, Layout, UI kit)
│   ├── contexts/           # React Context (Auth, Theme Settings)
│   ├── libs/
│   │   ├── ai/             # Gemini API client & Skill Extractor logic
│   │   ├── prisma.ts       # Singleton Prisma Client
│   │   └── supabase/       # Supabase client helpers
│   ├── server/             # Server validations (Zod), services, auth utils
│   ├── types/              # Deklarasi TypeScript interfaces & types
│   └── views/              # Page view components (Landing, Career, Learning, dll.)
├── .env.example            # Template variabel lingkungan
├── package.json
└── tsconfig.json
```

---

## 🚀 Panduan Instalasi Lokal (Getting Started)

### Prasyarat
- **Node.js**: Versi `18.18.0` atau yang lebih baru
- **npm** atau **pnpm**
- Akun basis data **PostgreSQL** (disarankan menggunakan [Supabase](https://supabase.com))
- **Google Gemini API Key** (dapat diperoleh gratis melalui [Google AI Studio](https://aistudio.google.com))

### 1. Kloning Repositori
```bash
git clone https://github.com/Kokoirham47/Growvia.git
cd Growvia
```

### 2. Instal Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi konfigurasi berikut pada `.env`:
```env
# Database (PostgreSQL / Supabase)
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres"

# NextAuth Secret & URL
NEXTAUTH_SECRET="your-super-secret-jwt-key"
NEXTAUTH_URL="http://localhost:3000"

# Google Gemini AI API
GEMINI_API_KEY="AIzaSy..."

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Sinkronisasi Skema Basis Data & Seeding
```bash
# Sinkronkan skema Prisma ke database
npx prisma db push

# Jalankan seeder data awal (katalog karier, course, peluang, admin akun)
npm run seed
```

### 5. Jalankan Development Server
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

Gunakan Akun Demo
Email: demo@growvia.id
Password: Password123!

---

## Keamanan & Praktik Rekayasa Perangkat Lunak

- **Validasi Data Berlapis**: Seluruh request body divalidasi ketat pada level server menggunakan **Zod Schema**.
- **Pencegahan Injeksi & XSS**: Prisma ORM menggunakan parameterization queries bawaan untuk mencegah SQL Injection; input teks disanitasi sebelum ditampilkan.
- **Enkripsi Kredensial**: Password akun di-hash menggunakan algoritma **bcryptjs** dengan salt factor yang aman.
- **Proteksi Akses Role-Based (RBAC)**: Rute administratif (`/admin/*`) diproteksi melalui verifikasi session token level middleware dan server utility.
- **Aksesibilitas (a11y) & Performa**: Mengikuti standar kontras WCAG 2.1 AA, dukungan `prefers-reduced-motion`, navigasi keyboard yang ramah, dan optimasi gambar bawaan Next.js.

---

## Tim Pengembang (Growvia Team)

Karya ini dikembangkan oleh **Tim Growvia** untuk ajang **Web Development Competition UINIC 8.0 (2026)**:
- **Ketua Tim / Lead Developer & Architect**: Irham
- **Anggota Tim / UI/UX & Frontend Engineer**: Najla
- **Anggota Tim / Backend & AI Engineer**: Haddi

---
