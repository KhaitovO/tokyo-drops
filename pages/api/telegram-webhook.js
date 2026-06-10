import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
  const OWNER_CHAT_ID = process.env.TELEGRAM_CHAT_ID

  async function sendMessage(chatId, text, extra = {}) {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true, ...extra })
    })
  }

  async function answerCallback(callbackQueryId, text) {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: callbackQueryId, text })
    })
  }

  async function editMessage(chatId, messageId, text) {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, message_id: messageId, text, parse_mode: 'HTML' })
    })
  }

  try {
    const update = req.body

    // ── CALLBACK QUERY (button pressed) ──
    if (update.callback_query) {
      const cb = update.callback_query
      const data = cb.data
      const chatId = cb.message.chat.id
      const messageId = cb.message.message_id
      const username = cb.from?.username ? `@${cb.from.username}` : cb.from?.first_name

      if (data.startsWith('confirm_')) {
        const orderId = data.replace('confirm_', '')

        // Update order status in Supabase
        await supabase.from('orders').update({ status: 'processing' }).eq('id', orderId)

        // Edit customer message
        await editMessage(chatId, messageId,
          `✅ <b>Buyurtma tasdiqlandi!</b>\n\n` +
          `Endi to'lovni amalga oshiring:\n` +
          `Karta: <code>9860 1606 0740 1702</code>\n` +
          `Egasi: Jalolova M\n\n` +
          `📸 To'lovdan keyin chek screenshotini shu botga yuboring!`
        )

        // Notify owner
        await sendMessage(OWNER_CHAT_ID,
          `✅ <b>Mijoz buyurtmani tasdiqladi!</b>\n\n` +
          `👤 ${username}\n` +
          `🆔 Buyurtma: #${orderId}\n\n` +
          `⏳ Chek kutilmoqda...`
        )

        await answerCallback(cb.id, "Tasdiqlandi!")

      } else if (data.startsWith('cancel_')) {
        const orderId = data.replace('cancel_', '')

        // Update order status
        await supabase.from('orders').update({ status: 'cancelled' }).eq('id', orderId)

        // Edit customer message
        await editMessage(chatId, messageId,
          `❌ <b>Buyurtma bekor qilindi.</b>\n\n` +
          `Savollaringiz bo'lsa bog'laning:\n` +
          `🛍 <a href="https://tokyo-brands-uz.vercel.app">tokyo-brands-uz.vercel.app</a>`
        )

        // Notify owner
        await sendMessage(OWNER_CHAT_ID,
          `❌ <b>Mijoz buyurtmani bekor qildi!</b>\n\n` +
          `👤 ${username}\n` +
          `🆔 Buyurtma: #${orderId}`
        )

        await answerCallback(cb.id, "Bekor qilindi")
      }

      return res.status(200).end()
    }

    // ── REGULAR MESSAGE ──
    const msg = update.message
    if (!msg) return res.status(200).end()

    const chatId = msg.chat.id
    const username = msg.from?.username || ''
    const firstName = msg.from?.first_name || ''
    const displayName = username ? `@${username}` : firstName

    // /start
    if (msg.text === '/start') {
      await supabase.from('telegram_users').upsert({
        id: chatId,
        username: username || null,
        first_name: firstName || null,
      }, { onConflict: 'id' })

      await sendMessage(chatId,
        `Salom, ${firstName}! 👋\n\n` +
        `Bu <b>TOKYO Brands</b> rasmiy buyurtma boti.\n\n` +
        `Buyurtma bergandan so'ng:\n` +
        `1️⃣ Tasdiqlash tugmasini bosing\n` +
        `2️⃣ Kartaga to'lov qiling\n` +
        `3️⃣ Chek screenshotini shu botga yuboring\n\n` +
        `🛍 <a href="https://tokyo-brands-uz.vercel.app">tokyo-brands-uz.vercel.app</a>`
      )
      return res.status(200).end()
    }

    // Photo (chek)
    if (msg.photo) {
      const fileId = msg.photo[msg.photo.length - 1].file_id
      const caption = msg.caption || ''

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: OWNER_CHAT_ID,
          photo: fileId,
          caption: `📸 <b>Chek keldi!</b>\n\n👤 ${displayName}\n🆔 Chat ID: ${chatId}${caption ? `\n💬 ${caption}` : ''}`,
          parse_mode: 'HTML'
        })
      })

      await sendMessage(chatId,
        `✅ Chekingiz qabul qilindi!\n\nTez orada buyurtmangizni jo'natamiz. Rahmat! 🙏`
      )
      return res.status(200).end()
    }

    // Other text
    if (msg.text) {
      await sendMessage(chatId,
        `Buyurtma bergandan so'ng chek screenshotini shu botga yuboring 📸\n\n` +
        `🛍 <a href="https://tokyo-brands-uz.vercel.app">tokyo-brands-uz.vercel.app</a>`
      )
    }

  } catch (err) {
    console.error('Webhook error:', err)
  }

  return res.status(200).end()
}
