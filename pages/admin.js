import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

const CATEGORIES = {
  "Ayollar": ["T-shirt/Sviter", "Ko'ylak/Bluzka", "Shim/Yubka", "Sho'rtik", "Auter/Kurtka", "Ichki kiyim", "Aksessuarlar", "Oyoq kiyimi"],
  "Erkaklar": ["T-shirt/Sviter", "Ko'ylak/Polo", "Shim", "Sho'rtik", "Auter/Kurtka", "Ichki kiyim", "Oyoq kiyimi"],
  "Bolalar": ["Qizlar", "O'g'il bolalar"],
  "Baby": ["Kiyimlar"],
  "Kosmetika": ["Yuz uchun", "Qo'l uchun", "Oyoq uchun", "Quyoshdan himoya", "Maska"],
}
const MAIN_CATS = Object.keys(CATEGORIES)
const SIZES_ALL = ["XS","S","M","L","XL","XXL","36","37","38","39","40","41","42","43","44"]
const KIDS_SIZES = ["80cm","90cm","100cm","110cm","120cm","130cm","140cm","150cm","160cm","XS(kids)","S(kids)","M(kids)","L(kids)"]
const fmt = n => n?.toLocaleString('uz-UZ') + " so'm"
const CLOUD_NAME = "dxt6bj2cx"
const UPLOAD_PRESET = "tokyo-drops"

const PRESET_COLORS = [
  {name:"Qora", hex:"#1a1a1a"}, {name:"Oq", hex:"#FFFFFF"},
  {name:"Kulrang", hex:"#9E9E9E"}, {name:"Kumush", hex:"#CFD8DC"},
  {name:"Qo'ng'ir", hex:"#795548"}, {name:"Qizil", hex:"#C62828"},
  {name:"Pushti", hex:"#E91E8C"}, {name:"Och pushti", hex:"#F8BBD9"},
  {name:"To'q sariq", hex:"#F57F17"}, {name:"Sariq", hex:"#FDD835"},
  {name:"Ko'k", hex:"#1565C0"}, {name:"Havorang", hex:"#29B6F6"},
  {name:"Navy", hex:"#0D1B4B"}, {name:"Yashil", hex:"#2E7D32"},
  {name:"Och yashil", hex:"#A5D6A7"}, {name:"Mint", hex:"#B2DFDB"},
  {name:"Binafsha", hex:"#6A1B9A"}, {name:"Liloviy", hex:"#CE93D8"},
  {name:"Olive", hex:"#827717"}, {name:"Terakota", hex:"#BF360C"},
]

const EMPTY_FORM = {
  name:"", main_cat:"Ayollar", sub_cat:"T-shirt/Sviter",
  price:"", old:"", sizes:[], stock:"",
  is_new:false, is_sale:false, description:"",
  volume:"", duration:"", colors:[],
}

