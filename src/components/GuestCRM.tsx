'use client'
import { useState, useTransition } from 'react'
import { upsertGuest, deleteGuest, updateGuestTags, updateGuestNotes } from '@/actions/guestActions'

const TIERS: Record<string,{color:string,bg:string}> = {
  NEW:{color:'#6b7280',bg:'#f3f4f6'}, BRONZE:{color:'#92400e',bg:'#fef3c7'},
  SILVER:{color:'#475569',bg:'#e2e8f0'}, GOLD:{color:'#92400e',bg:'#fde68a'},
  PLATINUM:{color:'#1e3a5f',bg:'#bfdbfe'},
}
const TAG_OPTIONS = ['VIP','Repeat','Family','Corporate','Long Stay','Influencer','Referral']
const TEMPLATES = [
  { name:'Discount Offer', msg:'Hi {name}! We miss you at Cozy B&B 🏡 Enjoy {discount}% off your next stay. Book directly with us!' },
  { name:'Birthday', msg:'Happy Birthday {name}! 🎂 Celebrate with a special stay — enjoy 15% off at Cozy B&B!' },
  { name:'Repeat Guest', msg:'Welcome back {name}! As a valued {tier} guest, enjoy an exclusive {discount}% discount on your next booking.' },
  { name:'Festive', msg:'Hi {name}! 🎉 Festive season special — get {discount}% off stays this month at Cozy B&B!' },
  { name:'Custom', msg:'' },
]

