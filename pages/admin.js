import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

const CATS = ["Kosmetika","Kiyim","Poyabzal","Atirlar","Aksessuarlar"]
const SIZES_ALL = ["XS","S","M","L","XL","XXL","36","37","38","39","40","41","42","43","44"]
const fmt = n => n?.toLocaleString('uz-UZ') + " so'm"
const EMPTY = {name:"",cat:"Kosmetika",price:"",old:"",images:[],sizes:[],stock:"",is_new:false,is_sale:false,description:""}
const CLOUD_NAME = "dxt6bj2cx"
const UPLOAD_PRESET = "tokyo-drops"

export default function Admin() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [notif, setNotif] = useState(null)
  const [tab, setTab] = useState('products')
  const [uploading, setUploading] = useState(false)
  const [activeImg, setActiveImg] = useState(0)
  const fileRef = useRef()

  useEffect(() => { fetchProducts(); fetchOrders() }, [])

  async function fetchProducts() {
    setLoading(true)
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (!error) setProducts(data || [])
    setLoading(false)
  }

  async function fetchOrders() {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (data) setOrders(data)
  }

  function notify(msg) { setNotif(msg); setTimeout(() => setNotif(null), 2500) }
  function upd(k, v) { setForm(f => ({ ...f, [k]: v })) }
  function toggleSz(s) { setForm(f => ({ ...f, sizes: f.sizes.includes(s) ? f.sizes.filter(x => x !== s) : [...f.sizes, s] })) }

  function openAdd() { setForm(EMPTY); setEditId(null); setActiveImg(0); setFormOpen(true) }
  function openEdit(p) {
    setForm({
      ...p,
      price: String(p.price),
      old: p.old_price ? String(p.old_price) : '',
      stock: String(p.stock),
      sizes: p.sizes || [],
      images: p.images || (p.img ? [p.img] : [])
    })
    setEditId(p.id); setActiveImg(0); setFormOpen(true)
  }

  async function uploadImages(files) {
    setUploading(true)
    const uploaded = []
    for (const file of files) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('upload_preset', UPLOAD_PRESET)
      fd.append('cloud_name', CLOUD_NAME)
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd })
      const data = await res.json()
      if (data.secure_url) uploaded.push(data.secure_url)
    }
    setForm(f => ({ ...f, images: [...(f.images||[]), ...uploaded] }))
    setUploading(false)
    notify(`${uploaded.length} ta rasm yuklandi ✓`)
  }

  function removeImage(idx) {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))
    setActiveImg(0)
  }

  async function del(id) {
    if (!window.confirm("O'chirilsinmi?")) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (!error) { fetchProducts(); notify("O'chirildi") }
  }

  async function save() {
    if (!form.name || !form.price) { notify("Nom va narx majburiy!"); return }
    const images = form.images || []
    const obj = {
      name: form.name, cat: form.cat,
      price: +form.price, old_price: form.old ? +form.old : null,
      img: images[0] || '', images: images,
      sizes: form.sizes, stock: +form.stock || 0,
      is_new: form.is_new, is_sale: form.is_sale,
      description: form.description || ''
    }
    let error
    if (editId) ({ error } = await supabase.from('products').update(obj).eq('id', editId))
    else ({ error } = await supabase.from('products').insert([obj]))
    if (!error) { fetchProducts(); setFormOpen(false); notify(editId ? "Yangilandi ✓" : "Qo'shildi ✓") }
    else notify("Xato: " + error.message)
  }

  async function updateOrderStatus(id, status) {
    await supabase.from('orders').update({ status }).eq('id', id)
    fetchOrders()
  }

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
          loading ? <p style={{textAlign:'center',padding:'40px',color:'#999'}}>Yuklanmoqda...</p> :
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
            {products.length === 0 && (
              <div style={{padding:'40px',textAlign:'center',color:'#999'}}>Mahsulot yo'q — "+" tugmasini bosib qo'shing</div>
            )}
            {products.map(p => (
              <div key={p.id} className="table-row">
                <div style={{position:'relative',width:40,height:50}}>
                  <img src={p.img||'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=80'} style={{width:40,height:50,objectFit:'cover'}} alt=""/>
                  {(p.images||[]).length > 1 && <span style={{position:'absolute',bottom:2,right:2,background:'rgba(0,0,0,.6)',color:'#fff',fontSize:'8px',padding:'1px 3px'}}>{(p.images||[]).length}</span>}
                </div>
                <div className="td" style={{fontWeight:500}}>{p.name}</div>
                <div className="td-muted">{p.cat}</div>
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
      <div className={`form-bg${formOpen?' show':''}`} onClick={()=>setFormOpen(false)}>
        <div className="form-box" onClick={e=>e.stopPropagation()} style={{maxWidth:'560px'}}>
          <div className="form-title serif">{editId?"Tahrirlash":"Yangi mahsulot"}</div>

          {/* IMAGE UPLOAD */}
          <div className="field">
            <label>Rasmlar (6-8 ta yuklash mumkin)</label>

            {/* Preview */}
            {form.images?.length > 0 && (
              <div style={{marginBottom:'10px'}}>
                <div style={{position:'relative',aspectRatio:'4/3',background:'#f5f5f3',marginBottom:'8px',overflow:'hidden'}}>
                  <img src={form.images[activeImg]} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>
                  <button onClick={()=>removeImage(activeImg)}
                    style={{position:'absolute',top:8,right:8,background:'rgba(0,0,0,.6)',color:'#fff',border:'none',width:28,height:28,fontSize:'16px',cursor:'pointer'}}>×</button>
                </div>
                <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                  {form.images.map((img,i) => (
                    <div key={i} onClick={()=>setActiveImg(i)}
                      style={{width:52,height:52,overflow:'hidden',cursor:'pointer',border:activeImg===i?'2px solid #111':'2px solid transparent',position:'relative'}}>
                      <img src={img} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload area */}
            <div
              onClick={()=>fileRef.current?.click()}
              onDragOver={e=>e.preventDefault()}
              onDrop={e=>{e.preventDefault();uploadImages(Array.from(e.dataTransfer.files))}}
              style={{border:'2px dashed #e4e2dd',padding:'24px',textAlign:'center',cursor:'pointer',background:'#fafaf8',transition:'border-color .2s'}}
              onMouseEnter={e=>e.currentTarget.style.borderColor='#111'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='#e4e2dd'}>
              {uploading ? (
                <p style={{fontSize:'13px',color:'#999'}}>Yuklanmoqda...</p>
              ) : (
                <>
                  <p style={{fontSize:'24px',marginBottom:'8px'}}>📸</p>
                  <p style={{fontSize:'13px',fontWeight:500,marginBottom:'4px'}}>Rasmlarni shu yerga tashlang</p>
                  <p style={{fontSize:'11px',color:'#aaa'}}>yoki bosib tanlang · JPG, PNG · Max 10MB</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" multiple accept="image/*" style={{display:'none'}}
              onChange={e=>uploadImages(Array.from(e.target.files))}/>
          </div>

          {[
            {l:"Nomi *",k:"name",t:"text",ph:"Masalan: Uniqlo Mini T-shirt"},
            {l:"Narx (so'm) *",k:"price",t:"number",ph:"Masalan: 185000"},
            {l:"Eski narx (so'm)",k:"old",t:"number",ph:"Bo'lmasa bo'sh qoldiring"},
            {l:"Zaxira (dona)",k:"stock",t:"number",ph:"Masalan: 10"},
            {l:"Tavsif",k:"description",t:"text",ph:"Mahsulot haqida qisqacha"},
          ].map(({l,k,t,ph})=>(
            <div key={k} className="field">
              <label>{l}</label>
              <input type={t} value={form[k]||''} placeholder={ph} onChange={e=>upd(k,e.target.value)}/>
            </div>
          ))}
          <div className="field">
            <label>Kategoriya</label>
            <select value={form.cat} onChange={e=>upd('cat',e.target.value)}>
              {CATS.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label>O'lchamlar</label>
            <div className="sizes-picker">
              {SIZES_ALL.map(s=>(
                <button key={s} type="button" className={`sp${form.sizes.includes(s)?' active':''}`} onClick={()=>toggleSz(s)}>{s}</button>
              ))}
            </div>
          </div>
          <div className="checks">
            <label><input type="checkbox" checked={form.is_new} onChange={e=>upd('is_new',e.target.checked)}/> Yangi mahsulot</label>
            <label><input type="checkbox" checked={form.is_sale} onChange={e=>upd('is_sale',e.target.checked)}/> Aksiyada (Sale)</label>
          </div>
          <div className="form-actions">
            <button className="btn-dark" onClick={save}>SAQLASH</button>
            <button className="btn-outline" onClick={()=>setFormOpen(false)}>BEKOR</button>
          </div>
        </div>
      </div>
    </>
  )
}