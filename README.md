# Portal Kania Happy

> **Rumah Sehat & Sanggar Senam**

Sistem manajemen gym, membership, kasir, booking sanggar, dan laporan keuangan berbasis web. Dibangun dengan Laravel 13 + React 19 + Inertia.js.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 13, PHP 8.4+ |
| Frontend | React 19, TypeScript, Inertia.js |
| Database | MySQL 8.x (production) / SQLite (development) |
| UI | Tailwind CSS v4, shadcn/ui, Lucide Icons |
| Auth | Laravel Breeze |
| Permission | Spatie Laravel Permission |
| Export | OpenSpout (Excel `.xlsx`) |
| Form | React Hook Form + Zod |

---

## Requirements

- PHP 8.4+
- Composer 2.x
- Node.js 20+
- MySQL 8.x (production)

---

## Installation (Development)

```bash
git clone <repository-url>
cd portal-kania-happy
composer install
npm install --legacy-peer-deps
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
```

Jalankan aplikasi:

```bash
# Terminal 1
php artisan serve

# Terminal 2
npm run dev
```

Atau: `composer dev`

Buka **http://localhost:8000**

---

## Default Credentials

| Field | Value |
|-------|-------|
| Email | admin@portalkaniah.com |
| Password | password |

> Ganti password segera setelah login pertama.

---

## Environment Variables

| Variable | Deskripsi | Production |
|----------|-----------|------------|
| `APP_NAME` | Nama aplikasi | `"Portal Kania Happy"` |
| `APP_ENV` | Environment | `production` |
| `APP_DEBUG` | Debug mode | `false` |
| `APP_URL` | URL publik | `https://domain.com` |
| `APP_TIMEZONE` | Timezone | `Asia/Jakarta` |
| `APP_KEY` | Encryption key | `php artisan key:generate` |
| `DB_*` | Koneksi MySQL | Sesuaikan server |
| `SESSION_DRIVER` | Session | `database` |
| `SESSION_LIFETIME` | Menit | `120` |
| `CACHE_STORE` | Cache | `database` atau `redis` |
| `QUEUE_CONNECTION` | Queue | `database` atau `redis` |
| `FILESYSTEM_DISK` | Storage | `local` / `s3` |
| `LOG_CHANNEL` | Logging | `stack` |
| `LOG_LEVEL` | Level log | `warning` atau `error` |
| `MAIL_*` | Email (reset password) | SMTP production |

---

## Build Commands

```bash
# TypeScript check
npx tsc --noEmit

# Production frontend build
npm run build

# Optimize Laravel (production)
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

---

## Modul Aplikasi

| Modul | Route | Permission |
|-------|-------|------------|
| Dashboard | `/dashboard` | `dashboard.view` |
| Kasir | `/cashier` | `cashier.view` |
| Senam | `/gym-classes` | `gym_classes.view` |
| Paket Membership | `/membership-packages` | `membership_packages.view` |
| Member | `/members` | `members.view` |
| Booking Sanggar | `/bookings` | `studio_bookings.view` |
| Laporan Gym Activity | `/reports/gym-activity` | `reports.gym_activity.view` |
| Laporan Membership | `/reports/membership` | `reports.membership.view` |
| Laporan Keuangan | `/financial-reports` | `financial_reports.view` |
| Konfigurasi Pembayaran | `/payment-configurations` | `payment_configurations.view` |
| Settings General | `/settings/general` | `settings.view` |
| Settings Branding | `/settings/branding` | `settings.view` |

---

## Deployment Checklist

### Pre-deploy

- [ ] Set `APP_ENV=production`, `APP_DEBUG=false`
- [ ] Generate `APP_KEY` unik per environment
- [ ] Konfigurasi MySQL production
- [ ] Set `APP_URL` ke domain HTTPS
- [ ] Konfigurasi SMTP untuk forgot password
- [ ] Backup database sebelum migrate

### Deploy

```bash
composer install --no-dev --optimize-autoloader
npm ci --legacy-peer-deps
npm run build
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Post-deploy

- [ ] Ganti password admin default
- [ ] Upload logo & favicon via Settings → Branding
- [ ] Konfigurasi metode pembayaran (Transfer/QRIS)
- [ ] Setup queue worker: `php artisan queue:work --daemon`
- [ ] Setup scheduler cron: `* * * * * php artisan schedule:run`
- [ ] Verifikasi HTTPS & CSRF cookie
- [ ] Test login, kasir, booking, export laporan
- [ ] Monitor log: `storage/logs/laravel.log`

### Server Requirements

- PHP extensions: `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `fileinfo`, `gd`
- Nginx/Apache dengan document root ke `/public`
- Writable: `storage/`, `bootstrap/cache/`

---

## Deploy ke Railway

Repo sudah include `railway.toml` dan `nixpacks.toml`. Connect GitHub → Railway → MySQL → set variables → deploy.

### 1. Buat project

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Pilih repo `portal-kania-happy`
3. **+ New** → **Database** → **MySQL**

### 2. Environment variables (service Web)

| Variable | Value |
|----------|-------|
| `APP_NAME` | `Portal Kania Happy` |
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_KEY` | `base64:...` *(lokal: `php artisan key:generate --show`)* |
| `APP_URL` | `https://kaniahappy.up.railway.app` |
| `APP_TIMEZONE` | `Asia/Jakarta` |
| `DB_CONNECTION` | `mysql` |
| `DB_HOST` | `${{MySQL.MYSQLHOST}}` |
| `DB_PORT` | `${{MySQL.MYSQLPORT}}` |
| `DB_DATABASE` | `${{MySQL.MYSQLDATABASE}}` |
| `DB_USERNAME` | `${{MySQL.MYSQLUSER}}` |
| `DB_PASSWORD` | `${{MySQL.MYSQLPASSWORD}}` |
| `SESSION_DRIVER` | `database` |
| `SESSION_SECURE_COOKIE` | `true` |
| `CACHE_STORE` | `database` |
| `QUEUE_CONNECTION` | `database` |
| `FILESYSTEM_DISK` | `local` *(lihat Volume/S3 di bawah)* |
| `LOG_CHANNEL` | `stderr` |
| `LOG_LEVEL` | `warning` |

