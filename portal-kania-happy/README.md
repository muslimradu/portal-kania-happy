# Portal Kania Happy

Portal internal berbasis Laravel + Inertia (React/TypeScript) dengan UI shadcn/Tailwind. Dokumen ini merangkum progres pengerjaan berdasarkan step-step pada phase awal proyek.

## Tech Stack

- **Backend:** Laravel 13, PHP ^8.3
- **Auth:** Laravel Breeze
- **Otorisasi:** spatie/laravel-permission (roles & permissions)
- **Frontend:** Inertia.js (React 19 + TypeScript), Tailwind CSS 4
- **UI Components:** shadcn/ui (Radix/Base UI), Lucide Icons, Sonner (toast)
- **State/Form:** Zustand, React Hook Form + Zod
- **Lainnya:** Ziggy (route helper), Vite 8

## Progres Phase Ini

| Step | Bagian | Isi | Status |
|---|---|---|---|
| 1 | Project Setup | Install Laravel 12/13, Breeze, semua package pendukung | ✅ |
| 2 | Database & Models | Migration, Model, Seeder | ✅ |
| 3 | Backend Core | SettingsService, Middleware, Exception Handler | ✅ |
| 4 | Autentikasi | Login page split-screen, logout | x |
| 5 | Layout Utama | AppLayout, Sidebar, Navbar, Breadcrumb | x |
| 6 | Global Search UI | Modal CTRL+K (UI saja, belum fungsi pencarian) | x |
| 7 | Dashboard | Cards, widgets, empty states | x |
| 8 | Settings Page | General settings + branding | x |
| 9 | Reusable Components | Semua shared components | x |
| 10 | Error Pages | 404, 403, 500 | x |

> Catatan: Global Search (step 6) baru mencakup tampilan modal; logika pencarian backend belum diimplementasikan dan menjadi bagian phase berikutnya.

## Struktur Singkat

```
app/
  Http/Controllers/      # DashboardController, ProfileController, Auth/*
  Http/Middleware/       # HandleInertiaRequests, dll.
  Models/                # User, Setting, ActivityLog
  Services/              # SettingsService
  Helpers/               # helpers.php

resources/js/
  layouts/               # AuthenticatedLayout, GuestLayout
  pages/                 # Dashboard, Auth/*, Profile/*, errors/*
  components/            # Komponen Breeze + components/ui (shadcn)

database/
  migrations/            # users, settings, activity_logs, permission tables
  seeders/
```

### Tabel Database

- `users` — data pengguna
- `settings` — pengaturan umum & branding aplikasi
- `activity_logs` — log aktivitas pengguna
- Tabel permission/role dari `spatie/laravel-permission` (`permissions`, `roles`, `model_has_permissions`, `model_has_roles`, `role_has_permissions`)

## Instalasi

1. **Clone & masuk ke folder proyek**
   ```bash
   git clone <repo-url> portal-kania
   cd portal-kania
   ```

2. **Install dependency PHP**
   ```bash
   composer install
   ```

3. **Install dependency JS**
   ```bash
   npm install
   ```

4. **Siapkan environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Siapkan database** (default SQLite)
   ```bash
   touch database/database.sqlite
   php artisan migrate --seed
   ```

6. **Jalankan aplikasi**
   ```bash
   composer run dev
   ```
   Perintah ini menjalankan server PHP, queue listener, log viewer (Pail), dan Vite secara bersamaan. Atau jalankan manual di dua terminal terpisah:
   ```bash
   php artisan serve
   npm run dev
   ```

7. Buka `http://localhost:8000` di browser.

## Script Berguna

| Perintah | Keterangan |
|---|---|
| `composer run dev` | Jalankan server, queue, pail, dan vite bersamaan |
| `npm run dev` | Jalankan Vite dev server saja |
| `npm run build` | Build asset untuk production |
| `php artisan migrate:fresh --seed` | Reset database & isi ulang seeder |
| `php artisan pint` | Format kode PHP sesuai standar Laravel |
| `php artisan test` | Jalankan test suite |

## Lisensi

Proyek internal — hak cipta dipegang oleh pemilik proyek.