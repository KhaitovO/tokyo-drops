import { useCart } from '../lib/CartContext'

const fmt = n => n?.toLocaleString('uz-UZ') + ' so\'m'

export default function ProductCard({ product: p, onClick }) {
  const { addToCart } = useCart()

  return (
    <div onClick={onClick} style={{ cursor: 'pointer' }}>
      <div style={{
        position: 'relative', overflow: 'hidden',
        aspectRatio: '3/4', background: '#f5f5f3', marginBottom: 10
      }}>
        <img
          src={p.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80'}
          alt={p.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .45s ease' }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.06)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        />
        <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {p.is_new && (
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.08em', padding: '3px 7px', background: '#111', color: '#fff', textTransform: 'uppercase' }}>
              Yangi
            </span>
          )}
          {p.is_sale && (
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.08em', padding: '3px 7px', background: '#c0392b', color: '#fff', textTransform: 'uppercase' }}>
              Sale
            </span>
          )}
        </div>
      </div>

      <p style={{ fontSize: 10, color: '#aaa', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 3 }}>
        {p.category}
      </p>
      <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 7, lineHeight: 1.4 }}>{p.name}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{fmt(p.price)}</span>
        {p.old_price && (
          <span style={{ fontSize: 12, color: '#bbb', textDecoration: 'line-through' }}>{fmt(p.old_price)}</span>
        )}
      </div>

      <button
        className="btn-dark"
        style={{ width: '100%', padding: 9, fontSize: 11 }}
        onClick={e => { e.stopPropagation(); addToCart(p) }}
      >
        SAVATGA
      </button>
    </div>
  )
}
