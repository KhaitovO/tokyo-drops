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
    `  ${idx + 1}. ${i.name}${i.color ? ` (${i.color})` : ''}${i.size ? ` / ${i.size}` : ''} x ${i.qty} = ${(i.price * i.qty).toLocaleString('uz-UZ')} so'm`
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
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true, ...extra })
    })
    return r.json()
  }

  try {
    // 1. Notify OWNER (pending confirmation)
    await sendMessage(OWNER_CHAT_ID,
      `🛍 <b>YANGI BUYURTMA!</b> — ⏳ Tasdiqlash kutilmoqda\n\n` +
      `👤 <b>Mijoz:</b> ${customer_name || "Noma'lum"}\n` +
      `📞 <b>Telefon:</b> ${phone}\n` +
      `💬 <b>Telegram:</b> ${telegramDisplay}\n` +
      `📍 <b>Manzil:</b> ${address || "Ko'rsatilmagan"}\n\n` +
      `🧾 <b>Buyurtma (${totalItems} ta):</b>\n${itemsList}\n\n` +
      `💰 <b>Jami: ${totalFormatted} so'm</b>\n` +
      `💳 Karta orqali · ⏳ Chek kutilmoqda\n\n` +
      `⏰ ${new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}`
    )

    // 2. Send confirmation request to CUSTOMER with inline buttons
    if (telegram) {
      const username = telegram.startsWith('@') ? telegram.slice(1) : telegram
      const { data: user } = await supabase
        .from('telegram_users')
        .select('id')
        .eq('username', username)
        .single()

      if (user?.id) {
        await sendMessage(user.id,
          `🛍 <b>Buyurtmangizni tasdiqlang!</b>\n\n` +
          `🧾 <b>Buyurtma:</b>\n${itemsList}\n\n` +
          `💰 <b>Jami: ${totalFormatted} so'm</b>\n\n` +
          `💳 <b>To'lov:</b>\n` +
          `Karta: <code>9860 1606 0740 1702</code>\n` +
          `Egasi: Jalolova M\n\n` +
          `Buyurtmangiz to'g'rimi? Tasdiqlang 👇`,
          {
            reply_markup: {
              inline_keyboard: [[
                { text: "✅ Tasdiqlash", callback_data: `confirm_${order_id}` },
                { text: "❌ Bekor qilish", callback_data: `cancel_${order_id}` }
              ]]
            }
          }
        )
      }
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Order API error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
