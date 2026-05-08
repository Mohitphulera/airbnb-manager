'use server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getTasks(status?: string) {
  const where: any = {}
  if (status && status !== 'ALL') where.status = status
  return prisma.task.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200 })
}

export async function createTask(data: { title: string; description?: string; property?: string; assignedTo?: string; priority?: string; category?: string; dueDate?: string }) {
  await prisma.task.create({
    data: { title: data.title, description: data.description || null, property: data.property || null, assignedTo: data.assignedTo || null, priority: data.priority || 'MEDIUM', category: data.category || 'CLEANING', dueDate: data.dueDate ? new Date(data.dueDate) : null },
  })
  revalidatePath('/admin/tasks')
}

export async function updateTaskStatus(id: string, status: string) {
  await prisma.task.update({ where: { id }, data: { status } })
  revalidatePath('/admin/tasks')
}

export async function deleteTask(id: string) {
  await prisma.task.delete({ where: { id } })
  revalidatePath('/admin/tasks')
}

export async function getTaskStats() {
  const [todo, inProgress, done, total] = await Promise.all([
    prisma.task.count({ where: { status: 'TODO' } }),
    prisma.task.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.task.count({ where: { status: 'DONE' } }),
    prisma.task.count(),
  ])
  return { todo, inProgress, done, total }
}
