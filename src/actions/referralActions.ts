'use server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getReferrals() {
  return prisma.referral.findMany({ orderBy: { createdAt: 'desc' } })
}

export async function createReferral(data: { referrerName: string; referrerPhone: string; discountPct?: number }) {
  const code = `COZY${data.referrerName.replace(/\s/g, '').slice(0, 4).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`
  await prisma.referral.create({ data: { referrerName: data.referrerName, referrerPhone: data.referrerPhone, code, discountPct: data.discountPct || 10 } })
  revalidatePath('/admin/referrals')
}

export async function useReferralCode(code: string) {
  const ref = await prisma.referral.findUnique({ where: { code } })
  if (!ref || !ref.isActive) return { error: 'Invalid or inactive code' }
  await prisma.referral.update({ where: { id: ref.id }, data: { timesUsed: ref.timesUsed + 1 } })
  return { discount: ref.discountPct, referrerName: ref.referrerName }
}

export async function toggleReferral(id: string, isActive: boolean) {
  await prisma.referral.update({ where: { id }, data: { isActive } })
  revalidatePath('/admin/referrals')
}

export async function deleteReferral(id: string) {
  await prisma.referral.delete({ where: { id } })
  revalidatePath('/admin/referrals')
}
