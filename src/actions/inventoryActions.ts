'use server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getInventory(property?: string) {
  const where: any = {}
  if (property) where.property = property
  return prisma.inventoryItem.findMany({ where, orderBy: { name: 'asc' } })
}

export async function addInventoryItem(data: { name: string; property: string; category?: string; quantity?: number; minStock?: number; unit?: string }) {
  await prisma.inventoryItem.create({ data: { name: data.name, property: data.property, category: data.category || 'TOILETRIES', quantity: data.quantity ?? 0, minStock: data.minStock ?? 5, unit: data.unit || 'pcs' } })
  revalidatePath('/admin/inventory')
}

export async function updateStock(id: string, quantity: number) {
  await prisma.inventoryItem.update({ where: { id }, data: { quantity, lastRefilled: new Date() } })
  revalidatePath('/admin/inventory')
}

export async function deleteInventoryItem(id: string) {
  await prisma.inventoryItem.delete({ where: { id } })
  revalidatePath('/admin/inventory')
}

export async function getLowStockItems() {
  const items = await prisma.inventoryItem.findMany()
  return items.filter(i => i.quantity <= i.minStock)
}