> `railway.toml` sudah mengatur build, start, migrate, dan health check `/up`.

### 3. Generate domain

**Settings → Networking → Generate Domain** → set `APP_URL=https://kaniahappy.up.railway.app` → redeploy.

### 4. Seed pertama kali (via Railway CLI)

```bash
railway link
railway run php artisan db:seed --force
```

Login default: `admin@portalkaniah.com` / `password`

### 5. Post-deploy

- [ ] Ganti password admin
- [ ] Settings → Branding (logo/favicon)
- [ ] Konfigurasi Transfer & QRIS
- [ ] Input master data
- [ ] Test login, kasir, booking, export

---

### Hal penting di Railway

#### HTTPS & Proxy

Sudah dikonfigurasi di codebase:

- `bootstrap/app.php` → `trustProxies(at: '*')`
- `AppServiceProvider` → `URL::forceScheme('https')` saat production

Set juga `SESSION_SECURE_COOKIE=true` di Railway variables.

#### Storage ephemeral (upload logo, QRIS, branding)

Filesystem Railway **tidak permanen** — upload logo, gambar QRIS, dan file lain di `storage/app/public` bisa hilang saat redeploy.

**Opsi A — Railway Volume (disarankan untuk logo/favicon):**

1. Service Web → **Settings → Volumes**
2. Add Volume, mount path: `/app/storage/app/public`
3. Tetap `FILESYSTEM_DISK=local`

**Opsi B — S3 / Cloudflare R2:**

```env
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=...
AWS_BUCKET=...
AWS_URL=https://...   # opsional, untuk R2/custom endpoint
```

#### Health check

Route `/up` (Laravel built-in) — sudah di `railway.toml` sebagai `healthcheckPath`.

#### Log

Set `LOG_CHANNEL=stderr` agar log muncul di Railway **Deploy Logs**.

#### Redeploy / update

Push ke `main` → Railway auto-deploy. Migrate otomatis via `preDeployCommand` di `railway.toml`.

```bash
git push origin main
```

#### Troubleshooting

| Masalah | Solusi |
|---------|--------|
| 500 / blank page | Cek Deploy Logs; pastikan `APP_KEY` terisi |
| Vite manifest not found | Pastikan build command jalan (`npm run build`) |
| DB connection error | Cek reference variable MySQL |
| CSRF / 419 | Pastikan `APP_URL` HTTPS benar |
| Logo hilang setelah redeploy | Pasang Volume atau S3 |
| CSS/JS tidak load | Redeploy; cek `public/build/` ada di build log |

---

## Manual Testing Checklist

- [ ] Login / Logout / Remember Me / Forgot Password
- [ ] Dashboard — stat cards, widget, chart
- [ ] Senam — CRUD, soft delete, restore
- [ ] Paket Membership — CRUD
- [ ] Member — CRUD, registrasi, quota
- [ ] Kasir — check-in member, transaksi non-member, daftar hadir
- [ ] Booking — wizard, kalender, pembayaran, cancel
- [ ] Laporan Gym Activity — filter, sort, export
- [ ] Laporan Membership — filter, export
- [ ] Laporan Keuangan — filter, export
- [ ] Konfigurasi Pembayaran — Transfer & QRIS
- [ ] Settings General & Branding
- [ ] Activity Log tercatat
- [ ] Halaman error 403, 404, 419, 500
- [ ] Responsive: desktop, tablet, mobile

---

## Production Readiness Checklist

- [x] Autentikasi & authorization (Spatie Permission)
- [x] Validasi request di setiap mutasi
- [x] CSRF protection (Laravel default)
- [x] Upload branding — JPEG/PNG/WebP only (no SVG)
- [x] Database indexes untuk query hot path
- [x] Eager loading & query optimization
- [x] Export Excel dengan metadata (nama app, judul, tanggal, user)
- [x] Activity log untuk aksi penting
- [x] Error pages custom (403, 404, 419, 500)
- [x] Sidebar filter by permission
- [x] Form submit guard (disable + loading)
- [x] Debounced search
- [x] Sticky table header & skeleton loading
- [x] No TODO / placeholder / dummy data

---

## Development Commands

```bash
composer dev                          # Server + Vite + queue + logs
php artisan migrate:fresh --seed      # Reset database
php artisan config:clear && php artisan cache:clear && php artisan route:clear
npx tsc --noEmit                      # TypeScript check
npm run build                         # Production build
```

---

## Catatan

- Gunakan `npm install --legacy-peer-deps` karena peer dependency Vite/React.
- Warna brand (`--brand-primary`) di-inject dari database via `app.blade.php`.
- Timezone default: **Asia/Jakarta**.

---

## Lisensi

Private — Portal Kania Happy © 2026
