export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
  const OWNER_CHAT_ID = process.env.TELEGRAM_CHAT_ID

  const update = req.body

  // Helper: send message
  async function sendMessage(chatId, text, extra = {}) {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', ...extra })
    })
  }

  // Helper: forward photo to owner
  async function forwardPhoto(fromChatId, fileId, caption) {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: OWNER_CHAT_ID,
        photo: fileId,
        caption,
        parse_mode: 'HTML'
      })
    })
  }

  try {
    const msg = update.message

    if (!msg) return res.status(200).end()

    const chatId = msg.chat.id
    const username = msg.from?.username ? `@${msg.from.username}` : msg.from?.first_name || 'Noma\'lum'

    // /start command
    if (msg.text === '/start') {
      await sendMessage(chatId,
        `Salom! 👋\n\nBu <b>TOKYO Brands</b> rasmiy buyurtma boti.\n\n` +
        `Buyurtma bergandan so'ng to'lov chekini (screenshot) shu botga yuboring — biz tasdiqlaylik!\n\n` +
        `🛍 Do'kon: <a href="https://tokyo-brands-uz.vercel.app">tokyo-brands-uz.vercel.app</a>`
      )
      return res.status(200).end()
    }

    // Photo received - forward to owner
    if (msg.photo) {
      const fileId = msg.photo[msg.photo.length - 1].file_id
      const caption = msg.caption || ''

      await forwardPhoto(
        chatId,
        fileId,
        `📸 <b>Chek keldi!</b>\n\n👤 Mijoz: ${username}\n🆔 Chat ID: ${chatId}${caption ? `\n💬 Izoh: ${caption}` : ''}`
      )

      await sendMessage(chatId,
        `✅ Chekingiz qabul qilindi!\n\nBiz tez orada buyurtmangizni tasdiqlaymiz. Rahmat! 🙏`
      )

      return res.status(200).end()
    }

    // Text message (not /start)
    if (msg.text) {
      await sendMessage(chatId,
        `Buyurtma to'lovini amalga oshirgach, chek screenshotini shu botga yuboring 📸\n\n` +
        `Do'kon: <a href="https://tokyo-brands-uz.vercel.app">tokyo-brands-uz.vercel.app</a>`
      )
    }

  } catch (err) {
    console.error('Webhook error:', err)
  }

  return res.status(200).end()
}
