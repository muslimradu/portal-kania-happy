#!/bin/sh
cd /app

if [ -z "${APP_KEY:-}" ]; then
    echo "[entrypoint] ERROR: APP_KEY is not set. Add it in Railway → Variables."
    exit 1
fi

case "${DB_HOST:-}" in
    *'${{'*)
        echo "[entrypoint] ERROR: DB_HOST looks unresolved (${DB_HOST})."
        echo "[entrypoint] Use Railway Reference, not literal \${{MySQL.MYSQLHOST}} text."
        exit 1
        ;;
esac

mkdir -p storage/app/public/payment/qris storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

php artisan config:clear 2>/dev/null || true
php artisan route:clear 2>/dev/null || true
php artisan view:clear 2>/dev/null || true
php artisan storage:link --force 2>/dev/null || true

echo "[entrypoint] PHP $(php -r 'echo PHP_VERSION;')"
echo "[entrypoint] PORT=${PORT:-8080}"
echo "[entrypoint] DB_CONNECTION=${DB_CONNECTION:-not set}"
echo "[entrypoint] DB_HOST=${DB_HOST:-not set}"

# Migrate in background so healthcheck /up can respond immediately.
if [ -n "${DB_HOST:-}" ] && [ "${DB_CONNECTION:-mysql}" != "sqlite" ]; then
    (
        sleep 3
        echo "[entrypoint] Running migrations..."
        timeout 120 php artisan migrate --force 2>&1 || echo "[entrypoint] WARN: migrate failed (check DB_* variables)"
    ) &
fi

echo "[entrypoint] Starting server on 0.0.0.0:${PORT:-8080}"
exec php artisan serve --host=0.0.0.0 --port="${PORT:-8080}"
