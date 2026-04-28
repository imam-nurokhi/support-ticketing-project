#!/bin/sh
set -e

echo "🚀 Support by Nexora - Starting..."

# Clean up duplicate attachment rows so the storedName unique constraint can be applied safely.
echo "🧹 Checking attachment metadata..."
node <<'NODE'
const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function main() {
  const tableExists = await db.$queryRawUnsafe(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'TicketAttachment'",
  );

  if (!Array.isArray(tableExists) || tableExists.length === 0) {
    return;
  }

  const duplicates = await db.$queryRawUnsafe(`
    SELECT "storedName", COUNT(*) as "count"
    FROM "TicketAttachment"
    WHERE "storedName" IS NOT NULL
    GROUP BY "storedName"
    HAVING COUNT(*) > 1
  `);

  if (!Array.isArray(duplicates) || duplicates.length === 0) {
    return;
  }

  console.log(`Found ${duplicates.length} duplicate storedName values. Removing duplicate rows before schema sync...`);

  const deleted = await db.$executeRawUnsafe(`
    DELETE FROM "TicketAttachment"
    WHERE "id" IN (
      SELECT "id"
      FROM "TicketAttachment"
      WHERE "storedName" IN (
        SELECT "storedName"
        FROM "TicketAttachment"
        WHERE "storedName" IS NOT NULL
        GROUP BY "storedName"
        HAVING COUNT(*) > 1
      )
      AND "id" NOT IN (
        SELECT MIN("id")
        FROM "TicketAttachment"
        WHERE "storedName" IS NOT NULL
        GROUP BY "storedName"
      )
    )
  `);

  console.log(`Removed ${deleted} duplicate attachment rows.`);
}

main()
  .catch((error) => {
    console.error('Failed to prepare attachment metadata:', error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
NODE

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
