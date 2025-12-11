#!/bin/sh

echo "==> chronos: entrypoint started"

if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  DATABASE_URL not set — skipping Prisma migrations."
else
  echo "ℹ️  DATABASE_URL present. Attempting Prisma migrations..."
  attempts=0
  max_attempts=10
  until [ $attempts -ge $max_attempts ]
  do
    if npx prisma migrate deploy --schema=prisma/schema.prisma 2>&1; then
      echo "✓ Prisma migrations applied successfully"
      break
    fi
    attempts=$((attempts+1))
    echo "Prisma migrate failed (attempt $attempts/$max_attempts). Retrying in 5s..."
    sleep 5
  done
  if [ $attempts -ge $max_attempts ]; then
    echo "⚠️  Prisma migrations failed after $max_attempts attempts"
    echo "    Application will attempt to start anyway (database schema may be incomplete)"
  fi
fi

echo "==> starting Chronos API"
exec node dist/main.js
