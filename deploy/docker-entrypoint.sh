#!/bin/sh

echo "==> chronos: entrypoint started"

if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  DATABASE_URL not set — skipping Prisma migrations."
else
  echo "ℹ️  DATABASE_URL present. Attempting Prisma migrations..."
  # Try to run migrations, but don't exit if it fails (Alpine compatibility issue)
  # The database might still work even if migrations fail
  if npx prisma migrate deploy --schema=prisma/schema.prisma 2>&1; then
    echo "✓ Prisma migrations applied successfully"
  else
    echo "⚠️  Prisma migrate had an issue (may be normal on Alpine Linux)"
    echo "    The application will attempt to start anyway."
  fi
fi

echo "==> starting Chronos API"
exec node dist/main.js
