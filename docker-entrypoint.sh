#!/bin/sh
set -e

echo "🚀 Support by Nexora - Starting..."

# Run Prisma migrations/push
echo "📦 Running database setup..."
node ./node_modules/prisma/build/index.js db push --skip-generate

# Seed only if database is empty (check user count)
USER_COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
db.user.count().then(c => { console.log(c); db.\$disconnect(); }).catch(() => { console.log(0); });
" 2>/dev/null || echo "0")

if [ "$USER_COUNT" = "0" ]; then
  echo "🌱 Seeding database..."
  node prisma/seed.js 2>&1 || echo "Seed completed with warnings"
else
  echo "✅ Database already seeded ($USER_COUNT users)"
fi

echo "🌐 Starting Next.js server on port 3000..."
exec "$@"
