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
      body: JSON.stringify({
        chat_id: chatId, text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        ...extra
      })
    })
  }

  async function answerCallback(id, text) {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: id, text })
    })
  }

  async function editMessage(chatId, messageId, text) {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId, message_id: messageId,
        text, parse_mode: 'HTML'
      })
    })
  }

  try {
    const update = req.body

    // Tugma bosildi
    if (update.callback_query) {
      const cb = update.callback_query
      const data = cb.data
      const chatId = cb.message.chat.id
      const messageId = cb.message.message_id
      const username = cb.from?.username ? `@${cb.from.username}` : cb.from?.first_name

      if (data.startsWith('confirm_')) {
        const orderId = data.replace('confirm_', '')
        await supabase.from('orders').update({ status: 'processing' }).eq('id', orderId)

        await editMessage(chatId, messageId,
          `✅ <b>Tasdiqlandi!</b>\n\n` +
          `Endi to'lovni amalga oshiring:\n\n` +
          `💳 Karta: <code>9860 1606 0740 1702</code>\n` +
          `👤 Egasi: Jalolova M\n\n` +
          `To'lovdan so'ng <b>chek screenshotini shu botga yuboring</b> 📸`
        )

        await sendMessage(OWNER_CHAT_ID,
          `✅ <b>Mijoz tasdiqladi!</b>\n\n` +
          `👤 ${username}\n` +
          `🆔 Buyurtma #${orderId}\n\n` +
          `⏳ Chek kutilmoqda...`
        )

        await answerCallback(cb.id, "✅ Tasdiqlandi!")

      } else if (data.startsWith('cancel_')) {
        const orderId = data.replace('cancel_', '')
        await supabase.from('orders').update({ status: 'cancelled' }).eq('id', orderId)

        await editMessage(chatId, messageId,
          `❌ <b>Buyurtma bekor qilindi.</b>\n\n` +
          `Yana xarid qilmoqchi bo'lsangiz:\n` +
          `🛍 <a href="https://tokyo-brands-uz.vercel.app">tokyo-brands-uz.vercel.app</a>`
        )

        await sendMessage(OWNER_CHAT_ID,
          `❌ <b>Mijoz bekor qildi!</b>\n\n` +
          `👤 ${username}\n` +
          `🆔 Buyurtma #${orderId}`
        )

        await answerCallback(cb.id, "❌ Bekor qilindi")
      }

      return res.status(200).end()
    }

    // Oddiy xabar
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
        `Salom${firstName ? `, ${firstName}` : ''}! 👋\n\n` +
        `<b>TOKYO Brands</b> — Yaponiyadan O'zbekistonga.\n\n` +
        `🛍 Xarid qilish:\n` +
        `<a href="https://tokyo-brands-uz.vercel.app">tokyo-brands-uz.vercel.app</a>\n\n` +
        `📸 Buyurtma bergach to'lov chekini shu botga yuboring.`
      )
      return res.status(200).end()
    }

    // Chek rasm
    if (msg.photo) {
      const fileId = msg.photo[msg.photo.length - 1].file_id
      const caption = msg.caption || ''

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: OWNER_CHAT_ID,
          photo: fileId,
          caption: `📸 <b>Chek keldi</b>\n👤 ${displayName}\n🆔 ${chatId}${caption ? `\n💬 ${caption}` : ''}`,
          parse_mode: 'HTML'
        })
      })

      await sendMessage(chatId,
        `✅ Chek qabul qilindi. Rahmat!\n\n` +
        `Buyurtmangiz tez orada jo'natiladi 🚀`
      )
      return res.status(200).end()
    }

    // Boshqa matn
    if (msg.text) {
      await sendMessage(chatId,
        `🛍 Xarid qilish:\n` +
        `<a href="https://tokyo-brands-uz.vercel.app">tokyo-brands-uz.vercel.app</a>\n\n` +
        `Buyurtma bergach chek screenshotini shu botga yuboring 📸`
      )
    }

  } catch (err) {
    console.error('Webhook error:', err)
  }

  return res.status(200).end()
}
