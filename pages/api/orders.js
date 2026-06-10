export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { customer_name, phone, telegram, address, total, items } = req.body

  if (!phone || !total || !items) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
  const OWNER_CHAT_ID = process.env.TELEGRAM_CHAT_ID

  const itemsList = items.map((i, idx) =>
    `  ${idx + 1}. ${i.name}${i.color ? ` (${i.color})` : ''}${i.size ? ` / ${i.size}` : ''} x ${i.qty} = ${(i.price * i.qty).toLocaleString('uz-UZ')} so'm`
  ).join('\n')

  const telegramDisplay = telegram
    ? telegram.startsWith('@')
      ? `<a href="https://t.me/${telegram.slice(1)}">${telegram}</a>`
      : telegram
    : "Ko'rsatilmagan"

  const totalItems = items.reduce((s, i) => s + i.qty, 0)
  const totalFormatted = Number(total).toLocaleString('uz-UZ')

  // 1. Notify OWNER
  const ownerMessage = `🛍 <b>YANGI BUYURTMA!</b>

👤 <b>Mijoz:</b> ${customer_name || "Noma'lum"}
📞 <b>Telefon:</b> ${phone}
💬 <b>Telegram:</b> ${telegramDisplay}
📍 <b>Manzil:</b> ${address || "Ko'rsatilmagan"}

🧾 <b>Buyurtma (${totalItems} ta mahsulot):</b>
${itemsList}

💰 <b>Jami: ${totalFormatted} so'm</b>
💳 <b>To'lov:</b> Karta orqali o'tkazma
   ⏳ Chek kutilmoqda...

⏰ ${new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}`

  try {
    // Send to owner
    const ownerRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: OWNER_CHAT_ID,
          text: ownerMessage,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      }
    )
    const ownerData = await ownerRes.json()
    if (!ownerData.ok) {
      console.error('Owner Telegram error:', ownerData)
    }

    // 2. Send confirmation to CUSTOMER (if telegram username provided)
    if (telegram) {
      // Get customer chat_id by username - only works if they started the bot
      const customerUsername = telegram.startsWith('@') ? telegram.slice(1) : telegram

      const customerMessage = `✅ <b>Buyurtmangiz qabul qilindi!</b>

🧾 <b>Buyurtma:</b>
${itemsList}

💰 <b>Jami: ${totalFormatted} so'm</b>

💳 <b>To'lov:</b>
Karta raqami: <code>9860 1606 0740 1702</code>
Karta egasi: Jalolova M

📸 <b>To'lovdan keyin chek screenshotini shu botga yuboring!</b>
Biz tasdiqlashni kutamiz 🙏

🛍 <a href="https://tokyo-brands-uz.vercel.app">TOKYO Brands</a>`

      // Try to send to customer via username
      // Note: this only works if customer has started the bot
      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: `@${customerUsername}`,
            text: customerMessage,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          }),
        }
      )
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Order API error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
