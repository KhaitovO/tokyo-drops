import { useState } from 'react'
import Head from 'next/head'

const PRODUCTS = [
  {id:1,name:"Shiseido Moisturizer SPF50",cat:"Kosmetika",price:285000,old:380000,img:"https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80",sizes:[],stock:18,isNew:true,isSale:true,desc:"Yaponiyaning eng mashhur Shiseido brendidan namlantiruvchi krem. SPF50 himoyasi bilan. Barcha teri turlari uchun mos."},
  {id:2,name:"Laneige Lip Sleeping Mask",cat:"Kosmetika",price:125000,old:null,img:"https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80",sizes:[],stock:32,isNew:true,isSale:false,desc:"Tungi lablarni parvarish qiluvchi maska. Ko'p yillik bestseller. Berry va Vanilla ta'mi."},
  {id:3,name:"Uniqlo Ultra Light Down",cat:"Kiyim",price:620000,old:820000,img:"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80",sizes:["XS","S","M","L","XL"],stock:9,isNew:false,isSale:true,desc:"Uniqlo ning ikonik engil pufliyak. Yaponiyada eng ko'p sotiladigan kiyimlardan biri. Yig'ma sumkaga sig'adi."},
  {id:4,name:"GU Wide Leg Trousers",cat:"Kiyim",price:245000,old:null,img:"https://images.unsplash.com/photo-1603251578711-3290ca1a0187?w=600&q=80",sizes:["S","M","L","XL"],stock:14,isNew:true,isSale:false,desc:"GU brendidan keng shimlar. Minimal va zamonaviy uslub. Linen aralashma material."},
  {id:5,name:"New Balance 574 JP",cat:"Poyabzal",price:890000,old:1100000,img:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",sizes:["39","40","41","42","43","44"],stock:5,isNew:false,isSale:true,desc:"Yaponiyada cheklangan nashrda chiqarilgan NB 574. Japan exclusive colorway."},
  {id:6,name:"Asics Gel-Kayano 30",cat:"Poyabzal",price:1150000,old:null,img:"https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80",sizes:["38","39","40","41","42","43"],stock:7,isNew:true,isSale:false,desc:"Yapon sport poyabzali. Qo'shimcha GEL amortizatsiya texnologiyasi bilan. Uzoq yurish uchun ideal."},
  {id:7,name:"Issey Miyake L'Eau",cat:"Atirlar",price:480000,old:620000,img:"https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80",sizes:[],stock:11,isNew:false,isSale:true,desc:"Issey Miyake ning klassik uniseks atiri. Yangi, toza va uzoq davomli. 100ml EDT."},
  {id:8,name:"Shiro Savon Parfum",cat:"Atirlar",price:390000,old:null,img:"https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80",sizes:[],stock:8,isNew:true,isSale:false,desc:"Yaponiyaning SHIRO brendidan nozik sovun atiri. Faqat Yaponiya do'konlarida sotiladi. 40ml."},
  {id:9,name:"Porter Yoshida Tote",cat:"Aksessuarlar",price:720000,old:950000,img:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",sizes:[],stock:4,isNew:false,isSale:true,desc:"Yaponiyaning ikonik PORTER brendidan sumka. 70 yillik hunarmandchilik. Nylon material."},
  {id:10,name:"Canmake Glow Fleur Cheeks",cat:"Kosmetika",price:89000,old:115000,img:"https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&q=80",sizes:[],stock:25,isNew:false,isSale:true,desc:"Yaponiyaning sevimli Canmake brendidan blush & highlighter paleti. 5 ta rang kombinatsiyasi."},
  {id:11,name:"Adidas Japan Pack Samba",cat:"Poyabzal",price:980000,old:null,img:"https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&q=80",sizes:["38","39","40","41","42","43","44"],stock:3,isNew:true,isSale:false,desc:"Faqat Yaponiyada chiqarilgan Adidas Samba maxsus to'plami. Cheklangan miqdor."},
  {id:12,name:"Uniqlo Linen Shirt",cat:"Kiyim",price:195000,old:260000,img:"https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=600&q=80",sizes:["XS","S","M","L","XL","XXL"],stock:20,isNew:false,isSale:true,desc:"Uniqlo premium linen ko'ylak. 100% kiyilishi yumshoq linen. Yoz mavsumi uchun ideal."},
]

const NEWS = [
  {id:1,date:"28 May 2025",title:"Yangi Uniqlo 2025 yoz kolleksiyasi keldi",desc:"Linen, keng shimlar va pastel ranglar — bu yozning eng trend buyumlari Yaponiyadan to'g'ridan-to'g'ri sizga."},
  {id:2,date:"20 May 2025",title:"Shiseido yangi SPF seriyasi — Yaponiyadan",desc:"Yaponiyada mashhurligi bo'yicha 1-o'rinni egallab turgan SPF kremlar endi bizda mavjud."},
  {id:3,date:"12 May 2025",title:"Nike Sacai x CLOT — cheklangan miqdor",desc:"Yaponiyaning ekskluziv sneaker drops'i. Bugun buyurtma bering, 2 haftada qo'lingizda."},
  {id:4,date:"5 May 2025",title:"Yetkazib berish muddatlari qisqardi: 10-14 kun",desc:"Yangi logistika hamkorligimiz tufayli buyurtmalar endi tezroq yetib keladi."},
  {id:5,date:"28 Apr 2025",title:"Issey Miyake yangi atir kolleksiyasi: Blossom",desc:"Yaponiya bahoridan ilhomlanib yaratilgan yangi atir liniyasi — faqat bizda."},
]

const CATS = ["Barchasi","Kosmetika","Kiyim","Poyabzal","Atirlar","Aksessuarlar"]
const ALL_SIZES = ["XS","S","M","L","XL","XXL","36","37","38","39","40","41","42","43","44"]
const fmt = n => n.toLocaleString('uz-UZ') + " so'm"

export default function Home() {
  const [products] = useState(PRODUCTS)
  const [page, setPage] = useState('store')
  const [cat, setCat] = useState('Barchasi')
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [detailId, setDetailId] = useState(null)
  const [mobileNav, setMobileNav] = useState(false)
  const [notif, setNotif] = useState(null)

  const filtered = cat === 'Barchasi' ? products : products.filter(p => p.cat === cat)
  const newArrivals = products.filter(p => p.isNew).slice(0, 4)
  const onSale = products.filter(p => p.isSale).slice(0, 4)
  const detail = products.find(p => p.id === detailId)
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)

  function notify(msg) {
    setNotif(msg)
    setTimeout(() => setNotif(null), 2200)
  }

  function addToCart(id) {
    const p = products.find(x => x.id === id)
    if (!p) return
    setCart(prev => {
      const ex = prev.find(x => x.id === id)
      if (ex) return prev.map(x => x.id === id ? { ...x, qty: x.qty + 1 } : x)
      return [...prev, { ...p, qty: 1 }]
    })
    notify('Savatga qo\'shildi ✓')
  }

  function removeFromCart(id) { setCart(c => c.filter(x => x.id !== id)) }
  function changeQty(id, d) {
    setCart(c => c.map(x => x.id === id ? { ...x, qty: x.qty + d } : x).filter(x => x.qty > 0))
  }

  function goPage(p, c) {
    setPage(p)
    if (c) setCat(c)
    setMobileNav(false)
    window.scrollTo(0, 0)
  }

  return (
    <>
      <Head>
        <title>TOKYO Drops — Yaponiyadan O'zbekistonga</title>
        <meta name="description" content="Yaponiyaning original brendlari — Uniqlo, Nike, Shiseido va boshqalar. To'g'ridan-to'g'ri sizga yetkazamiz." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* NOTIFICATION */}
      {notif && <div className="notif show">{notif}</div>}

      {/* MOBILE NAV */}
      <div className={`mobile-nav${mobileNav ? ' open' : ''}`}>
        <button className="mobile-nav-close" onClick={() => setMobileNav(false)}>×</button>
        {['Barchasi','Kosmetika','Kiyim','Poyabzal','Atirlar','Aksessuarlar'].map(c => (
          <a key={c} onClick={() => goPage('store', c)}>{c}</a>
        ))}
        <a onClick={() => goPage('news')}>Yangiliklar</a>
      </div>

      {/* HEADER */}
      <header className="header">
        <div className="header-inner">
          <div className="logo" onClick={() => goPage('store', 'Barchasi')}>
            TOKYO <em>Drops</em>
          </div>
          <nav className="nav">
            <a onClick={() => goPage('store','Barchasi')} className={page==='store'?'active':''}>Do'kon</a>
            {CATS.slice(1).map(c => <a key={c} onClick={() => goPage('store',c)}>{c}</a>)}
            <a onClick={() => goPage('news')} className={page==='news'?'active':''}>Yangiliklar</a>
          </nav>
          <div className="header-actions">
            <button className="icon-btn" onClick={() => setCartOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>
            <button className="hamburger" onClick={() => setMobileNav(true)}>
              <span/><span/><span/>
            </button>
          </div>
        </div>
      </header>

      {/* TICKER */}
      <div className="ticker">
        <span className="ticker-track">
          {'🇯🇵 YAPONIYADAN TO\'G\'RIDAN-TO\'G\'RI · UNIQLO · NIKE · SHISEIDO · ISSEY MIYAKE · GU · PORTER · CANMAKE · NEW BALANCE · ADIDAS JP · 10-14 KUNDA YETKAZIB BERAMIZ · PAYME · CLICK · '.repeat(3)}
        </span>
      </div>

      {/* MAIN */}
      <main>
        {page === 'store' && (
          <>
            {/* HERO */}
            <section className="hero">
              <p className="hero-eyebrow">Yaponiyadan — O'zbekistonga</p>
              <h1 className="hero-title serif">
                Original<br /><em>Yaponiyadan</em>
              </h1>
              <p className="hero-sub">Uniqlo, Nike, Shiseido va yuzlab boshqa yapon brendlari. To'g'ridan-to'g'ri, tez va ishonchli.</p>
              <div className="hero-btns">
                <button className="btn-dark" onClick={() => setCat('Barchasi')}>Barcha mahsulotlar</button>
                <button className="btn-outline" onClick={() => goPage('news')}>Yangiliklar</button>
              </div>
            </section>

            {/* CATS */}
            <div className="cats-wrap">
              <div className="cats-scroll">
                {CATS.map(c => (
                  <button key={c} className={`cat-pill${cat === c ? ' active' : ''}`} onClick={() => setCat(c)}>{c}</button>
                ))}
              </div>
            </div>

            {cat !== 'Barchasi' ? (
              <div className="section">
                <div className="section-head">
                  <span className="section-title">{cat} — {filtered.length} ta mahsulot</span>
                </div>
                <div className="grid">
                  {filtered.map(p => <ProductCard key={p.id} p={p} onAdd={addToCart} onDetail={setDetailId} />)}
                </div>
              </div>
            ) : (
              <>
                <div className="section">
                  <div className="section-head">
                    <span className="section-title">Yangi keldi</span>
                    <span className="see-all" onClick={() => setCat('Barchasi')}>Barchasi</span>
                  </div>
                  <div className="grid">
                    {newArrivals.map(p => <ProductCard key={p.id} p={p} onAdd={addToCart} onDetail={setDetailId} />)}
                  </div>
                </div>
                <div className="cta-banner">
                  <p style={{fontSize:'10px',letterSpacing:'.18em',color:'#999',textTransform:'uppercase',marginBottom:'14px'}}>Har haftada yangi mahsulotlar</p>
                  <h2 className="cta-title serif">Telegram kanalimizga<br /><em>obuna bo'ling</em></h2>
                  <p className="cta-sub">Yangi kelgan mahsulotlar, chegirmalar va ekskluziv takliflardan birinchilar orasida xabardor bo'ling</p>
                  <button className="btn-dark">TELEGRAM KANALGA O'TISH</button>
                </div>
                <div className="section">
                  <div className="section-head">
                    <span className="section-title">Aksiyada</span>
                  </div>
                  <div className="grid">
                    {onSale.map(p => <ProductCard key={p.id} p={p} onAdd={addToCart} onDetail={setDetailId} />)}
                  </div>
                </div>
                <div className="features">
                  <div className="features-grid">
                    {[
                      {icon:'🇯🇵',t:'100% Original',s:'Yaponiyadan to\'g\'ridan-to\'g\'ri'},
                      {icon:'⚡',t:'10–14 kun',s:'Tez yetkazib berish'},
                      {icon:'💳',t:'Payme · Click',s:'Qulay to\'lov usullari'},
                      {icon:'✅',t:'3+ yillik tajriba',s:'1000+ mamnun mijoz'},
                    ].map(f => (
                      <div key={f.t}>
                        <div className="feat-icon">{f.icon}</div>
                        <div className="feat-title">{f.t}</div>
                        <div className="feat-sub">{f.s}</div>
                      </div>
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
            {NEWS.map(n => (
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
            <div className="footer-brand serif">TOKYO <em>Drops</em></div>
            <div className="footer-desc">Yaponiyaning eng yaxshi brendlari — to'g'ridan-to'g'ri sizga. Original mahsulotlar, tez yetkazib berish, qulay to'lov.</div>
          </div>
          <div className="footer-col">
            <h4>Do'kon</h4>
            {CATS.slice(1).map(c => <a key={c} onClick={() => goPage('store',c)}>{c}</a>)}
          </div>
          <div className="footer-col">
            <h4>Ma'lumot</h4>
            <a>Yetkazib berish</a>
            <a>Qaytarish</a>
            <a>Biz haqimizda</a>
            <a>Aloqa</a>
          </div>
          <div className="footer-col">
            <h4>Ijtimoiy</h4>
            <a>Telegram</a>
            <a>Instagram</a>
            <a>TikTok</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2025 TOKYO Drops. Barcha huquqlar himoyalangan.</span>
          <span>Toshkent, O'zbekiston</span>
        </div>
      </footer>

      {/* CART DRAWER */}
      <div className={`overlay${cartOpen ? ' show' : ''}`} onClick={() => setCartOpen(false)} />
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
              <img className="cart-item-img" src={item.img} alt={item.name} />
              <div className="cart-item-info">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-price">{fmt(item.price)}</div>
                <div className="qty-row">
                  <button className="qty-btn" onClick={() => changeQty(item.id,-1)}>−</button>
                  <span className="qty-num">{item.qty}</span>
                  <button className="qty-btn" onClick={() => changeQty(item.id,1)}>+</button>
                  <button className="rm-btn" onClick={() => removeFromCart(item.id)}>O'chir</button>
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
            <button className="btn-dark" style={{width:'100%',padding:'14px',fontSize:'11px',letterSpacing:'.1em'}}>BUYURTMA BERISH</button>
            <p className="pay-note">Payme · Click · Naqd pul</p>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      <div className={`modal-bg${detail ? ' show' : ''}`} onClick={() => setDetailId(null)}>
        {detail && (
          <div className="modal" onClick={e => e.stopPropagation()}>
            <img className="modal-img" src={detail.img} alt={detail.name} />
            <div className="modal-body">
              <button className="close-btn" style={{display:'block',marginLeft:'auto',marginBottom:'12px'}} onClick={() => setDetailId(null)}>×</button>
              <div className="modal-cat">{detail.cat}</div>
              <div className="modal-name serif">{detail.name}</div>
              <div className="modal-prices">
                <span className="modal-price">{fmt(detail.price)}</span>
                {detail.old && <span className="modal-old">{fmt(detail.old)}</span>}
              </div>
              {detail.sizes.length > 0 && (
                <>
                  <div className="sizes-lbl">O'lchamlar</div>
                  <div className="sizes-row">
                    {detail.sizes.map(s => <button key={s} className="size-btn">{s}</button>)}
                  </div>
                </>
              )}
              <div className="modal-desc">{detail.desc}</div>
              <button className="btn-dark" style={{width:'100%',padding:'14px',fontSize:'11px',letterSpacing:'.1em'}}
                onClick={() => { addToCart(detail.id); setDetailId(null) }}>
                SAVATGA QO'SHISH
              </button>
              <div className="modal-stock">Zaxirada: {detail.stock} ta</div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function ProductCard({ p, onAdd, onDetail }) {
  const fmt = n => n.toLocaleString('uz-UZ') + " so'm"
  return (
    <div className="pcard" onClick={() => onDetail(p.id)}>
      <div className="pcard-img-wrap">
        <img src={p.img} alt={p.name} loading="lazy" />
        <div className="ptags">
          {p.isNew && <span className="ptag ptag-new">Yangi</span>}
          {p.isSale && <span className="ptag ptag-sale">Sale</span>}
        </div>
      </div>
      <div className="pcard-cat">{p.cat}</div>
      <div className="pcard-name">{p.name}</div>
      <div className="pcard-prices">
        <span className="price-now">{fmt(p.price)}</span>
        {p.old && <span className="price-old">{fmt(p.old)}</span>}
      </div>
      <button className="btn-dark pcard-btn" onClick={e => { e.stopPropagation(); onAdd(p.id) }}>
        SAVATGA
      </button>
    </div>
  )
}
