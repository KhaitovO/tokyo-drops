import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

const fmt = n => n?.toLocaleString('uz-UZ') + ' so\'m'
const CATS = ['Kosmetika', 'Kiyim', 'Poyabzal', 'Atirlar', 'Aksessuarlar']
const SIZES_ALL = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44']
const EMPTY = { name: '', category: 'Kosmetika', price: '', old_price: '', image_url: '', sizes: [], stock: '', description: '', is_new: false, is_sale: false, is_active: true }

export default function AdminPage() {
  const [auth, setAuth] = useState(false)
  const [pw, setPw] = useState('')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [msg, setMsg] = useState('')

  const notify = (text) => { setMsg(text); setTimeout(() => setMsg(''), 2500) }

  useEffect(() => {
    if (auth) loadProducts()
  }, [auth])

  const checkPw = () => {
    if (pw === (process.env.NEXT_PUBLIC_ADMIN_PW || 'tokyodrops2025')) setAuth(true)
    else notify('Parol noto\'g\'ri')
  }

  const loadProducts = async () => {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  const openAdd = () => { setForm(EMPTY); setEditId(null); setFormOpen(true) }
  const openEdit = (p) => { setForm({ ...p, price: String(p.price), old_price: p.old_price ? String(p.old_price) : '', stock: String(p.stock) }); setEditId(p.id); setFormOpen(true) }
  const closeForm = () => { setFormOpen(false); setForm(EMPTY); setEditId(null) }

  const toggleSize = (s) => setForm(f => ({ ...f, sizes: f.sizes.includes(s) ? f.sizes.filter(x => x !== s) : [...f.sizes, s] }))

  const save = async () => {
    if (!form.name || !form.price) return notify('Nom va narx majburiy')
    const obj = {
      name: form.name, category: form.category,
      price: +form.price, old_price: form.old_price ? +form.old_price : null,
      image_url: form.image_url, sizes: form.sizes,
      stock: +form.stock || 0, description: form.description,
      is_new: form.is_new, is_sale: form.is_sale, is_active: form.is_active
    }
    if (editId) {
      await supabase.from('products').update(obj).eq('id', editId)
      notify('Yangilandi ✓')
    } else {
      await supabase.from('products').insert(obj)
      notify('Qo\'shildi ✓')
    }
    closeForm(); loadProducts()
  }

  const del = async (id) => {
    if (!confirm('O\'chirishni tasdiqlaysizmi?')) return
    await supabase.from('products').delete().eq('id', id)
    notify('O\'chirildi'); loadProducts()
  }

  if (!auth) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7f5' }}>
      <div style={{ background: '#fff', padding: 40, maxWidth: 360, width: '100%', border: '1px solid #e8e8e8' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 400, marginBottom: 24 }}>Admin Panel</h1>
        <input type="password" placeholder="Parol" value={pw} onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && checkPw()}
          style={{ width: '100%', border: '1px solid #ddd', padding: '10px 12px', fontSize: 14, marginBottom: 14 }} />
        <button className="btn-dark" style={{ width: '100%', padding: 12 }} onClick={checkPw}>KIRISH</button>
        {msg && <p style={{ color: '#c0392b', fontSize: 13, marginTop: 10, textAlign: 'center' }}>{msg}</p>}
      </div>
    </div>
  )

  const stats = [
    { l: 'Jami', v: products.length, c: '#111' },
    { l: 'Aksiyada', v: products.filter(p => p.is_sale).length, c: '#c0392b' },
    { l: 'Yangi', v: products.filter(p => p.is_new).length, c: '#2471a3' },
    { l: 'Kam qolgan', v: products.filter(p => p.stock < 5).length, c: '#b7950b' },
  ]

  return (
    <>
      <Head><title>Admin Panel — TOKYO Drops</title></Head>

      {msg && <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', background: '#111', color: '#fff', padding: '9px 22px', fontSize: 12, letterSpacing: '.04em', zIndex: 999 }}>{msg}</div>}

      {/* FORM MODAL */}
      {formOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', maxWidth: 480, width: '100%', padding: 28, maxHeight: '90vh', overflowY: 'auto', borderRadius: 2 }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 400, marginBottom: 22 }}>{editId ? 'Tahrirlash' : 'Yangi mahsulot'}</h3>

            {[
              { l: 'Nomi *', k: 'name', t: 'text' },
              { l: 'Narx (so\'m) *', k: 'price', t: 'number' },
              { l: 'Eski narx (so\'m)', k: 'old_price', t: 'number' },
              { l: 'Rasm URL (unsplash yoki boshqa)', k: 'image_url', t: 'text' },
              { l: 'Zaxira (dona)', k: 'stock', t: 'number' },
              { l: 'Tavsif', k: 'description', t: 'text' },
            ].map(({ l, k, t }) => (
              <div key={k} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 10, letterSpacing: '.07em', color: '#888', textTransform: 'uppercase', marginBottom: 5 }}>{l}</label>
                <input type={t} value={form[k] || ''} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                  style={{ width: '100%', border: '1px solid #e0e0e0', padding: '9px 11px', fontSize: 13, background: '#fafaf8' }} />
              </div>
            ))}

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 10, letterSpacing: '.07em', color: '#888', textTransform: 'uppercase', marginBottom: 5 }}>Kategoriya</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                style={{ width: '100%', border: '1px solid #e0e0e0', padding: '9px 11px', fontSize: 13, background: '#fafaf8' }}>
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 10, letterSpacing: '.07em', color: '#888', textTransform: 'uppercase', marginBottom: 8 }}>O'lchamlar</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {SIZES_ALL.map(s => (
                  <button key={s} type="button" onClick={() => toggleSize(s)} style={{
                    padding: '6px 12px', fontSize: 11, border: '1px solid', cursor: 'pointer',
                    borderColor: form.sizes.includes(s) ? '#111' : '#e0e0e0',
                    background: form.sizes.includes(s) ? '#111' : '#fff',
                    color: form.sizes.includes(s) ? '#fff' : '#666',
                    transition: 'all .15s'
                  }}>{s}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 20, marginBottom: 22 }}>
              {[{ k: 'is_new', l: 'Yangi' }, { k: 'is_sale', l: 'Aksiyada' }, { k: 'is_active', l: 'Aktiv' }].map(cb => (
                <label key={cb.k} style={{ display: 'flex', gap: 7, alignItems: 'center', fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form[cb.k]} onChange={e => setForm(f => ({ ...f, [cb.k]: e.target.checked }))} />
                  {cb.l}
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-dark" onClick={save} style={{ flex: 1, padding: 12 }}>SAQLASH</button>
              <button className="btn-outline" onClick={closeForm} style={{ flex: 1, padding: 12 }}>BEKOR</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 400 }}>Admin panel</h1>
            <p style={{ fontSize: 13, color: '#999', marginTop: 2 }}>TOKYO Drops do'konini boshqarish</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/" className="btn-outline" style={{ padding: '10px 20px', fontSize: 12 }}>← Do'konga qayt</Link>
            <button className="btn-dark" onClick={openAdd} style={{ padding: '10px 20px', fontSize: 12 }}>+ Mahsulot qo'shish</button>
          </div>
        </div>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 24 }}>
          {stats.map(s => (
            <div key={s.l} style={{ background: '#f7f7f5', padding: '14px 16px', borderRadius: 2 }}>
              <div style={{ fontSize: 22, fontWeight: 600, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: 11, color: '#999', marginTop: 2, letterSpacing: '.03em' }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* TABLE */}
        {loading ? (
          <p style={{ textAlign: 'center', color: '#bbb', padding: 40 }}>Yuklanmoqda...</p>
        ) : (
          <div style={{ border: '1px solid #ebebeb', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 110px 140px 60px 70px 130px', padding: '10px 14px', background: '#f7f7f5', borderBottom: '1px solid #ebebeb' }}>
              {['', 'Nomi', 'Kategoriya', 'Narx', 'Zaxira', 'Status', 'Amallar'].map(h => (
                <span key={h} style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.07em', color: '#999', textTransform: 'uppercase' }}>{h}</span>
              ))}
            </div>
            {products.length === 0 && (
              <p style={{ textAlign: 'center', color: '#bbb', padding: 40, fontSize: 13 }}>
                Hali mahsulot yo'q — yuqoridagi "+ Mahsulot qo'shish" tugmasini bosing
              </p>
            )}
            {products.map(p => (
              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '48px 1fr 110px 140px 60px 70px 130px', padding: '10px 14px', borderBottom: '1px solid #f5f5f5', alignItems: 'center', transition: 'background .15s' }}
                onMouseOver={e => e.currentTarget.style.background = '#fafaf8'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                <img src={p.image_url} alt={p.name} style={{ width: 36, height: 44, objectFit: 'cover' }} />
                <span style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</span>
                <span style={{ fontSize: 12, color: '#888' }}>{p.category}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{fmt(p.price)}</div>
                  {p.old_price && <div style={{ fontSize: 11, color: '#bbb', textDecoration: 'line-through' }}>{fmt(p.old_price)}</div>}
                </div>
                <span style={{ fontSize: 13, color: p.stock < 5 ? '#c0392b' : '#111', fontWeight: p.stock < 5 ? 600 : 400 }}>{p.stock}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {p.is_new && <span style={{ fontSize: 9, background: '#111', color: '#fff', padding: '2px 5px', fontWeight: 700, letterSpacing: '.05em' }}>YANGI</span>}
                  {p.is_sale && <span style={{ fontSize: 9, background: '#c0392b', color: '#fff', padding: '2px 5px', fontWeight: 700, letterSpacing: '.05em' }}>SALE</span>}
                  {!p.is_active && <span style={{ fontSize: 9, background: '#999', color: '#fff', padding: '2px 5px', fontWeight: 700, letterSpacing: '.05em' }}>NOFAOL</span>}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => openEdit(p)} style={{ fontSize: 11, color: '#555', background: 'none', border: '1px solid #ddd', padding: '4px 10px', cursor: 'pointer' }}>Tahrir</button>
                  <button onClick={() => del(p.id)} style={{ fontSize: 11, color: '#c0392b', background: 'none', border: '1px solid #fcc', padding: '4px 10px', cursor: 'pointer' }}>O'chir</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
