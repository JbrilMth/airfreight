/**
 * Migration: Create Recipient table and seed it with unique recipient_name values
 * from Shipment table.
 * Run with: npx tsx scripts/migrate_recipients.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔌 Connecting to database...')

  // 1. Create Recipient table if it doesn't exist
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Recipient" (
        "id" UUID NOT NULL,
        "name" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Recipient_pkey" PRIMARY KEY ("id")
      );
    `)
    console.log('✅ Created Recipient table (if not exists)')
  } catch (e: any) {
    console.error('❌ Error creating Recipient table:', e.message)
  }

  // 2. Add unique constraint on Recipient name if it doesn't exist
  try {
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Recipient_name_key" ON "Recipient"("name");
    `)
    console.log('✅ Created unique index on Recipient.name')
  } catch (e: any) {
    console.error('❌ Error creating unique index:', e.message)
  }

  // 3. Seed Recipient table with existing unique names from Shipment
  try {
    const shipments = await prisma.shipment.findMany({ select: { recipient_name: true } })

    const uniqueRecipients = new Set<string>()
    shipments.forEach(s => {
      if (s.recipient_name && s.recipient_name.trim()) uniqueRecipients.add(s.recipient_name.trim())
    })

    console.log(`🔍 Found ${uniqueRecipients.size} unique recipients in existing shipments. Seeding...`)

    for (const name of uniqueRecipients) {
      // Find or create
      const existing = await prisma.$queryRawUnsafe<{ id: string }[]>(
        `SELECT "id" FROM "Recipient" WHERE "name" = $1 LIMIT 1`,
        name
      )
      if (existing.length === 0) {
        await prisma.$executeRawUnsafe(
          `INSERT INTO "Recipient" ("id", "name", "created_at") VALUES (gen_random_uuid(), $1, CURRENT_TIMESTAMP)`,
          name
        ).catch(async () => {
          // fallback if gen_random_uuid() isn't enabled
          await prisma.$executeRawUnsafe(
            `INSERT INTO "Recipient" ("id", "name", "created_at") VALUES (cast(substring(md5(random()::text) from 1 for 8) || '-' || substring(md5(random()::text) from 9 for 4) || '-' || substring(md5(random()::text) from 13 for 4) || '-' || substring(md5(random()::text) from 17 for 4) || '-' || substring(md5(random()::text) from 21 for 12) as uuid), $1, CURRENT_TIMESTAMP)`,
            name
          )
        })
        console.log(`   👤 Seeded recipient: "${name}"`)
      }
    }
  } catch (e: any) {
    console.error('❌ Error seeding Recipients:', e.message)
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
