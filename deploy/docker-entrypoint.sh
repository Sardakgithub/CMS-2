#!/bin/sh
set -e

echo "==> chronos: entrypoint started"

if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  DATABASE_URL not set — skipping Prisma migrations."
else
  echo "› DATABASE_URL present, attempting to run Prisma migrations..."
  attempts=0
  max_attempts=10
  until [ $attempts -ge $max_attempts ]
  do
    if npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma; then
      echo "✓ Prisma migrations applied"
      break
    fi
    attempts=$((attempts+1))
    echo "Prisma migrate failed (attempt $attempts/$max_attempts). Retrying in 5s..."
    sleep 5
  done
  if [ $attempts -ge $max_attempts ]; then
    echo "✗ Prisma migrate failed after $max_attempts attempts"
    exit 1
  fi
fi

echo "==> starting Chronos API"
exec node dist/main.js
