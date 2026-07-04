#!/bin/sh
set -e

cd /app

if [ -z "${APP_KEY:-}" ]; then
    echo "[entrypoint] ERROR: APP_KEY is not set. Add it in Railway → Variables."
    exit 1
fi

mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

php artisan config:clear
php artisan route:clear
php artisan view:clear

php artisan storage:link --force 2>/dev/null || true

if [ -n "${DB_HOST:-}" ] || [ "${DB_CONNECTION:-}" = "sqlite" ]; then
    php artisan migrate --force || echo "[entrypoint] WARN: migrate failed (check DB_* variables)"
fi

echo "[entrypoint] Starting on port ${PORT:-8080}"
exec php artisan serve --host=0.0.0.0 --port="${PORT:-8080}"
