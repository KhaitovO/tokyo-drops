import { useCart } from '../lib/CartContext'

const fmt = n => n?.toLocaleString('uz-UZ') + ' so\'m'

export default function CartDrawer({ open, onClose }) {
  const { cart, removeFromCart, changeQty } = useCart()
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)',
        zIndex: 400, opacity: open ? 1 : 0,
        pointerEvents: open ? 'all' : 'none', transition: 'opacity .25s'
      }} />

      {/* Drawer */}
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0,
        width: 'min(380px, 100vw)', background: '#fff',
        zIndex: 500, transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .3s ease', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 400 }}>Savat</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, color: '#aaa', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {cart.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#ccc', marginTop: 50, fontSize: 13 }}>Savat bo'sh</p>
          ) : cart.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid #f5f5f5' }}>
              <img src={item.image_url} alt={item.name} style={{ width: 60, height: 74, objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{item.name}</p>
                <p style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{fmt(item.price)}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button onClick={() => changeQty(item.id, -1)} style={{ width: 24, height: 24, border: '1px solid #e0e0e0', background: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <span style={{ fontSize: 13, fontWeight: 500, minWidth: 16, textAlign: 'center' }}>{item.qty}</span>
                  <button onClick={() => changeQty(item.id, 1)} style={{ width: 24, height: 24, border: '1px solid #e0e0e0', background: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  <button onClick={() => removeFromCart(item.id)} style={{ marginLeft: 'auto', fontSize: 11, color: '#ccc', background: 'none', border: 'none', cursor: 'pointer' }}>O'chir</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 13, color: '#777' }}>Jami</span>
              <span style={{ fontSize: 18, fontWeight: 600 }}>{fmt(total)}</span>
            </div>
            <button className="btn-dark" style={{ width: '100%', padding: 13, fontSize: 12, letterSpacing: '.08em' }}>
              BUYURTMA BERISH
            </button>
            <p style={{ fontSize: 11, color: '#bbb', textAlign: 'center', marginTop: 10 }}>Payme · Click · Naqd pul</p>
          </div>
        )}
      </div>
    </>
  )
}
