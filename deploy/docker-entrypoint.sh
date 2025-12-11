#!/bin/sh
set -e

echo "==> chronos: entrypoint started"

if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  DATABASE_URL not set — skipping Prisma migrations."
else
  echo "ℹ️  DATABASE_URL present. Skipping migrations at startup."
  echo "    (Prisma schema engine has compatibility issues with Alpine Linux)"
  echo "    To run migrations manually, execute:"
  echo "    npx prisma migrate deploy --schema=prisma/schema.prisma"
fi

echo "==> starting Chronos API"
exec node dist/main.js
