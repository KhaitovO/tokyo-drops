import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'

const INIT = [
  {id:1,name:"Shiseido Moisturizer SPF50",cat:"Kosmetika",price:285000,old:380000,img:"https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80",sizes:[],stock:18,isNew:true,isSale:true},
  {id:2,name:"Laneige Lip Sleeping Mask",cat:"Kosmetika",price:125000,old:null,img:"https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80",sizes:[],stock:32,isNew:true,isSale:false},
  {id:3,name:"Uniqlo Ultra Light Down",cat:"Kiyim",price:620000,old:820000,img:"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80",sizes:["XS","S","M","L","XL"],stock:9,isNew:false,isSale:true},
  {id:4,name:"GU Wide Leg Trousers",cat:"Kiyim",price:245000,old:null,img:"https://images.unsplash.com/photo-1603251578711-3290ca1a0187?w=400&q=80",sizes:["S","M","L","XL"],stock:14,isNew:true,isSale:false},
  {id:5,name:"New Balance 574 JP",cat:"Poyabzal",price:890000,old:1100000,img:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",sizes:["39","40","41","42","43","44"],stock:5,isNew:false,isSale:true},
  {id:6,name:"Issey Miyake L'Eau",cat:"Atirlar",price:480000,old:620000,img:"https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&q=80",sizes:[],stock:11,isNew:false,isSale:true},
  {id:7,name:"Porter Yoshida Tote",cat:"Aksessuarlar",price:720000,old:950000,img:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",sizes:[],stock:4,isNew:false,isSale:true},
]
const CATS = ["Kosmetika","Kiyim","Poyabzal","Atirlar","Aksessuarlar"]
const SIZES_ALL = ["XS","S","M","L","XL","XXL","36","37","38","39","40","41","42","43","44"]
const fmt = n => n.toLocaleString('uz-UZ') + " so'm"
const EMPTY = {name:"",cat:"Kosmetika",price:"",old:"",img:"",sizes:[],stock:"",isNew:false,isSale:false,desc:""}

export default function Admin() {
  const [products, setProducts] = useState(INIT)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [notif, setNotif] = useState(null)
  const [search, setSearch] = useState('')

  function notify(msg) { setNotif(msg); setTimeout(() => setNotif(null), 2200) }
  function upd(k, v) { setForm(f => ({ ...f, [k]: v })) }
  function toggleSz(s) { setForm(f => ({ ...f, sizes: f.sizes.includes(s) ? f.sizes.filter(x => x !== s) : [...f.sizes, s] })) }

  function openAdd() { setForm(EMPTY); setEditId(null); setFormOpen(true) }
  function openEdit(p) { setForm({ ...p, price: String(p.price), old: p.old ? String(p.old) : '', stock: String(p.stock) }); setEditId(p.id); setFormOpen(true) }
  function del(id) { if (window.confirm("O'chirilsinmi?")) { setProducts(p => p.filter(x => x.id !== id)); notify("O'chirildi") } }

  function save() {
    if (!form.name || !form.price) { notify("Nom va narx majburiy!"); return }
    const obj = { ...form, id: editId || Date.now(), price: +form.price, old: form.old ? +form.old : null, stock: +form.stock || 0 }
    if (editId) setProducts(p => p.map(x => x.id === editId ? obj : x))
    else setProducts(p => [...p, obj])
    setFormOpen(false); notify(editId ? "Yangilandi ✓" : "Qo'shildi ✓")
  }

  const shown = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
  const stats = [
    { l: "Jami mahsulot", v: products.length, c: '#111' },
    { l: "Aksiyada", v: products.filter(p => p.isSale).length, c: '#c0392b' },
    { l: "Yangi", v: products.filter(p => p.isNew).length, c: '#2471a3' },
    { l: "Kam qolgan (<5)", v: products.filter(p => p.stock < 5).length, c: '#b7950b' },
  ]

  return (
    <>
      <Head><title>Admin — TOKYO Drops</title></Head>
      {notif && <div className="notif show">{notif}</div>}

      <header className="header">
        <div className="header-inner">
          <div className="logo serif">TOKYO <em>Drops</em> <span style={{ fontSize: '11px', color: '#999', fontFamily: 'DM Sans', fontStyle: 'normal', marginLeft: '8px' }}>Admin</span></div>
          <Link href="/" style={{ fontSize: '12px', color: '#888', letterSpacing: '.06em' }}>← Do'konga qayt</Link>
        </div>
      </header>

      <div className="admin-page">
        <div className="admin-top">
          <div>
            <div className="admin-heading serif">Admin panel</div>
            <div className="admin-sub">{products.length} ta mahsulot boshqarilmoqda</div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Qidirish..." style={{ border: '1px solid #e4e2dd', padding: '10px 14px', fontSize: '13px', background: '#f2f1ee', width: '200px' }} />
            <button className="btn-dark" onClick={openAdd}>+ Mahsulot qo'shish</button>
          </div>
        </div>

        <div className="stats">
          {stats.map(s => (
            <div key={s.l} className="stat">
              <div className="stat-n" style={{ color: s.c }}>{s.v}</div>
              <div className="stat-l">{s.l}</div>
            </div>
          ))}
        </div>

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
          {shown.map(p => (
            <div key={p.id} className="table-row">
              <img src={p.img} style={{ width: 40, height: 50, objectFit: 'cover' }} alt="" />
              <div className="td" style={{ fontWeight: 500 }}>{p.name}</div>
              <div className="td-muted">{p.cat}</div>
              <div>
                <div className="td" style={{ fontWeight: 600 }}>{fmt(p.price)}</div>
                {p.old && <div className="td-muted" style={{ textDecoration: 'line-through' }}>{fmt(p.old)}</div>}
              </div>
              <div className="td" style={{ color: p.stock < 5 ? '#c0392b' : '#111', fontWeight: p.stock < 5 ? 600 : 400 }}>{p.stock}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {p.isNew && <span style={{ fontSize: '9px', background: '#111', color: '#fff', padding: '2px 5px', fontWeight: 700, letterSpacing: '.06em' }}>YANGI</span>}
                {p.isSale && <span style={{ fontSize: '9px', background: '#c0392b', color: '#fff', padding: '2px 5px', fontWeight: 700, letterSpacing: '.06em' }}>SALE</span>}
              </div>
              <div className="trow-actions">
                <button className="act-btn act-edit" onClick={() => openEdit(p)}>Tahrir</button>
                <button className="act-btn act-del" onClick={() => del(p.id)}>O'chir</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FORM MODAL */}
      <div className={`form-bg${formOpen ? ' show' : ''}`} onClick={() => setFormOpen(false)}>
        <div className="form-box" onClick={e => e.stopPropagation()}>
          <div className="form-title serif">{editId ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}</div>
          {[
            { l: "Nomi *", k: "name", t: "text", ph: "Masalan: Uniqlo Linen Shirt" },
            { l: "Narx (so'm) *", k: "price", t: "number", ph: "Masalan: 450000" },
            { l: "Eski narx (so'm)", k: "old", t: "number", ph: "Bo'lmasa bo'sh qoldiring" },
            { l: "Rasm URL", k: "img", t: "text", ph: "https://..." },
            { l: "Zaxira (dona)", k: "stock", t: "number", ph: "Masalan: 10" },
            { l: "Tavsif", k: "desc", t: "text", ph: "Mahsulot haqida qisqacha" },
          ].map(({ l, k, t, ph }) => (
            <div key={k} className="field">
              <label>{l}</label>
              <input type={t} value={form[k] || ''} placeholder={ph} onChange={e => upd(k, e.target.value)} />
            </div>
          ))}
          <div className="field">
            <label>Kategoriya</label>
            <select value={form.cat} onChange={e => upd('cat', e.target.value)}>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label>O'lchamlar (kiyim/poyabzal uchun)</label>
            <div className="sizes-picker">
              {SIZES_ALL.map(s => (
                <button key={s} type="button" className={`sp${form.sizes.includes(s) ? ' active' : ''}`} onClick={() => toggleSz(s)}>{s}</button>
              ))}
            </div>
          </div>
          <div className="checks">
            <label><input type="checkbox" checked={form.isNew} onChange={e => upd('isNew', e.target.checked)} /> Yangi mahsulot</label>
            <label><input type="checkbox" checked={form.isSale} onChange={e => upd('isSale', e.target.checked)} /> Aksiyada (Sale)</label>
          </div>
          <div className="form-actions">
            <button className="btn-dark" onClick={save}>SAQLASH</button>
            <button className="btn-outline" onClick={() => setFormOpen(false)}>BEKOR</button>
          </div>
        </div>
      </div>
    </>
  )
}
