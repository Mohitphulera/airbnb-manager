'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getExpenses() {
  return await prisma.expense.findMany({
    include: { property: true },
    orderBy: { date: 'desc' }
  })
}

export async function addExpense(formData: FormData) {
  const propertyId = formData.get('propertyId') as string
  const description = formData.get('description') as string
  const amount = parseFloat(formData.get('amount') as string)
  const category = formData.get('category') as string
  const date = new Date(formData.get('date') as string)

  await prisma.expense.create({
    data: { propertyId, description, amount, category, date }
  })

  revalidatePath('/admin/expenses')
  revalidatePath('/admin')
  return { success: true }
}

export async function deleteExpense(id: string) {
  await prisma.expense.delete({ where: { id } })
  revalidatePath('/admin/expenses')
  revalidatePath('/admin')
}

export async function updateExpense(id: string, data: Record<string, any>) {
  const updateData: Record<string, any> = {}
  if (data.description !== undefined) updateData.description = data.description
  if (data.amount !== undefined) updateData.amount = parseFloat(data.amount)
  if (data.category !== undefined) updateData.category = data.category
  if (data.date !== undefined) updateData.date = new Date(data.date)

  await prisma.expense.update({ where: { id }, data: updateData })
  revalidatePath('/admin/expenses')
  revalidatePath('/admin')
}
