'use server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/session'

export async function getTasks(status?: string) {
  const user = await requireUser()
  const where: any = { userId: user.id }
  if (status && status !== 'ALL') where.status = status
  return prisma.task.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200 })
}

export async function createTask(data: { title: string; description?: string; property?: string; assignedTo?: string; priority?: string; category?: string; dueDate?: string }) {
  const user = await requireUser()
  await prisma.task.create({
    data: { userId: user.id, title: data.title, description: data.description || null, property: data.property || null, assignedTo: data.assignedTo || null, priority: data.priority || 'MEDIUM', category: data.category || 'CLEANING', dueDate: data.dueDate ? new Date(data.dueDate) : null },
  })
  revalidatePath('/admin/tasks')
}

export async function updateTaskStatus(id: string, status: string) {
  const user = await requireUser()
  await prisma.task.updateMany({ where: { id, userId: user.id }, data: { status } })
  revalidatePath('/admin/tasks')
}

export async function deleteTask(id: string) {
  const user = await requireUser()
  await prisma.task.deleteMany({ where: { id, userId: user.id } })
  revalidatePath('/admin/tasks')
}

export async function getTaskStats() {
  const user = await requireUser()
  const [todo, inProgress, done, total] = await Promise.all([
    prisma.task.count({ where: { userId: user.id, status: 'TODO' } }),
    prisma.task.count({ where: { userId: user.id, status: 'IN_PROGRESS' } }),
    prisma.task.count({ where: { userId: user.id, status: 'DONE' } }),
    prisma.task.count({ where: { userId: user.id } }),
  ])
  return { todo, inProgress, done, total }
}
