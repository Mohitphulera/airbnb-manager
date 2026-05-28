/**
 * Migration script: creates the default "Cozy B&B" owner account
 * and assigns all existing orphaned records to them.
 *
 * Run with: npx tsx scripts/migrate-to-multitenant.ts
 */

import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
// @ts-ignore
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  // ─── 1. Create or find default owner ──────────────────────────────────────
  const email = process.env.MIGRATION_OWNER_EMAIL ?? 'admin@cozybnb.com'
  const password = process.env.MIGRATION_OWNER_PASSWORD ?? process.env.ADMIN_PASSWORD ?? 'admin123'
  const businessName = process.env.MIGRATION_BUSINESS_NAME ?? 'Cozy B&B'
  const slug = process.env.MIGRATION_SLUG ?? 'cozybnb'

  let user = await prisma.user.findFirst({ where: { OR: [{ email }, { slug }] } })

  if (!user) {
    const passwordHash = await bcrypt.hash(password, 12)
    user = await prisma.user.create({
      data: { email, passwordHash, businessName, slug },
    })
    console.log(`✅ Created default owner: ${email} / slug: ${slug}`)
  } else {
    console.log(`ℹ️  Default owner already exists: ${user.email}`)
  }

  const userId = user.id

  // ─── 2. Assign orphaned Properties ────────────────────────────────────────
  const propResult = await prisma.property.updateMany({
    where: { userId: { equals: undefined as any } },
    data: { userId },
  })
  // Fallback: update any row with empty/null userId (raw SQL style)
  const props = await prisma.property.findMany({ where: { userId: '' } })
  for (const p of props) {
    await prisma.property.update({ where: { id: p.id }, data: { userId } })
  }
  console.log(`📦 Assigned ${propResult.count} orphaned properties → ${businessName}`)

  // ─── 3. Assign orphaned Tasks ──────────────────────────────────────────────
  const tasks = await prisma.task.updateMany({
    where: { userId: '' },
    data: { userId },
  })
  console.log(`✅ Assigned ${tasks.count} tasks`)

  // ─── 4. Assign orphaned Guests ────────────────────────────────────────────
  const guests = await prisma.guest.updateMany({
    where: { userId: '' },
    data: { userId },
  })
  console.log(`✅ Assigned ${guests.count} guests`)

  // ─── 5. Assign orphaned Referrals ─────────────────────────────────────────
  const referrals = await prisma.referral.updateMany({
    where: { userId: '' },
    data: { userId },
  })
  console.log(`✅ Assigned ${referrals.count} referrals`)

  // ─── 6. Assign orphaned InventoryItems ────────────────────────────────────
  const inventory = await prisma.inventoryItem.updateMany({
    where: { userId: '' },
    data: { userId },
  })
  console.log(`✅ Assigned ${inventory.count} inventory items`)

  // ─── 7. Assign orphaned SaleProperties ────────────────────────────────────
  const saleProps = await prisma.saleProperty.updateMany({
    where: { userId: '' },
    data: { userId },
  })
  console.log(`✅ Assigned ${saleProps.count} sale properties`)

  // ─── 8. Assign orphaned Feedbacks ─────────────────────────────────────────
  const feedbacks = await prisma.feedback.updateMany({
    where: { userId: '' },
    data: { userId },
  })
  console.log(`✅ Assigned ${feedbacks.count} feedbacks`)

  console.log(`
╔══════════════════════════════════════════╗
║        Migration Complete! 🎉            ║
╠══════════════════════════════════════════╣
║  Login: ${email.padEnd(32)}║
║  Password: ${password.padEnd(29)}║
║  Public URL: /${slug.padEnd(27)}║
╚══════════════════════════════════════════╝
  `)
}

main()
  .catch(e => { console.error('Migration failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
