import { useState } from 'react'
import { useCart } from '../lib/CartContext'

const fmt = n => n?.toLocaleString('uz-UZ') + ' so\'m'

export default function ProductModal({ product: p, onClose }) {
  const { addToCart } = useCart()
  const [selectedSize, setSelectedSize] = useState(null)
  const sizes = p.sizes || []

  const handleAdd = () => {
    addToCart(p)
    onClose()
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
      zIndex: 600, display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 16
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', width: '100%', maxWidth: 720,
        maxHeight: '90vh', overflow: 'hidden',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        borderRadius: 2
      }}>
        <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', maxHeight: '80vh', objectFit: 'cover' }} />
        <div style={{ padding: 'clamp(20px,4vw,36px)', overflowY: 'auto' }}>
          <p style={{ fontSize: 10, color: '#bbb', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 }}>{p.category}</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(18px,3vw,26px)', fontWeight: 400, lineHeight: 1.25, marginBottom: 16 }}>{p.name}</h2>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 20, fontWeight: 600 }}>{fmt(p.price)}</span>
            {p.old_price && <span style={{ fontSize: 15, color: '#bbb', textDecoration: 'line-through' }}>{fmt(p.old_price)}</span>}
          </div>

          {sizes.length > 0 && (
            <>
              <p style={{ fontSize: 10, color: '#aaa', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 8 }}>O'lchamlar</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                {sizes.map(s => (
                  <button key={s} onClick={() => setSelectedSize(s)} style={{
                    border: '1px solid', padding: '7px 13px', fontSize: 12, cursor: 'pointer',
                    borderColor: selectedSize === s ? '#111' : '#e0e0e0',
                    background: selectedSize === s ? '#111' : '#fff',
                    color: selectedSize === s ? '#fff' : '#111',
                    transition: 'all .15s'
                  }}>{s}</button>
                ))}
              </div>
            </>
          )}

          {p.description && (
            <p style={{ fontSize: 13, color: '#888', lineHeight: 1.7, marginBottom: 20 }}>{p.description}</p>
          )}

          <button className="btn-dark" style={{ width: '100%', padding: 13, fontSize: 12, letterSpacing: '.08em' }} onClick={handleAdd}>
            SAVATGA QO'SHISH
          </button>
          <p style={{ fontSize: 11, color: '#bbb', textAlign: 'center', marginTop: 10 }}>Zaxirada: {p.stock} ta</p>
        </div>

        <style>{`@media(max-width:600px){ .product-modal-grid { grid-template-columns: 1fr !important; } }`}</style>
      </div>
    </div>
  )
}
