'use client'
import { useState, useTransition } from 'react'
import { createTask, updateTaskStatus, deleteTask } from '@/actions/taskActions'

const PRIORITIES: Record<string,{color:string,bg:string}> = { LOW:{color:'#64748b',bg:'#f1f5f9'}, MEDIUM:{color:'#d97706',bg:'#fef3c7'}, HIGH:{color:'#dc2626',bg:'#fee2e2'}, URGENT:{color:'#fff',bg:'#dc2626'} }
const COLUMNS = [{ key:'TODO', label:'To Do', icon:'checklist', color:'#64748b' }, { key:'IN_PROGRESS', label:'In Progress', icon:'pending', color:'#2563eb' }, { key:'DONE', label:'Done', icon:'task_alt', color:'#16a34a' }]

export default function TaskManager({ tasks: initial, stats, properties }: { tasks: any[]; stats: any; properties: string[] }) {
  const [tasks, setTasks] = useState(initial)
  const [showAdd, setShowAdd] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({ title:'', description:'', property:'', assignedTo:'', priority:'MEDIUM', category:'CLEANING', dueDate:'' })

  const handleCreate = () => {
    if (!form.title.trim()) return
    startTransition(async () => { await createTask(form); setShowAdd(false); setForm({ title:'', description:'', property:'', assignedTo:'', priority:'MEDIUM', category:'CLEANING', dueDate:'' }); window.location.reload() })
  }
  const moveTask = (id: string, status: string) => startTransition(async () => { await updateTaskStatus(id, status); window.location.reload() })
  const removeTask = (id: string) => { if (!confirm('Delete task?')) return; startTransition(async () => { await deleteTask(id); window.location.reload() }) }

  const S: Record<string,React.CSSProperties> = {
    card: { background:'#fff', borderRadius:'14px', padding:'1.25rem', border:'1px solid var(--border)' },
    input: { width:'100%', padding:'0.625rem 0.875rem', borderRadius:'8px', border:'1px solid var(--border)', fontSize:'0.8125rem', fontFamily:'inherit', outline:'none' },
    label: { display:'block', fontSize:'0.5rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'#64748b', marginBottom:'0.25rem' },
    btn: { padding:'0.5rem 1rem', borderRadius:'8px', border:'none', fontSize:'0.75rem', fontWeight:700, cursor:'pointer' },
    overlay: { position:'fixed' as const, inset:0, background:'rgba(0,0,0,0.4)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center' },
  }

  return (
    <div>
      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
        {[{ l:'To Do', v:stats.todo, c:'#64748b' }, { l:'In Progress', v:stats.inProgress, c:'#2563eb' }, { l:'Done', v:stats.done, c:'#16a34a' }, { l:'Total', v:stats.total, c:'#1e293b' }].map((s,i) => (
          <div key={i} style={S.card}>
            <div style={{ fontSize:'0.5rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#94a3b8', marginBottom:'0.375rem' }}>{s.l}</div>
            <div style={{ fontSize:'1.5rem', fontWeight:800, color:s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'1rem' }}>
        <button onClick={()=>setShowAdd(true)} style={{ ...S.btn, background:'var(--gradient-primary)', color:'#fff' }}>+ New Task</button>
      </div>

      {/* Kanban */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem' }}>
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key)
          return (
            <div key={col.key} style={{ background:'#f8fafc', borderRadius:'14px', padding:'1rem', minHeight:'300px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize:'18px', color:col.color }}>{col.icon}</span>
                <span style={{ fontSize:'0.6875rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:col.color }}>{col.label}</span>
                <span style={{ marginLeft:'auto', background:col.color, color:'#fff', borderRadius:'50%', width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.625rem', fontWeight:700 }}>{colTasks.length}</span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                {colTasks.map(t => {
                  const pri = PRIORITIES[t.priority] || PRIORITIES.MEDIUM
                  return (
                    <div key={t.id} style={{ background:'#fff', borderRadius:'10px', padding:'0.875rem', border:'1px solid #e5e7eb', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.375rem' }}>
                        <span style={{ fontWeight:600, fontSize:'0.8125rem', lineHeight:1.4 }}>{t.title}</span>
                        <span style={{ padding:'0.1rem 0.375rem', borderRadius:'4px', fontSize:'0.5rem', fontWeight:700, background:pri.bg, color:pri.color, flexShrink:0 }}>{t.priority}</span>
                      </div>
                      {t.description && <p style={{ fontSize:'0.6875rem', color:'#6b7280', marginBottom:'0.375rem', lineHeight:1.5 }}>{t.description}</p>}
                      <div style={{ display:'flex', gap:'0.375rem', flexWrap:'wrap', marginBottom:'0.5rem' }}>
                        {t.property && <span style={{ fontSize:'0.5625rem', padding:'0.1rem 0.375rem', borderRadius:'4px', background:'#eff6ff', color:'#2563eb', fontWeight:600 }}>{t.property}</span>}
                        {t.assignedTo && <span style={{ fontSize:'0.5625rem', padding:'0.1rem 0.375rem', borderRadius:'4px', background:'#f0fdf4', color:'#16a34a', fontWeight:600 }}>{t.assignedTo}</span>}
                        {t.dueDate && <span style={{ fontSize:'0.5625rem', padding:'0.1rem 0.375rem', borderRadius:'4px', background:'#fef3c7', color:'#92400e', fontWeight:600 }}>{new Date(t.dueDate).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>}
                      </div>
                      <div style={{ display:'flex', gap:'0.25rem' }}>
                        {col.key !== 'TODO' && <button onClick={()=>moveTask(t.id, col.key === 'DONE' ? 'IN_PROGRESS' : 'TODO')} style={{ ...S.btn, padding:'0.2rem 0.5rem', fontSize:'0.5625rem', background:'#f1f5f9', color:'#64748b' }}>← Back</button>}
                        {col.key !== 'DONE' && <button onClick={()=>moveTask(t.id, col.key === 'TODO' ? 'IN_PROGRESS' : 'DONE')} style={{ ...S.btn, padding:'0.2rem 0.5rem', fontSize:'0.5625rem', background:COLUMNS[COLUMNS.findIndex(c=>c.key===col.key)+1]?.color || '#16a34a', color:'#fff' }}>→ {COLUMNS[COLUMNS.findIndex(c=>c.key===col.key)+1]?.label}</button>}
                        <button onClick={()=>removeTask(t.id)} style={{ ...S.btn, padding:'0.2rem 0.5rem', fontSize:'0.5625rem', background:'none', color:'#ef4444', marginLeft:'auto' }}><span className="material-symbols-outlined" style={{ fontSize:'14px' }}>delete</span></button>
                      </div>
                    </div>
                  )
                })}
                {colTasks.length === 0 && <div style={{ textAlign:'center', padding:'1.5rem', color:'#cbd5e1', fontSize:'0.75rem' }}>No tasks</div>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Task Modal */}
      {showAdd && (
        <div style={S.overlay} onClick={()=>setShowAdd(false)}>
          <div style={{ background:'#fff', borderRadius:'16px', padding:'1.75rem', width:'100%', maxWidth:'440px' }} onClick={e=>e.stopPropagation()}>
            <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'1rem' }}>New Task</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              <div><label style={S.label}>Title *</label><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} style={S.input} placeholder="e.g. Deep clean bathroom" /></div>
              <div><label style={S.label}>Description</label><textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} style={{ ...S.input, minHeight:'60px', resize:'vertical' }} /></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                <div><label style={S.label}>Property</label><select value={form.property} onChange={e=>setForm(f=>({...f,property:e.target.value}))} style={S.input}><option value="">None</option>{properties.map(p=><option key={p} value={p}>{p}</option>)}</select></div>
                <div><label style={S.label}>Assigned To</label><input value={form.assignedTo} onChange={e=>setForm(f=>({...f,assignedTo:e.target.value}))} style={S.input} placeholder="Staff name" /></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.75rem' }}>
                <div><label style={S.label}>Priority</label><select value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))} style={S.input}><option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>URGENT</option></select></div>
                <div><label style={S.label}>Category</label><select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} style={S.input}><option>CLEANING</option><option>MAINTENANCE</option><option>INVENTORY</option><option>OTHER</option></select></div>
                <div><label style={S.label}>Due Date</label><input type="date" value={form.dueDate} onChange={e=>setForm(f=>({...f,dueDate:e.target.value}))} style={S.input} /></div>
              </div>
            </div>
            <div style={{ display:'flex', gap:'0.5rem', marginTop:'1.25rem' }}>
              <button onClick={handleCreate} disabled={isPending || !form.title.trim()} style={{ ...S.btn, background:'var(--gradient-primary)', color:'#fff', flex:1 }}>{isPending ? 'Creating...' : 'Create Task'}</button>
              <button onClick={()=>setShowAdd(false)} style={{ ...S.btn, background:'#f1f5f9', color:'#64748b' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
