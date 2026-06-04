import React, { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'

const CATEGORIES = {
  "Ayollar": ["T-shirt/Sviter", "Ko'ylak/Bluzka", "Shim/Yubka", "Sho'rtik", "Auter/Kurtka", "Ichki kiyim", "Aksessuarlar", "Oyoq kiyimi"],
  "Erkaklar": ["T-shirt/Sviter", "Ko'ylak/Polo", "Shim", "Sho'rtik", "Auter/Kurtka", "Ichki kiyim", "Oyoq kiyimi"],
  "Bolalar": ["Qizlar", "O'g'il bolalar"],
  "Baby": ["Kiyimlar"],
  "Kosmetika": ["Yuz uchun", "Qo'l uchun", "Oyoq uchun", "Quyoshdan himoya", "Maska"],
}
const MAIN_CATS = Object.keys(CATEGORIES)
const fmt = n => n?.toLocaleString('uz-UZ') + " so'm"

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState('store')
  const [activeCat, setActiveCat] = useState(null)
  const [activeSubCat, setActiveSubCat] = useState(null)
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [detailId, setDetailId] = useState(null)
  const [mobileNav, setMobileNav] = useState(false)
  const [notif, setNotif] = useState(null)
  const [orderForm, setOrderForm] = useState(false)
  const [orderData, setOrderData] = useState({name:'',phone:'',address:''})
  const [dropdownOpen, setDropdownOpen] = useState(null)
  const [specialFilter, setSpecialFilter] = useState(null) // 'new' | 'sale' | null

  useEffect(() => { fetchProducts() }, [])
  useEffect(() => {
    function handleClick() { setDropdownOpen(null) }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  async function fetchProducts() {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  const detail = products.find(p => p.id === detailId)
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)

  const filtered = products.filter(p => {
    if (specialFilter === 'new') return p.is_new
    if (specialFilter === 'sale') return p.is_sale
    if (!activeCat) return true
    if (p.main_cat !== activeCat) return false
    if (activeSubCat && p.sub_cat !== activeSubCat) return false
    return true
  })

  const newArrivals = products.filter(p => p.is_new).slice(0, 4)
  const onSale = products.filter(p => p.is_sale).slice(0, 4)

  function notify(msg) { setNotif(msg); setTimeout(() => setNotif(null), 2200) }

  function selectCat(main, sub) {
    setActiveCat(main)
    setActiveSubCat(sub || null)
    setSpecialFilter(null)
    setPage('store')
    setDropdownOpen(null)
    setMobileNav(false)
    window.scrollTo(0, 0)
  }

  function goHome() {
    setActiveCat(null)
    setActiveSubCat(null)
    setSpecialFilter(null)
    setPage('store')
    setMobileNav(false)
    window.scrollTo(0, 0)
  }

  function handleSpecialFilter(type) {
    setSpecialFilter(type)
    setActiveCat(null)
    setActiveSubCat(null)
    setPage('store')
    window.scrollTo(0, 0)
  }

  function addToCart(id, size, color) {
    const p = products.find(x => x.id === id)
    if (!p) return
    const cartKey = `${id}-${size||''}-${color||''}`
    setCart(prev => {
      const ex = prev.find(x => x.cartKey === cartKey)
      if (ex) return prev.map(x => x.cartKey === cartKey ? { ...x, qty: x.qty + 1 } : x)
      // Get color image for cart display
      const colorObj = p.colors?.find(c => c.name === color)
      const cartImg = colorObj?.images?.[0] || p.img || ''
      return [...prev, { ...p, img: cartImg, qty: 1, cartKey, selectedSize: size || null, selectedColor: color || null }]
    })
    notify("Savatga qo'shildi ✓" + (size ? ` (${size})` : '') + (color ? ` · ${color}` : ''))
  }

  function removeFromCart(cartKey) { setCart(c => c.filter(x => x.cartKey !== cartKey)) }
  function changeQty(cartKey, d) { setCart(c => c.map(x => x.cartKey === cartKey ? { ...x, qty: x.qty + d } : x).filter(x => x.qty > 0)) }

  async function submitOrder() {
    if (!orderData.phone) { notify('Telefon raqam majburiy!'); return }
    const { error } = await supabase.from('orders').insert([{
      customer_name: orderData.name,
      phone: orderData.phone,
      address: orderData.address,
      total: cartTotal,
      items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, size: i.selectedSize, color: i.selectedColor })),
      status: 'new'
    }])
    if (!error) {
      setCart([]); setOrderForm(false); setCartOpen(false)
      notify('Buyurtma qabul qilindi! ✓')
    } else notify('Xato: ' + error.message)
  }

  const isHome = !activeCat && !specialFilter && page === 'store'

  return (
    <>
      <Head>
        <title>TOKYO Brands — Yaponiyadan O'zbekistonga</title>
        <meta name="description" content="Hammasi Yaponiyadan — Uniqlo, Nike, Shiseido va yuzlab original brendlar." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {notif && <div className="notif show">{notif}</div>}

      {/* MOBILE NAV - Accordion */}
      <MobileNav
        open={mobileNav}
        onClose={()=>setMobileNav(false)}
        onSelectCat={selectCat}
        onHome={goHome}
        onNews={()=>{setPage('news');setMobileNav(false)}}
        activeCat={activeCat}
        activeSubCat={activeSubCat}
        specialFilter={specialFilter}
        handleSpecialFilter={handleSpecialFilter}
      />

      {/* HEADER */}
      <header className="header">
        <div className="header-inner">
          <div className="logo serif" onClick={goHome}>TOKYO <em>Brands</em></div>

          {/* Desktop nav with dropdowns */}
          <nav className="nav" style={{gap:'20px'}}>
            {MAIN_CATS.map(cat => (
              <div key={cat} style={{position:'relative'}}
                onClick={e=>e.stopPropagation()}>
                <a
                  className={activeCat===cat?'active':''}
                  onMouseEnter={()=>CATEGORIES[cat].length>0&&setDropdownOpen(cat)}
                  onClick={()=>selectCat(cat,null)}
                  style={{cursor:'pointer',display:'flex',alignItems:'center',gap:'3px'}}>
                  {cat}
                  {CATEGORIES[cat].length > 0 && <span style={{fontSize:'8px',opacity:.5}}>▾</span>}
                </a>
                {dropdownOpen===cat && CATEGORIES[cat].length>0 && (
                  <div
                    onMouseLeave={()=>setDropdownOpen(null)}
                    style={{position:'absolute',top:'100%',left:'50%',transform:'translateX(-50%)',background:'#fff',border:'1px solid #e8e8e4',minWidth:'160px',zIndex:300,paddingTop:'8px',paddingBottom:'8px',marginTop:'8px',boxShadow:'0 4px 20px rgba(0,0,0,.08)'}}>
                    {CATEGORIES[cat].map(sub => (
                      <div key={sub} onClick={()=>selectCat(cat,sub)}
                        style={{padding:'8px 18px',fontSize:'12px',color:'#555',cursor:'pointer',letterSpacing:'.03em',whiteSpace:'nowrap',transition:'background .15s'}}
                        onMouseEnter={e=>e.currentTarget.style.background='#f7f7f5'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        {sub}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <a onClick={()=>setPage('news')} className={page==='news'?'active':''} style={{cursor:'pointer'}}>Yangiliklar</a>
          </nav>

          <div className="header-actions">
            <button className="icon-btn" onClick={()=>setCartOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>
            <button className="hamburger" onClick={()=>setMobileNav(true)}><span/><span/><span/></button>
          </div>
        </div>
      </header>

      {/* TICKER */}
      <div className="ticker">
        <span className="ticker-track">
          {'🇯🇵 YAPONIYADAN TO\'G\'RIDAN-TO\'G\'RI · UNIQLO · NIKE · SHISEIDO · ISSEY MIYAKE · GU · PORTER · 10-14 KUNDA YETKAZIB BERAMIZ · PAYME · CLICK · '.repeat(3)}
        </span>
      </div>

      {/* STICKY CATEGORY BAR */}
      <div style={{position:"sticky",top:"56px",zIndex:150,background:"#fff",borderBottom:"1px solid #e8e8e4",overflowX:"auto",scrollbarWidth:"none",WebkitOverflowScrolling:"touch"}}>
        <div style={{display:"flex",minWidth:"max-content"}}>
          {MAIN_CATS.map(cat => (
            <div key={cat} onClick={()=>selectCat(cat,null)}
              style={{padding:"11px 14px",cursor:"pointer",fontSize:"11px",fontWeight:600,letterSpacing:".07em",textTransform:"uppercase",whiteSpace:"nowrap",borderBottom:"2px solid",borderBottomColor:activeCat===cat&&!specialFilter?"#111":"transparent",color:activeCat===cat&&!specialFilter?"#111":"#888",flexShrink:0}}>
              {cat}
            </div>
          ))}
          <div onClick={()=>handleSpecialFilter("new")}
            style={{padding:"11px 14px",cursor:"pointer",fontSize:"11px",fontWeight:600,letterSpacing:".07em",textTransform:"uppercase",whiteSpace:"nowrap",borderBottom:"2px solid",borderBottomColor:specialFilter==="new"?"#C8102E":"transparent",color:specialFilter==="new"?"#C8102E":"#888",flexShrink:0}}>
            Yangiliklar
          </div>
          <div onClick={()=>handleSpecialFilter("sale")}
            style={{padding:"11px 14px",cursor:"pointer",fontSize:"11px",fontWeight:600,letterSpacing:".07em",textTransform:"uppercase",whiteSpace:"nowrap",borderBottom:"2px solid",borderBottomColor:specialFilter==="sale"?"#C8102E":"transparent",color:specialFilter==="sale"?"#C8102E":"#888",flexShrink:0}}>
            Chegirmalar
          </div>
        </div>
      </div>

      <main>
        {page === 'store' && (
          <>
            {isHome ? (
              /* HOME PAGE */
              <>
                <section className="hero">
                  <p className="hero-eyebrow">Yaponiyadan — O'zbekistonga</p>
                  <h1 className="hero-title serif">Hammasi<br/><em>Yaponiyadan</em></h1>
                  <p className="hero-sub">Uniqlo, Nike, Shiseido va yuzlab boshqa yapon brendlari. To'g'ridan-to'g'ri, tez va ishonchli.</p>
                  <div className="hero-btns">
                    <button
                      onClick={()=>handleSpecialFilter('new')}
                      style={{background:'#fff',color:'#111',border:'1.5px solid #111',padding:'12px 28px',fontSize:'11px',fontWeight:500,letterSpacing:'.1em',cursor:'pointer',transition:'background .2s, color .2s'}}
                      onMouseEnter={e=>{e.currentTarget.style.background='#111';e.currentTarget.style.color='#fff'}}
                      onMouseLeave={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#111'}}>
                      YANGILIKLAR
                    </button>
                    <button
                      onClick={()=>handleSpecialFilter('sale')}
                      style={{background:'#fff',color:'#111',border:'1.5px solid #111',padding:'12px 28px',fontSize:'11px',fontWeight:500,letterSpacing:'.1em',cursor:'pointer',transition:'background .2s, color .2s'}}
                      onMouseEnter={e=>{e.currentTarget.style.background='#111';e.currentTarget.style.color='#fff'}}
                      onMouseLeave={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#111'}}>
                      CHEGIRMALAR
                    </button>
                  </div>
                </section>


                {newArrivals.length > 0 && (
                  <div className="section">
                    <div className="section-head"><span className="section-title">Yangi keldi</span></div>
                    <div className="grid">{newArrivals.map(p=><ProductCard key={p.id} p={p} onAdd={addToCart} onDetail={setDetailId}/>)}</div>
                  </div>
                )}

                {products.length === 0 && (
                  <div style={{textAlign:'center',padding:'60px 24px',color:'#bbb'}}>
                    <p style={{fontSize:'48px',marginBottom:'16px'}}>🇯🇵</p>
                    <p style={{fontSize:'15px',color:'#888',marginBottom:'8px'}}>Mahsulotlar tez orada qo'shiladi</p>
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
                    <div className="grid">{onSale.map(p=><ProductCard key={p.id} p={p} onAdd={addToCart} onDetail={setDetailId}/>)}</div>
                  </div>
                )}

                <div className="features">
                  <div className="features-grid">
                    {[
                      {icon:'🇯🇵',t:'100% Original',s:"Yaponiyadan to'g'ridan-to'g'ri"},
                      {icon:'⚡',t:'10–14 kun',s:'Tez yetkazib berish'},
                      {icon:'💳',t:'Payme · Click',s:"Qulay to'lov usullari"},
                      {icon:'✅',t:'3+ yillik tajriba',s:'1000+ mamnun mijoz'},
                    ].map(f=>(
                      <div key={f.t}><div className="feat-icon">{f.icon}</div><div className="feat-title">{f.t}</div><div className="feat-sub">{f.s}</div></div>
                    ))}
                  </div>
                </div>
              </>
            ) : specialFilter ? (
              /* SPECIAL FILTER PAGE - Yangiliklar / Chegirmalar */
              <div className="section">
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'20px',fontSize:'12px',color:'#aaa'}}>
                  <span onClick={goHome} style={{cursor:'pointer',color:'#888'}}>Bosh sahifa</span>
                  <span>›</span>
                  <span style={{color:'#111'}}>{specialFilter==='new'?'Yangiliklar':'Chegirmalar'}</span>
                </div>
                <div className="section-head">
                  <span className="section-title">{specialFilter==='new'?'Yangi mahsulotlar':'Chegirmadagi mahsulotlar'} — {filtered.length} ta</span>
                </div>
                {loading ? (
                  <div style={{textAlign:'center',padding:'60px',color:'#999'}}>Yuklanmoqda...</div>
                ) : filtered.length === 0 ? (
                  <div style={{textAlign:'center',padding:'60px',color:'#bbb'}}>
                    <p style={{fontSize:'32px',marginBottom:'12px'}}>{specialFilter==='new'?'🆕':'🏷️'}</p>
                    <p>Hozircha mahsulot yo'q</p>
                  </div>
                ) : (
                  <div className="grid">{filtered.map(p=><ProductCard key={p.id} p={p} onAdd={addToCart} onDetail={setDetailId}/>)}</div>
                )}
              </div>
            ) : (
              /* CATEGORY PAGE */
              <div className="section">
                {/* Breadcrumb */}
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'20px',fontSize:'12px',color:'#aaa'}}>
                  <span onClick={goHome} style={{cursor:'pointer',color:'#888'}}>Bosh sahifa</span>
                  <span>›</span>
                  <span onClick={()=>selectCat(activeCat,null)} style={{cursor:'pointer',color:activeSubCat?'#888':'#111'}}>{activeCat}</span>
                  {activeSubCat && <><span>›</span><span style={{color:'#111'}}>{activeSubCat}</span></>}
                </div>

                {/* Sub-category pills */}
                {CATEGORIES[activeCat]?.length > 0 && (
                  <div style={{display:'flex',gap:'8px',marginBottom:'24px',flexWrap:'wrap'}}>
                    <button onClick={()=>selectCat(activeCat,null)}
                      style={{padding:'7px 16px',fontSize:'11px',fontWeight:500,letterSpacing:'.06em',border:'1px solid',borderColor:!activeSubCat?'#111':'#ddd',background:!activeSubCat?'#111':'transparent',color:!activeSubCat?'#fff':'#666',cursor:'pointer',textTransform:'uppercase'}}>
                      Barchasi
                    </button>
                    {CATEGORIES[activeCat].map(sub => (
                      <button key={sub} onClick={()=>selectCat(activeCat,sub)}
                        style={{padding:'7px 16px',fontSize:'11px',fontWeight:500,letterSpacing:'.06em',border:'1px solid',borderColor:activeSubCat===sub?'#111':'#ddd',background:activeSubCat===sub?'#111':'transparent',color:activeSubCat===sub?'#fff':'#666',cursor:'pointer',textTransform:'uppercase'}}>
                        {sub}
                      </button>
                    ))}
                  </div>
                )}

                <div className="section-head">
                  <span className="section-title">{activeSubCat||activeCat} — {filtered.length} ta mahsulot</span>
                </div>

                {loading ? (
                  <div style={{textAlign:'center',padding:'60px',color:'#999'}}>Yuklanmoqda...</div>
                ) : filtered.length === 0 ? (
                  <div style={{textAlign:'center',padding:'60px',color:'#bbb'}}>
                    <p style={{fontSize:'32px',marginBottom:'12px'}}>🛍</p>
                    <p>Hozircha mahsulot yo'q</p>
                  </div>
                ) : (
                  <div className="grid">{filtered.map(p=><ProductCard key={p.id} p={p} onAdd={addToCart} onDetail={setDetailId}/>)}</div>
                )}
              </div>
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
              {id:3,date:"12 May 2025",title:"Nike Sacai x CLOT — cheklangan miqdor",desc:"Yaponiyaning ekskluziv sneaker drops'i."},
              {id:4,date:"5 May 2025",title:"Yetkazib berish muddatlari qisqardi",desc:"Yangi logistika hamkorligimiz tufayli buyurtmalar tezroq yetib keladi."},
            ].map(n=>(
              <div key={n.id} className="news-card">
                <div className="news-date">{n.date}</div>
                <div className="news-title">{n.title}</div>
                <div className="news-desc">{n.desc}</div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <div className="footer-brand serif">TOKYO <em>Brands</em></div>
            <div className="footer-desc">Yaponiyaning eng yaxshi brendlari — to'g'ridan-to'g'ri sizga.</div>
          </div>
          <div className="footer-col">
            <h4>Kategoriyalar</h4>
            {MAIN_CATS.map(c=><a key={c} onClick={()=>selectCat(c,null)} style={{cursor:'pointer'}}>{c}</a>)}
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
          <span>© 2025 TOKYO Brands. Barcha huquqlar himoyalangan.</span>
          <span>Toshkent, O'zbekiston</span>
        </div>
      </footer>

      {/* CART DRAWER */}
      <div className={`overlay${cartOpen?' show':''}`} onClick={()=>setCartOpen(false)}/>
      <div className={`cart-drawer${cartOpen?' open':''}`}>
        <div className="drawer-header">
          <span className="drawer-title serif">Savat</span>
          <button className="close-btn" onClick={()=>setCartOpen(false)}>×</button>
        </div>
        <div className="drawer-body">
          {cart.length===0 ? (
            <p style={{textAlign:'center',color:'#ccc',marginTop:'60px',fontSize:'13px'}}>Savat bo'sh</p>
          ) : cart.map(item=>(
            <div key={item.cartKey} className="cart-item">
              <img className="cart-item-img" src={item.img||'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=120'} alt={item.name}/>
              <div className="cart-item-info">
                <div className="cart-item-name">{item.name}</div>
                {item.selectedColor && (
                  <div style={{fontSize:'11px',color:'#888',marginBottom:'2px',display:'flex',alignItems:'center',gap:'5px'}}>
                    Rang:
                    {(() => {
                      const colorObj = item.colors?.find(c => c.name === item.selectedColor)
                      return colorObj ? <span style={{width:10,height:10,borderRadius:'50%',background:colorObj.hex,border:'1px solid #ddd',display:'inline-block'}}/> : null
                    })()}
                    <b style={{color:'#111'}}>{item.selectedColor}</b>
                  </div>
                )}
                {item.selectedSize && (
                  <div style={{fontSize:'11px',color:'#888',marginBottom:'2px'}}>O'lcham: <b style={{color:'#111'}}>{item.selectedSize}</b></div>
                )}
                <div className="cart-item-price">{fmt(item.price)}</div>
                <div className="qty-row">
                  <button className="qty-btn" onClick={()=>changeQty(item.cartKey,-1)}>−</button>
                  <span className="qty-num">{item.qty}</span>
                  <button className="qty-btn" onClick={()=>changeQty(item.cartKey,1)}>+</button>
                  <button className="rm-btn" onClick={()=>removeFromCart(item.cartKey)}>O'chir</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {cart.length>0 && (
          <div className="drawer-footer">
            <div className="cart-total-row">
              <span className="cart-total-label">Jami</span>
              <span className="cart-total-amount">{fmt(cartTotal)}</span>
            </div>
            <button className="btn-dark" style={{width:'100%',padding:'14px',fontSize:'11px',letterSpacing:'.1em'}} onClick={()=>setOrderForm(true)}>
              BUYURTMA BERISH
            </button>
            <p className="pay-note">Payme · Click · Naqd pul</p>
          </div>
        )}
      </div>

      {/* ORDER FORM */}
      <div className={`form-bg${orderForm?' show':''}`} onClick={()=>setOrderForm(false)}>
        <div className="form-box" onClick={e=>e.stopPropagation()}>
          <div className="form-title serif">Buyurtma berish</div>
          <div className="field">
            <label>Ismingiz</label>
            <input type="text" placeholder="Ism Familiya" value={orderData.name} onChange={e=>setOrderData(d=>({...d,name:e.target.value}))}/>
          </div>
          <div className="field">
            <label>Telefon *</label>
            <input type="tel" placeholder="+998 90 000 00 00" value={orderData.phone} onChange={e=>setOrderData(d=>({...d,phone:e.target.value}))}/>
          </div>
          <div className="field">
            <label>Manzil</label>
            <input type="text" placeholder="Toshkent, Chilonzor..." value={orderData.address} onChange={e=>setOrderData(d=>({...d,address:e.target.value}))}/>
          </div>
          <div style={{background:'#f7f7f5',padding:'14px',marginBottom:'16px'}}>
            <div style={{fontSize:'12px',color:'#888',marginBottom:'8px'}}>Buyurtma:</div>
            {cart.map(i=>(
              <div key={i.cartKey} style={{display:'flex',justifyContent:'space-between',fontSize:'13px',marginBottom:'4px'}}>
                <span>{i.name}{i.selectedColor?` · ${i.selectedColor}`:''}{i.selectedSize?` (${i.selectedSize})`:''} x{i.qty}</span>
                <span>{fmt(i.price*i.qty)}</span>
              </div>
            ))}
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'14px',fontWeight:600,marginTop:'8px',paddingTop:'8px',borderTop:'1px solid #e4e2dd'}}>
              <span>Jami</span><span>{fmt(cartTotal)}</span>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-dark" onClick={submitOrder}>TASDIQLASH</button>
            <button className="btn-outline" onClick={()=>setOrderForm(false)}>BEKOR</button>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      <div className={`modal-bg${detail?' show':''}`} onClick={()=>setDetailId(null)}
        style={{overflowY:detail?'auto':'hidden'}}
        onTouchMove={e=>e.stopPropagation()}>
        {detail && <DetailModal detail={detail} onClose={()=>setDetailId(null)} onAdd={addToCart}/>}
      </div>
    </>
  )
}

function MobileNav({ open, onClose, onSelectCat, onHome, onNews, activeCat, activeSubCat, specialFilter, handleSpecialFilter }) {
  const [expandedCat, setExpandedCat] = useState(null)

  function toggleCat(cat) {
    setExpandedCat(prev => prev === cat ? null : cat)
  }

  // Prevent body scroll when open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setExpandedCat(null)
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Overlay */}
      {open && (
        <div onClick={onClose}
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,.4)',zIndex:290}}/>
      )}

      {/* Drawer */}
      <div style={{
        position:'fixed',left:0,top:0,bottom:0,
        width:'min(300px,85vw)',
        background:'#fff',
        zIndex:300,
        transform:open?'translateX(0)':'translateX(-100%)',
        transition:'transform .3s ease',
        display:'flex',
        flexDirection:'column',
        overflowY:'auto',
        WebkitOverflowScrolling:'touch',
      }}>
        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'18px 20px',borderBottom:'1px solid #f0f0f0',flexShrink:0}}>
          <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'18px',fontWeight:400,letterSpacing:'.04em'}}>TOKYO <em>Brands</em></span>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:'24px',color:'#aaa',cursor:'pointer',lineHeight:1,padding:'4px'}}>×</button>
        </div>

        {/* Nav items */}
        <div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch'}}>

          {/* Home */}
          <div onClick={()=>{onHome();onClose()}}
            style={{padding:'14px 20px',fontSize:'13px',fontWeight:500,letterSpacing:'.06em',textTransform:'uppercase',cursor:'pointer',borderBottom:'1px solid #f5f5f5',color:'#111'}}>
            Bosh sahifa
          </div>

          {/* Yangiliklar */}
          <div onClick={()=>handleSpecialFilter('new')}
            style={{padding:'14px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:'13px',fontWeight:500,letterSpacing:'.06em',textTransform:'uppercase',cursor:'pointer',borderBottom:'1px solid #f5f5f5',background:specialFilter==='new'?'#111':'transparent',color:specialFilter==='new'?'#fff':'#111'}}>
            Yangiliklar
          </div>

          {/* Chegirmalar */}
          <div onClick={()=>handleSpecialFilter('sale')}
            style={{padding:'14px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:'13px',fontWeight:500,letterSpacing:'.06em',textTransform:'uppercase',cursor:'pointer',borderBottom:'1px solid #f5f5f5',background:specialFilter==='sale'?'#111':'transparent',color:specialFilter==='sale'?'#fff':'#111'}}>
            Chegirmalar
          </div>

          {/* Main categories */}
          {MAIN_CATS.map(cat => (
            <div key={cat}>
              {/* Category row */}
              <div
                onClick={()=> CATEGORIES[cat].length > 0 ? toggleCat(cat) : onSelectCat(cat, null)}
                style={{
                  padding:'14px 20px',
                  display:'flex',
                  justifyContent:'space-between',
                  alignItems:'center',
                  fontSize:'13px',
                  fontWeight:500,
                  letterSpacing:'.06em',
                  textTransform:'uppercase',
                  cursor:'pointer',
                  borderBottom:'1px solid #f5f5f5',
                  background: activeCat===cat && !activeSubCat ? '#111' : 'transparent',
                  color: activeCat===cat && !activeSubCat ? '#fff' : '#111',
                  transition:'background .2s',
                }}>
                <span>{cat}</span>
                {CATEGORIES[cat].length > 0 && (
                  <span style={{fontSize:'11px',color:activeCat===cat&&!activeSubCat?'rgba(255,255,255,.6)':'#bbb',transition:'transform .2s',display:'inline-block',transform:expandedCat===cat?'rotate(90deg)':'rotate(0deg)'}}>›</span>
                )}
              </div>

              {/* Sub categories - accordion */}
              {CATEGORIES[cat].length > 0 && expandedCat === cat && (
                <div style={{background:'#fafaf8',borderBottom:'1px solid #f0f0f0'}}>
                  {/* All in category */}
                  <div onClick={()=>onSelectCat(cat, null)}
                    style={{padding:'10px 20px 10px 32px',fontSize:'12px',cursor:'pointer',letterSpacing:'.04em',background:activeCat===cat&&!activeSubCat?'#111':'transparent',color:activeCat===cat&&!activeSubCat?'#fff':'#666',borderBottom:'1px solid #f0f0f0'}}>
                    Barchasi
                  </div>
                  {CATEGORIES[cat].map(sub => (
                    <div key={sub} onClick={()=>onSelectCat(cat, sub)}
                      style={{padding:'10px 20px 10px 32px',fontSize:'12px',cursor:'pointer',letterSpacing:'.04em',background:activeCat===cat&&activeSubCat===sub?'#111':'transparent',color:activeCat===cat&&activeSubCat===sub?'#fff':'#666',borderBottom:'1px solid #f0f0f0',transition:'background .15s'}}>
                      {sub}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Yangiliklar page */}
          <div onClick={onNews}
            style={{padding:'14px 20px',fontSize:'13px',fontWeight:500,letterSpacing:'.06em',textTransform:'uppercase',cursor:'pointer',borderBottom:'1px solid #f5f5f5',color:'#111'}}>
            Yangiliklar
          </div>
        </div>
      </div>
    </>
  )
}


function DetailModal({ detail, onClose, onAdd }) {
  const fmt = n => n?.toLocaleString('uz-UZ') + " so'm"
  const colors = detail.colors || []
  const hasColors = colors.length > 0
  const [activeColorIdx, setActiveColorIdx] = useState(0)
  const activeColor = hasColors ? colors[activeColorIdx] : null
  const images = hasColors
    ? (activeColor?.images?.length > 0 ? activeColor.images : (detail.img ? [detail.img] : []))
    : (detail.images?.length > 0 ? detail.images : (detail.img ? [detail.img] : []))
  const [activeImg, setActiveImg] = useState(0)
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(hasColors ? colors[0]?.name : null)
  const [zoom, setZoom] = useState(false)
  const [zoomPos, setZoomPos] = useState({x:50,y:50})
  const [fullscreen, setFullscreen] = useState(false)
  const fsRef = useRef()
  const swipeRef = useRef(null)

  function selectColor(idx) {
    setActiveColorIdx(idx)
    setSelectedColor(colors[idx]?.name)
    setActiveImg(0)
  }

  function prev() { setActiveImg(i => (i-1+images.length)%images.length) }
  function next() { setActiveImg(i => (i+1)%images.length) }

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    setZoomPos({ x:((e.clientX-rect.left)/rect.width)*100, y:((e.clientY-rect.top)/rect.height)*100 })
  }

  useEffect(() => {
    if (!fullscreen || !fsRef.current) return
    const el = fsRef.current
    function onTS(e) { swipeRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
    function onTM(e) {
      if (!swipeRef.current) return
      const dx = Math.abs(e.touches[0].clientX - swipeRef.current.x)
      const dy = Math.abs(e.touches[0].clientY - swipeRef.current.y)
      if (dx > dy*1.5 && dx > 20) { e.preventDefault(); e.stopPropagation() }
    }
    function onTE(e) {
      if (!swipeRef.current) return
      const dx = swipeRef.current.x - e.changedTouches[0].clientX
      const dy = Math.abs(swipeRef.current.y - e.changedTouches[0].clientY)
      swipeRef.current = null
      if (Math.abs(dx) < 80 || Math.abs(dx) < dy*1.5) return
      e.preventDefault(); e.stopPropagation()
      if (dx > 0) setActiveImg(i=>(i+1)%images.length)
      else setActiveImg(i=>(i-1+images.length)%images.length)
    }
    el.addEventListener('touchstart', onTS, {passive:true})
    el.addEventListener('touchmove', onTM, {passive:false})
    el.addEventListener('touchend', onTE, {passive:false})
    return () => { el.removeEventListener('touchstart',onTS); el.removeEventListener('touchmove',onTM); el.removeEventListener('touchend',onTE) }
  }, [fullscreen, images.length])

  return (
    <>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div style={{position:'relative',background:'#f5f5f3',overflow:'hidden',display:'flex',flexDirection:'column'}}>
          <div style={{position:'relative',flex:1,overflow:'hidden',cursor:zoom?'crosshair':'zoom-in',minHeight:0}}
            onMouseEnter={()=>setZoom(true)} onMouseLeave={()=>setZoom(false)}
            onMouseMove={handleMouseMove} onClick={()=>setFullscreen(true)}>
            <img src={images[activeImg]} alt={detail.name}
              style={{width:'100%',height:'100%',maxHeight:'70vh',objectFit:'cover',display:'block',transition:'transform .1s ease',transformOrigin:`${zoomPos.x}% ${zoomPos.y}%`,transform:zoom?'scale(2.2)':'scale(1)'}}/>
            {!zoom && <div style={{position:'absolute',bottom:10,right:10,background:'rgba(0,0,0,.5)',color:'#fff',fontSize:'10px',padding:'4px 8px',pointerEvents:'none'}}>🔍 Zoom</div>}
            <button onClick={e=>{e.stopPropagation();setFullscreen(true)}}
              style={{position:'absolute',top:10,right:10,background:'rgba(255,255,255,.85)',border:'none',width:32,height:32,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px'}}>⛶</button>
          </div>
          {images.length>1 && (
            <div style={{display:'flex',gap:'4px',padding:'8px',background:'#fff',overflowX:'auto'}}>
              {images.map((img,i)=>(
                <div key={i} onClick={()=>setActiveImg(i)}
                  style={{width:48,height:60,overflow:'hidden',cursor:'pointer',flexShrink:0,border:activeImg===i?'2px solid #111':'2px solid transparent'}}>
                  <img src={img} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>
                </div>
              ))}
            </div>
          )}
          {images.length>1 && (
            <>
              <button onClick={prev} style={{position:'absolute',left:8,top:'40%',transform:'translateY(-50%)',background:'rgba(255,255,255,.9)',border:'none',width:36,height:36,fontSize:'20px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2}}>‹</button>
              <button onClick={next} style={{position:'absolute',right:8,top:'40%',transform:'translateY(-50%)',background:'rgba(255,255,255,.9)',border:'none',width:36,height:36,fontSize:'20px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2}}>›</button>
            </>
          )}
        </div>

        <div className="modal-body">
          <button className="close-btn" style={{display:'block',marginLeft:'auto',marginBottom:'12px'}} onClick={onClose}>×</button>
          <div className="modal-cat">{detail.main_cat} {detail.sub_cat ? `· ${detail.sub_cat}` : ''}</div>
          <div className="modal-name serif">{detail.name}</div>
          <div className="modal-prices">
            <span className="modal-price">{fmt(detail.price)}</span>
            {detail.old_price && <span className="modal-old">{fmt(detail.old_price)}</span>}
          </div>
          {/* COLOR SWATCHES */}
          {hasColors && colors.length > 0 && (
            <div style={{marginBottom:'18px'}}>
              <p style={{fontSize:'11px',color:'#aaa',letterSpacing:'.07em',textTransform:'uppercase',marginBottom:'10px'}}>
                Rang: <span style={{color:'#111',fontWeight:500}}>{selectedColor}</span>
              </p>
              <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                {colors.map((c,i) => (
                  <div key={i} title={c.name} onClick={()=>selectColor(i)}
                    style={{width:28,height:28,borderRadius:'50%',background:c.hex,cursor:'pointer',
                      border:activeColorIdx===i?'2px solid #111':'2px solid transparent',
                      outline:activeColorIdx===i?'1px solid #111':'1px solid #ddd',
                      outlineOffset:'2px',
                      transition:'all .15s'}}/>
                ))}
              </div>
            </div>
          )}

          {detail.sizes?.length>0 && (
            <>
              <div className="sizes-lbl">O'lchamni tanlang</div>
              <div className="sizes-row">
                {detail.sizes.map(s=>(
                  <button key={s} className={`size-btn${selectedSize===s?' active':''}`} onClick={()=>setSelectedSize(s)}>{s}</button>
                ))}
              </div>
            </>
          )}
          {detail.sizes?.length>0 && !selectedSize && (
            <p style={{fontSize:'12px',color:'#c0392b',marginBottom:'10px'}}>⚠ Iltimos, o'lchamni tanlang</p>
          )}
          {detail.description && <div className="modal-desc">{detail.description}</div>}
          {(detail.volume || detail.duration) && (
            <div style={{display:'flex',gap:'12px',marginBottom:'16px',flexWrap:'wrap'}}>
              {detail.volume && (
                <div style={{background:'#f7f7f5',padding:'8px 14px',fontSize:'12px'}}>
                  <span style={{color:'#aaa',marginRight:'6px'}}>Hajmi:</span>
                  <span style={{fontWeight:500}}>{detail.volume}</span>
                </div>
              )}
              {detail.duration && (
                <div style={{background:'#f7f7f5',padding:'8px 14px',fontSize:'12px'}}>
                  <span style={{color:'#aaa',marginRight:'6px'}}>Muddat:</span>
                  <span style={{fontWeight:500}}>{detail.duration}</span>
                </div>
              )}
            </div>
          )}
          <button className="btn-dark"
            style={{width:'100%',padding:'14px',fontSize:'11px',letterSpacing:'.1em',opacity:(detail.sizes?.length>0&&!selectedSize)?0.6:1}}
            onClick={()=>{
              if (detail.sizes?.length>0 && !selectedSize) return
              onAdd(detail.id, selectedSize, selectedColor)
              onClose()
            }}>
            SAVATGA QO'SHISH {selectedSize?`— ${selectedSize}`:''}
          </button>
          <div className="modal-stock">Zaxirada: {detail.stock} ta</div>
        </div>
      </div>

      {fullscreen && (
        <div ref={fsRef}
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,.96)',zIndex:800,display:'flex',flexDirection:'column',touchAction:'pan-y'}}
          onClick={()=>setFullscreen(false)}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 16px',flexShrink:0}} onClick={e=>e.stopPropagation()}>
            <span style={{color:'rgba(255,255,255,.7)',fontSize:'13px'}}>{activeImg+1} / {images.length}</span>
            <button onClick={()=>setFullscreen(false)} style={{background:'rgba(255,255,255,.15)',border:'none',color:'#fff',width:36,height:36,fontSize:'18px',cursor:'pointer',borderRadius:'50%'}}>×</button>
          </div>
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}} onClick={e=>e.stopPropagation()}>
            <img src={images[activeImg]} alt={detail.name} style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain',userSelect:'none',pointerEvents:'none'}}/>
          </div>
          {images.length>1 && (
            <div style={{flexShrink:0,padding:'12px 16px 24px'}} onClick={e=>e.stopPropagation()}>
              <div style={{display:'flex',justifyContent:'center',gap:'16px',marginBottom:'12px'}}>
                <button onClick={prev} style={{background:'rgba(255,255,255,.15)',border:'1px solid rgba(255,255,255,.2)',color:'#fff',width:52,height:52,fontSize:'22px',cursor:'pointer',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>‹</button>
                <button onClick={next} style={{background:'rgba(255,255,255,.15)',border:'1px solid rgba(255,255,255,.2)',color:'#fff',width:52,height:52,fontSize:'22px',cursor:'pointer',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>›</button>
              </div>
              <div style={{display:'flex',gap:'6px',justifyContent:'center',flexWrap:'wrap'}}>
                {images.map((img,i)=>(
                  <div key={i} onClick={e=>{e.stopPropagation();setActiveImg(i)}}
                    style={{width:48,height:48,overflow:'hidden',cursor:'pointer',border:activeImg===i?'2px solid #fff':'2px solid rgba(255,255,255,.2)',borderRadius:'2px',flexShrink:0}}>
                    <img src={img} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}

function ProductCard({ p, onAdd, onDetail }) {
  const fmt = n => n?.toLocaleString('uz-UZ') + " so'm"
  const colors = p.colors || []
  const [activeCardColorIdx, setActiveCardColorIdx] = useState(0)
  const images = colors.length > 0
    ? (colors[activeCardColorIdx]?.images?.length > 0 ? colors[activeCardColorIdx].images : (p.img?[p.img]:[]))
    : (p.images?.length>0 ? p.images : (p.img?[p.img]:[]))
  const [imgIdx, setImgIdx] = useState(0)
  return (
    <div className="pcard" onClick={()=>onDetail(p.id)}>
      <div className="pcard-img-wrap">
        <img src={images[imgIdx]||'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=400'} alt={p.name} loading="lazy"/>
        {images.length>1 && (
          <>
            <button onClick={e=>{e.stopPropagation();setImgIdx(i=>(i-1+images.length)%images.length)}}
              className="card-arrow card-arrow-l"
              style={{position:'absolute',left:6,top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,.85)',border:'none',width:28,height:28,fontSize:'16px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',opacity:0}}>‹</button>
            <button onClick={e=>{e.stopPropagation();setImgIdx(i=>(i+1)%images.length)}}
              className="card-arrow card-arrow-r"
              style={{position:'absolute',right:6,top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,.85)',border:'none',width:28,height:28,fontSize:'16px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',opacity:0}}>›</button>
            <div style={{position:'absolute',bottom:8,left:'50%',transform:'translateX(-50%)',display:'flex',gap:'4px'}}>
              {images.map((_,i)=>(
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
      <div className="pcard-cat">{p.main_cat}{p.sub_cat?` · ${p.sub_cat}`:''}</div>
      <div className="pcard-name">{p.name}</div>
      {p.colors?.length > 0 && (
        <div style={{display:'flex',gap:'5px',marginBottom:'6px',flexWrap:'wrap'}}>
          {p.colors.map((c,i) => (
            <div key={i} title={c.name}
              style={{width:14,height:14,borderRadius:'50%',background:c.hex,border:'1.5px solid',borderColor:imgIdx===0&&i===0?'#111':'#ddd',cursor:'pointer',transition:'border-color .15s'}}
              onClick={e=>{e.stopPropagation();setImgIdx(0);}}/>
          ))}
        </div>
      )}
      <div className="pcard-prices">
        <span className="price-now">{fmt(p.price)}</span>
        {p.old_price && <span className="price-old">{fmt(p.old_price)}</span>}
      </div>
      <button className="btn-dark pcard-btn" onClick={e=>{e.stopPropagation();onAdd(p.id)}}>SAVATGA</button>
    </div>
  )
}