export default function GuestCRM({ guests: initial, stats }: { guests: any[], stats: any }) {
  const [guests, setGuests] = useState(initial)
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('ALL')
  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showMsg, setShowMsg] = useState(false)
  const [msgTemplate, setMsgTemplate] = useState(0)
  const [customMsg, setCustomMsg] = useState('')
  const [discount, setDiscount] = useState('10')
  const [detail, setDetail] = useState<any>(null)
  const [editNotes, setEditNotes] = useState('')
  const [editTags, setEditTags] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()

  const filtered = guests.filter(g => {
    const matchSearch = !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.phone.includes(search) || (g.email||'').toLowerCase().includes(search.toLowerCase())
    const matchTier = tierFilter === 'ALL' || g.loyaltyTier === tierFilter
    return matchSearch && matchTier
  })

  const toggleSelect = (id: string) => {
    const s = new Set(selected)
    s.has(id) ? s.delete(id) : s.add(id)
    setSelected(s)
  }
  const selectAll = () => setSelected(filtered.length === selected.size ? new Set() : new Set(filtered.map(g=>g.id)))

  const openWhatsApp = (phone: string, name: string, tier: string) => {
    const tpl = TEMPLATES[msgTemplate]
    const msg = (msgTemplate === TEMPLATES.length-1 ? customMsg : tpl.msg)
      .replace(/{name}/g, name).replace(/{discount}/g, discount).replace(/{tier}/g, tier)
    window.open(`https://wa.me/${phone.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const sendBulk = () => {
    const sel = filtered.filter(g => selected.has(g.id))
    if (!sel.length) return
    sel.forEach((g, i) => setTimeout(() => openWhatsApp(g.phone, g.name, g.loyaltyTier), i * 800))
  }

  const handleAdd = async (fd: FormData) => {
    startTransition(async () => {
      await upsertGuest({ name: fd.get('name') as string, phone: fd.get('phone') as string, email: fd.get('email') as string || undefined, city: fd.get('city') as string || undefined, birthday: fd.get('birthday') as string || undefined })
      setShowAdd(false)
      window.location.reload()
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Delete this guest record?')) return
    startTransition(async () => { await deleteGuest(id); window.location.reload() })
  }

  const openDetail = (g: any) => {
    setDetail(g)
    setEditNotes(g.notes || '')
    try { setEditTags(JSON.parse(g.tags || '[]')) } catch { setEditTags([]) }
  }

  const saveTags = () => startTransition(async () => { await updateGuestTags(detail.id, editTags); window.location.reload() })
  const saveNotes = () => startTransition(async () => { await updateGuestNotes(detail.id, editNotes); window.location.reload() })

  const S: Record<string, React.CSSProperties> = {
    card: { background:'#fff', borderRadius:'14px', padding:'1.25rem', border:'1px solid var(--border)' },
    statNum: { fontSize:'1.5rem', fontWeight:800, letterSpacing:'-0.03em' },
    statLabel: { fontSize:'0.5625rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#94a3b8' },
    input: { width:'100%', padding:'0.625rem 0.875rem', borderRadius:'8px', border:'1px solid var(--border)', fontSize:'0.8125rem', fontFamily:'inherit', outline:'none' },
    label: { display:'block', fontSize:'0.5rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'#64748b', marginBottom:'0.25rem' },
    btn: { padding:'0.5rem 1rem', borderRadius:'8px', border:'none', fontSize:'0.75rem', fontWeight:700, cursor:'pointer', transition:'all 0.2s' },
    overlay: { position:'fixed' as const, inset:0, background:'rgba(0,0,0,0.4)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center' },
    modal: { background:'#fff', borderRadius:'16px', padding:'1.75rem', width:'100%', maxWidth:'480px', maxHeight:'85vh', overflowY:'auto' as const },
  }

  return (
    <div>
      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
        {[
          { label:'Total Guests', value:stats.total, icon:'group' },
          { label:'New This Month', value:stats.newThisMonth, icon:'person_add' },
          { label:'Repeat Rate', value:`${stats.repeatRate}%`, icon:'loyalty' },
          { label:'Tiers', value:Object.entries(stats.tiers||{}).map(([k,v])=>`${k}:${v}`).join(' · ')||'—', icon:'stars', small:true },
        ].map((s,i) => (
          <div key={i} style={S.card}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.5rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize:'18px', color:'var(--primary)' }}>{s.icon}</span>
              <span style={S.statLabel}>{s.label}</span>
            </div>
            <div style={{ ...S.statNum, ...(s.small ? { fontSize:'0.75rem', fontWeight:600 } : {}) }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.25rem', flexWrap:'wrap', alignItems:'center' }}>
        <input placeholder="Search by name, phone, or email..." value={search} onChange={e=>setSearch(e.target.value)} style={{ ...S.input, maxWidth:'320px' }} />
        <select value={tierFilter} onChange={e=>setTierFilter(e.target.value)} style={{ ...S.input, maxWidth:'140px' }}>
          <option value="ALL">All Tiers</option>
          {Object.keys(TIERS).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <div style={{ flex:1 }} />
        <button onClick={()=>setShowAdd(true)} style={{ ...S.btn, background:'var(--gradient-primary)', color:'#fff' }}>+ Add Guest</button>
        {selected.size > 0 && (
          <button onClick={()=>setShowMsg(true)} style={{ ...S.btn, background:'#16a34a', color:'#fff' }}>
            WhatsApp ({selected.size})
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ ...S.card, padding:0, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.8125rem' }}>
          <thead>
            <tr style={{ background:'#f8fafc', borderBottom:'1px solid var(--border)' }}>
              <th style={{ padding:'0.75rem', textAlign:'left', width:'32px' }}>
                <input type="checkbox" checked={selected.size===filtered.length && filtered.length>0} onChange={selectAll} />
              </th>
              <th style={{ padding:'0.75rem', textAlign:'left', fontSize:'0.5625rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#64748b' }}>Guest</th>
              <th style={{ padding:'0.75rem', textAlign:'left', fontSize:'0.5625rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#64748b' }}>Phone</th>
              <th style={{ padding:'0.75rem', textAlign:'center', fontSize:'0.5625rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#64748b' }}>Stays</th>
              <th style={{ padding:'0.75rem', textAlign:'right', fontSize:'0.5625rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#64748b' }}>Spent</th>
              <th style={{ padding:'0.75rem', textAlign:'center', fontSize:'0.5625rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#64748b' }}>Tier</th>
              <th style={{ padding:'0.75rem', textAlign:'left', fontSize:'0.5625rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#64748b' }}>Last Stay</th>
              <th style={{ padding:'0.75rem', textAlign:'center', fontSize:'0.5625rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#64748b' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(g => {
              const tier = TIERS[g.loyaltyTier] || TIERS.NEW
              let tags: string[] = []
              try { tags = JSON.parse(g.tags || '[]') } catch {}
              return (
                <tr key={g.id} style={{ borderBottom:'1px solid #f1f5f9', transition:'background 0.15s' }} onMouseEnter={e=>(e.currentTarget.style.background='#f8fafc')} onMouseLeave={e=>(e.currentTarget.style.background='')}>
                  <td style={{ padding:'0.625rem 0.75rem' }}><input type="checkbox" checked={selected.has(g.id)} onChange={()=>toggleSelect(g.id)} /></td>
                  <td style={{ padding:'0.625rem 0.75rem' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.625rem' }}>
                      <div style={{ width:32, height:32, borderRadius:'50%', background:tier.bg, color:tier.color, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.75rem', flexShrink:0 }}>{g.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <div style={{ fontWeight:600 }}>{g.name}</div>
                        {tags.length > 0 && <div style={{ display:'flex', gap:'0.25rem', marginTop:'0.125rem' }}>{tags.slice(0,3).map(t=><span key={t} style={{ fontSize:'0.5rem', padding:'0.1rem 0.375rem', borderRadius:'4px', background:'#eff6ff', color:'#2563eb', fontWeight:600 }}>{t}</span>)}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:'0.625rem 0.75rem', fontFamily:'monospace', fontSize:'0.75rem' }}>{g.phone}</td>
                  <td style={{ padding:'0.625rem 0.75rem', textAlign:'center', fontWeight:700 }}>{g.totalStays}</td>
                  <td style={{ padding:'0.625rem 0.75rem', textAlign:'right', fontWeight:600 }}>₹{g.totalSpent.toLocaleString('en-IN')}</td>
                  <td style={{ padding:'0.625rem 0.75rem', textAlign:'center' }}><span style={{ padding:'0.2rem 0.5rem', borderRadius:'4px', fontSize:'0.5rem', fontWeight:700, letterSpacing:'0.08em', background:tier.bg, color:tier.color }}>{g.loyaltyTier}</span></td>
                  <td style={{ padding:'0.625rem 0.75rem', fontSize:'0.75rem', color:'#6b7280' }}>{g.lastProperty ? `${g.lastProperty}` : '—'}{g.lastCheckIn ? ` · ${new Date(g.lastCheckIn).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}` : ''}</td>
                  <td style={{ padding:'0.625rem 0.75rem', textAlign:'center' }}>
                    <div style={{ display:'flex', gap:'0.25rem', justifyContent:'center' }}>
                      <button onClick={()=>openWhatsApp(g.phone,g.name,g.loyaltyTier)} title="WhatsApp" style={{ background:'none', border:'none', cursor:'pointer', color:'#16a34a', padding:'4px' }}><span className="material-symbols-outlined" style={{ fontSize:'18px' }}>chat</span></button>
                      <button onClick={()=>openDetail(g)} title="Details" style={{ background:'none', border:'none', cursor:'pointer', color:'var(--primary)', padding:'4px' }}><span className="material-symbols-outlined" style={{ fontSize:'18px' }}>info</span></button>
                      <button onClick={()=>handleDelete(g.id)} title="Delete" style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444', padding:'4px' }}><span className="material-symbols-outlined" style={{ fontSize:'18px' }}>delete</span></button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && <tr><td colSpan={8} style={{ padding:'2rem', textAlign:'center', color:'#9ca3af' }}>No guests found. Add guests manually or they'll be auto-created from bookings.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Add Guest Modal */}
      {showAdd && (
        <div style={S.overlay} onClick={()=>setShowAdd(false)}>
          <form action={handleAdd} style={S.modal} onClick={e=>e.stopPropagation()}>
            <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'1rem' }}>Add Guest</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              <div><label style={S.label}>Name *</label><input name="name" required style={S.input} /></div>
              <div><label style={S.label}>Phone *</label><input name="phone" required style={S.input} placeholder="+91..." /></div>
              <div><label style={S.label}>Email</label><input name="email" type="email" style={S.input} /></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                <div><label style={S.label}>City</label><input name="city" style={S.input} /></div>
                <div><label style={S.label}>Birthday</label><input name="birthday" type="date" style={S.input} /></div>
              </div>
            </div>
            <div style={{ display:'flex', gap:'0.5rem', marginTop:'1.25rem' }}>
              <button type="submit" disabled={isPending} style={{ ...S.btn, background:'var(--gradient-primary)', color:'#fff', flex:1 }}>{isPending ? 'Saving...' : 'Save Guest'}</button>
              <button type="button" onClick={()=>setShowAdd(false)} style={{ ...S.btn, background:'#f1f5f9', color:'#64748b' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Guest Detail Modal */}
      {detail && (
        <div style={S.overlay} onClick={()=>setDetail(null)}>
          <div style={{ ...S.modal, maxWidth:'520px' }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
              <h3 style={{ fontSize:'1.125rem', fontWeight:700 }}>{detail.name}</h3>
              <button onClick={()=>setDetail(null)} style={{ background:'none', border:'none', cursor:'pointer' }}><span className="material-symbols-outlined">close</span></button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'1rem' }}>
              <div style={{ ...S.card, padding:'0.75rem' }}><div style={S.statLabel}>Phone</div><div style={{ fontWeight:600, fontSize:'0.875rem' }}>{detail.phone}</div></div>
              <div style={{ ...S.card, padding:'0.75rem' }}><div style={S.statLabel}>Email</div><div style={{ fontWeight:600, fontSize:'0.875rem' }}>{detail.email||'—'}</div></div>
              <div style={{ ...S.card, padding:'0.75rem' }}><div style={S.statLabel}>Total Stays</div><div style={{ fontWeight:800, fontSize:'1.25rem' }}>{detail.totalStays}</div></div>
              <div style={{ ...S.card, padding:'0.75rem' }}><div style={S.statLabel}>Total Spent</div><div style={{ fontWeight:800, fontSize:'1.25rem' }}>₹{detail.totalSpent.toLocaleString('en-IN')}</div></div>
              <div style={{ ...S.card, padding:'0.75rem' }}><div style={S.statLabel}>City</div><div style={{ fontWeight:600 }}>{detail.city||'—'}</div></div>
              <div style={{ ...S.card, padding:'0.75rem' }}><div style={S.statLabel}>Birthday</div><div style={{ fontWeight:600 }}>{detail.birthday ? new Date(detail.birthday).toLocaleDateString('en-IN',{day:'numeric',month:'long'}) : '—'}</div></div>
            </div>
            {/* Tags */}
            <div style={{ marginBottom:'1rem' }}>
              <div style={S.statLabel}>Tags</div>
              <div style={{ display:'flex', gap:'0.375rem', flexWrap:'wrap', marginTop:'0.375rem' }}>
                {TAG_OPTIONS.map(t => <button key={t} onClick={()=>setEditTags(prev=>prev.includes(t)?prev.filter(x=>x!==t):[...prev,t])} style={{ ...S.btn, padding:'0.3rem 0.625rem', fontSize:'0.625rem', background:editTags.includes(t)?'#2563eb':'#f1f5f9', color:editTags.includes(t)?'#fff':'#64748b' }}>{t}</button>)}
              </div>
              <button onClick={saveTags} disabled={isPending} style={{ ...S.btn, marginTop:'0.5rem', background:'var(--gradient-primary)', color:'#fff', fontSize:'0.625rem' }}>Save Tags</button>
            </div>
            {/* Notes */}
            <div>
              <div style={S.statLabel}>Internal Notes</div>
              <textarea value={editNotes} onChange={e=>setEditNotes(e.target.value)} style={{ ...S.input, marginTop:'0.375rem', minHeight:'60px', resize:'vertical' }} placeholder="Add notes about this guest..." />
              <button onClick={saveNotes} disabled={isPending} style={{ ...S.btn, marginTop:'0.5rem', background:'var(--gradient-primary)', color:'#fff', fontSize:'0.625rem' }}>Save Notes</button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Bulk Modal */}
      {showMsg && (
        <div style={S.overlay} onClick={()=>setShowMsg(false)}>
          <div style={S.modal} onClick={e=>e.stopPropagation()}>
            <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'1rem' }}>Send WhatsApp Message</h3>
            <p style={{ fontSize:'0.8125rem', color:'#6b7280', marginBottom:'1rem' }}>Sending to <strong>{selected.size}</strong> selected guest{selected.size>1?'s':''}. Each will open in a new tab.</p>
            <div style={{ marginBottom:'0.75rem' }}>
              <label style={S.label}>Template</label>
              <select value={msgTemplate} onChange={e=>setMsgTemplate(Number(e.target.value))} style={S.input}>
                {TEMPLATES.map((t,i) => <option key={i} value={i}>{t.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:'0.75rem' }}>
              <label style={S.label}>Discount %</label>
              <input value={discount} onChange={e=>setDiscount(e.target.value)} style={{ ...S.input, maxWidth:'100px' }} />
            </div>
            {msgTemplate === TEMPLATES.length-1 && (
              <div style={{ marginBottom:'0.75rem' }}>
                <label style={S.label}>Custom Message (use {'{name}'}, {'{discount}'})</label>
                <textarea value={customMsg} onChange={e=>setCustomMsg(e.target.value)} style={{ ...S.input, minHeight:'80px' }} />
              </div>
            )}
            <div style={{ background:'#f8fafc', borderRadius:'8px', padding:'0.875rem', fontSize:'0.75rem', color:'#374151', marginBottom:'1rem', lineHeight:1.7 }}>
              <strong>Preview:</strong><br/>
              {(msgTemplate===TEMPLATES.length-1?customMsg:TEMPLATES[msgTemplate].msg).replace(/{name}/g,'Guest Name').replace(/{discount}/g,discount).replace(/{tier}/g,'GOLD')}
            </div>
            <div style={{ display:'flex', gap:'0.5rem' }}>
              <button onClick={()=>{sendBulk();setShowMsg(false)}} style={{ ...S.btn, background:'#16a34a', color:'#fff', flex:1 }}>Send to {selected.size} Guest{selected.size>1?'s':''}</button>
              <button onClick={()=>setShowMsg(false)} style={{ ...S.btn, background:'#f1f5f9', color:'#64748b' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
