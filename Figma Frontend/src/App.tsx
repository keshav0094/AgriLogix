import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen = 'home' | 'farmer' | 'buyer' | 'admin'

// ─── Price chart data ─────────────────────────────────────────────────────────
const priceData = [
  { day: 'Mon', price: 2140 },
  { day: 'Tue', price: 2280 },
  { day: 'Wed', price: 2190 },
  { day: 'Thu', price: 2350 },
  { day: 'Fri', price: 2420 },
  { day: 'Sat', price: 2390 },
  { day: 'Sun', price: 2510 },
]

// ─── SVG Line Chart ───────────────────────────────────────────────────────────
function PriceChart() {
  const W = 540, H = 180
  const pad = { t: 20, r: 20, b: 36, l: 56 }
  const innerW = W - pad.l - pad.r
  const innerH = H - pad.t - pad.b

  const min = 2000, max = 2600
  const pts = priceData.map((d, i) => ({
    x: pad.l + (i / (priceData.length - 1)) * innerW,
    y: pad.t + (1 - (d.price - min) / (max - min)) * innerH,
    ...d,
  }))

  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ')
  const area = `M${pts[0].x},${H - pad.b} ` +
    pts.map(p => `L${p.x},${p.y}`).join(' ') +
    ` L${pts[pts.length - 1].x},${H - pad.b} Z`

  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: 'var(--font-body)' }}>
      {/* Y-axis gridlines */}
      {[2000, 2200, 2400, 2600].map(v => {
        const y = pad.t + (1 - (v - min) / (max - min)) * innerH
        return (
          <g key={v}>
            <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="#E5E7EB" strokeWidth="1" />
            <text x={pad.l - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#6B7280">₹{v}</text>
          </g>
        )
      })}
      {/* Area fill */}
      <path d={area} fill="#1E6B3C" fillOpacity="0.08" />
      {/* Line */}
      <polyline points={polyline} fill="none" stroke="#1E6B3C" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {/* Points */}
      {pts.map((p, i) => (
        <g key={i} style={{ cursor: 'pointer' }}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}>
          <circle cx={p.x} cy={p.y} r={hovered === i ? 7 : 4}
            fill={hovered === i ? '#1E6B3C' : '#fff'}
            stroke="#1E6B3C" strokeWidth="2.5" />
          {hovered === i && (
            <>
              <rect x={p.x - 32} y={p.y - 32} width="64" height="22" rx="4" fill="#1E6B3C" />
              <text x={p.x} y={p.y - 16} textAnchor="middle" fontSize="11" fill="white" fontWeight="600">₹{p.price}/q</text>
            </>
          )}
          {/* Day label */}
          <text x={p.x} y={H - 8} textAnchor="middle" fontSize="11" fill="#6B7280">{p.day}</text>
        </g>
      ))}
      {/* Predicted label */}
      <rect x={pts[6].x - 52} y={pts[6].y - 48} width="104" height="20" rx="3" fill="#D97706" />
      <text x={pts[6].x} y={pts[6].y - 34} textAnchor="middle" fontSize="11" fill="white" fontWeight="700">Predicted: ₹2,510</text>
    </svg>
  )
}

