import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  try {
    // Simple query to keep Supabase active
    await supabase.from('products').select('id').limit(1)
    return res.status(200).json({ ok: true, time: new Date().toISOString() })
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message })
  }
}
