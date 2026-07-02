# Portal Kania Happy

> **Rumah Sehat & Sanggar Senam**

Sistem manajemen gym & membership berbasis web untuk Portal Kania Happy. Dibangun dengan Laravel 13 + React 19 + Inertia.js.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 13.17, PHP 8.5.7 |
| Frontend | React 19, TypeScript, Inertia.js |
| Database | MySQL 8.x |
| UI | Tailwind CSS v4, shadcn/ui (Nova preset), Lucide Icons |
| Auth | Laravel Breeze |
| Permission | Spatie Laravel Permission 8.1 |
| Form | React Hook Form + Zod |
| State | Zustand |
| Date | Day.js |

---

## Requirements

- PHP 8.4+
- Composer 2.x
- Node.js 20+
- MySQL 8.x

---

## Installation

### 1. Clone repository

```bash
git clone <repository-url>
cd portal-kania-happy
```

### 2. Install dependencies

```bash
composer install
npm install --legacy-peer-deps
```

### 3. Setup environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` dan sesuaikan konfigurasi database:

```env
APP_NAME="Portal Kania Happy"
APP_URL=http://localhost:8000
APP_TIMEZONE=Asia/Jakarta

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=portal_kania_happy
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Setup database

```bash
# Buat database terlebih dahulu di MySQL
# CREATE DATABASE portal_kania_happy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

php artisan migrate --seed
```

### 5. Storage link

```bash
php artisan storage:link
```

### 6. Jalankan aplikasi

Buka **2 terminal**:

```bash
# Terminal 1 — Laravel Backend
php artisan serve

# Terminal 2 — Vite Frontend
npm run dev
```

Atau gunakan satu command (menjalankan semua sekaligus):

```bash
composer dev
```

Buka browser: **http://localhost:8000**

---

## Default Credentials

| Field | Value |
|-------|-------|
| Email | admin@portalkaniah.com |
| Password | password |

> ⚠️ **Penting:** Ganti password segera setelah login pertama kali melalui halaman Profil.

---

## Struktur Folder

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Auth/                        ← Auth controllers
│   │   ├── Settings/                    ← General & Branding controllers
│   │   └── DashboardController.php
│   ├── Middleware/
│   │   └── HandleInertiaRequests.php    ← Share global props ke React
│   └── Requests/
│       └── Settings/                    ← Form Request validasi
├── Models/
│   ├── User.php
│   ├── Setting.php
│   └── ActivityLog.php
├── Services/
│   ├── SettingsService.php              ← Cache-aware settings service
│   └── ActivityLogService.php
└── Helpers/
    └── helpers.php                      ← Global helper setting()

resources/js/
├── components/
│   ├── layout/                          ← Sidebar, Navbar, Breadcrumb, GlobalSearch
│   ├── shared/                          ← StatCard, DataTable, EmptyState, dll
│   └── ui/                             ← shadcn/ui base components
├── hooks/                               ← useFlashToast, useSidebarStore, useGlobalSearch, useDateTime
├── layouts/                             ← AppLayout, AuthSplitLayout
├── lib/
│   ├── navigation.ts                    ← Data menu sidebar terpusat
│   ├── utils.ts                         ← cn() helper
│   └── validations/                     ← Zod schemas
├── pages/
│   ├── Auth/                            ← Login, ForgotPassword, dll
│   ├── Dashboard.tsx
│   ├── Profile/
│   ├── errors/                          ← 404, 403, 500
│   └── settings/                        ← General, Branding
└── types/
    └── index.d.ts                       ← TypeScript types global
```

---

## Fitur Phase 1

- ✅ Autentikasi — Login, Logout, Remember Me, Forgot Password
- ✅ Dashboard — Stat cards, widget empty state, real-time clock
- ✅ Sidebar responsif — Desktop collapse, tablet collapsible, mobile drawer
- ✅ Global Search — CMD+K, keyboard navigation (↑↓ Enter ESC)
- ✅ Settings General — Nama app, tagline, timezone, currency, format tanggal
- ✅ Settings Branding — Primary color dinamis, upload logo & favicon
- ✅ Dynamic branding — Warna, nama, tagline dari database (tanpa ubah kode)
- ✅ Toast notifications — Success, Error, Warning, Info via Sonner
- ✅ Halaman error custom — 404, 403, 500
- ✅ Reusable components — DataTable, ConfirmDialog, EmptyState, StatCard, dll
- ✅ Activity Log — Struktur siap, belum diintegrasikan penuh
- ✅ Role & Permission — Spatie, role Admin, siap multi-role

---

## Catatan Penting

### npm install
Selalu gunakan `--legacy-peer-deps` karena ada konflik peer dependency antara `@vitejs/plugin-react-oxc` dan Vite 8:

```bash
npm install --legacy-peer-deps
```

### maatwebsite/excel
Package ini tidak diinstall karena belum support PHP 8.5. Akan diganti dengan `openspout/openspout` pada fase laporan.

### CSS Variable Brand Color
Warna brand (`--brand-primary`) di-inject via `app.blade.php` dari database. Semua komponen menggunakan `var(--brand-primary)` bukan hardcoded Tailwind class.

---

## Phase Progress

| Phase | Status | Deskripsi |
|-------|--------|-----------|
| **Phase 1** | ✅ Selesai | Foundation, Auth, Dashboard, Settings, Layout |
| Phase 2 | 🔜 Planned | Member Management |
| Phase 3 | 🔜 Planned | Kasir & Transaksi |
| Phase 4 | 🔜 Planned | Senam & Booking Sanggar |
| Phase 5 | 🔜 Planned | Laporan & Export |

---

## Development Commands

```bash
# Jalankan semua (server + vite + queue + logs)
composer dev

# Migration ulang dari awal
php artisan migrate:fresh --seed

# Clear semua cache
php artisan config:clear && php artisan cache:clear && php artisan route:clear

# TypeScript check
npx tsc --noEmit

# Build production
npm run build
```

---

## Lisensi

Private — Portal Kania Happy © 2026
