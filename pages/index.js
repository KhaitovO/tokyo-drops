import React, { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'

const CATS = ["Barchasi","Kosmetika","Kiyim","Poyabzal","Atirlar","Aksessuarlar"]
const fmt = n => n?.toLocaleString('uz-UZ') + " so'm"

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState('store')
  const [cat, setCat] = useState('Barchasi')
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [detailId, setDetailId] = useState(null)
  const [mobileNav, setMobileNav] = useState(false)
  const [notif, setNotif] = useState(null)
  const [orderForm, setOrderForm] = useState(false)
  const [orderData, setOrderData] = useState({name:'',phone:'',address:''})

  useEffect(() => { fetchProducts() }, [])

  async function fetchProducts() {
    setLoading(true)
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (!error && data) setProducts(data)
    setLoading(false)
  }

  const filtered = cat === 'Barchasi' ? products : products.filter(p => p.cat === cat)
  const newArrivals = products.filter(p => p.is_new).slice(0, 4)
  const onSale = products.filter(p => p.is_sale).slice(0, 4)
  const detail = products.find(p => p.id === detailId)
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)

  function notify(msg) { setNotif(msg); setTimeout(() => setNotif(null), 2200) }

  function addToCart(id, size) {
    const p = products.find(x => x.id === id)
    if (!p) return
    const cartKey = size ? `${id}-${size}` : String(id)
    setCart(prev => {
      const ex = prev.find(x => x.cartKey === cartKey)
      if (ex) return prev.map(x => x.cartKey === cartKey ? { ...x, qty: x.qty + 1 } : x)
      return [...prev, { ...p, qty: 1, cartKey, selectedSize: size || null }]
    })
    notify("Savatga qo'shildi ✓" + (size ? ` (${size})` : ''))
  }

  function removeFromCart(cartKey) { setCart(c => c.filter(x => x.cartKey !== cartKey)) }
  function changeQty(cartKey, d) { setCart(c => c.map(x => x.cartKey === cartKey ? { ...x, qty: x.qty + d } : x).filter(x => x.qty > 0)) }
  function goPage(p, c) { setPage(p); if (c) setCat(c); setMobileNav(false); window.scrollTo(0, 0) }

  async function submitOrder() {
    if (!orderData.phone) { notify('Telefon raqam majburiy!'); return }
    const { error } = await supabase.from('orders').insert([{
      customer_name: orderData.name,
      phone: orderData.phone,
      address: orderData.address,
      total: cartTotal,
      items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
      status: 'new'
    }])
    if (!error) {
      setCart([]); setOrderForm(false); setCartOpen(false)
      notify('Buyurtma qabul qilindi! ✓')
    } else notify('Xato: ' + error.message)
  }

  return (
    <>
      <Head>
        <title>TOKYO Drops — Yaponiyadan O'zbekistonga</title>
        <meta name="description" content="Yaponiyaning original brendlari — Uniqlo, Nike, Shiseido va boshqalar." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {notif && <div className="notif show">{notif}</div>}

      <div className={`mobile-nav${mobileNav ? ' open' : ''}`}>
        <button className="mobile-nav-close" onClick={() => setMobileNav(false)}>×</button>
        {CATS.map(c => <a key={c} onClick={() => goPage('store', c)}>{c}</a>)}
        <a onClick={() => goPage('news')}>Yangiliklar</a>
      </div>

      <header className="header">
        <div className="header-inner">
          <div className="logo serif" onClick={() => goPage('store', 'Barchasi')}>TOKYO <em>Drops</em></div>
          <nav className="nav">
            <a onClick={() => goPage('store', 'Barchasi')} className={page === 'store' ? 'active' : ''}>Do'kon</a>
            {CATS.slice(1).map(c => <a key={c} onClick={() => goPage('store', c)}>{c}</a>)}
            <a onClick={() => goPage('news')} className={page === 'news' ? 'active' : ''}>Yangiliklar</a>
          </nav>
          <div className="header-actions">
            <button className="icon-btn" onClick={() => setCartOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>
            <button className="hamburger" onClick={() => setMobileNav(true)}><span/><span/><span/></button>
          </div>
        </div>
      </header>

      <div className="ticker">
        <span className="ticker-track">
          {'🇯🇵 YAPONIYADAN TO\'G\'RIDAN-TO\'G\'RI · UNIQLO · NIKE · SHISEIDO · ISSEY MIYAKE · GU · PORTER · 10-14 KUNDA YETKAZIB BERAMIZ · PAYME · CLICK · '.repeat(3)}
        </span>
      </div>

      <main>
        {page === 'store' && (
          <>
            <section className="hero">
              <p className="hero-eyebrow">Yaponiyadan — O'zbekistonga</p>
              <h1 className="hero-title serif">Original<br/><em>Yaponiyadan</em></h1>
              <p className="hero-sub">Uniqlo, Nike, Shiseido va yuzlab boshqa yapon brendlari. To'g'ridan-to'g'ri, tez va ishonchli.</p>
              <div className="hero-btns">
                <button className="btn-dark" onClick={() => setCat('Barchasi')}>Barcha mahsulotlar</button>
                <button className="btn-outline" onClick={() => goPage('news')}>Yangiliklar</button>
              </div>
            </section>

            <div className="cats-wrap">
              <div className="cats-scroll">
                {CATS.map(c => <button key={c} className={`cat-pill${cat === c ? ' active' : ''}`} onClick={() => setCat(c)}>{c}</button>)}
              </div>
            </div>

            {loading ? (
              <div style={{textAlign:'center',padding:'60px',color:'#999',fontSize:'13px'}}>Yuklanmoqda...</div>
            ) : cat !== 'Barchasi' ? (
              <div className="section">
                <div className="section-head">
                  <span className="section-title">{cat} — {filtered.length} ta mahsulot</span>
                </div>
                {filtered.length === 0 ? (
                  <div style={{textAlign:'center',padding:'60px',color:'#bbb'}}>
                    <p style={{fontSize:'32px',marginBottom:'12px'}}>🛍</p>
                    <p>Hozircha mahsulot yo'q</p>
                  </div>
                ) : (
                  <div className="grid">{filtered.map(p => <ProductCard key={p.id} p={p} onAdd={addToCart} onDetail={setDetailId}/>)}</div>
                )}
              </div>
            ) : (
              <>
                {newArrivals.length > 0 && (
                  <div className="section">
                    <div className="section-head"><span className="section-title">Yangi keldi</span></div>
                    <div className="grid">{newArrivals.map(p => <ProductCard key={p.id} p={p} onAdd={addToCart} onDetail={setDetailId}/>)}</div>
                  </div>
                )}
                {products.length === 0 && (
                  <div style={{textAlign:'center',padding:'80px 24px',color:'#bbb'}}>
                    <p style={{fontSize:'48px',marginBottom:'16px'}}>🇯🇵</p>
                    <p style={{fontSize:'16px',marginBottom:'8px',color:'#888'}}>Mahsulotlar tez orada qo'shiladi</p>
                  </div>
                )}
                <div className="cta-banner">
                  <p style={{fontSize:'10px',letterSpacing:'.18em',color:'#999',textTransform:'uppercase',marginBottom:'14px'}}>Har haftada yangi mahsulotlar</p>
                  <h2 className="cta-title serif">Telegram kanalimizga<br/><em>obuna bo'ling</em></h2>
                  <p className="cta-sub">Yangi kelgan mahsulotlar va chegirmalardan birinchi xabardor bo'ling</p>
                  <button className="btn-dark">TELEGRAM KANALGA O'TISH</button>
                </div>
                {onSale.length > 0 && (
                  <div className="section">
                    <div className="section-head"><span className="section-title">Aksiyada</span></div>
                    <div className="grid">{onSale.map(p => <ProductCard key={p.id} p={p} onAdd={addToCart} onDetail={setDetailId}/>)}</div>
                  </div>
                )}
                <div className="features">
                  <div className="features-grid">
                    {[
                      {icon:'🇯🇵',t:'100% Original',s:"Yaponiyadan to'g'ridan-to'g'ri"},
                      {icon:'⚡',t:'10–14 kun',s:'Tez yetkazib berish'},
                      {icon:'💳',t:'Payme · Click',s:"Qulay to'lov usullari"},
                      {icon:'✅',t:'3+ yillik tajriba',s:'1000+ mamnun mijoz'},
                    ].map(f => (
                      <div key={f.t}><div className="feat-icon">{f.icon}</div><div className="feat-title">{f.t}</div><div className="feat-sub">{f.s}</div></div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {page === 'news' && (
          <div className="news-wrap">
            <h1 className="serif" style={{fontSize:'clamp(32px,5vw,52px)',fontWeight:300,marginBottom:'8px'}}>Yangiliklar</h1>
            <p style={{fontSize:'13px',color:'var(--gray)',marginBottom:'32px'}}>Yaponiyadan so'nggi yangiliklar</p>
            {[
              {id:1,date:"28 May 2025",title:"Yangi Uniqlo 2025 yoz kolleksiyasi keldi",desc:"Linen, keng shimlar va pastel ranglar — bu yozning eng trend buyumlari."},
              {id:2,date:"20 May 2025",title:"Shiseido yangi SPF seriyasi",desc:"Yaponiyada 1-o'rindagi SPF kremlar endi bizda mavjud."},
              {id:3,date:"12 May 2025",title:"Nike Sacai x CLOT — cheklangan miqdor",desc:"Yaponiyaning ekskluziv sneaker drops'i. Bugun buyurtma bering."},
              {id:4,date:"5 May 2025",title:"Yetkazib berish muddatlari qisqardi: 10-14 kun",desc:"Yangi logistika hamkorligimiz tufayli buyurtmalar tezroq yetib keladi."},
            ].map(n => (
              <div key={n.id} className="news-card">
                <div className="news-date">{n.date}</div>
                <div className="news-title">{n.title}</div>
                <div className="news-desc">{n.desc}</div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div>
            <div className="footer-brand serif">TOKYO <em>Drops</em></div>
            <div className="footer-desc">Yaponiyaning eng yaxshi brendlari — to'g'ridan-to'g'ri sizga.</div>
          </div>
          <div className="footer-col">
            <h4>Do'kon</h4>
            {CATS.slice(1).map(c => <a key={c} onClick={() => goPage('store', c)}>{c}</a>)}
          </div>
          <div className="footer-col">
            <h4>Ma'lumot</h4>
            <a>Yetkazib berish</a><a>Qaytarish</a><a>Biz haqimizda</a><a>Aloqa</a>
          </div>
          <div className="footer-col">
            <h4>Ijtimoiy</h4>
            <a>Telegram</a><a>Instagram</a><a>TikTok</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2025 TOKYO Drops. Barcha huquqlar himoyalangan.</span>
          <span>Toshkent, O'zbekiston</span>
        </div>
      </footer>

      <div className={`overlay${cartOpen ? ' show' : ''}`} onClick={() => setCartOpen(false)}/>
      <div className={`cart-drawer${cartOpen ? ' open' : ''}`}>
        <div className="drawer-header">
          <span className="drawer-title serif">Savat</span>
          <button className="close-btn" onClick={() => setCartOpen(false)}>×</button>
        </div>
        <div className="drawer-body">
          {cart.length === 0 ? (
            <p style={{textAlign:'center',color:'#ccc',marginTop:'60px',fontSize:'13px'}}>Savat bo'sh</p>
          ) : cart.map(item => (
            <div key={item.id} className="cart-item">
              <img className="cart-item-img" src={item.img || 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=120'} alt={item.name}/>
              <div className="cart-item-info">
                <div className="cart-item-name">{item.name}</div>
                {item.selectedSize && (
                  <div style={{fontSize:'11px',color:'#888',marginBottom:'2px',letterSpacing:'.03em'}}>O'lcham: <b style={{color:'#111'}}>{item.selectedSize}</b></div>
                )}
                <div className="cart-item-price">{fmt(item.price)}</div>
                <div className="qty-row">
                  <button className="qty-btn" onClick={() => changeQty(item.cartKey, -1)}>−</button>
                  <span className="qty-num">{item.qty}</span>
                  <button className="qty-btn" onClick={() => changeQty(item.cartKey, 1)}>+</button>
                  <button className="rm-btn" onClick={() => removeFromCart(item.cartKey)}>O'chir</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="drawer-footer">
            <div className="cart-total-row">
              <span className="cart-total-label">Jami</span>
              <span className="cart-total-amount">{fmt(cartTotal)}</span>
            </div>
            <button className="btn-dark" style={{width:'100%',padding:'14px',fontSize:'11px',letterSpacing:'.1em'}} onClick={() => setOrderForm(true)}>
              BUYURTMA BERISH
            </button>
            <p className="pay-note">Payme · Click · Naqd pul</p>
          </div>
        )}
      </div>

      <div className={`form-bg${orderForm ? ' show' : ''}`} onClick={() => setOrderForm(false)}>
        <div className="form-box" onClick={e => e.stopPropagation()}>
          <div className="form-title serif">Buyurtma berish</div>
          <div className="field">
            <label>Ismingiz</label>
            <input type="text" placeholder="Ism Familiya" value={orderData.name} onChange={e => setOrderData(d => ({...d, name: e.target.value}))}/>
          </div>
          <div className="field">
            <label>Telefon *</label>
            <input type="tel" placeholder="+998 90 000 00 00" value={orderData.phone} onChange={e => setOrderData(d => ({...d, phone: e.target.value}))}/>
          </div>
          <div className="field">
            <label>Manzil</label>
            <input type="text" placeholder="Toshkent, Chilonzor..." value={orderData.address} onChange={e => setOrderData(d => ({...d, address: e.target.value}))}/>
          </div>
          <div style={{background:'#f7f7f5',padding:'14px',marginBottom:'16px'}}>
            <div style={{fontSize:'12px',color:'#888',marginBottom:'8px'}}>Buyurtma:</div>
            {cart.map(i => (
              <div key={i.id} style={{display:'flex',justifyContent:'space-between',fontSize:'13px',marginBottom:'4px'}}>
                <span>{i.name} x{i.qty}</span><span>{fmt(i.price * i.qty)}</span>
              </div>
            ))}
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'14px',fontWeight:600,marginTop:'8px',paddingTop:'8px',borderTop:'1px solid #e4e2dd'}}>
              <span>Jami</span><span>{fmt(cartTotal)}</span>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-dark" onClick={submitOrder}>TASDIQLASH</button>
            <button className="btn-outline" onClick={() => setOrderForm(false)}>BEKOR</button>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL WITH SLIDER */}
      <div className={`modal-bg${detail ? ' show' : ''}`} onClick={() => setDetailId(null)}
        style={{overflowY: detail ? 'auto' : 'hidden'}}
        onTouchMove={e => e.stopPropagation()}>
        {detail && <DetailModal detail={detail} onClose={() => setDetailId(null)} onAdd={addToCart} />}
      </div>
    </>
  )
}

function DetailModal({ detail, onClose, onAdd }) {
  const fmt = n => n?.toLocaleString('uz-UZ') + " so'm"
  const images = detail.images?.length > 0 ? detail.images : (detail.img ? [detail.img] : [])
  const [activeImg, setActiveImg] = useState(0)
  const [selectedSize, setSelectedSize] = useState(null)
  const [zoom, setZoom] = useState(false)
  const [zoomPos, setZoomPos] = useState({x:50,y:50})
  const [fullscreen, setFullscreen] = useState(false)
  const imgRef = useRef()
  const fsRef = useRef()
  const swipeRef = useRef(null)
  const activeImgRef = useRef(activeImg)
  activeImgRef.current = activeImg

  function prev() { setActiveImg(i => (i - 1 + images.length) % images.length) }
  function next() { setActiveImg(i => (i + 1) % images.length) }

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({x, y})
  }

  // Native touch events for fullscreen - bypasses passive listener issue
  useEffect(() => {
    if (!fullscreen || !fsRef.current) return
    const el = fsRef.current

    function onTouchStart(e) {
      swipeRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }

    function onTouchMove(e) {
      if (!swipeRef.current) return
      const dx = Math.abs(e.touches[0].clientX - swipeRef.current.x)
      const dy = Math.abs(e.touches[0].clientY - swipeRef.current.y)
      if (dx > dy && dx > 8) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    function onTouchEnd(e) {
      if (!swipeRef.current) return
      const dx = swipeRef.current.x - e.changedTouches[0].clientX
      const dy = Math.abs(swipeRef.current.y - e.changedTouches[0].clientY)
      swipeRef.current = null
      if (Math.abs(dx) < 40 || Math.abs(dx) < dy) return
      e.preventDefault()
      e.stopPropagation()
      if (dx > 0) setActiveImg(i => (i + 1) % images.length)
      else setActiveImg(i => (i - 1 + images.length) % images.length)
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: false })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [fullscreen, images.length])

  return (
    <>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {/* LEFT: IMAGE PANEL */}
        <div style={{position:'relative',background:'#f5f5f3',overflow:'hidden',display:'flex',flexDirection:'column'}}>

          {/* Main image with zoom */}
          <div
            ref={imgRef}
            style={{position:'relative',flex:1,overflow:'hidden',cursor:zoom?'crosshair':'zoom-in',minHeight:0}}
            onMouseEnter={()=>setZoom(true)}
            onMouseLeave={()=>setZoom(false)}
            onMouseMove={handleMouseMove}
            onClick={()=>setFullscreen(true)}
          >
            <img
              src={images[activeImg]}
              alt={detail.name}
              style={{
                width:'100%',
                height:'100%',
                maxHeight:'70vh',
                objectFit:'cover',
                display:'block',
                transition:'transform .1s ease',
                transformOrigin:`${zoomPos.x}% ${zoomPos.y}%`,
                transform: zoom ? 'scale(2.2)' : 'scale(1)',
              }}
            />
            {/* Zoom hint */}
            {!zoom && (
              <div style={{position:'absolute',bottom:10,right:10,background:'rgba(0,0,0,.5)',color:'#fff',fontSize:'10px',padding:'4px 8px',letterSpacing:'.04em',pointerEvents:'none'}}>
                🔍 Zoom
              </div>
            )}
            {/* Fullscreen hint */}
            <button onClick={e=>{e.stopPropagation();setFullscreen(true)}}
              style={{position:'absolute',top:10,right:10,background:'rgba(255,255,255,.85)',border:'none',width:32,height:32,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px'}}>
              ⛶
            </button>
          </div>

          {/* Thumbnails bottom */}
          {images.length > 1 && (
            <div style={{display:'flex',gap:'4px',padding:'8px',background:'#fff',overflowX:'auto'}}>
              {images.map((img, i) => (
                <div key={i} onClick={()=>setActiveImg(i)}
                  style={{width:48,height:60,overflow:'hidden',cursor:'pointer',flexShrink:0,border:activeImg===i?'2px solid #111':'2px solid transparent',transition:'border-color .2s'}}>
                  <img src={img} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>
                </div>
              ))}
            </div>
          )}

          {/* Prev/Next arrows */}
          {images.length > 1 && (
            <>
              <button onClick={prev} style={{position:'absolute',left:8,top:'40%',transform:'translateY(-50%)',background:'rgba(255,255,255,.9)',border:'none',width:36,height:36,fontSize:'20px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2}}>‹</button>
              <button onClick={next} style={{position:'absolute',right:8,top:'40%',transform:'translateY(-50%)',background:'rgba(255,255,255,.9)',border:'none',width:36,height:36,fontSize:'20px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2}}>›</button>
            </>
          )}
        </div>

        {/* RIGHT: CONTENT */}
        <div className="modal-body">
          <button className="close-btn" style={{display:'block',marginLeft:'auto',marginBottom:'12px'}} onClick={onClose}>×</button>
          <div className="modal-cat">{detail.cat}</div>
          <div className="modal-name serif">{detail.name}</div>
          <div className="modal-prices">
            <span className="modal-price">{fmt(detail.price)}</span>
            {detail.old_price && <span className="modal-old">{fmt(detail.old_price)}</span>}
          </div>
          {detail.sizes?.length > 0 && (
            <>
              <div className="sizes-lbl">O'lchamni tanlang</div>
              <div className="sizes-row">
                {detail.sizes.map(s => (
                  <button key={s} className={`size-btn${selectedSize===s?' active':''}`} onClick={()=>setSelectedSize(s)}>{s}</button>
                ))}
              </div>
            </>
          )}
          {detail.description && <div className="modal-desc">{detail.description}</div>}
          {detail.sizes?.length > 0 && !selectedSize && (
            <p style={{fontSize:'12px',color:'#c0392b',marginBottom:'10px',letterSpacing:'.02em'}}>⚠ Iltimos, o'lchamni tanlang</p>
          )}
          <button className="btn-dark" style={{width:'100%',padding:'14px',fontSize:'11px',letterSpacing:'.1em',opacity:(detail.sizes?.length>0&&!selectedSize)?0.6:1}}
            onClick={() => {
              if (detail.sizes?.length > 0 && !selectedSize) {
                document.querySelector('.sizes-lbl')?.scrollIntoView({behavior:'smooth'})
                return
              }
              onAdd(detail.id, selectedSize)
              onClose()
            }}>
            SAVATGA QO'SHISH {selectedSize ? `— ${selectedSize}` : ''}
          </button>
          <div className="modal-stock">Zaxirada: {detail.stock} ta</div>
        </div>
      </div>

      {/* FULLSCREEN MODAL */}
      {fullscreen && (
        <div
          ref={fsRef}
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,.95)',zIndex:800,display:'flex',alignItems:'center',justifyContent:'center',touchAction:'pan-y',overscrollBehavior:'none'}}
          onClick={()=>setFullscreen(false)}
        >
          <button onClick={()=>setFullscreen(false)}
            style={{position:'absolute',top:16,right:16,background:'rgba(255,255,255,.15)',border:'none',color:'#fff',width:40,height:40,fontSize:'20px',cursor:'pointer',zIndex:801}}>×</button>
          {images.length > 1 && (
            <>
              <button onClick={e=>{e.stopPropagation();prev()}}
                style={{position:'absolute',left:16,top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,.15)',border:'none',color:'#fff',width:44,height:44,fontSize:'24px',cursor:'pointer',zIndex:801}}>‹</button>
              <button onClick={e=>{e.stopPropagation();next()}}
                style={{position:'absolute',right:16,top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,.15)',border:'none',color:'#fff',width:44,height:44,fontSize:'24px',cursor:'pointer',zIndex:801}}>›</button>
            </>
          )}
          <img
            src={images[activeImg]}
            alt={detail.name}
            onClick={e=>e.stopPropagation()}
            style={{maxWidth:'90vw',maxHeight:'90vh',objectFit:'contain',userSelect:'none'}}
          />
          {images.length > 1 && (
            <div style={{position:'absolute',bottom:20,left:'50%',transform:'translateX(-50%)',display:'flex',gap:'8px'}}>
              {images.map((_,i) => (
                <button key={i} onClick={e=>{e.stopPropagation();setActiveImg(i)}}
                  style={{width:i===activeImg?24:8,height:8,borderRadius:'4px',background:i===activeImg?'#fff':'rgba(255,255,255,.4)',border:'none',cursor:'pointer',transition:'all .2s',padding:0}}/>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}

function ProductCard({ p, onAdd, onDetail }) {
  const fmt = n => n?.toLocaleString('uz-UZ') + " so'm"
  const images = p.images?.length > 0 ? p.images : (p.img ? [p.img] : [])
  const [imgIdx, setImgIdx] = useState(0)

  return (
    <div className="pcard" onClick={() => onDetail(p.id)}>
      <div className="pcard-img-wrap">
        <img src={images[imgIdx] || 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=400'} alt={p.name} loading="lazy"/>
        {images.length > 1 && (
          <>
            <button onClick={e=>{e.stopPropagation();setImgIdx(i=>(i-1+images.length)%images.length)}}
              style={{position:'absolute',left:6,top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,.85)',border:'none',width:28,height:28,fontSize:'16px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',opacity:0}}
              className="card-arrow card-arrow-l">‹</button>
            <button onClick={e=>{e.stopPropagation();setImgIdx(i=>(i+1)%images.length)}}
              style={{position:'absolute',right:6,top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,.85)',border:'none',width:28,height:28,fontSize:'16px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',opacity:0}}
              className="card-arrow card-arrow-r">›</button>
            <div style={{position:'absolute',bottom:8,left:'50%',transform:'translateX(-50%)',display:'flex',gap:'4px'}}>
              {images.map((_,i) => (
                <span key={i} style={{width:i===imgIdx?14:5,height:5,borderRadius:'3px',background:i===imgIdx?'#fff':'rgba(255,255,255,.6)',display:'block',transition:'all .2s'}}/>
              ))}
            </div>
          </>
        )}
        <div className="ptags">
          {p.is_new && <span className="ptag ptag-new">Yangi</span>}
          {p.is_sale && <span className="ptag ptag-sale">Sale</span>}
        </div>
      </div>
      <div className="pcard-cat">{p.cat}</div>
      <div className="pcard-name">{p.name}</div>
      <div className="pcard-prices">
        <span className="price-now">{fmt(p.price)}</span>
        {p.old_price && <span className="price-old">{fmt(p.old_price)}</span>}
      </div>
      <button className="btn-dark pcard-btn" onClick={e => { e.stopPropagation(); onAdd(p.id) }}>SAVATGA</button>
    </div>
  )
}