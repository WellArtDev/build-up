# BuildUp — Grassroots Sports Management Platform

Platform SaaS all-in-one untuk akademi olahraga grassroots Indonesia. Kelola siswa, pantau perkembangan 4 PILAR, otomatiskan keuangan, dan komunikasi WhatsApp — semua dalam satu dashboard.

![BuildUp](https://img.shields.io/badge/version-1.0.0-CCFF00?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange?style=flat-square&logo=mysql)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## Fitur Utama

### Multi-Tenant Architecture
- Isolasi data penuh per akademi (`tenant_id`)
- RBAC 5 role: Super Admin, Academy Owner, Academy Admin, Coach, Parent
- Subscription tiers: Starter, Growth, Professional, Enterprise

### Manajemen Siswa & Pelatih
- CRUD siswa lengkap dengan foto, NIK, NISN, riwayat klub
- Import massal via CSV, export ke CSV
- Manajemen pelatih dengan lisensi, spesialisasi, pengalaman
- Drag-drop board untuk assignment pelatih ke siswa

### Sistem 4 PILAR (Assessment)
- **Teknik:** First touch, Passing, Dribbling, Shooting
- **Taktik:** Positioning, Decision making
- **Fisik:** Stamina, Speed/agility, Strength
- **Mental:** Discipline, Teamwork, Fighting spirit
- Skala 1-10, evidence photos, coach notes
- Progress tracking dengan chart perbandingan

### Jadwal & Absensi
- Kalender jadwal latihan/pertandingan/turnamen
- Absensi per sesi dengan status Hadir/Terlambat/Izin/Absen
- Klik untuk toggle status absensi

### Keuangan & SPP
- Transaksi keuangan: SPP, pemasukan, pengeluaran
- Invoice otomatis dengan nomor unik
- Ringkasan keuangan bulanan
- Export laporan

### WhatsApp Gateway (Wablas)
- Pilihan: BuildUp Shared API atau API Key sendiri
- Kirim invoice SPP otomatis
- Pengingat jatuh tempo
- Broadcast pengumuman
- OTP via WhatsApp
- Dokumentasi lengkap: [Wablas API](https://wablas.com/documentation/api)

### Parent Portal
- Dashboard perkembangan anak (4 PILAR)
- Riwayat kehadiran
- Jadwal mendatang
- Status pembayaran SPP

### Discovery & Registrasi Online
- Pencarian akademi publik dengan filter olahraga & lokasi
- Peta Leaflet/OpenStreetMap
- Registrasi siswa online (guest)
- Profil akademi publik

### Turnamen & Prestasi
- Manajemen turnamen (upcoming/ongoing/completed)
- Pencatatan prestasi individu & tim
- Sertifikat digital (HTML print-to-PDF)

### Pengumuman
- Broadcast ke target spesifik: semua, orang tua, siswa, pelatih
- Prioritas: normal, high, urgent
- Integrasi WhatsApp

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS, custom dark theme |
| Auth | NextAuth.js v4, JWT, Credentials Provider |
| Database | MySQL 8.0, mysql2, prepared statements |
| Maps | Leaflet + OpenStreetMap (free) |
| Validation | Zod |
| WhatsApp | Wablas API Gateway |
| Deployment | Vercel (frontend), cPanel (full-stack) |

### Design System
| Token | Value | Usage |
|-------|-------|-------|
| `canvas` | `#0A0A0C` | Primary background |
| `surface` | `#111114` | Cards, containers |
| `accent` | `#CCFF00` | CTAs, highlights, progress |
| `text-primary` | `#FFFFFF` | Headings, body text |
| `text-secondary` | `#9CA3AF` | Labels, muted text |
| `border` | `#1F2937` | Dividers, card borders |

**Typography:** Outfit (UI), Inter (data/tables), Playfair Display italic (headings)

---

## Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm

### Install

```bash
git clone https://github.com/WellArtDev/build-up.git
cd build-up
npm install
cp .env.example .env.local
```

Edit `.env.local` dengan kredensial database Anda:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=buildup_db

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-min-32-chars
```

### Database Setup

```bash
# Create database
echo "CREATE DATABASE IF NOT EXISTS buildup_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" | mysql -u root -p

# Run migrations
npm run db:migrate

# (Optional) Run indexes for production performance
mysql -u root -p buildup_db < src/lib/db/indexes.sql
```

### Seed Demo Data

```bash
npm run db:seed
```

### Run Development Server

```bash
npm run dev
```

Buka `http://localhost:3000`

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@buildup.id` | `password123` |
| Academy Owner | `owner@garuda.id` | `password123` |
| Coach | `coach@garuda.id` | `password123` |
| Parent | `parent.rizky@email.com` | `password123` |

---

## Project Structure

```
buildup/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/                # API routes (17 route groups)
│   │   │   ├── admin/          # Super admin stats
│   │   │   ├── auth/           # NextAuth + change-password + forgot-pw
│   │   │   ├── certificates/   # Certificate generation
│   │   │   ├── contact/        # Contact form
│   │   │   ├── reports/        # Analytics reports
│   │   │   ├── tenants/        # Multi-tenant CRUD
│   │   │   ├── upload/         # File upload
│   │   │   └── wablas/         # WhatsApp gateway
│   │   ├── auth/               # Login, register, forgot-pw, error, onboarding
│   │   ├── dashboard/          # Role-based dashboards
│   │   │   ├── coach/          # Coach dashboard
│   │   │   ├── parent/         # Parent portal + finance
│   │   │   ├── settings/       # Academy settings + Wablas
│   │   │   ├── super-admin/    # Platform admin (tenants, billing, payments, pricing, settings)
│   │   │   └── tenants/        # Per-academy modules
│   │   │       └── [tenantId]/ # Students, coaches, assessments, schedules, finances, tournaments, achievements, announcements, reports
│   │   ├── discovery/          # Public academy search + profiles
│   │   ├── register/           # Guest online registration
│   │   ├── error.tsx           # Error boundary
│   │   ├── loading.tsx         # Global loading state
│   │   ├── not-found.tsx       # 404 page
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── coach/              # DragDropBoard
│   │   ├── forms/              # FileUpload
│   │   ├── layout/             # SiteHeader, DashboardSidebar, TenantSubNav, Providers
│   │   ├── maps/               # AcademyMap (Leaflet)
│   │   ├── notifications/      # NotificationBell
│   │   └── ui/                 # Skeleton, EmptyState, StatCard, StatusBadge
│   ├── hooks/                  # useDebounce, useApi, useMutation, useForm
│   ├── lib/
│   │   ├── api/                # handleError, validateTenant, response helpers
│   │   ├── auth/               # NextAuth config, middleware, types
│   │   ├── db/                 # Pool, schema, migrate, seed, health, transaction, indexes
│   │   ├── env/                # validate environment
│   │   ├── security/           # audit, headers, rateLimit, sanitize
│   │   ├── validation/         # Zod schemas for all endpoints
│   │   ├── wablas/             # Wablas API client
│   │   └── config.ts           # Centralized constants
│   ├── middleware.ts            # Security headers + rate limiting
│   ├── instrumentation.ts      # Startup env validation
│   ├── styles/                 # globals.css (Tailwind + design tokens)
│   └── types/                  # TypeScript definitions
├── .env.example                # Environment template
├── .gitignore
├── CHECKLIST.md                # Production readiness checklist
├── DEPLOYMENT.md               # Deployment guide
├── tailwind.config.ts          # Fluid design + color tokens
└── tsconfig.json               # Strict TypeScript config
```

---

## API Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/[...nextauth]` | Public | NextAuth handler |
| `POST` | `/api/auth/change-password` | User | Change password |
| `POST` | `/api/auth/forgot-password` | Public | Request password reset |
| `GET` | `/api/admin/stats` | Super Admin | Platform statistics |
| `GET` | `/api/tenants` | Super Admin | List/search tenants |
| `POST` | `/api/tenants/register` | Public | Register new academy |
| `GET` | `/api/tenants/[id]` | Public/Auth | Tenant detail (ID or slug) |
| `PATCH` | `/api/tenants/[id]` | Admin | Update tenant |
| `GET/POST` | `/api/tenants/[id]/students` | Auth | Student CRUD |
| `PATCH` | `/api/tenants/[id]/students/[sid]` | Admin | Update student |
| `GET/POST` | `/api/tenants/[id]/coaches` | Auth | Coach CRUD |
| `GET/POST` | `/api/tenants/[id]/assessments` | Auth | 4 PILAR CRUD |
| `GET/POST` | `/api/tenants/[id]/schedules` | Auth | Schedule CRUD |
| `GET/POST` | `/api/tenants/[id]/schedules/[sid]/attendance` | Auth | Attendance |
| `GET/POST` | `/api/tenants/[id]/finances` | Auth | Financial CRUD |
| `GET/POST` | `/api/tenants/[id]/tournaments` | Auth | Tournament CRUD |
| `GET/POST` | `/api/tenants/[id]/achievements` | Auth | Achievement CRUD |
| `GET/POST` | `/api/tenants/[id]/announcements` | Auth | Announcement CRUD |
| `GET` | `/api/tenants/[id]/export` | Admin | Export CSV |
| `POST` | `/api/tenants/[id]/import` | Admin | Bulk import CSV |
| `POST` | `/api/tenants/[id]/register` | Public | Guest registration |
| `GET` | `/api/reports` | Auth | Analytics reports |
| `POST` | `/api/upload` | Auth | File upload |
| `GET/POST` | `/api/wablas` | Admin | WhatsApp gateway |
| `POST` | `/api/certificates` | Auth | Generate certificate |
| `POST` | `/api/contact` | Public | Contact form |

---

## Security

- **Multi-tenant isolation:** `tenant_id` pada setiap query, divalidasi middleware
- **Prepared statements:** mysql2 mencegah SQL injection
- **JWT + RBAC:** NextAuth.js dengan role-based access
- **Rate limiting:** In-memory (gunakan Redis di production)
- **CSP headers:** Content-Security-Policy, X-Frame-Options, X-XSS-Protection
- **Input sanitization:** XSS filter, validasi nomor HP/NIK/email
- **File upload validation:** MIME type check, max 5MB, tenant-specific folders
- **Audit logging:** Tabel `audit_logs` untuk tracking operasi sensitif

---

## Production Deployment

Lihat [DEPLOYMENT.md](./DEPLOYMENT.md) untuk panduan lengkap.

### Checklist Sebelum Launch
- [ ] Generate `NEXTAUTH_SECRET` kuat (`openssl rand -base64 64`)
- [ ] Enable HTTPS (SSL certificate)
- [ ] Redis untuk rate limiting (ganti in-memory)
- [ ] MySQL daily backup
- [ ] Error monitoring (Sentry atau sejenis)
- [ ] Review CSP headers untuk production
- [ ] Konfigurasi Wablas webhook

---

## License

MIT License. Copyright © 2024 BuildUp.

---

Dibuat dengan 🏟️ untuk memajukan olahraga grassroots Indonesia.