// ─── Top Navigation ───────────────────────────────────────────────────────────
function TopNav({ active, onNav }: { active: Screen; onNav: (s: Screen) => void }) {
  const [lang, setLang] = useState('EN')

  return (
    <header style={{ borderBottom: '3px solid #1E6B3C', background: '#fff', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 24, height: 68 }}>
        {/* Logo */}
        <button onClick={() => onNav('home')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, background: '#1E6B3C', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 3C8 3 4 7 4 12c0 2 .8 4 2 5.5L12 21l6-3.5C19.2 16 20 14 20 12c0-5-4-9-8-9z" fill="white" opacity=".9"/>
              <path d="M12 8v8M8 10l4-2 4 2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: '#1E6B3C', lineHeight: 1.1 }}>AgriLogix</div>
            <div style={{ fontSize: 10, color: '#6B7280', letterSpacing: '.05em', fontWeight: 500 }}>KISAN DIGITAL MANDI</div>
          </div>
        </button>

        {/* Nav links */}
        <nav style={{ display: 'flex', gap: 4, marginLeft: 16 }}>
          {([
            { id: 'farmer', label: 'Farmer Portal' },
            { id: 'buyer', label: 'Buyer Market' },
            { id: 'admin', label: 'Admin / Dispatch' },
          ] as { id: Screen; label: string }[]).map(item => (
            <button key={item.id} onClick={() => onNav(item.id)}
              style={{
                padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14,
                background: active === item.id ? '#E8F5EE' : 'transparent',
                color: active === item.id ? '#1E6B3C' : '#374151',
                transition: 'all .15s',
              }}>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Helpline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: '#FEF3C7', borderRadius: 6, border: '1px solid #FCD34D' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24A11.36 11.36 0 0020 15.5c.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57-.11.36-.02.76.24 1.02l-2.69 2.2z" fill="#D97706"/>
            </svg>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#92400E' }}>Helpline: 1800-180-1551</span>
          </div>

          {/* Language toggle */}
          <div style={{ display: 'flex', border: '1.5px solid #D1D5DB', borderRadius: 6, overflow: 'hidden' }}>
            {['EN', 'HI'].map(l => (
              <button key={l} onClick={() => setLang(l)}
                style={{
                  padding: '6px 14px', border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: 13,
                  background: lang === l ? '#1E6B3C' : '#fff',
                  color: lang === l ? '#fff' : '#374151',
                  transition: 'all .15s',
                }}>
                {l === 'HI' ? 'हि' : l}
              </button>
            ))}
          </div>

          {/* Login button */}
          <button onClick={() => onNav('home')}
            style={{
              padding: '10px 22px', background: '#1E6B3C', color: '#fff',
              border: 'none', borderRadius: 8, cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 2px 8px rgba(30,107,60,0.25)',
            }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 12a5 5 0 100-10 5 5 0 000 10zM4 20c0-3.31 3.58-6 8-6s8 2.69 8 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Login / KYC
          </button>
        </div>
      </div>
    </header>
  )
}

// ─── SCREEN 1: Home ───────────────────────────────────────────────────────────
function HomeScreen({ onNav }: { onNav: (s: Screen) => void }) {
  return (
    <main>
      {/* Gov banner */}
      <div style={{ background: '#1E6B3C', color: '#fff', textAlign: 'center', padding: '8px', fontSize: 13, fontWeight: 500, letterSpacing: '.04em' }}>
        🇮🇳 &nbsp; भारत सरकार | Government of India &nbsp;—&nbsp; Ministry of Agriculture & Farmers' Welfare
      </div>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(180deg, #F0FAF4 0%, #FFFFFF 100%)', padding: '80px 24px 72px', textAlign: 'center' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: 9999, padding: '4px 16px', marginBottom: 28 }}>
            <span style={{ width: 8, height: 8, background: '#16A34A', borderRadius: '50%', display: 'inline-block' }}></span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#15803D' }}>Live Market · 14,280 Farmers Online Today</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 52, color: '#111827', lineHeight: 1.15, marginBottom: 20 }}>
            India's Most Trusted<br />
            <span style={{ color: '#1E6B3C' }}>Digital Agri-Market</span>
          </h1>
          <p style={{ fontSize: 20, color: '#374151', lineHeight: 1.7, marginBottom: 52, maxWidth: 580, margin: '0 auto 52px' }}>
            AI-powered price discovery, direct buyer connections, and real-time logistics — in one platform built for every Indian farmer.
          </p>

          {/* Big action buttons */}
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => onNav('farmer')}
              style={{
                padding: '28px 52px', background: '#1E6B3C', color: '#fff',
                border: 'none', borderRadius: 16, cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                boxShadow: '0 8px 32px rgba(30,107,60,0.30)',
                transition: 'transform .15s, box-shadow .15s',
                minWidth: 260,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 14px 40px rgba(30,107,60,0.38)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(30,107,60,0.30)' }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="rgba(255,255,255,0.15)" />
                <path d="M24 10C17 10 12 16 12 24c0 3 1 5.5 2.5 7.5L24 38l9.5-6.5C35 29.5 36 27 36 24c0-8-5-14-12-14z" fill="white" opacity=".9"/>
                <path d="M24 18v10M20 20l4-2 4 2" stroke="#1E6B3C" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              🌾 I am a Farmer
              <span style={{ fontSize: 13, fontWeight: 500, opacity: .8 }}>मैं एक किसान हूँ</span>
            </button>

            <button onClick={() => onNav('buyer')}
              style={{
                padding: '28px 52px', background: '#fff', color: '#1E6B3C',
                border: '3px solid #1E6B3C', borderRadius: 16, cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                boxShadow: '0 8px 32px rgba(30,107,60,0.12)',
                transition: 'transform .15s, box-shadow .15s',
                minWidth: 260,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.background = '#E8F5EE' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.background = '#fff' }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="#E8F5EE" />
                <path d="M14 18h20l-2 12H16L14 18z" fill="#1E6B3C" opacity=".85"/>
                <path d="M14 18l-2-4H10M20 30v4M28 30v4" stroke="#1E6B3C" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              🛒 I am a Buyer
              <span style={{ fontSize: 13, fontWeight: 500, opacity: .7 }}>मैं एक खरीदार हूँ</span>
            </button>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ background: '#1E6B3C', padding: '28px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 20 }}>
          {[
            { num: '3.8 Lakh+', label: 'Registered Farmers', sub: 'पंजीकृत किसान' },
            { num: '₹ 2,840 Cr', label: 'Trade Volume FY24', sub: 'कुल व्यापार' },
            { num: '28 States', label: 'Pan-India Coverage', sub: 'राज्य' },
            { num: '98.2%', label: 'Payment Success Rate', sub: 'भुगतान सफलता' },
          ].map(s => (
            <div key={s.num} style={{ textAlign: 'center', color: '#fff' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32 }}>{s.num}</div>
              <div style={{ fontWeight: 600, fontSize: 14, opacity: .9 }}>{s.label}</div>
              <div style={{ fontSize: 12, opacity: .65 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '64px 24px', background: '#FAFAFA' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, marginBottom: 48, color: '#111827' }}>
            Why Farmers & Buyers Choose AgriLogix
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[
              { icon: '🤖', title: 'AI Price Predictor', desc: '7-day forward price forecast using satellite data, mandi trends, and weather patterns.' },
              { icon: '🚚', title: 'Smart Logistics', desc: 'AI-optimized truck routing ensures freshest produce reaches buyers at lowest cost.' },
              { icon: '✅', title: 'Driver & Quality Verified', desc: 'Every listing is graded A/B/C. Every truck driver is Aadhaar-verified.' },
              { icon: '💸', title: 'Direct Payment', desc: 'Funds credited to farmer bank account within 48 hours of delivery confirmation.' },
            ].map(f => (
              <div key={f.title} style={{ background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 12, padding: 28 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 8, color: '#111827' }}>{f.title}</h3>
                <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

// ─── SCREEN 2: Farmer AI Dashboard ───────────────────────────────────────────
function FarmerDashboard() {
  const [crop, setCrop] = useState('Wheat (Gehun)')
  const [region, setRegion] = useState('Punjab – Ludhiana Mandi')

  const listings = [
    { id: 'AG-2024-0891', crop: 'Wheat', qty: '12 Quintal', grade: 'A', price: '₹2,510/q', status: 'Active', bids: 4, listed: '17 Sep 2026' },
    { id: 'AG-2024-0756', crop: 'Rice (Basmati)', qty: '8 Quintal', grade: 'A+', price: '₹4,200/q', status: 'Bid Received', bids: 7, listed: '14 Sep 2026' },
    { id: 'AG-2024-0712', crop: 'Soybean', qty: '20 Quintal', grade: 'B', price: '₹3,100/q', status: 'In Transit', bids: 1, listed: '10 Sep 2026' },
  ]

  const statusColor: Record<string, string> = {
    'Active': '#1E6B3C',
    'Bid Received': '#D97706',
    'In Transit': '#2563EB',
  }

  return (
    <main style={{ background: '#F3F4F6', minHeight: 'calc(100vh - 68px)' }}>
      {/* Page header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '20px 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 500, marginBottom: 4 }}>Welcome back,</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: '#111827', margin: 0 }}>
              Ramesh Kumar Yadav &nbsp;
              <span style={{ fontSize: 13, background: '#DCFCE7', color: '#166534', padding: '3px 10px', borderRadius: 9999, fontWeight: 600 }}>KYC Verified ✓</span>
            </h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#6B7280' }}>Village: Anandpur, Dist. Ludhiana, Punjab</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>Farmer ID: KSN-PB-2024-019281</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* AI Price Predictor panel */}
        <section style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ background: '#1E6B3C', padding: '16px 28px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M3 18l5-8 4 5 3-4 6 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="19" cy="5" r="3" fill="#FCD34D"/>
            </svg>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: '#fff', margin: 0 }}>
              AI Price Predictor
            </h2>
            <span style={{ marginLeft: 'auto', fontSize: 13, color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: 9999 }}>
              Model accuracy: 94.2%
            </span>
          </div>

          <div style={{ padding: 28 }}>
            {/* Controls row */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 28, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Select Crop / फसल चुनें</label>
                <select value={crop} onChange={e => setCrop(e.target.value)}
                  style={{ width: '100%', padding: '13px 16px', fontSize: 16, fontWeight: 600, border: '2px solid #D1D5DB', borderRadius: 8, background: '#fff', color: '#111827', cursor: 'pointer' }}>
                  <option>Wheat (Gehun)</option>
                  <option>Rice – Basmati</option>
                  <option>Soybean</option>
                  <option>Cotton (Kapas)</option>
                  <option>Mustard (Sarson)</option>
                  <option>Maize (Makka)</option>
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Select Region / क्षेत्र चुनें</label>
                <select value={region} onChange={e => setRegion(e.target.value)}
                  style={{ width: '100%', padding: '13px 16px', fontSize: 16, fontWeight: 600, border: '2px solid #D1D5DB', borderRadius: 8, background: '#fff', color: '#111827', cursor: 'pointer' }}>
                  <option>Punjab – Ludhiana Mandi</option>
                  <option>UP – Hapur Mandi</option>
                  <option>MP – Indore Mandi</option>
                  <option>Maharashtra – Pune Mandi</option>
                  <option>Rajasthan – Jaipur Mandi</option>
                </select>
              </div>
              <button style={{
                padding: '14px 32px', background: '#1E6B3C', color: '#fff',
                border: 'none', borderRadius: 10, cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
                boxShadow: '0 4px 16px rgba(30,107,60,0.28)',
                whiteSpace: 'nowrap',
              }}>
                🔄 Refresh Forecast
              </button>
            </div>

            {/* Chart + summary side-by-side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 28 }}>
              <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 20px 8px' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
                  7-Day Price Trend — {crop} · {region}
                </div>
                <PriceChart />
              </div>

              {/* Right: price summary + CTA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: '#E8F5EE', border: '1.5px solid #86EFAC', borderRadius: 10, padding: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#166534', marginBottom: 4 }}>AI Recommended Price</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, color: '#15803D' }}>₹2,510<span style={{ fontSize: 16, fontWeight: 600 }}>/q</span></div>
                  <div style={{ fontSize: 13, color: '#166534', marginTop: 4 }}>+₹120 vs. today's MSP</div>
                </div>
                <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#92400E' }}>Best Sell Window</div>
                  <div style={{ fontWeight: 700, color: '#78350F', fontSize: 15, marginTop: 2 }}>Sun 22 Sep, 06:00–10:00 AM</div>
                </div>
                <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1E40AF' }}>MSP (Govt. Floor)</div>
                  <div style={{ fontWeight: 700, color: '#1E3A8A', fontSize: 15, marginTop: 2 }}>₹2,275 / Quintal</div>
                </div>
                <button style={{
                  padding: '18px', background: '#1E6B3C', color: '#fff',
                  border: 'none', borderRadius: 12, cursor: 'pointer',
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18,
                  boxShadow: '0 6px 20px rgba(30,107,60,0.30)',
                  lineHeight: 1.3,
                }}>
                  📋 List Crop at<br />Predicted Price
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Active Listings table */}
        <section style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '16px 28px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: '#111827', margin: 0 }}>My Active Listings</h2>
            <button style={{ padding: '8px 20px', background: '#E8F5EE', color: '#1E6B3C', border: '1.5px solid #86EFAC', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              + New Listing
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  {['Listing ID', 'Crop', 'Quantity', 'Grade', 'Price Listed', 'Bids', 'Status', 'Listed On', 'Action'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#374151', fontSize: 13, borderBottom: '2px solid #E5E7EB', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listings.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#1E6B3C', fontFamily: 'monospace', fontSize: 13 }}>{r.id}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>{r.crop}</td>
                    <td style={{ padding: '14px 16px' }}>{r.qty}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: '#DCFCE7', color: '#166534', fontWeight: 700, fontSize: 13, padding: '2px 10px', borderRadius: 9999 }}>Grade {r.grade}</span>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>{r.price}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 700, color: r.bids >= 4 ? '#15803D' : '#374151' }}>{r.bids}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: statusColor[r.status] + '20', color: statusColor[r.status], fontWeight: 700, fontSize: 13, padding: '4px 12px', borderRadius: 9999 }}>{r.status}</span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#6B7280', fontSize: 14 }}>{r.listed}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <button style={{ padding: '6px 16px', background: '#1E6B3C', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}

// ─── Star Rating display ──────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i <= rating ? '#F59E0B' : '#E5E7EB'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  )
}

// ─── SCREEN 3: Buyer Marketplace ──────────────────────────────────────────────
function BuyerMarketplace() {
  const [search, setSearch] = useState('')
  const [grades, setGrades] = useState<string[]>(['A'])
  const [minStars, setMinStars] = useState(0)
  const [crops, setCrops] = useState<string[]>([])

  const allCrops = ['Wheat', 'Rice', 'Soybean', 'Cotton', 'Mustard', 'Maize', 'Tomato', 'Onion']

  const listings = [
    { id: 1, crop: 'Wheat (Gehun)', farmer: 'Ramesh K. Yadav', region: 'Ludhiana, Punjab', weight: '40 Quintal', price: 2510, grade: 'A', rating: 5, img: 'photo-1574323347407-f5e1ad6d020b' },
    { id: 2, crop: 'Basmati Rice', farmer: 'Sukhvir Singh', region: 'Karnal, Haryana', weight: '25 Quintal', price: 4200, grade: 'A+', rating: 5, img: 'photo-1536304929831-ee1ca9d44906' },
    { id: 3, crop: 'Soybean', farmer: 'Meena Devi Patidar', region: 'Ujjain, MP', weight: '60 Quintal', price: 3100, grade: 'B', rating: 4, img: 'photo-1599940824399-b87987ceb72a' },
    { id: 4, crop: 'Cotton (Kapas)', farmer: 'Vijay Patil', region: 'Nagpur, Maharashtra', weight: '35 Quintal', price: 6700, grade: 'A', rating: 4, img: 'photo-1518537079-8b63f76a5fd4' },
    { id: 5, crop: 'Mustard (Sarson)', farmer: 'Hari Om Sharma', region: 'Jaipur, Rajasthan', weight: '18 Quintal', price: 5400, grade: 'A', rating: 5, img: 'photo-1618886614638-80e3c103d31a' },
    { id: 6, crop: 'Maize (Makka)', farmer: 'Anita Kumari Devi', region: 'Patna, Bihar', weight: '50 Quintal', price: 1980, grade: 'B', rating: 3, img: 'photo-1471193945509-9ad0617afabf' },
  ]

  const filtered = listings.filter(l =>
    (search === '' || l.crop.toLowerCase().includes(search.toLowerCase()) || l.region.toLowerCase().includes(search.toLowerCase())) &&
    (grades.length === 0 || grades.some(g => l.grade.startsWith(g))) &&
    l.rating >= minStars &&
    (crops.length === 0 || crops.some(c => l.crop.includes(c)))
  )

  const toggleGrade = (g: string) => setGrades(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  const toggleCrop = (c: string) => setCrops(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])

  return (
    <main style={{ background: '#F3F4F6', minHeight: 'calc(100vh - 68px)', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{ width: 280, minWidth: 280, background: '#fff', borderRight: '1.5px solid #E5E7EB', padding: 24, display: 'flex', flexDirection: 'column', gap: 28, overflowY: 'auto' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, margin: '0 0 18px', color: '#111827' }}>
            🔍 Filters
          </h2>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search crop or region..."
            style={{ width: '100%', padding: '12px 14px', fontSize: 15, border: '2px solid #D1D5DB', borderRadius: 8, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Crop type */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#374151', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.05em' }}>Crop Type</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {allCrops.map(c => (
              <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 15, color: '#374151', fontWeight: 500 }}>
                <input type="checkbox" checked={crops.includes(c)} onChange={() => toggleCrop(c)}
                  style={{ width: 18, height: 18, accentColor: '#1E6B3C', cursor: 'pointer' }} />
                {c}
              </label>
            ))}
          </div>
        </div>

        {/* Quality grade */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#374151', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.05em' }}>Quality Grade</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['A', 'B', 'C'].map(g => (
              <button key={g} onClick={() => toggleGrade(g)}
                style={{
                  padding: '8px 20px', borderRadius: 8, border: '2px solid', cursor: 'pointer',
                  fontWeight: 700, fontSize: 15,
                  borderColor: grades.includes(g) ? '#1E6B3C' : '#D1D5DB',
                  background: grades.includes(g) ? '#E8F5EE' : '#fff',
                  color: grades.includes(g) ? '#1E6B3C' : '#6B7280',
                }}>
                Grade {g}
              </button>
            ))}
          </div>
        </div>

        {/* Star rating */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#374151', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.05em' }}>Min. Seller Rating</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[0, 3, 4, 5].map(s => (
              <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="radio" name="stars" checked={minStars === s} onChange={() => setMinStars(s)}
                  style={{ width: 18, height: 18, accentColor: '#1E6B3C' }} />
                {s === 0 ? <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>Any rating</span> : (
                  <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i <= s ? '#F59E0B' : '#E5E7EB'}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                    <span style={{ fontSize: 13, color: '#6B7280', marginLeft: 4 }}>& above</span>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        <button onClick={() => { setSearch(''); setGrades(['A']); setMinStars(0); setCrops([]) }}
          style={{ padding: '10px', background: '#F3F4F6', color: '#374151', border: '1px solid #D1D5DB', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          Clear Filters
        </button>
      </aside>

      {/* Main grid */}
      <div style={{ flex: 1, padding: 28, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: '#111827', margin: 0 }}>
            Available Crop Listings
          </h1>
          <div style={{ fontSize: 14, color: '#6B7280' }}>{filtered.length} listings found</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {filtered.map(item => (
            <div key={item.id} style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
              {/* Photo */}
              <div style={{ height: 160, background: '#D1FAE5', position: 'relative', overflow: 'hidden' }}>
                <img
                  src={`https://images.unsplash.com/${item.img}?w=400&h=200&fit=crop&auto=format`}
                  alt={item.crop}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span className="badge-verified" style={{ position: 'absolute', top: 10, left: 10 }}>
                  ✓ Driver Verified
                </span>
                <span style={{ position: 'absolute', top: 10, right: 10, background: '#1E6B3C', color: '#fff', fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 9999 }}>
                  Grade {item.grade}
                </span>
              </div>

              {/* Card body */}
              <div style={{ padding: 18, flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: '#111827', margin: 0 }}>{item.crop}</h3>
                <div style={{ fontSize: 13, color: '#6B7280' }}>
                  <span style={{ fontWeight: 600, color: '#374151' }}>{item.farmer}</span> · {item.region}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: '#1E6B3C' }}>₹{item.price.toLocaleString()}<span style={{ fontSize: 13, fontWeight: 600, color: '#6B7280' }}>/quintal</span></div>
                    <div style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{item.weight} available</div>
                  </div>
                  <Stars rating={item.rating} />
                </div>
                <button style={{
                  marginTop: 'auto', padding: '13px', background: '#1E6B3C', color: '#fff',
                  border: 'none', borderRadius: 10, fontFamily: 'var(--font-display)',
                  fontWeight: 700, fontSize: 16, cursor: 'pointer',
                  boxShadow: '0 3px 12px rgba(30,107,60,0.25)',
                }}>
                  🛒 Place Order
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#6B7280' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🌾</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20 }}>No listings match your filters</div>
            <div style={{ fontSize: 15, marginTop: 8 }}>Try adjusting the filters in the sidebar.</div>
          </div>
        )}
      </div>
    </main>
  )
}

// ─── SCREEN 4: Admin Dispatch & Routing ───────────────────────────────────────
function AdminDispatch() {
  const [optimized, setOptimized] = useState(false)
  const [running, setRunning] = useState(false)

  const handleOptimize = () => {
    setRunning(true)
    setTimeout(() => { setRunning(false); setOptimized(true) }, 2000)
  }

  const orders = [
    { id: 'ORD-9021', crop: 'Wheat', from: 'Ludhiana', to: 'Delhi NCR', qty: '40q', urgency: 'High' },
    { id: 'ORD-9022', crop: 'Rice', from: 'Karnal', to: 'Mumbai', qty: '25q', urgency: 'Med' },
    { id: 'ORD-9023', crop: 'Soybean', from: 'Ujjain', to: 'Ahmedabad', qty: '60q', urgency: 'Low' },
    { id: 'ORD-9024', crop: 'Cotton', from: 'Nagpur', to: 'Surat', qty: '35q', urgency: 'High' },
    { id: 'ORD-9025', crop: 'Mustard', from: 'Jaipur', to: 'Kolkata', qty: '18q', urgency: 'Med' },
  ]

  const trucks = [
    { id: 'TRK-MH-4821', driver: 'Ravi Tiwari', capacity: '80q', location: 'Nagpur', status: 'Ready' },
    { id: 'TRK-PB-1142', driver: 'Harpreet Singh', capacity: '60q', location: 'Ludhiana', status: 'Ready' },
    { id: 'TRK-UP-3378', driver: 'Mohit Verma', capacity: '100q', location: 'Lucknow', status: 'Idle' },
    { id: 'TRK-RJ-7291', driver: 'Ramdan Khan', capacity: '80q', location: 'Jaipur', status: 'Ready' },
  ]

  const urgencyColor: Record<string, string> = { High: '#DC2626', Med: '#D97706', Low: '#16A34A' }

  const routes = optimized ? [
    { from: [280, 120], to: [460, 200], label: 'Ludhiana→Delhi', truck: 'TRK-PB-1142' },
    { from: [460, 200], to: [240, 340], label: 'Delhi→Ahmedabad', truck: 'TRK-PB-1142' },
    { from: [360, 280], to: [520, 380], label: 'Nagpur→Surat', truck: 'TRK-MH-4821' },
    { from: [280, 220], to: [600, 300], label: 'Karnal→Mumbai', truck: 'TRK-UP-3378' },
  ] : []

  return (
    <main style={{ background: '#F3F4F6', minHeight: 'calc(100vh - 68px)', display: 'flex' }}>
      {/* Left panel */}
      <aside style={{ width: 300, minWidth: 300, background: '#fff', borderRight: '1.5px solid #E5E7EB', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {/* Unassigned Orders */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, margin: 0, color: '#111827' }}>Unassigned Orders</h2>
            <span style={{ background: '#FEE2E2', color: '#DC2626', fontWeight: 700, fontSize: 13, padding: '2px 10px', borderRadius: 9999 }}>{orders.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {orders.map(o => (
              <div key={o.id} style={{ border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '12px 14px', background: optimized ? '#E8F5EE' : '#fff', borderColor: optimized ? '#86EFAC' : '#E5E7EB' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#1E6B3C' }}>{o.id}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: urgencyColor[o.urgency], background: urgencyColor[o.urgency] + '18', padding: '1px 8px', borderRadius: 9999 }}>{o.urgency}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{o.crop} · {o.qty}</div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{o.from} → {o.to}</div>
                {optimized && <div style={{ fontSize: 11, color: '#15803D', fontWeight: 600, marginTop: 4 }}>✓ Route Assigned</div>}
              </div>
            ))}
          </div>
        </div>

        <div style={{ margin: '20px 0', borderTop: '1px solid #E5E7EB' }}></div>

        {/* Available Trucks */}
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, margin: 0, color: '#111827' }}>Available Trucks</h2>
            <span style={{ background: '#DCFCE7', color: '#166534', fontWeight: 700, fontSize: 13, padding: '2px 10px', borderRadius: 9999 }}>{trucks.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {trucks.map(t => (
              <div key={t.id} style={{ border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#374151' }}>{t.id}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: t.status === 'Ready' ? '#15803D' : '#6B7280', background: t.status === 'Ready' ? '#DCFCE7' : '#F3F4F6', padding: '1px 8px', borderRadius: 9999 }}>● {t.status}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{t.driver}</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>📍 {t.location} · Cap: {t.capacity}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Map area */}
      <div style={{ flex: 1, position: 'relative', minHeight: 500 }}>
        {/* Map background */}
        <div className="map-bg" style={{ position: 'absolute', inset: 0 }}>
          {/* India outline SVG simplified */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .18 }} viewBox="0 0 800 700" fill="none" preserveAspectRatio="xMidYMid meet">
            <path d="M200 80 L300 60 L420 70 L500 90 L560 130 L600 200 L620 280 L580 360 L520 440 L480 520 L440 580 L400 640 L360 580 L300 500 L260 420 L220 340 L180 260 L160 180 Z" stroke="#1E6B3C" strokeWidth="3" fill="#1E6B3C" fillOpacity=".12"/>
          </svg>

          {/* City dots */}
          {[
            { x: 280, y: 120, name: 'Ludhiana' },
            { x: 360, y: 160, name: 'Delhi' },
            { x: 300, y: 220, name: 'Jaipur' },
            { x: 460, y: 200, name: 'Karnal' },
            { x: 400, y: 300, name: 'Bhopal/Ujjain' },
            { x: 350, y: 380, name: 'Nagpur' },
            { x: 240, y: 340, name: 'Ahmedabad' },
            { x: 200, y: 440, name: 'Mumbai' },
            { x: 520, y: 380, name: 'Kolkata' },
          ].map(c => (
            <g key={c.name}>
              <circle cx={`${c.x / 8 * 100}%`} cy={`${c.y / 7 * 100}%`} r="6" fill="#1E6B3C" opacity=".6" />
              <text x={`${c.x / 8 * 100}%`} y={`${(c.y + 16) / 7 * 100}%`} textAnchor="middle" fontSize="11" fill="#1E6B3C" opacity=".8" fontWeight="600">{c.name}</text>
            </g>
          ))}

          {/* Route lines after optimization */}
          {routes.map((r, i) => {
            const pct = (v: number, max: number) => `${(v / max) * 100}%`
            return (
              <g key={i}>
                <line
                  x1={pct(r.from[0], 800)} y1={pct(r.from[1], 700)}
                  x2={pct(r.to[0], 800)} y2={pct(r.to[1], 700)}
                  stroke="#1E6B3C" strokeWidth="3" strokeDasharray="8 4" opacity=".8"
                />
              </g>
            )
          })}
        </div>

        {/* Map header overlay */}
        <div style={{ position: 'absolute', top: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: '12px 18px', boxShadow: '0 2px 12px rgba(0,0,0,0.12)', border: '1px solid #E5E7EB' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 4 }}>Logistics Map — India</div>
            <div style={{ fontSize: 13, color: '#6B7280' }}>{optimized ? `${routes.length} optimized routes active` : '5 unassigned orders pending dispatch'}</div>
          </div>

          {/* Legend */}
          <div style={{ background: '#fff', borderRadius: 10, padding: '12px 18px', boxShadow: '0 2px 12px rgba(0,0,0,0.12)', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[{ color: '#1E6B3C', label: 'Active Route' }, { color: '#D97706', label: 'Pickup Point' }, { color: '#2563EB', label: 'Delivery Point' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: l.color, display: 'inline-block' }}></span>
                <span style={{ color: '#374151', fontWeight: 500 }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats after optimization */}
        {optimized && (
          <div style={{ position: 'absolute', bottom: 100, left: 20, display: 'flex', gap: 12 }}>
            {[
              { label: 'Distance Saved', value: '1,240 km', icon: '🛣️' },
              { label: 'Cost Saving', value: '₹38,500', icon: '💰' },
              { label: 'CO₂ Reduced', value: '0.8 Tonnes', icon: '🌿' },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', borderRadius: 10, padding: '12px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', border: '1.5px solid #86EFAC', textAlign: 'center' }}>
                <div style={{ fontSize: 20 }}>{s.icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: '#15803D' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Floating CTA button */}
        <div style={{ position: 'absolute', bottom: 36, right: 36 }}>
          <button onClick={handleOptimize} disabled={running}
            style={{
              padding: '20px 36px',
              background: optimized ? '#15803D' : '#1E6B3C',
              color: '#fff', border: 'none', borderRadius: 16, cursor: running ? 'wait' : 'pointer',
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20,
              display: 'flex', alignItems: 'center', gap: 12,
              boxShadow: '0 8px 32px rgba(30,107,60,0.40)',
              transition: 'all .2s',
              opacity: running ? .85 : 1,
            }}>
            {running ? (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                  <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Optimizing Routes…
              </>
            ) : optimized ? (
              <>✅ Routes Optimized!</>
            ) : (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L8 10H2l6 5-2 7 6-4 6 4-2-7 6-5h-6z" fill="white"/>
                </svg>
                Run AI Route Optimization
              </>
            )}
          </button>
        </div>

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </main>
  )
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>('home')

  const renderScreen = () => {
    switch (screen) {
      case 'home': return <HomeScreen onNav={setScreen} />
      case 'farmer': return <FarmerDashboard />
      case 'buyer': return <BuyerMarketplace />
      case 'admin': return <AdminDispatch />
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopNav active={screen} onNav={setScreen} />
      <div style={{ flex: 1 }}>
        {renderScreen()}
      </div>
      {/* Footer */}
      <footer style={{ background: '#1A3A22', color: 'rgba(255,255,255,0.7)', padding: '20px 32px', fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>© 2026 AgriLogix — A Government of India Initiative &nbsp;|&nbsp; Ministry of Agriculture & Farmers' Welfare</span>
        <span>NIC Hosted &nbsp;|&nbsp; CIN: U01119DL2024GOI123456 &nbsp;|&nbsp; Version 3.2.1</span>
      </footer>
    </div>
  )
}
