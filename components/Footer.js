import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ background: '#111', color: '#fff', padding: '40px 16px 24px', marginTop: 60 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 28, marginBottom: 32 }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 400, marginBottom: 10 }}>
              TOKYO <em>Drops</em>
            </div>
            <p style={{ fontSize: 12, color: '#888', lineHeight: 1.7 }}>
              Yaponiyaning eng yaxshi brendlari — to'g'ridan-to'g'ri sizga.
            </p>
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>Do'kon</p>
            {['Kosmetika', 'Kiyim', 'Poyabzal', 'Atirlar', 'Aksessuarlar'].map(c => (
              <Link key={c} href={`/?cat=${c}`} style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 8, transition: 'color .2s' }}
                onMouseOver={e => e.target.style.color = '#fff'}
                onMouseOut={e => e.target.style.color = '#888'}>{c}</Link>
            ))}
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>Ma'lumot</p>
            {["Yetkazib berish", "Qaytarish", "Biz haqimizda", "Aloqa"].map(l => (
              <a key={l} style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 8, cursor: 'pointer' }}>{l}</a>
            ))}
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>Ijtimoiy tarmoqlar</p>
            <a href="https://t.me/TOKYO_BrandsUZ" target="_blank" rel="noreferrer"
              style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 8 }}>Telegram</a>
            <a style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 8, cursor: 'pointer' }}>Instagram</a>
            <a style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 8, cursor: 'pointer' }}>TikTok</a>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #222', paddingTop: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#555' }}>© 2025 TOKYO Drops. Barcha huquqlar himoyalangan.</span>
          <span style={{ fontSize: 11, color: '#555' }}>Toshkent, O'zbekiston</span>
        </div>
      </div>
    </footer>
  )
}
