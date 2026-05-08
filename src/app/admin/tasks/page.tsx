import { getTasks, getTaskStats } from '@/actions/taskActions'
import { getProperties } from '@/actions/propertyActions'
import TaskManager from '@/components/TaskManager'

export const dynamic = 'force-dynamic'

export default async function TasksPage() {
  const [tasks, stats, properties] = await Promise.all([getTasks(), getTaskStats(), getProperties()])
  const serialized = tasks.map(t => ({ ...t, dueDate: t.dueDate?.toISOString() || null, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString() }))
  const propNames = properties.map((p: any) => p.name)

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>Staff Tasks</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Manage cleaning, maintenance & operational tasks</p>
      </div>
      <TaskManager tasks={serialized} stats={stats} properties={propNames} />
    </div>
  )
}
