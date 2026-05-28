'use server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/session'

export async function getExpenses() {
  const user = await requireUser()
  return await prisma.expense.findMany({
    where: { property: { userId: user.id } },
    include: { property: true },
    orderBy: { date: 'desc' },
  })
}

export async function addExpense(formData: FormData) {
  const user = await requireUser()
  const propertyId = formData.get('propertyId') as string
  // Verify ownership
  const prop = await prisma.property.findFirst({ where: { id: propertyId, userId: user.id } })
  if (!prop) return { error: 'Property not found' }

  const description = formData.get('description') as string
  const amount = parseFloat(formData.get('amount') as string)
  const category = formData.get('category') as string
  const date = new Date(formData.get('date') as string)
  const receiptUrl = (formData.get('receiptUrl') as string) || null

  await prisma.expense.create({ data: { propertyId, description, amount, category, date, receiptUrl } })
  revalidatePath('/admin/expenses')
  revalidatePath('/admin')
  return { success: true }
}

export async function deleteExpense(id: string) {
  const user = await requireUser()
  await prisma.expense.deleteMany({ where: { id, property: { userId: user.id } } })
  revalidatePath('/admin/expenses')
  revalidatePath('/admin')
}

export async function updateExpense(id: string, data: Record<string, any>) {
  const user = await requireUser()
  const expense = await prisma.expense.findFirst({ where: { id, property: { userId: user.id } } })
  if (!expense) throw new Error('Not found')

  const updateData: Record<string, any> = {}
  if (data.description !== undefined) updateData.description = data.description
  if (data.amount !== undefined) updateData.amount = parseFloat(data.amount)
  if (data.category !== undefined) updateData.category = data.category
  if (data.date !== undefined) updateData.date = new Date(data.date)

  await prisma.expense.update({ where: { id }, data: updateData })
  revalidatePath('/admin/expenses')
  revalidatePath('/admin')
}
