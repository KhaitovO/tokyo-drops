import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '../lib/CartContext'

const CATS = ['Kosmetika', 'Kiyim', 'Poyabzal', 'Atirlar', 'Aksessuarlar']

export default function Header({ onCartClick }) {
  const { cart } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <>
      {/* MOBILE NAV */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: '#fff', zIndex: 300,
          display: 'flex', flexDirection: 'column', padding: '20px'
        }}>
          <button onClick={() => setMobileOpen(false)} style={{
            alignSelf: 'flex-end', background: 'none', border: 'none',
            fontSize: 28, color: '#111', marginBottom: 24, cursor: 'pointer'
          }}>×</button>
          {['Do\'kon', ...CATS, 'Yangiliklar'].map(item => (
            <Link key={item} href={item === 'Do\'kon' ? '/' : item === 'Yangiliklar' ? '/news' : `/?cat=${item}`}
              onClick={() => setMobileOpen(false)}
              style={{
                fontSize: 22, fontWeight: 400, color: '#111', padding: '14px 0',
                borderBottom: '1px solid #f0f0f0', display: 'block'
              }}>
              {item}
            </Link>
          ))}
          <Link href="/admin" onClick={() => setMobileOpen(false)}
            style={{ fontSize: 14, color: '#999', marginTop: 24, display: 'block' }}>
            Admin Panel →
          </Link>
        </div>
      )}

      <header style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: '#fff', borderBottom: '1px solid #e8e8e8'
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto', padding: '0 16px',
          height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          {/* LOGO */}
          <Link href="/" style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 18, fontWeight: 400, letterSpacing: '.02em', color: '#111'
          }}>
            TOKYO <em>Drops</em>
          </Link>

          {/* DESKTOP NAV */}
          <nav style={{ display: 'flex', gap: 24 }} className="desktop-nav">
            {CATS.map(c => (
              <Link key={c} href={`/?cat=${c}`} style={{
                fontSize: 12, fontWeight: 500, letterSpacing: '.06em',
                color: '#555', textTransform: 'uppercase', transition: 'color .2s'
              }}>{c}</Link>
            ))}
            <Link href="/news" style={{
              fontSize: 12, fontWeight: 500, letterSpacing: '.06em',
              color: '#555', textTransform: 'uppercase'
            }}>Yangiliklar</Link>
          </nav>

          {/* ICONS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={onCartClick} style={{
              background: 'none', border: 'none', padding: 4,
              position: 'relative', cursor: 'pointer', color: '#111'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  background: '#111', color: '#fff', fontSize: 9,
                  width: 16, height: 16, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600
                }}>{cartCount}</span>
              )}
            </button>

            <Link href="/admin" style={{ color: '#111' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </Link>

            {/* HAMBURGER */}
            <button onClick={() => setMobileOpen(true)} style={{
              background: 'none', border: 'none', padding: 4,
              display: 'none', flexDirection: 'column', gap: 4, cursor: 'pointer'
            }} className="hamburger">
              {[0,1,2].map(i => (
                <span key={i} style={{ display: 'block', width: 20, height: 1.5, background: '#111' }}/>
              ))}
            </button>
          </div>
        </div>

        <style>{`
          @media(max-width:768px){
            .desktop-nav { display: none !important; }
            .hamburger { display: flex !important; }
          }
        `}</style>
      </header>
    </>
  )
}
