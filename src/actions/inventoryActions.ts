'use server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/session'

export async function getInventory(property?: string) {
  const user = await requireUser()
  const where: any = { userId: user.id }
  if (property) where.property = property
  return prisma.inventoryItem.findMany({ where, orderBy: { name: 'asc' } })
}

export async function addInventoryItem(data: { name: string; property: string; category?: string; quantity?: number; minStock?: number; unit?: string }) {
  const user = await requireUser()
  await prisma.inventoryItem.create({ data: { userId: user.id, name: data.name, property: data.property, category: data.category || 'TOILETRIES', quantity: data.quantity ?? 0, minStock: data.minStock ?? 5, unit: data.unit || 'pcs' } })
  revalidatePath('/admin/inventory')
}

export async function updateStock(id: string, quantity: number) {
  const user = await requireUser()
  await prisma.inventoryItem.updateMany({ where: { id, userId: user.id }, data: { quantity, lastRefilled: new Date() } })
  revalidatePath('/admin/inventory')
}

export async function deleteInventoryItem(id: string) {
  const user = await requireUser()
  await prisma.inventoryItem.deleteMany({ where: { id, userId: user.id } })
  revalidatePath('/admin/inventory')
}

export async function getLowStockItems() {
  const user = await requireUser()
  const items = await prisma.inventoryItem.findMany({ where: { userId: user.id } })
  return items.filter(i => i.quantity <= i.minStock)
}