export default function Admin() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [notif, setNotif] = useState(null)
  const [tab, setTab] = useState('products')
  const [uploading, setUploading] = useState(false)
  const [filterCat, setFilterCat] = useState('Barchasi')
  const [activeColorIdx, setActiveColorIdx] = useState(0)
  const [newColorName, setNewColorName] = useState('')
  const [newColorHex, setNewColorHex] = useState('#1a1a1a')
  const [urlInputs, setUrlInputs] = useState({})
  const fileInputRef = useRef()

  useEffect(() => { fetchProducts(); fetchOrders() }, [])

  async function fetchProducts() {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  async function fetchOrders() {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    setOrders(data || [])
  }

  function notify(msg) { setNotif(msg); setTimeout(() => setNotif(null), 2500) }
  function upd(k, v) { setForm(f => ({ ...f, [k]: v })) }
  function toggleSz(s) { setForm(f => ({ ...f, sizes: f.sizes.includes(s) ? f.sizes.filter(x => x !== s) : [...f.sizes, s] })) }

  function handleMainCatChange(val) {
    setForm(f => ({ ...f, main_cat: val, sub_cat: CATEGORIES[val]?.[0] || '' }))
  }

  function openAdd() {
    setForm({ ...EMPTY_FORM, sub_cat: CATEGORIES["Ayollar"][0] })
    setEditId(null)
    setActiveColorIdx(0)
    setUrlInputs({})
    setFormOpen(true)
  }

  function openEdit(p) {
    setForm({
      name: p.name || '',
      main_cat: p.main_cat || 'Ayollar',
      sub_cat: p.sub_cat || '',
      price: String(p.price || ''),
      old: p.old_price ? String(p.old_price) : '',
      sizes: p.sizes || [],
      stock: String(p.stock || ''),
      is_new: p.is_new || false,
      is_sale: p.is_sale || false,
      description: p.description || '',
      volume: p.volume || '',
      duration: p.duration || '',
      colors: p.colors || [],
    })
    setEditId(p.id)
    setActiveColorIdx(0)
    setUrlInputs({})
    setFormOpen(true)
  }

  // COLOR FUNCTIONS
  function addColor() {
    if (!newColorName.trim()) { notify("Rang nomini kiriting"); return }
    if (form.colors.find(c => c.hex === newColorHex)) { notify("Bu rang allaqachon bor"); return }
    const newColors = [...form.colors, { name: newColorName.trim(), hex: newColorHex, images: [] }]
    setForm(f => ({ ...f, colors: newColors }))
    setActiveColorIdx(newColors.length - 1)
    setNewColorName('')
    setNewColorHex('#1a1a1a')
    notify("Rang qo'shildi ✓")
  }

  function removeColor(idx) {
    setForm(f => ({ ...f, colors: f.colors.filter((_, i) => i !== idx) }))
    setActiveColorIdx(0)
  }

  function updateColorImages(colorIdx, newImages) {
    setForm(f => ({
      ...f,
      colors: f.colors.map((c, i) => i === colorIdx ? { ...c, images: newImages } : c)
    }))
  }

  async function uploadColorImages(colorIdx, files) {
    if (!files.length) return
    setUploading(true)
    const uploaded = []
    for (const file of files) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('upload_preset', UPLOAD_PRESET)
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd })
      const data = await res.json()
      if (data.secure_url) uploaded.push(data.secure_url)
    }
    const existing = form.colors[colorIdx]?.images || []
    updateColorImages(colorIdx, [...existing, ...uploaded])
    setUploading(false)
    notify(`${uploaded.length} ta rasm yuklandi ✓`)
  }

  function addUrlToColor(colorIdx) {
    const url = (urlInputs[colorIdx] || '').trim()
    if (!url.startsWith('http')) { notify("To'g'ri URL kiriting"); return }
    const existing = form.colors[colorIdx]?.images || []
    updateColorImages(colorIdx, [...existing, url])
    setUrlInputs(u => ({ ...u, [colorIdx]: '' }))
    notify("Rasm qo'shildi ✓")
  }

  function removeColorImage(colorIdx, imgIdx) {
    const existing = form.colors[colorIdx]?.images || []
    updateColorImages(colorIdx, existing.filter((_, i) => i !== imgIdx))
  }

  async function del(id) {
    if (!window.confirm("O'chirilsinmi?")) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (!error) { fetchProducts(); notify("O'chirildi") }
    else notify("Xato: " + error.message)
  }

  async function save() {
    if (!form.name.trim() || !form.price) { notify("Nom va narx majburiy!"); return }
    const firstImg = form.colors?.[0]?.images?.[0] || ''
    const obj = {
      name: form.name,
      main_cat: form.main_cat,
      sub_cat: form.sub_cat || '',
      cat: form.main_cat,
      price: +form.price,
      old_price: form.old ? +form.old : null,
      img: firstImg,
      images: form.colors?.[0]?.images || [],
      colors: form.colors,
      sizes: form.sizes,
      stock: +form.stock || 0,
      is_new: form.is_new,
      is_sale: form.is_sale,
      description: form.description || '',
      volume: form.volume || '',
      duration: form.duration || '',
    }
    let error
    if (editId) {
      const res = await supabase.from('products').update(obj).eq('id', editId)
      error = res.error
    } else {
      const res = await supabase.from('products').insert([obj])
      error = res.error
    }
    if (!error) {
      fetchProducts()
      setFormOpen(false)
      notify(editId ? "Yangilandi ✓" : "Qo'shildi ✓")
    } else notify("Xato: " + error.message)
  }

  async function updateOrderStatus(id, status) {
    await supabase.from('orders').update({ status }).eq('id', id)
    fetchOrders()
  }

  const filteredProducts = filterCat === 'Barchasi' ? products : products.filter(p => p.main_cat === filterCat)
  const activeColor = form.colors[activeColorIdx]

  const stats = [
    { l: "Jami mahsulot", v: products.length, c: '#111' },
    { l: "Aksiyada", v: products.filter(p => p.is_sale).length, c: '#c0392b' },
    { l: "Yangi", v: products.filter(p => p.is_new).length, c: '#2471a3' },
    { l: "Buyurtmalar", v: orders.length, c: '#1a7a4a' },
  ]
  const statusLabel = { new: 'Yangi', processing: 'Jarayonda', delivered: 'Yetkazildi', cancelled: 'Bekor' }
  const statusColor = { new: '#2471a3', processing: '#b7950b', delivered: '#1a7a4a', cancelled: '#c0392b' }

  return (
    <>
      <Head><title>Admin — TOKYO Drops</title></Head>
      {notif && <div className="notif show">{notif}</div>}

      <header className="header">
        <div className="header-inner">
          <div className="logo serif">TOKYO <em>Drops</em>
            <span style={{fontSize:'11px',color:'#999',fontFamily:'DM Sans',fontStyle:'normal',marginLeft:'8px'}}>Admin</span>
          </div>
          <Link href="/" style={{fontSize:'12px',color:'#888',letterSpacing:'.06em'}}>← Do'konga qayt</Link>
        </div>
      </header>

      <div className="admin-page">
        <div className="admin-top">
          <div>
            <div className="admin-heading serif">Admin panel</div>
            <div className="admin-sub">{products.length} ta mahsulot · {orders.length} ta buyurtma</div>
          </div>
          <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
            <button className={tab==='products'?'btn-dark':'btn-outline'} onClick={()=>setTab('products')}>Mahsulotlar</button>
            <button className={tab==='orders'?'btn-dark':'btn-outline'} onClick={()=>setTab('orders')}>Buyurtmalar</button>
            {tab==='products' && <button className="btn-dark" onClick={openAdd}>+ Qo'shish</button>}
          </div>
        </div>

        <div className="stats">
          {stats.map(s => (
            <div key={s.l} className="stat">
              <div className="stat-n" style={{color:s.c}}>{s.v}</div>
              <div className="stat-l">{s.l}</div>
            </div>
          ))}
        </div>

        {tab === 'products' && (
          <>
            <div style={{display:'flex',gap:'8px',marginBottom:'16px',flexWrap:'wrap'}}>
              {['Barchasi', ...MAIN_CATS].map(c => (
                <button key={c} onClick={()=>setFilterCat(c)}
                  style={{padding:'6px 14px',fontSize:'11px',fontWeight:500,letterSpacing:'.05em',border:'1px solid',borderColor:filterCat===c?'#111':'#ddd',background:filterCat===c?'#111':'transparent',color:filterCat===c?'#fff':'#666',cursor:'pointer'}}>
                  {c}
                </button>
              ))}
            </div>
            {loading ? (
              <p style={{textAlign:'center',padding:'40px',color:'#999'}}>Yuklanmoqda...</p>
            ) : (
              <div className="table-wrap">
                <div className="table-head">
                  <span className="th"></span>
                  <span className="th">Mahsulot</span>
                  <span className="th">Kategoriya</span>
                  <span className="th">Narx</span>
                  <span className="th">Zaxira</span>
                  <span className="th">Status</span>
                  <span className="th">Amallar</span>
                </div>
                {filteredProducts.length === 0 && (
                  <div style={{padding:'40px',textAlign:'center',color:'#999'}}>Mahsulot yo'q</div>
                )}
                {filteredProducts.map(p => (
                  <div key={p.id} className="table-row">
                    <img src={p.img||'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=80'} style={{width:40,height:50,objectFit:'cover'}} alt=""/>
                    <div>
                      <div className="td" style={{fontWeight:500}}>{p.name}</div>
                      {p.colors?.length > 0 && (
                        <div style={{display:'flex',gap:'3px',marginTop:'4px'}}>
                          {p.colors.map((c,i) => (
                            <div key={i} title={c.name} style={{width:12,height:12,borderRadius:'50%',background:c.hex,border:'1px solid #ddd'}}/>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="td">{p.main_cat}</div>
                      <div className="td-muted">{p.sub_cat}</div>
                    </div>
                    <div>
                      <div className="td" style={{fontWeight:600}}>{fmt(p.price)}</div>
                      {p.old_price && <div className="td-muted" style={{textDecoration:'line-through'}}>{fmt(p.old_price)}</div>}
                    </div>
                    <div className="td" style={{color:p.stock<5?'#c0392b':'#111',fontWeight:p.stock<5?600:400}}>{p.stock}</div>
                    <div style={{display:'flex',flexDirection:'column',gap:'3px'}}>
                      {p.is_new && <span style={{fontSize:'9px',background:'#111',color:'#fff',padding:'2px 5px',fontWeight:700}}>YANGI</span>}
                      {p.is_sale && <span style={{fontSize:'9px',background:'#c0392b',color:'#fff',padding:'2px 5px',fontWeight:700}}>SALE</span>}
                    </div>
                    <div className="trow-actions">
                      <button className="act-btn act-edit" onClick={()=>openEdit(p)}>Tahrir</button>
                      <button className="act-btn act-del" onClick={()=>del(p.id)}>O'chir</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'orders' && (
          <div className="table-wrap">
            <div style={{display:'grid',gridTemplateColumns:'1fr 130px 150px 130px 110px',padding:'10px 16px',background:'#f7f7f5',borderBottom:'1px solid #e4e2dd'}}>
              {['Mijoz','Telefon','Jami','Status','Sana'].map(h=><span key={h} className="th">{h}</span>)}
            </div>
            {orders.length === 0 && <div style={{padding:'40px',textAlign:'center',color:'#999'}}>Buyurtma yo'q</div>}
            {orders.map(o => (
              <div key={o.id} style={{display:'grid',gridTemplateColumns:'1fr 130px 150px 130px 110px',padding:'12px 16px',borderBottom:'1px solid #f5f5f5',alignItems:'center'}}>
                <div>
                  <div style={{fontSize:'13px',fontWeight:500}}>{o.customer_name||"Noma'lum"}</div>
                  <div style={{fontSize:'11px',color:'#aaa'}}>{o.address}</div>
                </div>
                <div style={{fontSize:'13px'}}>{o.phone}</div>
                <div style={{fontSize:'13px',fontWeight:600}}>{fmt(o.total)}</div>
                <select value={o.status} onChange={e=>updateOrderStatus(o.id,e.target.value)}
                  style={{fontSize:'11px',border:'1px solid #ddd',padding:'4px 8px',background:'#fff',color:statusColor[o.status]||'#111',fontWeight:600}}>
                  {Object.entries(statusLabel).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
                <div style={{fontSize:'11px',color:'#aaa'}}>{new Date(o.created_at).toLocaleDateString('uz-UZ')}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FORM MODAL */}
      {formOpen && (
        <div className="form-bg show" onClick={()=>setFormOpen(false)}>
          <div className="form-box" onClick={e=>e.stopPropagation()} style={{maxWidth:'580px'}}>
            <div className="form-title serif">{editId ? "Tahrirlash" : "Yangi mahsulot"}</div>

            {/* CATEGORIES */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'16px'}}>
              <div className="field" style={{marginBottom:0}}>
                <label>Asosiy kategoriya</label>
                <select value={form.main_cat} onChange={e=>handleMainCatChange(e.target.value)}>
                  {MAIN_CATS.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="field" style={{marginBottom:0}}>
                <label>Kichik kategoriya</label>
                <select value={form.sub_cat} onChange={e=>upd('sub_cat',e.target.value)} disabled={!CATEGORIES[form.main_cat]?.length}>
                  {(CATEGORIES[form.main_cat]||[]).map(c=><option key={c}>{c}</option>)}
                  {!CATEGORIES[form.main_cat]?.length && <option value="">—</option>}
                </select>
              </div>
            </div>

            {/* BASIC FIELDS */}
            {[
              {l:"Nomi *", k:"name", t:"text", ph:"Masalan: Uniqlo Crew Neck T-shirt"},
              {l:"Narx (so'm) *", k:"price", t:"number", ph:"185000"},
              {l:"Eski narx (so'm)", k:"old", t:"number", ph:"Bo'lmasa bo'sh qoldiring"},
              {l:"Zaxira (dona)", k:"stock", t:"number", ph:"10"},
              {l:"Tavsif", k:"description", t:"text", ph:"Mahsulot haqida qisqacha"},
            ].map(({l,k,t,ph}) => (
              <div key={k} className="field">
                <label>{l}</label>
                <input type={t} value={form[k]||''} placeholder={ph} onChange={e=>upd(k,e.target.value)}/>
              </div>
            ))}

            {/* KOSMETIKA EXTRA */}
            {form.main_cat === 'Kosmetika' && (
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'16px'}}>
                <div className="field" style={{marginBottom:0}}>
                  <label>Hajmi (ml/g/dona)</label>
                  <input type="text" value={form.volume||''} placeholder="50ml, 30g..." onChange={e=>upd('volume',e.target.value)}/>
                </div>
                <div className="field" style={{marginBottom:0}}>
                  <label>Muddat / Necha kunlik</label>
                  <input type="text" value={form.duration||''} placeholder="30 kunlik..." onChange={e=>upd('duration',e.target.value)}/>
                </div>
              </div>
            )}

            {/* SIZES */}
            {form.main_cat !== 'Kosmetika' && (
              <div className="field">
                <label>O'lchamlar</label>
                <div className="sizes-picker">
                  {(form.main_cat==='Bolalar'||form.main_cat==='Baby' ? KIDS_SIZES : SIZES_ALL).map(s=>(
                    <button key={s} type="button" className={`sp${form.sizes.includes(s)?' active':''}`} onClick={()=>toggleSz(s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* COLORS */}
            <div className="field">
              <label>Ranglar va rasmlar</label>

              {/* Color tabs */}
              {form.colors.length > 0 && (
                <div style={{display:'flex',gap:'6px',marginBottom:'12px',flexWrap:'wrap'}}>
                  {form.colors.map((c, i) => (
                    <div key={i} onClick={()=>setActiveColorIdx(i)}
                      style={{display:'flex',alignItems:'center',gap:'6px',padding:'5px 10px',border:'1.5px solid',borderColor:activeColorIdx===i?'#111':'#ddd',background:activeColorIdx===i?'#f7f7f5':'#fff',cursor:'pointer',fontSize:'12px',borderRadius:'2px'}}>
                      <div style={{width:14,height:14,borderRadius:'50%',background:c.hex,border:'1px solid rgba(0,0,0,.1)',flexShrink:0}}/>
                      <span style={{fontWeight:activeColorIdx===i?500:400}}>{c.name}</span>
                      <span style={{fontSize:'10px',color:'#bbb'}}>({c.images?.length||0})</span>
                      <button type="button" onClick={e=>{e.stopPropagation();removeColor(i)}}
                        style={{background:'none',border:'none',color:'#ccc',cursor:'pointer',fontSize:'15px',padding:0,lineHeight:1,marginLeft:'2px'}}>×</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Active color image section */}
              {form.colors.length > 0 && activeColor && (
                <div style={{background:'#fafaf8',border:'1px solid #e4e2dd',padding:'14px',marginBottom:'12px',borderRadius:'2px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'10px'}}>
                    <div style={{width:14,height:14,borderRadius:'50%',background:activeColor.hex,border:'1px solid rgba(0,0,0,.1)'}}/>
                    <span style={{fontSize:'11px',color:'#666',letterSpacing:'.05em',textTransform:'uppercase'}}>{activeColor.name} uchun rasmlar</span>
                  </div>

                  {/* Image previews */}
                  {activeColor.images?.length > 0 && (
                    <div style={{display:'flex',gap:'6px',marginBottom:'10px',flexWrap:'wrap'}}>
                      {activeColor.images.map((img, i) => (
                        <div key={i} style={{position:'relative',width:56,height:70,flexShrink:0}}>
                          <img src={img} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'1px'}} alt=""/>
                          <button type="button" onClick={()=>removeColorImage(activeColorIdx, i)}
                            style={{position:'absolute',top:-5,right:-5,background:'#c0392b',color:'#fff',border:'none',width:16,height:16,borderRadius:'50%',fontSize:'10px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1}}>×</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* File upload */}
                  <input type="file" multiple accept="image/*"
                    id={`fu-${activeColorIdx}`} style={{display:'none'}}
                    onChange={e=>uploadColorImages(activeColorIdx, Array.from(e.target.files))}/>
                  <label htmlFor={`fu-${activeColorIdx}`}
                    style={{display:'inline-block',border:'1px dashed #ccc',padding:'7px 14px',fontSize:'12px',cursor:'pointer',color:'#555',marginBottom:'8px',borderRadius:'2px'}}>
                    {uploading ? '⏳ Yuklanmoqda...' : '📸 Rasm yuklash'}
                  </label>

                  {/* URL input */}
                  <div style={{display:'flex',gap:'6px'}}>
                    <input type="text"
                      value={urlInputs[activeColorIdx]||''}
                      onChange={e=>setUrlInputs(u=>({...u,[activeColorIdx]:e.target.value}))}
                      onKeyDown={e=>{if(e.key==='Enter'){addUrlToColor(activeColorIdx)}}}
                      placeholder="URL: https://..."
                      style={{flex:1,border:'1px solid #e4e2dd',padding:'7px 10px',fontSize:'12px',background:'#fff'}}/>
                    <button type="button" onClick={()=>addUrlToColor(activeColorIdx)}
                      style={{background:'#111',color:'#fff',border:'none',padding:'7px 12px',fontSize:'11px',cursor:'pointer'}}>+ Qo'sh</button>
                  </div>
                </div>
              )}

              {/* Add new color */}
              <div style={{border:'1px solid #e4e2dd',padding:'14px',borderRadius:'2px'}}>
                <p style={{fontSize:'11px',color:'#888',letterSpacing:'.05em',textTransform:'uppercase',marginBottom:'10px'}}>Yangi rang qo'shish</p>

                {/* Preset swatches */}
                <div style={{display:'flex',gap:'5px',flexWrap:'wrap',marginBottom:'12px'}}>
                  {PRESET_COLORS.map((c,i) => (
                    <div key={i} title={c.name}
                      onClick={()=>{setNewColorName(c.name);setNewColorHex(c.hex)}}
                      style={{width:22,height:22,borderRadius:'50%',background:c.hex,border:newColorHex===c.hex?'2.5px solid #111':'1.5px solid #ddd',cursor:'pointer',flexShrink:0,transition:'transform .15s'}}
                      onMouseEnter={e=>e.currentTarget.style.transform='scale(1.2)'}
                      onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}/>
                  ))}
                </div>

                <div style={{display:'grid',gridTemplateColumns:'1fr 40px 100px auto',gap:'8px',alignItems:'center'}}>
                  <input type="text" value={newColorName}
                    onChange={e=>setNewColorName(e.target.value)}
                    onKeyDown={e=>{if(e.key==='Enter')addColor()}}
                    placeholder="Rang nomi..."
                    style={{border:'1px solid #e4e2dd',padding:'8px 10px',fontSize:'12px'}}/>
                  <input type="color" value={newColorHex}
                    onChange={e=>setNewColorHex(e.target.value)}
                    style={{width:'40px',height:'34px',border:'1px solid #e4e2dd',cursor:'pointer',padding:'2px'}}/>
                  <input type="text" value={newColorHex}
                    onChange={e=>setNewColorHex(e.target.value)}
                    placeholder="#000000"
                    style={{border:'1px solid #e4e2dd',padding:'8px 10px',fontSize:'12px',fontFamily:'monospace'}}/>
                  <button type="button" onClick={addColor}
                    style={{background:'#111',color:'#fff',border:'none',padding:'8px 14px',fontSize:'12px',cursor:'pointer',whiteSpace:'nowrap'}}>+ Rang</button>
                </div>
              </div>
            </div>

            <div className="checks">
              <label><input type="checkbox" checked={form.is_new} onChange={e=>upd('is_new',e.target.checked)}/> Yangi</label>
              <label><input type="checkbox" checked={form.is_sale} onChange={e=>upd('is_sale',e.target.checked)}/> Aksiyada</label>
            </div>
            <div className="form-actions">
              <button className="btn-dark" onClick={save}>SAQLASH</button>
              <button className="btn-outline" onClick={()=>setFormOpen(false)}>BEKOR</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
