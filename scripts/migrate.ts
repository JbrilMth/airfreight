/**
 * Migration: Create Sender table and seed it with unique sender_name values
 * from Box and Shipment tables.
 * Run with: npx tsx scripts/migrate.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔌 Connecting to database...')

  // 1. Create Sender table if it doesn't exist
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Sender" (
        "id" UUID NOT NULL,
        "name" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Sender_pkey" PRIMARY KEY ("id")
      );
    `)
    console.log('✅ Created Sender table (if not exists)')
  } catch (e: any) {
    console.error('❌ Error creating Sender table:', e.message)
  }

  // 2. Add unique constraint on Sender name if it doesn't exist
  try {
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Sender_name_key" ON "Sender"("name");
    `)
    console.log('✅ Created unique index on Sender.name')
  } catch (e: any) {
    console.error('❌ Error creating unique index:', e.message)
  }

  // 3. Seed Sender table with existing unique names from Box and Shipment
  try {
    const boxSenders = await prisma.box.findMany({ select: { sender_name: true } })
    const shipmentSenders = await prisma.shipment.findMany({ select: { sender_name: true } })

    const uniqueSenders = new Set<string>()
    boxSenders.forEach(b => {
      if (b.sender_name && b.sender_name.trim()) uniqueSenders.add(b.sender_name.trim())
    })
    shipmentSenders.forEach(s => {
      if (s.sender_name && s.sender_name.trim()) uniqueSenders.add(s.sender_name.trim())
    })

    console.log(`🔍 Found ${uniqueSenders.size} unique senders in existing records. Seeding...`)

    for (const name of uniqueSenders) {
      // Find or create
      const existing = await prisma.$queryRawUnsafe<{ id: string }[]>(
        `SELECT "id" FROM "Sender" WHERE "name" = $1 LIMIT 1`,
        name
      )
      if (existing.length === 0) {
        // Generate UUID in JS or Postgres. Let's use postgres uuid_generate_v4 or gen_random_uuid
        // or just insert using random UUID from postgres if pgcrypto is available,
        // or generate standard UUID in raw SQL. Since standard UUIDs are needed,
        // we can use standard SQL gen_random_uuid() or uuid_in(md5(random()::text)::cstring)
        // or simply do insert using query parameters.
        await prisma.$executeRawUnsafe(
          `INSERT INTO "Sender" ("id", "name", "created_at") VALUES (gen_random_uuid(), $1, CURRENT_TIMESTAMP)`,
          name
        ).catch(async () => {
          // fallback if gen_random_uuid() isn't enabled
          await prisma.$executeRawUnsafe(
            `INSERT INTO "Sender" ("id", "name", "created_at") VALUES (cast(substring(md5(random()::text) from 1 for 8) || '-' || substring(md5(random()::text) from 9 for 4) || '-' || substring(md5(random()::text) from 13 for 4) || '-' || substring(md5(random()::text) from 17 for 4) || '-' || substring(md5(random()::text) from 21 for 12) as uuid), $1, CURRENT_TIMESTAMP)`,
            name
          )
        })
        console.log(`   👤 Seeded sender: "${name}"`)
      }
    }
  } catch (e: any) {
    console.error('❌ Error seeding Senders:', e.message)
  }

  console.log('🎉 Migration complete!')
}

main()
  .catch((e) => {
    console.error('Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
