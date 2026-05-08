'use client'

export default function OccupancyHeatmap({ properties, bookings }: { properties: { id:string; name:string }[]; bookings: { propertyId:string; customerName:string; checkInDate:string; checkOutDate:string }[] }) {
  const today = new Date(); today.setHours(0,0,0,0)
  const days = Array.from({ length: 30 }, (_, i) => { const d = new Date(today); d.setDate(d.getDate() + i); return d })

  const getBooking = (propId: string, date: Date) => {
    return bookings.find(b => {
      const ci = new Date(b.checkInDate); ci.setHours(0,0,0,0)
      const co = new Date(b.checkOutDate); co.setHours(0,0,0,0)
      return b.propertyId === propId && date >= ci && date < co
    })
  }

  const totalCells = properties.length * 30
  let bookedCells = 0
  properties.forEach(p => days.forEach(d => { if (getBooking(p.id, d)) bookedCells++ }))
  const occupancy = totalCells > 0 ? Math.round((bookedCells / totalCells) * 100) : 0

  return (
    <div>
      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
        <div style={{ background:'#fff', borderRadius:'14px', padding:'1.25rem', border:'1px solid var(--border)' }}>
          <div style={{ fontSize:'0.5rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#94a3b8', marginBottom:'0.375rem' }}>Overall Occupancy</div>
          <div style={{ fontSize:'1.5rem', fontWeight:800, color: occupancy > 70 ? '#16a34a' : occupancy > 40 ? '#d97706' : '#dc2626' }}>{occupancy}%</div>
        </div>
        <div style={{ background:'#fff', borderRadius:'14px', padding:'1.25rem', border:'1px solid var(--border)' }}>
          <div style={{ fontSize:'0.5rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#94a3b8', marginBottom:'0.375rem' }}>Booked Nights</div>
          <div style={{ fontSize:'1.5rem', fontWeight:800 }}>{bookedCells}</div>
        </div>
        <div style={{ background:'#fff', borderRadius:'14px', padding:'1.25rem', border:'1px solid var(--border)' }}>
          <div style={{ fontSize:'0.5rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#94a3b8', marginBottom:'0.375rem' }}>Empty Nights</div>
          <div style={{ fontSize:'1.5rem', fontWeight:800, color:'#dc2626' }}>{totalCells - bookedCells}</div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div style={{ background:'#fff', borderRadius:'14px', border:'1px solid var(--border)', overflow:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.625rem' }}>
          <thead>
            <tr>
              <th style={{ position:'sticky', left:0, background:'#fff', zIndex:2, padding:'0.5rem 0.75rem', textAlign:'left', fontSize:'0.5625rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#64748b', borderBottom:'1px solid #e5e7eb', minWidth:'120px' }}>Property</th>
              {days.map((d, i) => {
                const isToday = d.getTime() === today.getTime()
                const isWeekend = d.getDay() === 0 || d.getDay() === 6
                return <th key={i} style={{ padding:'0.375rem 0.125rem', textAlign:'center', borderBottom:'1px solid #e5e7eb', fontWeight: isToday ? 800 : 600, color: isToday ? '#c9a84c' : isWeekend ? '#2563eb' : '#94a3b8', background: isToday ? '#fffbeb' : 'transparent', minWidth:'28px' }}>
                  <div>{d.toLocaleDateString('en-IN',{day:'numeric'})}</div>
                  <div style={{ fontSize:'0.4375rem' }}>{d.toLocaleDateString('en-IN',{weekday:'narrow'})}</div>
                </th>
              })}
            </tr>
          </thead>
          <tbody>
            {properties.map(p => {
              let propBooked = 0
              days.forEach(d => { if (getBooking(p.id, d)) propBooked++ })
              return (
                <tr key={p.id}>
                  <td style={{ position:'sticky', left:0, background:'#fff', zIndex:1, padding:'0.5rem 0.75rem', fontWeight:600, fontSize:'0.75rem', borderBottom:'1px solid #f1f5f9', whiteSpace:'nowrap' }}>
                    {p.name}
                    <span style={{ marginLeft:'0.375rem', fontSize:'0.5625rem', color:'#94a3b8' }}>{Math.round((propBooked/30)*100)}%</span>
                  </td>
                  {days.map((d, i) => {
                    const b = getBooking(p.id, d)
                    const isToday = d.getTime() === today.getTime()
                    return <td key={i} title={b ? `${b.customerName}` : 'Empty'} style={{ padding:'0.125rem', borderBottom:'1px solid #f8fafc', textAlign:'center' }}>
                      <div style={{ width:'24px', height:'24px', borderRadius:'4px', margin:'0 auto', background: b ? '#16a34a' : isToday ? '#fef3c7' : '#f1f5f9', border: isToday ? '2px solid #c9a84c' : 'none', display:'flex', alignItems:'center', justifyContent:'center', cursor: b ? 'pointer' : 'default', transition:'transform 0.15s' }} onMouseEnter={e=>{if(b)(e.currentTarget.style.transform='scale(1.2)')}} onMouseLeave={e=>(e.currentTarget.style.transform='')}>
                        {b && <span style={{ fontSize:'0.4375rem', color:'#fff', fontWeight:700 }}>{b.customerName.charAt(0)}</span>}
                      </div>
                    </td>
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ display:'flex', gap:'1.25rem', marginTop:'0.75rem', justifyContent:'center' }}>
        {[{c:'#16a34a',l:'Booked'},{c:'#f1f5f9',l:'Empty'},{c:'#fef3c7',l:'Today'}].map(x => (
          <div key={x.l} style={{ display:'flex', alignItems:'center', gap:'0.375rem', fontSize:'0.6875rem', color:'#6b7280' }}>
            <div style={{ width:12, height:12, borderRadius:'3px', background:x.c, border: x.l==='Today' ? '2px solid #c9a84c' : 'none' }} />
            {x.l}
          </div>
        ))}
      </div>
    </div>
  )
}
