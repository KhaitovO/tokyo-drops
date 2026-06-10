import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { customer_name, phone, telegram, address, total, items, order_id } = req.body
  if (!phone || !total || !items) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
  const OWNER_CHAT_ID = process.env.TELEGRAM_CHAT_ID

  const itemsList = items.map((i, idx) =>
    `  ${idx + 1}. ${i.name}${i.color ? ` (${i.color})` : ''}${i.size ? ` / ${i.size}` : ''} × ${i.qty} = ${(i.price * i.qty).toLocaleString('uz-UZ')} so'm`
  ).join('\n')

  const totalItems = items.reduce((s, i) => s + i.qty, 0)
  const totalFormatted = Number(total).toLocaleString('uz-UZ')

  const telegramDisplay = telegram
    ? telegram.startsWith('@')
      ? `<a href="https://t.me/${telegram.slice(1)}">${telegram}</a>`
      : telegram
    : "Ko'rsatilmagan"

  async function sendMessage(chatId, text, extra = {}) {
    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        ...extra
      })
    })
    return r.json()
  }

  try {
    // 1. Egasiga xabar
    await sendMessage(OWNER_CHAT_ID,
      `🛍 <b>YANGI BUYURTMA</b>\n` +
      `━━━━━━━━━━━━━━━\n` +
      `👤 ${customer_name || "Noma'lum"}\n` +
      `📞 ${phone}\n` +
      `💬 ${telegramDisplay}\n` +
      `📍 ${address || "—"}\n` +
      `━━━━━━━━━━━━━━━\n` +
      `${itemsList}\n` +
      `━━━━━━━━━━━━━━━\n` +
      `💰 Jami: <b>${totalFormatted} so'm</b>\n` +
      `💳 Karta orqali · ⏳ Tasdiqlash kutilmoqda\n` +
      `⏰ ${new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}`
    )

    // 2. Mijozga tasdiqlash xabari
    if (telegram) {
      const rawUsername = telegram.startsWith('@') ? telegram.slice(1) : telegram

      // Case-insensitive search
      const { data: user } = await supabase
        .from('telegram_users')
        .select('id')
        .ilike('username', rawUsername)
        .single()

      if (user?.id) {
        await sendMessage(user.id,
          `🛍 <b>Buyurtmangiz qabul qilindi!</b>\n` +
          `━━━━━━━━━━━━━━━\n` +
          `${itemsList}\n` +
          `━━━━━━━━━━━━━━━\n` +
          `💰 Jami: <b>${totalFormatted} so'm</b>\n\n` +
          `Buyurtmangiz to'g'rimi? 👇`,
          {
            reply_markup: {
              inline_keyboard: [[
                { text: "✅ Tasdiqlash", callback_data: `confirm_${order_id}` },
                { text: "❌ Bekor qilish", callback_data: `cancel_${order_id}` }
              ]]
            }
          }
        )
      } else {
        // User not found - send note to owner
        await sendMessage(OWNER_CHAT_ID,
          `⚠️ <b>Diqqat:</b> ${telegramDisplay} hali botga ulanmagan.\n` +
          `Mijoz bilan qo'lda bog'laning.`
        )
      }
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Order API error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
