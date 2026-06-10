import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
  const OWNER_CHAT_ID = process.env.TELEGRAM_CHAT_ID

  async function sendMessage(chatId, text) {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true })
    })
  }

  async function forwardPhoto(fileId, caption) {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: OWNER_CHAT_ID, photo: fileId, caption, parse_mode: 'HTML' })
    })
  }

  try {
    const msg = req.body?.message
    if (!msg) return res.status(200).end()

    const chatId = msg.chat.id
    const username = msg.from?.username || ''
    const firstName = msg.from?.first_name || ''
    const displayName = username ? `@${username}` : firstName

    // /start — save user to Supabase
    if (msg.text === '/start') {
      // Save or update telegram_users
      await supabase.from('telegram_users').upsert({
        id: chatId,
        username: username || null,
        first_name: firstName || null,
      }, { onConflict: 'id' })

      await sendMessage(chatId,
        `Salom, ${firstName}! 👋\n\n` +
        `Bu <b>TOKYO Brands</b> rasmiy buyurtma boti.\n\n` +
        `Buyurtma bergandan so'ng to'lov chekini (screenshot) shu botga yuboring — biz tasdiqlaylik!\n\n` +
        `🛍 <a href="https://tokyo-brands-uz.vercel.app">tokyo-brands-uz.vercel.app</a>`
      )
      return res.status(200).end()
    }

    // Photo — forward to owner
    if (msg.photo) {
      const fileId = msg.photo[msg.photo.length - 1].file_id
      const caption = msg.caption || ''

      await forwardPhoto(
        fileId,
        `📸 <b>Chek keldi!</b>\n\n👤 Mijoz: ${displayName}\n🆔 Chat ID: ${chatId}${caption ? `\n💬 Izoh: ${caption}` : ''}`
      )

      await sendMessage(chatId,
        `✅ Chekingiz qabul qilindi!\n\nBiz tez orada buyurtmangizni tasdiqlaymiz. Rahmat! 🙏`
      )
      return res.status(200).end()
    }

    // Other text
    if (msg.text) {
      await sendMessage(chatId,
        `Buyurtma to'lovidan so'ng chek screenshotini shu botga yuboring 📸\n\n` +
        `🛍 <a href="https://tokyo-brands-uz.vercel.app">tokyo-brands-uz.vercel.app</a>`
      )
    }

  } catch (err) {
    console.error('Webhook error:', err)
  }

  return res.status(200).end()
}
