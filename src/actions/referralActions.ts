'use server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/session'

export async function getReferrals() {
  const user = await requireUser()
  return prisma.referral.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
}

export async function createReferral(data: { referrerName: string; referrerPhone: string; discountPct?: number }) {
  const user = await requireUser()
  const code = `${data.referrerName.replace(/\s/g, '').slice(0, 4).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`
  await prisma.referral.create({ data: { userId: user.id, referrerName: data.referrerName, referrerPhone: data.referrerPhone, code, discountPct: data.discountPct || 10 } })
  revalidatePath('/admin/referrals')
}

export async function useReferralCode(code: string) {
  const ref = await prisma.referral.findUnique({ where: { code } })
  if (!ref || !ref.isActive) return { error: 'Invalid or inactive code' }
  await prisma.referral.update({ where: { id: ref.id }, data: { timesUsed: ref.timesUsed + 1 } })
  return { discount: ref.discountPct, referrerName: ref.referrerName }
}

export async function toggleReferral(id: string, isActive: boolean) {
  const user = await requireUser()
  await prisma.referral.updateMany({ where: { id, userId: user.id }, data: { isActive } })
  revalidatePath('/admin/referrals')
}

export async function deleteReferral(id: string) {
  const user = await requireUser()
  await prisma.referral.deleteMany({ where: { id, userId: user.id } })
  revalidatePath('/admin/referrals')
}
